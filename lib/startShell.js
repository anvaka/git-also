var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter file to find what is related: '
});

module.exports = startShell;

function startShell(similarities) {
  rl.prompt();

  rl.on('line', printLine).on('close', printBye);

  function printLine(line) {
    var entered = line.trim();
    similarities.print(entered);
    rl.prompt();
  }

  function printBye() {
    console.log('Have a great day!');
    process.exit(0);
  }
}
