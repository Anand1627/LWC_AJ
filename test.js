#!/usr/bin/env node

// Test file for the simple JavaScript program
// This demonstrates how to test the exported functions

const { generateRandomNumber, calculateStatistics, Player } = require('./simple-program');

console.log('🧪 Running tests for simple-program.js\n');

// Test 1: Random Number Generation
console.log('Test 1: Random Number Generation');
console.log('---------------------------------');
let passed = true;
for (let i = 0; i < 100; i++) {
    const num = generateRandomNumber(1, 10);
    if (num < 1 || num > 10) {
        passed = false;
        console.log(`❌ Failed: Generated ${num} which is out of range [1, 10]`);
        break;
    }
}
if (passed) {
    console.log('✅ Passed: All random numbers are within range');
}
console.log();

// Test 2: Statistics Calculation
console.log('Test 2: Statistics Calculation');
console.log('-------------------------------');
const testNumbers = [5, 10, 15, 20, 25];
const stats = calculateStatistics(testNumbers);
console.log('Input:', testNumbers);
console.log('Results:', stats);
console.log(stats.sum === 75 ? '✅ Sum correct' : '❌ Sum incorrect');
console.log(stats.mean === 15 ? '✅ Mean correct' : '❌ Mean incorrect');
console.log(stats.median === 15 ? '✅ Median correct' : '❌ Median incorrect');
console.log(stats.min === 5 ? '✅ Min correct' : '❌ Min incorrect');
console.log(stats.max === 25 ? '✅ Max correct' : '❌ Max incorrect');
console.log();

// Test 3: Player Class
console.log('Test 3: Player Class');
console.log('--------------------');
const player = new Player('TestPlayer');
console.log('Initial stats:', player.getStats());

// Simulate some games
player.recordGame(true, 5);  // Won in 5 attempts
player.recordGame(false, 7); // Lost after 7 attempts
player.recordGame(true, 3);  // Won in 3 attempts

console.log('After 3 games:', player.getStats());
console.log(player.getWinRate() === (2/3 * 100) ? '✅ Win rate calculation correct' : '❌ Win rate calculation incorrect');
console.log(player.getAverageAttempts() === 5 ? '✅ Average attempts calculation correct' : '❌ Average attempts calculation incorrect');
console.log();

// Test 4: Edge Cases
console.log('Test 4: Edge Cases');
console.log('------------------');
const emptyStats = calculateStatistics([]);
console.log('Empty array stats:', emptyStats);
console.log(emptyStats === null ? '✅ Handles empty array correctly' : '❌ Empty array handling failed');

const singleElementStats = calculateStatistics([42]);
console.log('Single element stats:', singleElementStats);
console.log(singleElementStats.mean === 42 && singleElementStats.median === 42 ? '✅ Single element handled correctly' : '❌ Single element handling failed');
console.log();

console.log('🎯 All tests completed!');
console.log('\nTo play the actual game, run: node simple-program.js');