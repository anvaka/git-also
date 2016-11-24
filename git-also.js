#!/usr/bin/env node
var computeSimilarities = require('./lib/computeSimilarities.js');
var readline = require('readline');
var path = require('path');

var program = require('commander');
program
  .version(require('./package.json').version)
  .usage('[options] <file>')
  .description('For a <file> in your git repository prints other files that are most often committed together')
  .option('-c, --count <n>', 'Print top N other files. N is 10 by default', parseInt)
  .parse(process.argv);

if (program.args.length !== 1) {
  program.outputHelp();
  return;
}

var fileLookup = path.normalize(program.args[0])
// in cygwin/windows the lookup path is "Root\Lib\file.c", while git shows it as
// "Root/Lib/file.c". Changing:
fileLookup = fileLookup.replace(/\\/g, '/');

var buffer = [];
var commits = [];

var spawn = require('child_process').spawn;
var git = spawn('git', ['log', '--name-only', '--pretty=format:""']);

const rl = readline.createInterface({ input: git.stdout });
rl.on('line', processLine).on('close', printResults);

git.stderr.on('data', function (data) {
  console.error('stderr: ' + data.toString());
});

function printResults() {
  var similarities = computeSimilarities(commits)
  similarities.print(fileLookup, program.count);
}

function processLine(line) {
  if (line === '""') return;
  if (line) {
    buffer.push(line)
  } else {
    if (buffer.length > 0) {
      if (hasFile(buffer, fileLookup)) commits.push(buffer);
      buffer = [];
    }
  }
}

function hasFile(buffer, fileLookup) {
  for (var i = 0; i < buffer.length; ++i) {
    if (buffer[i] === fileLookup) return true;
  }
}
