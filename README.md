# Simple JavaScript Program - Number Guessing Game

A fun and interactive console-based number guessing game that demonstrates various JavaScript concepts.

## Features

- 🎮 Interactive gameplay with user input
- 🎯 Random number generation
- 📊 Input validation and error handling
- 🔄 Play again functionality
- 🏆 Performance rating based on attempts
- 💡 Helpful hints (too high/too low)

## How to Run

### Option 1: Using Node.js directly
```bash
node simple-program.js
```

### Option 2: Using npm
```bash
npm start
```

### Option 3: Make it executable (Linux/Mac)
```bash
chmod +x simple-program.js
./simple-program.js
```

## How to Play

1. The program will generate a random number between 1 and 100
2. You have 7 attempts to guess the number
3. After each guess, you'll receive a hint:
   - 📈 "Too low!" if your guess is below the target
   - 📉 "Too high!" if your guess is above the target
4. Try to guess the number in as few attempts as possible!
5. After the game ends, you can choose to play again

## JavaScript Concepts Demonstrated

This program showcases several important JavaScript concepts:

### Core Features Used:
- **Variables and Constants**: Using `const` and `let` for different scopes
- **Functions**: Both regular and arrow functions
- **Async/Await**: For handling asynchronous user input
- **Promises**: Used in the getUserGuess function
- **Control Flow**: if/else statements and while loops
- **Template Literals**: For dynamic string formatting
- **Array Methods**: reduce, sort, map (in utility functions)
- **Error Handling**: Try-catch blocks and input validation
- **Node.js Modules**: Using readline for console interaction

### Additional Demonstrations:
- **Classes**: Example Player class for OOP demonstration
- **Statistical Functions**: Calculate mean, median, min, max
- **Module Exports**: Proper module structure for reusability

## Code Structure

```
simple-program.js
├── Configuration constants
├── Utility functions
│   ├── generateRandomNumber()
│   ├── displayWelcome()
│   ├── getUserGuess()
│   └── provideFeedback()
├── Main game logic
│   └── playGame()
├── Event handlers
├── Bonus demonstrations
│   ├── calculateStatistics()
│   └── Player class
└── Module exports
```

## Requirements

- Node.js version 14.0.0 or higher
- No additional npm packages required (uses built-in readline module)

## Customization

You can easily modify the game by changing these constants at the top of the file:
- `MIN_NUMBER`: Minimum number for the range (default: 1)
- `MAX_NUMBER`: Maximum number for the range (default: 100)
- `MAX_ATTEMPTS`: Number of allowed guesses (default: 7)

## Learning Resources

This program is great for learning because it:
1. Uses only built-in Node.js modules (no external dependencies)
2. Includes extensive comments explaining each section
3. Demonstrates both basic and intermediate JavaScript concepts
4. Shows proper code organization and structure
5. Includes input validation and error handling

## Sample Output

```
╔════════════════════════════════════════╗
║     Welcome to Number Guessing Game!   ║
╚════════════════════════════════════════╝

I'm thinking of a number between 1 and 100.
You have 7 attempts to guess it!

Attempt 1/7 - Enter your guess: 50
📈 Too low! Try a higher number. (6 attempts left)

Attempt 2/7 - Enter your guess: 75
📉 Too high! Try a lower number. (5 attempts left)

Attempt 3/7 - Enter your guess: 62
🎉 Congratulations! You guessed the number!
✨ You won in 3 attempts!

🏆 Amazing! You're a mind reader!
```

## License

MIT License - Feel free to use and modify this code for learning purposes!