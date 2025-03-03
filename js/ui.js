// UI Components
function createMessageActions(messageElement, messageText) {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'message-actions flex mt-2';
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'action-btn';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(messageText).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    });
  };
  
  // Read button
  const readBtn = document.createElement('button');
  readBtn.className = 'action-btn';
  readBtn.innerHTML = '<i class="fas fa-volume-up"></i> Read';
  readBtn.onclick = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    const cleanedText = messageText
      .replace(/\[\[SYSTEM:.*?\]\]/gs, '')
      .replace(/\[\[RESPOND:.*?\]\]/gs, '')
      .replace(/\[\[NOTE:.*?\]\]/gs, '')
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    speechSynthesis.speak(utterance);
  };
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn bg-red-600 text-white';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
  deleteBtn.onclick = () => {
    if (confirm('Delete this message?')) {
      const userMessageElement = messageElement.previousElementSibling;
      conversation.removeChild(messageElement);
      if (userMessageElement && userMessageElement.classList.contains('user-message')) {
        conversation.removeChild(userMessageElement);
      }
    }
  };
  
  actionsDiv.appendChild(copyBtn);
  actionsDiv.appendChild(readBtn);
  actionsDiv.appendChild(deleteBtn);
  
  return actionsDiv;
}

function addNotificationMessage(message, color = 'green') {
  const notificationElement = document.createElement('p');
  notificationElement.textContent = message;
  notificationElement.style.color = color;
  notificationElement.classList.add('notification-message', 'mb-2');
  conversation.appendChild(notificationElement);
  conversation.scrollTop = conversation.scrollHeight;
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (conversation.contains(notificationElement)) {
      conversation.removeChild(notificationElement);
    }
  }, 5000);
}

function updateTalkButtonText() {
  talkButton.textContent = config.aiSpeechEnabled ? (recognizing ? 'Stop' : 'Talk') : 'Send';
}

// Add click handlers for UI elements
function setupEventListeners() {
  // Speech recognition setup
  if (recognition) {
    recognition.onstart = function() {
      recognizing = true;
      talkButton.textContent = 'Stop';
    };

    recognition.onend = function() {
      recognizing = false;
      updateTalkButtonText();
    };

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      messageInput.value = transcript;
      addMessage();
    };
  }
}
