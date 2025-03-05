// Memory Management Module

// Array to hold user interests/preferences
let userInterests = [];

// Function to detect user interests/preferences from input
function detectUserInterests(input) {
  console.log(`Detecting interests from input: "${input}"`); // Debugging statement
  // Simple example: Detect keywords in the input
  const keywords = ['writing', 'coding', 'design', 'music'];
  keywords.forEach(keyword => {
    if (input.includes(keyword)) {
      console.log(`Detected interest: "${keyword}"`); // Debugging statement
      if (!userInterests.includes(keyword)) {
        userInterests.push(keyword);
        console.log(`Updated interests: ${JSON.stringify(userInterests)}`); // Debugging statement
      }
    }
  });
  // Save interests after detection
  saveUserInterests();
}

// Function to save user interests/preferences to local storage
function saveUserInterests() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('userInterests', JSON.stringify(userInterests));
  }
}

// Function to load user interests/preferences from local storage
function loadUserInterests() {
  if (typeof localStorage !== 'undefined') {
    const storedInterests = JSON.parse(localStorage.getItem('userInterests'));
    if (storedInterests) {
      userInterests = storedInterests;
    }
  }
}

// Initialize user interests on load
loadUserInterests();

// Export the detectUserInterests function and userInterests array
module.exports = { detectUserInterests, userInterests };