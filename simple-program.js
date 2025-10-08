#!/usr/bin/env node

// Simple JavaScript Program - Number Guessing Game
// This program demonstrates basic JavaScript concepts including:
// - Variables and data types
// - Functions
// - Control flow (if/else, loops)
// - User input/output
// - Random number generation
// - Error handling

const readline = require('readline');

// Create interface for reading user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Game configuration
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const MAX_ATTEMPTS = 7;

// Generate a random number between min and max (inclusive)
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Display welcome message
function displayWelcome() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     Welcome to Number Guessing Game!   ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`I'm thinking of a number between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
    console.log(`You have ${MAX_ATTEMPTS} attempts to guess it!\n`);
}

// Get user's guess
function getUserGuess(attemptNumber) {
    return new Promise((resolve) => {
        rl.question(`Attempt ${attemptNumber}/${MAX_ATTEMPTS} - Enter your guess: `, (answer) => {
            const guess = parseInt(answer);
            resolve(guess);
        });
    });
}

// Provide feedback on the guess
function provideFeedback(guess, target, attemptsLeft) {
    if (guess < target) {
        console.log(`📈 Too low! Try a higher number. (${attemptsLeft} attempts left)\n`);
        return false;
    } else if (guess > target) {
        console.log(`📉 Too high! Try a lower number. (${attemptsLeft} attempts left)\n`);
        return false;
    } else {
        return true;
    }
}

// Main game function
async function playGame() {
    displayWelcome();
    
    const targetNumber = generateRandomNumber(MIN_NUMBER, MAX_NUMBER);
    let attempts = 0;
    let hasWon = false;
    
    // Game loop
    while (attempts < MAX_ATTEMPTS && !hasWon) {
        attempts++;
        const guess = await getUserGuess(attempts);
        
        // Validate input
        if (isNaN(guess) || guess < MIN_NUMBER || guess > MAX_NUMBER) {
            console.log(`⚠️  Please enter a valid number between ${MIN_NUMBER} and ${MAX_NUMBER}.\n`);
            attempts--; // Don't count invalid attempts
            continue;
        }
        
        // Check if guess is correct
        hasWon = provideFeedback(guess, targetNumber, MAX_ATTEMPTS - attempts);
        
        if (hasWon) {
            console.log('\n🎉 Congratulations! You guessed the number!');
            console.log(`✨ You won in ${attempts} attempt${attempts === 1 ? '' : 's'}!\n`);
            
            // Display performance rating
            if (attempts <= 3) {
                console.log('🏆 Amazing! You\'re a mind reader!');
            } else if (attempts <= 5) {
                console.log('⭐ Great job! Very impressive!');
            } else {
                console.log('👍 Good work! You got it!');
            }
        }
    }
    
    // Game over - player didn't guess the number
    if (!hasWon) {
        console.log('\n😔 Game Over! You\'ve run out of attempts.');
        console.log(`The number was: ${targetNumber}`);
        console.log('Better luck next time!\n');
    }
    
    // Ask if player wants to play again
    rl.question('\nWould you like to play again? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            console.clear();
            playGame();
        } else {
            console.log('\nThanks for playing! Goodbye! 👋\n');
            rl.close();
            process.exit(0);
        }
    });
}

// Handle cleanup when program exits
rl.on('close', () => {
    console.log('\nGame ended. See you next time!');
    process.exit(0);
});

// Start the game
playGame().catch((error) => {
    console.error('An error occurred:', error);
    rl.close();
});

// Additional utility functions for demonstration

// Function to calculate statistics (not used in game, but demonstrates more JS features)
function calculateStatistics(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return null;
    }
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const mean = sum / numbers.length;
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const median = sortedNumbers.length % 2 === 0
        ? (sortedNumbers[sortedNumbers.length / 2 - 1] + sortedNumbers[sortedNumbers.length / 2]) / 2
        : sortedNumbers[Math.floor(sortedNumbers.length / 2)];
    
    return {
        sum,
        mean,
        median,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        count: numbers.length
    };
}

// Example of a class (not used in game, but demonstrates OOP in JavaScript)
class Player {
    constructor(name) {
        this.name = name;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.totalAttempts = 0;
    }
    
    recordGame(won, attempts) {
        this.gamesPlayed++;
        if (won) {
            this.gamesWon++;
        }
        this.totalAttempts += attempts;
    }
    
    getWinRate() {
        return this.gamesPlayed === 0 ? 0 : (this.gamesWon / this.gamesPlayed) * 100;
    }
    
    getAverageAttempts() {
        return this.gamesPlayed === 0 ? 0 : this.totalAttempts / this.gamesPlayed;
    }
    
    getStats() {
        return {
            name: this.name,
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            winRate: `${this.getWinRate().toFixed(1)}%`,
            averageAttempts: this.getAverageAttempts().toFixed(2)
        };
    }
}

// Export functions if this module is imported (for testing or reuse)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRandomNumber,
        calculateStatistics,
        Player
    };
}