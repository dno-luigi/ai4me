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
          
          // Process markdown with marked
          const renderedHtml = marked(processedResponse);
          
          // Add copy buttons to code blocks
          const processedHtml = renderedHtml.replace(/<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g, function(match, attrs, codeContent) {
            return `<pre class="relative group"><code${attrs}>${codeContent}</code><button class="code-copy-btn absolute top-2 right-2 bg-[var(--accent-color)] text-white text-xs px-2 py-1 rounded-custom opacity-0 group-hover:opacity-100 transition-opacity" onclick="navigator.clipboard.writeText(this.parentElement.querySelector('code').innerText.trim())"><i class="fas fa-clone"></i> Copy</button></pre>`;
          });
          
          aiMessageElement.innerHTML = processedHtml;
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
    const historyPanel = document.getElementById('history');
    if (historyPanel) {
      historyPanel.classList.toggle('-translate-x-full');
      loadChatHistory();
    }
  });

  closeHistory.addEventListener('click', () => {
    const historyPanel = document.getElementById('history');
    if (historyPanel) {
      historyPanel.classList.add('-translate-x-full');
    }
  });

  // Theme Buttons
  darkTheme.addEventListener('click', () => setTheme('dark-mode'));
  lightTheme.addEventListener('click', () => setTheme('light-mode'));
  greenTheme.addEventListener('click', () => setTheme('green-mode'));
  blueTheme.addEventListener('click', () => setTheme('blue-mode'));
  purpleTheme.addEventListener('click', () => setTheme('purple-mode'));
  darkblueTheme.addEventListener('click', () => setTheme('darkblue-mode'));
  darkpurpleTheme.addEventListener('click', () => setTheme('darkpurple-mode'));
  
  // History buttons
  document.getElementById('copyHistory').addEventListener('click', () => {
    if (chatHistory.length === 0) {
      addNotificationMessage('No history to copy', 'red');
      return;
    }
    
    let fullHistory = '';
    chatHistory.forEach((conversation, index) => {
      fullHistory += `--- Conversation ${index + 1} (${conversation.timestamp}) ---\n\n`;
      conversation.messages.forEach(msg => {
        fullHistory += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n\n`;
      });
      fullHistory += '\n\n';
    });
    
    navigator.clipboard.writeText(fullHistory).then(() => {
      addNotificationMessage('Chat history copied to clipboard', 'green');
    });
  });
  
  document.getElementById('exportHistory').addEventListener('click', () => {
    if (chatHistory.length === 0) {
      addNotificationMessage('No history to export', 'red');
      return;
    }
    
    // Option 1: Export as formatted text
    let fullHistory = '';
    chatHistory.forEach((conversation, index) => {
      fullHistory += `--- Conversation ${index + 1} (${conversation.timestamp}) ---\n\n`;
      conversation.messages.forEach(msg => {
        fullHistory += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n\n`;
      });
      fullHistory += '\n\n';
    });
    
    // Option 2: Export as JSON
    const jsonHistory = JSON.stringify(chatHistory, null, 2);
    
    // Create element with both download options
    const exportOptionsElement = document.createElement('div');
    exportOptionsElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10';
    exportOptionsElement.innerHTML = `
      <div class="bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 rounded-md w-80">
        <h3 class="text-lg font-bold mb-4">Export Format</h3>
        <p class="text-sm mb-4">Choose export format:</p>
        <div class="flex justify-between">
          <button id="exportText" class="px-4 py-2 rounded-custom bg-[var(--accent-color)] text-white text-sm">Text File</button>
          <button id="exportJSON" class="px-4 py-2 rounded-custom bg-[var(--accent-color)] text-white text-sm">JSON File</button>
          <button id="cancelExport" class="px-4 py-2 rounded-custom bg-gray-600 text-white text-sm">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(exportOptionsElement);
    
    // Set up export buttons
    document.getElementById('exportText').addEventListener('click', () => {
      downloadFile(fullHistory, 'ai-chat-history.txt', 'text/plain');
      document.body.removeChild(exportOptionsElement);
    });
    
    document.getElementById('exportJSON').addEventListener('click', () => {
      downloadFile(jsonHistory, 'ai-chat-history.json', 'application/json');
      document.body.removeChild(exportOptionsElement);
    });
    
    document.getElementById('cancelExport').addEventListener('click', () => {
      document.body.removeChild(exportOptionsElement);
    });
  });
  
  document.getElementById('clearHistory').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      chatHistory = [];
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      loadChatHistory();
      addNotificationMessage('Chat history cleared', 'green');
    }
  });
  
  // Function to download a file
  function downloadFile(content, filename, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    addNotificationMessage(`Exported chat history as ${filename}`, 'green');
  }
  
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
