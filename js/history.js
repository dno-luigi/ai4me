// History Management
function saveToHistory(userMessage, aiMessage) {
  const timestamp = new Date().toLocaleString();
  
  // Check if this is a continuation of the last conversation
  const isNewConversation = chatHistory.length === 0 || 
                          (Date.now() - new Date(chatHistory[chatHistory.length-1].timestamp).getTime() > 3600000); // 1 hour
  
  if (isNewConversation) {
    // Create new conversation entry
    chatHistory.push({ 
      timestamp, 
      messages: [{ role: 'user', content: userMessage }, { role: 'assistant', content: aiMessage }],
      preview: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
    });
  } else {
    // Add to existing conversation
    chatHistory[chatHistory.length-1].messages.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiMessage }
    );
    // Update timestamp
    chatHistory[chatHistory.length-1].timestamp = timestamp;
  }
  
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function loadChatHistory() {
  historyList.innerHTML = '';
  
  if (chatHistory.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No chat history yet';
    emptyMessage.classList.add('text-center', 'text-[var(--text-secondary)]', 'italic', 'my-4');
    historyList.appendChild(emptyMessage);
    return;
  }
  
  chatHistory.forEach((conversation, index) => {
    const chatItem = document.createElement('div');
    chatItem.classList.add('mb-3', 'p-2', 'bg-[var(--bg-primary)]', 'rounded-md', 'cursor-pointer', 'hover:bg-opacity-80');
    
    // Format timestamp nicely
    const date = new Date(conversation.timestamp);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
    
    chatItem.innerHTML = `
      <p class="text-xs text-[var(--text-secondary)]">${formattedDate}</p>
      <p class="text-sm font-bold mt-1">${conversation.preview || 'Conversation ' + (index + 1)}</p>
      <p class="text-xs text-[var(--text-secondary)] mt-1">${conversation.messages.length/2} messages</p>
    `;
    
    // Add click event to load this conversation
    chatItem.addEventListener('click', function() {
      // Clear the conversation area
      window.conversation.innerHTML = '';
      
      // Add each message
      conversation.messages.forEach(msg => {
        if (msg.role === 'user') {
          const userMessageElement = document.createElement('p');
          userMessageElement.textContent = msg.content;
          userMessageElement.classList.add('user-message', 'mb-2', 'pb-2', 'border-b', 'border-[var(--text-secondary)]');
          window.conversation.appendChild(userMessageElement);
        } else {
          const aiMessageElement = document.createElement('div');
          aiMessageElement.innerHTML = marked(msg.content);
          aiMessageElement.classList.add('ai-message', 'mb-4', 'pb-2', 'border-b', 'border-[var(--text-secondary)]');
          
          // Add message actions
          const actionsDiv = createMessageActions(aiMessageElement, msg.content);
          aiMessageElement.appendChild(actionsDiv);
          
          window.conversation.appendChild(aiMessageElement);
        }
      });
      
      window.conversation.scrollTop = 0;
      
      // Close the history panel
      history.classList.add('-translate-x-full');
    });
    
    historyList.appendChild(chatItem);
  });
}
