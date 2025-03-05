// UI Components

// Function to create a feedback interface for user interests
function createFeedbackInterface() {
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-interface';

  const interestsTitle = document.createElement('h3');
  interestsTitle.textContent = 'Detected Interests:';
  feedbackDiv.appendChild(interestsTitle);

  userInterests.forEach(interest => {
    const interestItem = document.createElement('div');
    interestItem.className = 'interest-item';
    interestItem.textContent = interest;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = () => {
      console.log(`Confirmed interest: ${interest}`);
      // Logic to confirm interest (e.g., save to a confirmed list)
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
      console.log(`Deleted interest: ${interest}`);
      userInterests = userInterests.filter(i => i !== interest);
      saveUserInterests(); // Update local storage
      feedbackDiv.removeChild(interestItem); // Remove from UI
    };

    interestItem.appendChild(confirmButton);
    interestItem.appendChild(deleteButton);
    feedbackDiv.appendChild(interestItem);
  });

  document.body.appendChild(feedbackDiv);
}

// Call this function to display the feedback interface
createFeedbackInterface();
