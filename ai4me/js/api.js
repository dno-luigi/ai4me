// API Communication
async function validateApiKey(key) {
  if (!key) {
    updateApiKeyStatus('Please enter an API key', false);
    return false;
  }

  try {
    // Simple validation request to OpenRouter
    const response = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.ok) {
      updateApiKeyStatus('API key is valid!', true);
      return true;
    } else {
      updateApiKeyStatus('Invalid API key', false);
      return false;
    }
  } catch (error) {
    updateApiKeyStatus('Error validating API key', false);
    console.error('Validation error:', error);
    return false;
  }
}

function updateApiKeyStatus(message, isValid) {
  const apiKeyStatus = document.getElementById('apiKeyStatus');
  if (apiKeyStatus) {
    apiKeyStatus.textContent = message;
    apiKeyStatus.classList.remove('hidden', 'text-green-500', 'text-red-500');
    apiKeyStatus.classList.add(isValid ? 'text-green-500' : 'text-red-500');
    apiKeyStatus.classList.remove('hidden');
  }
  isApiKeyValid = isValid;
}

// Process AI Control Commands
function processAiControlCommands(aiResponse) {
  let updatedResponse = aiResponse;
  
  // Check for system prompt updates
  if (aiResponse.includes('[[SYSTEM:')) {
    const systemMatch = aiResponse.match(/\[\[SYSTEM:(.*?)\]\]/s);
    if (systemMatch && systemMatch[1]) {
      config.userInfo = systemMatch[1].trim();
      const userInfoInput = document.getElementById('userInfo');
      if (userInfoInput) userInfoInput.value = config.userInfo;
      localStorage.setItem('userInfo', config.userInfo);
      updatedResponse = updatedResponse.replace(/\[\[SYSTEM:(.*?)\]\]/s, '*System prompt updated*\n\n');
    }
  }
  
  // Check for response instruction updates
  if (aiResponse.includes('[[RESPOND:')) {
    const respondMatch = aiResponse.match(/\[\[RESPOND:(.*?)\]\]/s);
    if (respondMatch && respondMatch[1]) {
      config.responseInstructions = respondMatch[1].trim();
      const responseInstructionsInput = document.getElementById('responseInstructions');
      if (responseInstructionsInput) responseInstructionsInput.value = config.responseInstructions;
      localStorage.setItem('responseInstructions', config.responseInstructions);
      updatedResponse = updatedResponse.replace(/\[\[RESPOND:(.*?)\]\]/s, '*Response instructions updated*\n\n');
    }
  }
  
  // Check for note updates
  if (aiResponse.includes('[[NOTE:')) {
    const noteMatch = aiResponse.match(/\[\[NOTE:(.*?)\]\]/s);
    if (noteMatch && noteMatch[1]) {
      config.aiNotes = noteMatch[1].trim();
      const aiNotesInput = document.getElementById('aiNotes');
      if (aiNotesInput) aiNotesInput.value = config.aiNotes;
      localStorage.setItem('aiNotes', config.aiNotes);
      updatedResponse = updatedResponse.replace(/\[\[NOTE:(.*?)\]\]/s, '*Note saved*\n\n');
    }
  }
  
  // Check for theme updates
  if (aiResponse.includes('[[THEME:')) {
    const themeMatch = aiResponse.match(/\[\[THEME:(.*?)\]\]/s);
    if (themeMatch && themeMatch[1]) {
      const theme = themeMatch[1].trim().toLowerCase();
      const validThemes = ['dark-mode', 'light-mode', 'green-mode', 'blue-mode', 'purple-mode', 'darkblue-mode', 'darkpurple-mode'];
      if (validThemes.includes(theme)) {
        setTheme(theme);
        updatedResponse = updatedResponse.replace(/\[\[THEME:(.*?)\]\]/s, `*Theme changed to ${theme}*\n\n`);
      } else {
        updatedResponse = updatedResponse.replace(/\[\[THEME:(.*?)\]\]/s, '*Invalid theme specified*\n\n');
      }
    }
  }
  
  // Check for text size updates
  if (aiResponse.includes('[[TEXT_SIZE:')) {
    const sizeMatch = aiResponse.match(/\[\[TEXT_SIZE:(.*?)\]\]/s);
    if (sizeMatch && sizeMatch[1]) {
      const size = parseInt(sizeMatch[1].trim());
      if (!isNaN(size) && size >= 12 && size <= 28) {
        config.textSize = size;
        document.getElementById('conversation').style.fontSize = `${size}px`;
        const textSizeDisplay = document.getElementById('textSizeDisplay');
        if (textSizeDisplay) textSizeDisplay.textContent = `${size}px`;
        localStorage.setItem('textSize', size);
        updatedResponse = updatedResponse.replace(/\[\[TEXT_SIZE:(.*?)\]\]/s, `*Text size changed to ${size}px*\n\n`);
      } else {
        updatedResponse = updatedResponse.replace(/\[\[TEXT_SIZE:(.*?)\]\]/s, '*Invalid text size (must be between 12 and 28)*\n\n');
      }
    }
  }
  
  // Check for accent color updates
  if (aiResponse.includes('[[COLOR:')) {
    const colorMatch = aiResponse.match(/\[\[COLOR:(.*?)\]\]/s);
    if (colorMatch && colorMatch[1]) {
      const color = colorMatch[1].trim();
      const validColors = {
        'blue': '#3b82f6',
        'green': '#10b981',
        'red': '#ef4444',
        'yellow': '#f59e0b',
        'purple': '#8b5cf6',
        'pink': '#ec4899',
        'cyan': '#06b6d4',
        'teal': '#14b8a6'
      };
      
      if (validColors[color.toLowerCase()]) {
        setAccentColor(validColors[color.toLowerCase()]);
        updatedResponse = updatedResponse.replace(/\[\[COLOR:(.*?)\]\]/s, `*Accent color changed to ${color}*\n\n`);
      } else if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
        setAccentColor(color);
        updatedResponse = updatedResponse.replace(/\[\[COLOR:(.*?)\]\]/s, `*Accent color changed to ${color}*\n\n`);
      } else {
        updatedResponse = updatedResponse.replace(/\[\[COLOR:(.*?)\]\]/s, '*Invalid accent color*\n\n');
      }
    }
  }
  
  // Check for button style updates
  if (aiResponse.includes('[[BUTTONS:')) {
    const buttonMatch = aiResponse.match(/\[\[BUTTONS:(.*?)\]\]/s);
    if (buttonMatch && buttonMatch[1]) {
      try {
        const buttonSettings = buttonMatch[1].trim();
        const settings = JSON.parse(buttonSettings);
        
        // Update button size if provided
        if (settings.size) {
          const size = settings.size.toLowerCase();
          const validSizes = ['small', 'medium', 'large'];
          if (validSizes.includes(size)) {
            const sizeValue = size === 'small' ? 'text-xs px-2 py-1' : 
                             size === 'medium' ? 'text-sm px-3 py-1.5' : 
                             'text-base px-4 py-2';
            
            document.documentElement.style.setProperty('--button-size-class', sizeValue);
            
            // Apply the new size to all action buttons
            const actionButtons = document.querySelectorAll('.action-btn');
            actionButtons.forEach(btn => {
              // Remove existing size classes
              btn.classList.remove('text-xs', 'text-sm', 'text-base', 'px-2', 'px-3', 'px-4', 'py-1', 'py-1.5', 'py-2');
              // Add new size classes
              btn.className = btn.className + ' ' + sizeValue;
            });
            
            // Also apply to main talk/send button if requested
            if (settings.applyToMain) {
              const talkButton = document.getElementById('talkButton');
              if (talkButton) {
                talkButton.classList.remove('text-xl', 'text-2xl', 'text-3xl');
                talkButton.classList.add(size === 'small' ? 'text-xl' : 
                                       size === 'medium' ? 'text-2xl' : 
                                       'text-3xl');
              }
            }
            
            localStorage.setItem('buttonSize', size);
            updatedResponse = updatedResponse.replace(/\[\[BUTTONS:(.*?)\]\]/s, `*Button size changed to ${size}*\n\n`);
          } else {
            updatedResponse = updatedResponse.replace(/\[\[BUTTONS:(.*?)\]\]/s, '*Invalid button size (must be small, medium, or large)*\n\n');
            return updatedResponse;
          }
        }
        
        // Update button icons if provided
        if (settings.icons) {
          const validIcons = {
            'copy': ['fa-copy', 'fa-clone', 'fa-files-o', 'fa-clipboard'],
            'read': ['fa-volume-up', 'fa-headphones', 'fa-book', 'fa-file-audio-o', 'fa-play'],
            'delete': ['fa-trash', 'fa-trash-o', 'fa-times', 'fa-remove', 'fa-times-circle'],
            'stop': ['fa-volume-mute', 'fa-volume-off', 'fa-stop', 'fa-pause']
          };
          
          // Validate icons
          let validIconChoices = true;
          Object.keys(settings.icons).forEach(key => {
            if (!validIcons[key] || !validIcons[key].includes(settings.icons[key])) {
              validIconChoices = false;
            }
          });
          
          if (!validIconChoices) {
            updatedResponse = updatedResponse.replace(/\[\[BUTTONS:(.*?)\]\]/s, '*Invalid icon names provided*\n\n');
            return updatedResponse;
          }
          
          // Save icon preferences
          localStorage.setItem('buttonIcons', JSON.stringify(settings.icons));
          
          // Update actually happens on next button creation, so we don't need to find existing buttons
          if (!updatedResponse.includes('*Button size changed to')) {
            updatedResponse = updatedResponse.replace(/\[\[BUTTONS:(.*?)\]\]/s, '*Button icons updated*\n\n');
          }
        }
      } catch (e) {
        console.error('Error parsing button settings:', e);
        updatedResponse = updatedResponse.replace(/\[\[BUTTONS:(.*?)\]\]/s, '*Invalid button settings format*\n\n');
      }
    }
  }
  
  return updatedResponse;
}

