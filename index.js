function parseNameFromArgs(argv) {
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--name' || arg === '-n') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        return next;
      }
      return '';
    }
    const [key, value] = arg.split('=');
    if ((key === '--name' || key === '-n') && value) {
      return value;
    }
  }
  return '';
}

function greet(name) {
  const person = name && name.trim().length > 0 ? name.trim() : 'world';
  console.log(`Hello, ${person}!`);
}

if (require.main === module) {
  const name = parseNameFromArgs(process.argv);
  greet(name);
}

module.exports = { greet, parseNameFromArgs };

