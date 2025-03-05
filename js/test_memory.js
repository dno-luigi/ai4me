// Test Memory Functionality

// Mock localStorage
const localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  clear() {
    this.store = {};
  }
};

// Import the detectUserInterests function and userInterests from memory.js using CommonJS syntax
const { detectUserInterests, userInterests } = require('./memory.js');

// Simulate user input
function testMemoryFunctionality() {
  const testInputs = [
    "I love writing and coding.",
    "My favorite hobby is music.",
    "I am interested in design and art."
  ];

  testInputs.forEach(input => {
    console.log(`Testing input: "${input}"`);
    detectUserInterests(input);
    console.log(`Current interests: ${JSON.stringify(userInterests)}`);
  });
}

// Run the test
testMemoryFunctionality();