// UI Components
function createMessageActions(messageElement, messageText) {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'message-actions flex mt-2';
  
  // Get button preferences from localStorage
  let buttonSize = localStorage.getItem('buttonSize') || 'medium';
  const sizeClass = buttonSize === 'small' ? 'text-xs px-2 py-1' : 
                   buttonSize === 'medium' ? 'text-sm px-3 py-1.5' : 
                   'text-base px-4 py-2';
  
  let buttonIcons = {};
  try {
    const savedIcons = localStorage.getItem('buttonIcons');
    if (savedIcons) {
      buttonIcons = JSON.parse(savedIcons);
    }
  } catch (e) {
    console.error('Error parsing button icons:', e);
  }
  
  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = `action-btn ${sizeClass}`;
  
  const copyIcon = buttonIcons.copy || 'fa-copy';
  copyBtn.innerHTML = `<i class="fas ${copyIcon}"></i> Copy`;
  
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
  readBtn.className = `action-btn ${sizeClass}`;
  
  const readIcon = buttonIcons.read || 'fa-volume-up';
  const stopIcon = buttonIcons.stop || 'fa-volume-mute';
  readBtn.innerHTML = `<i class="fas ${readIcon}"></i> Read`;
  
  readBtn.onclick = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      readBtn.innerHTML = `<i class="fas ${readIcon}"></i> Read`;
    } else {
      const cleanedText = messageText
        .replace(/\[\[SYSTEM:.*?\]\]/gs, '')
        .replace(/\[\[RESPOND:.*?\]\]/gs, '')
        .replace(/\[\[NOTE:.*?\]\]/gs, '')
        .replace(/\[\[THEME:.*?\]\]/gs, '')
        .replace(/\[\[COLOR:.*?\]\]/gs, '')
        .replace(/\[\[TEXT_SIZE:.*?\]\]/gs, '')
        .replace(/\[\[BUTTONS:.*?\]\]/gs, '')
        .trim();
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.onstart = () => {
        readBtn.innerHTML = `<i class="fas ${stopIcon}"></i> Stop`;
      };
      utterance.onend = () => {
        readBtn.innerHTML = `<i class="fas ${readIcon}"></i> Read`;
      };
      speechSynthesis.speak(utterance);
    }
  };
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = `action-btn bg-red-600 text-white ${sizeClass}`;
  
  const deleteIcon = buttonIcons.delete || 'fa-trash';
  deleteBtn.innerHTML = `<i class="fas ${deleteIcon}"></i> Delete`;
  
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
