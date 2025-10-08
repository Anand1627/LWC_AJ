#!/usr/bin/env node
'use strict';

function generateGreeting(name, shouldUppercase) {
  const normalizedName = String(name).trim() || 'World';
  const message = `Hello, ${normalizedName}!`;
  return shouldUppercase ? message.toUpperCase() : message;
}

function parseCommandLineArguments(argv) {
  const args = argv.slice(2);
  let name = 'World';
  let shouldUppercase = false;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--upper' || token === '-u') {
      shouldUppercase = true;
      continue;
    }
    if (!token.startsWith('-') && name === 'World') {
      name = token;
      continue;
    }
  }

  return { name, shouldUppercase };
}

function main() {
  const { name, shouldUppercase } = parseCommandLineArguments(process.argv);
  const greeting = generateGreeting(name, shouldUppercase);
  console.log(greeting);
}

if (require.main === module) {
  main();
}

