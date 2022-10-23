#!/usr/bin/env node
var readline = require('readline');
var path = require('path');
var createGraph = require('ngraph.graph');

var program = require('commander');
program
  .version(require('./package.json').version)
  .usage('[options]')
  .description('Prints a graph of files that are most frequently changed together')
  .parse(process.argv);


var childProcess = require('child_process')

processGitLogs();

function processGitLogs() {
  var buffer = [];

  var git = childProcess.spawn('git', ['log', '--name-only', '--pretty=format:""']);
  var graph = createGraph();

  var rl = readline.createInterface({ input: git.stdout });
  rl.on('line', processLine).on('close', printResults);

  git.stderr.on('data', function (data) {
    console.error('stderr: ' + data.toString());
  });

  function printResults() {
    console.warn('Pairs: ', graph.getLinkCount(), 'Nodes: ' + graph.getNodeCount());

    let nodes = [];
    graph.forEachNode(node => {
      nodes.push(node.data.count);
    });
    let meanNodeCount = nodes.reduce((a, b) => a + b, 0) / nodes.length;
    let stdDevNode = nodes.reduce((a, b) => a + Math.pow(b - meanNodeCount, 2), 0) / nodes.length;
    let nodeFilterThreshold = meanNodeCount;// + stdDevNode;

    console.warn('Mean node count: ', meanNodeCount, 'StdDev: ', Math.sqrt(stdDevNode));

    let scores = [];
    graph.forEachLink(link => {
      let fromNode = graph.getNode(link.fromId);
      let toNode = graph.getNode(link.toId);
      let committedTogether = link.data.count;
      if (!(fromNode.id.match(/^src/) || toNode.id.match(/^src/))) return;

      if (fromNode.data.count > nodeFilterThreshold ||
          toNode.data.count > nodeFilterThreshold) {
        let score = committedTogether / (fromNode.data.count + toNode.data.count - committedTogether);
        scores.push({
          link, score
        });
      }
    })

    scores.sort((a, b) => b.score - a.score);

    let mean = scores.reduce((a, b) => a + b.score, 0) / scores.length;
    let stdDev = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b.score - mean, 2), 0) / scores.length);

    console.warn('Mean: ', mean, 'StdDev: ', stdDev);
    console.log('graph G {')
    scores.forEach(({link, score}) => {
      if (score > mean + stdDev) {
        console.log(`  "${link.fromId}" -- "${link.toId}" [score=${Math.round(score*100)/100}];`)
      }
    });
    console.log('}')
    // var similarities = computeSimilarities(commits)
    // similarities.print(fileLookup, program.count);
  }

  function processLine(line) {
    if (line === '""') return;
    if (line) {
      buffer.push(line)
    } else {
      if (buffer.length > 0) {
        buffer.forEach(fileName => {
          if (!graph.hasNode(fileName)) {
            graph.addNode(fileName, {count: 0});
          }
          graph.getNode(fileName).data.count += 1;
        });
        for (let i = 0; i < buffer.length - 1; i++) {
          let from = buffer[i];
          for (let j = i + 1; j < buffer.length; j++) {
            let to = buffer[j];
            let canonicalFrom = from;
            let canonicalTo = to;
            if (from < to) {
              canonicalFrom = to;
              canonicalTo = from;
            }

            if (!graph.hasLink(canonicalFrom, canonicalTo)) {
              graph.addLink(canonicalFrom, canonicalTo, {count: 0});
            }
            graph.getLink(canonicalFrom, canonicalTo).data.count += 1;
          }
        }
        buffer = [];
      }
    }
  }

  function hasFile(buffer, fileLookup) {
    for (var i = 0; i < buffer.length; ++i) {
      if (buffer[i] === fileLookup) return true;
    }
  }
}


function changeWorkingDirectoryBasedOnInput(dirName) {
  try {
    process.chdir(dirName);
  } catch(error) {
    if (error.code !== 'ENOENT') throw error;

    console.error('no such directory: ' + dirName);
    process.exit(1);
  }
}
