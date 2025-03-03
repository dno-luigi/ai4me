// Core message handling
async function addMessage() {
  const message = messageInput.value.trim();
  if (message) {
    // Handle model commands
    if (message.toLowerCase().startsWith('add model')) {
      showAddModelDialog();
      messageInput.value = '';
      return;
    }
    
    // Check if API key is configured
    if (!config.apiKey) {
      addNotificationMessage('Please configure your OpenRouter API key in settings', 'red');
      return;
    }

    // Check if model is selected
    if (!config.preferredModel) {
      addNotificationMessage('Please select a model in settings', 'red');
      return;
    }

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.classList.add('user-message', 'mb-2', 'pb-2', 'border-b', 'border-[var(--text-secondary)]');
    conversation.appendChild(messageElement);
    messageInput.value = '';
    conversation.scrollTop = conversation.scrollHeight;

    const thinkingElement = document.createElement('p');
    thinkingElement.textContent = 'AI is thinking...';
    thinkingElement.classList.add('thinking-message', 'text-[var(--text-secondary)]', 'italic');
    conversation.appendChild(thinkingElement);
    conversation.scrollTop = conversation.scrollHeight;

    powerButton.classList.add('pulsate');

    try {
      // API call
      const aiResponseContent = await sendMessageToApi(message);
      
      // Process any environment control commands in the AI response
      const processedResponse = processAiControlCommands(aiResponseContent);

      // Remove the thinking element
      conversation.removeChild(thinkingElement);
      
      const aiMessageElement = document.createElement('div');
      aiMessageElement.innerHTML = marked(processedResponse);
      aiMessageElement.classList.add('ai-message', 'mb-4', 'pb-2', 'border-b', 'border-[var(--text-secondary)]');
      
      // Add message actions
      const actionsDiv = createMessageActions(aiMessageElement, processedResponse);
      aiMessageElement.appendChild(actionsDiv);
      
      conversation.appendChild(aiMessageElement);
      conversation.scrollTop = conversation.scrollHeight;

      // Save to history
      saveToHistory(message, processedResponse);

      if (config.aiSpeechEnabled) {
        // Clean up any special control syntax for speech
        const speechText = processedResponse
          .replace(/\[\[SYSTEM:.*?\]\]/gs, '')
          .replace(/\[\[RESPOND:.*?\]\]/gs, '')
          .replace(/\[\[NOTE:.*?\]\]/gs, '')
          .trim();
        
        currentUtterance = new SpeechSynthesisUtterance(speechText);
        speechSynthesis.speak(currentUtterance);
      }
    } catch (error) {
      console.error('Error:', error);
      conversation.removeChild(thinkingElement);
      
      addNotificationMessage(`Error: ${error.message}`, 'red');
    } finally {
      powerButton.classList.remove('pulsate');
    }
  }
}

