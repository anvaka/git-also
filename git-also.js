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

// Only commits that have this file will be counted:
var fileLookup = path.resolve(program.args[0])

// Change working directory based on input path
try {
    var dirName = path.dirname(fileLookup);
    process.chdir(dirName);
} catch(error) {
    if (error.code === 'ENOENT') {
        console.log('no such directory: ' + dirName);
        process.exitCode = 1;
    } else {
        // re-raise the error if it's not an ENOENT
        throw(error);
    }
    return;
}

fileLookup = path.normalize(fileLookup);
// in cygwin/windows the lookup path is "Root\Lib\file.c", while git shows it as
// "Root/Lib/file.c". Changing:
fileLookup = fileLookup.replace(/\\/g, '/');

var chilidProcess = require('child_process')

fixNestedPaths(processGitLogs);

function fixNestedPaths(finishedCallback) {
  var cmd = 'git rev-parse --show-toplevel';
  chilidProcess.exec(cmd, function(error, stdout, stderr) {
    if (error) {
      if (stderr) console.log(stderr);
      else {
        console.log('something is wrong: ', error);
      }
      process.exit(2);
    }

    // stdout has \n at the end - remove it
    var gitRoot = stdout.trim();
    // fileLookup is guaranteed to have gitRoot in it (since we've done path.resolve aboce)
    // just remove the git root, and that will give us relative file name (which is printed
    // by `git log` output)
    fileLookup = fileLookup.substring(gitRoot.length + 1);
    finishedCallback();
  });
}

function processGitLogs() {
  var buffer = [];
  var commits = [];

  var git = chilidProcess.spawn('git', ['log', '--name-only', '--pretty=format:""']);

  var rl = readline.createInterface({ input: git.stdout });
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
}