// Send Message to API
async function sendMessageToApi(message) {
  // Get recent message history for context (last 5 messages or less)
  const recentMessages = [];
  const contextMessageCount = 5;
  
  // Get visible messages in the conversation
  const visibleMessages = Array.from(conversation.querySelectorAll('.user-message, .ai-message'));
  const visibleMessageTexts = visibleMessages.map(el => {
    if (el.classList.contains('user-message')) {
      return { role: 'user', content: el.textContent };
    } else {
      // For AI messages, grab the original content before markdown processing
      const actionsDiv = el.querySelector('.message-actions');
      if (actionsDiv) {
        // Get the first copy button which has access to original text
        const copyBtn = actionsDiv.querySelector('button');
        if (copyBtn && copyBtn.onclick) {
          // Extract the original text from the copy button's onclick
          const aiText = el.innerText.replace(copyBtn.innerText, '').replace('Copy', '').replace('Read', '').replace('Delete', '').trim();
          return { role: 'assistant', content: aiText };
        }
      }
      // Fallback to visible text if we can't get the original
      return { role: 'assistant', content: el.innerText };
    }
  });
  
  // Take the most recent messages up to contextMessageCount
  const recentContextMessages = visibleMessageTexts.slice(-contextMessageCount);
  
  // Regular API call
  const payload = {
    model: config.preferredModel,
    messages: [
      { 
        role: "system", 
        content: `What you should know about me: ${config.userInfo}
How I want you to respond: ${config.responseInstructions}

You have the ability to:
1. Update system prompts with [[SYSTEM:your new prompt]]
2. Update response instructions with [[RESPOND:your new instructions]]
3. Save notes with [[NOTE:your note content]]
4. Change the theme with [[THEME:theme_name]] (options: dark-mode, light-mode, green-mode, blue-mode, purple-mode, darkblue-mode, darkpurple-mode)
5. Change text size with [[TEXT_SIZE:size]] (between 12-28)
6. Change accent color with [[COLOR:color_name]] (options: blue, green, red, yellow, purple, pink, cyan, teal, or hex code like #ff5500)
7. Customize buttons with [[BUTTONS:{"size":"small/medium/large","icons":{"copy":"fa-clone","read":"fa-headphones","delete":"fa-trash-o","stop":"fa-stop"},"applyToMain":true/false}]]
   - Size options: small, medium, large
   - Icon options for copy: fa-copy, fa-clone, fa-files-o, fa-clipboard
   - Icon options for read: fa-volume-up, fa-headphones, fa-book, fa-file-audio-o, fa-play
   - Icon options for delete: fa-trash, fa-trash-o, fa-times, fa-remove, fa-times-circle
   - Icon options for stop: fa-volume-mute, fa-volume-off, fa-stop, fa-pause
   - Set applyToMain to true to also apply size to main Send/Talk button

When responding, consider the full conversation context and prior messages to maintain continuity.

Current notes: ${config.aiNotes || "No notes yet."}`
      },
      ...recentContextMessages,
      { role: "user", content: message }
    ]
  };

  console.log('Sending request to OpenRouter:', payload);

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const data = await response.json();
  console.log('Response from OpenRouter:', data);
  
  return data.choices[0].message.content.trim();
}