// Event listeners for UI elements
document.addEventListener('DOMContentLoaded', function() {
  // Set up speech recognition
  setupEventListeners();
  
  // Model Management
  modelSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
      customModelContainer.classList.remove('hidden');
    } else if (this.value !== '') {
      customModelContainer.classList.add('hidden');
      config.preferredModel = this.value;
    }
  });

  // Panel Controls
  powerButton.addEventListener('click', () => {
    applet.classList.toggle('translate-x-full');
  });

  closeSettings.addEventListener('click', () => {
    applet.classList.add('translate-x-full');
  });

  historyButton.addEventListener('click', () => {
    history.classList.toggle('-translate-x-full');
    loadChatHistory();
  });

  closeHistory.addEventListener('click', () => {
    history.classList.add('-translate-x-full');
  });

  // Theme Buttons
  darkTheme.addEventListener('click', () => setTheme('dark-mode'));
  lightTheme.addEventListener('click', () => setTheme('light-mode'));
  greenTheme.addEventListener('click', () => setTheme('green-mode'));
  blueTheme.addEventListener('click', () => setTheme('blue-mode'));
  purpleTheme.addEventListener('click', () => setTheme('purple-mode'));
  darkblueTheme.addEventListener('click', () => setTheme('darkblue-mode'));
  darkpurpleTheme.addEventListener('click', () => setTheme('darkpurple-mode'));
  
  // Accent color buttons
  const accentColorButtons = document.querySelectorAll('[data-color]');
  accentColorButtons.forEach(button => {
    button.addEventListener('click', function() {
      setAccentColor(this.dataset.color);
    });
  });
  
  // API Key validation
  document.getElementById('validateApiKey').addEventListener('click', async () => {
    const key = document.getElementById('apiKey').value.trim();
    const isValid = await validateApiKey(key);
    if (isValid) {
      config.apiKey = key;
      localStorage.setItem('apiKey', key);
      addNotificationMessage('API key validated successfully!', 'green');
    }
  });
  
  // Save Settings
  document.getElementById('saveSettings').addEventListener('click', () => {
    config.apiKey = document.getElementById('apiKey').value.trim();
    config.preferredModel = modelSelect.value;
    config.userInfo = document.getElementById('userInfo').value;
    config.responseInstructions = document.getElementById('responseInstructions').value;
    config.aiSpeechEnabled = document.getElementById('aiSpeechToggle').checked;
    config.aiNotes = document.getElementById('aiNotes').value;
    
    localStorage.setItem('apiKey', config.apiKey);
    localStorage.setItem('preferredModel', config.preferredModel);
    localStorage.setItem('userInfo', config.userInfo);
    localStorage.setItem('responseInstructions', config.responseInstructions);
    localStorage.setItem('aiSpeechEnabled', config.aiSpeechEnabled);
    localStorage.setItem('aiNotes', config.aiNotes);
    
    addNotificationMessage('Settings saved successfully!', 'green');
    applet.classList.add('translate-x-full');
  });

  // Talk/Send Button
  talkButton.addEventListener('click', () => {
    if (recognizing) {
      recognition.stop();
    } else if (!config.aiSpeechEnabled) {
      addMessage();
    } else {
      if (currentUtterance) {
        speechSynthesis.cancel();
        currentUtterance = null;
      }
      recognition.start();
    }
  });

  // Input
  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addMessage();
    }
  });

  // Initialize data from localStorage
  config.apiKey = localStorage.getItem('apiKey') || '';
  config.preferredModel = localStorage.getItem('preferredModel') || '';
  config.userInfo = localStorage.getItem('userInfo') || '';
  config.responseInstructions = localStorage.getItem('responseInstructions') || '';
  config.aiSpeechEnabled = localStorage.getItem('aiSpeechEnabled') === 'true';
  config.aiNotes = localStorage.getItem('aiNotes') || '';
  config.textSize = parseInt(localStorage.getItem('textSize')) || 16;
  config.currentTheme = localStorage.getItem('theme') || 'dark-mode';
  config.buttonRadius = parseInt(localStorage.getItem('buttonRadius')) || 6;
  config.accentColor = localStorage.getItem('accentColor') || '#3b82f6';
  chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  customModels = JSON.parse(localStorage.getItem('customModels')) || [];

  // Set appearance
  setTheme(config.currentTheme);
  setButtonRoundness(config.buttonRadius);
  setAccentColor(config.accentColor);
  
  // Update UI with current values
  buttonRoundness.value = config.buttonRadius;
  textSizeDisplay.textContent = `${config.textSize}px`;
  
  // Load custom models
  loadCustomModels();

  // Set initial values for form fields
  document.getElementById('apiKey').value = config.apiKey;
  document.getElementById('userInfo').value = config.userInfo || '';
  document.getElementById('responseInstructions').value = config.responseInstructions || '';
  document.getElementById('aiSpeechToggle').checked = config.aiSpeechEnabled;
  document.getElementById('aiNotes').value = config.aiNotes || '';
  conversation.style.fontSize = `${config.textSize}px`;
  
  // Update the talk button text based on speech setting
  updateTalkButtonText();
  
  // Show welcome message if no history
  if (chatHistory.length === 0) {
    const welcomeElement = document.createElement('div');
    welcomeElement.innerHTML = marked(`
# Welcome to AI Chat!

To get started:
1. Click the settings button (⚙️) in the top-left
2. Enter your OpenRouter API key
3. Select a model from the dropdown
4. Save settings

**Features:**
- 7 theme options including Dark Purple and Dark Blue
- Custom shapes and colors for all interface elements
- Add custom models and more
    `);
    conversation.appendChild(welcomeElement);
  }
});
