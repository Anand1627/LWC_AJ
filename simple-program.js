// Simple JavaScript Program
// This program demonstrates basic JavaScript concepts

// 1. Variables and Data Types
const programName = "Simple JS Demo";
let counter = 0;
const numbers = [1, 2, 3, 4, 5];
const person = {
    name: "John Doe",
    age: 30,
    city: "New York"
};

// 2. Functions
function greet(name) {
    return `Hello, ${name}! Welcome to ${programName}`;
}

// Arrow function
const add = (a, b) => a + b;

// 3. Array operations
function processNumbers(arr) {
    console.log("Original numbers:", arr);
    
    // Map - multiply each number by 2
    const doubled = arr.map(num => num * 2);
    console.log("Doubled:", doubled);
    
    // Filter - get only even numbers
    const evens = arr.filter(num => num % 2 === 0);
    console.log("Even numbers:", evens);
    
    // Reduce - sum all numbers
    const sum = arr.reduce((acc, num) => acc + num, 0);
    console.log("Sum:", sum);
    
    return { doubled, evens, sum };
}

// 4. Object manipulation
function displayPerson(personObj) {
    console.log("\nPerson Information:");
    for (const [key, value] of Object.entries(personObj)) {
        console.log(`  ${key}: ${value}`);
    }
}

// 5. Async function example
async function fetchRandomJoke() {
    console.log("\nFetching a random joke...");
    try {
        // Simulating an API call with a timeout
        const joke = await new Promise((resolve) => {
            setTimeout(() => {
                resolve("Why do programmers prefer dark mode? Because light attracts bugs!");
            }, 1000);
        });
        console.log(`Joke: ${joke}`);
    } catch (error) {
        console.error("Error fetching joke:", error);
    }
}

// 6. Class example
class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(num) {
        this.result += num;
        return this;
    }
    
    subtract(num) {
        this.result -= num;
        return this;
    }
    
    multiply(num) {
        this.result *= num;
        return this;
    }
    
    divide(num) {
        if (num !== 0) {
            this.result /= num;
        } else {
            console.log("Cannot divide by zero!");
        }
        return this;
    }
    
    getResult() {
        return this.result;
    }
    
    reset() {
        this.result = 0;
        return this;
    }
}

// Main execution
async function main() {
    console.log("=".repeat(50));
    console.log("Running Simple JavaScript Program");
    console.log("=".repeat(50));
    
    // Greeting
    console.log("\n" + greet("User"));
    
    // Basic math
    console.log(`\nAddition: 5 + 3 = ${add(5, 3)}`);
    
    // Array operations
    console.log("\n--- Array Operations ---");
    processNumbers(numbers);
    
    // Object display
    console.log("\n--- Object Information ---");
    displayPerson(person);
    
    // Calculator demo
    console.log("\n--- Calculator Demo ---");
    const calc = new Calculator();
    const result = calc.add(10)
        .multiply(2)
        .subtract(5)
        .divide(3)
        .getResult();
    console.log(`Calculator result: 10 + 0 = 10, 10 * 2 = 20, 20 - 5 = 15, 15 / 3 = ${result}`);
    
    // Async operation
    await fetchRandomJoke();
    
    // Counter demonstration
    console.log("\n--- Counter Demo ---");
    for (let i = 1; i <= 5; i++) {
        counter++;
        console.log(`Counter value: ${counter}`);
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("Program completed successfully!");
    console.log("=".repeat(50));
}

// Run the program
main().catch(console.error);