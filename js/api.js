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
  
  return updatedResponse;
}

// Send Message to API
async function sendMessageToApi(message) {
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

Current notes: ${config.aiNotes || "No notes yet."}`
      },
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
