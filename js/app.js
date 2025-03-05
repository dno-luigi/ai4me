// Core message handling
async function addMessage() {
  const message = messageInput.value.trim();
  if (message) {
    // Detect user interests/preferences from the message
    detectUserInterests(message);

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

      // Display the feedback interface for detected interests
      createFeedbackInterface();
    } catch (error) {
      console.error('Error:', error);
      conversation.removeChild(thinkingElement);
      
      addNotificationMessage(`Error: ${error.message}`, 'red');
    } finally {
      powerButton.classList.remove('pulsate');
    }
  }
}
