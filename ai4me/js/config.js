// Global configuration and state variables
const config = {
  baseUrl: 'https://openrouter.ai/api/v1', // Fixed for OpenRouter
  apiKey: '',
  preferredModel: '',
  userInfo: '',
  responseInstructions: '',
  textSize: 20,
  aiNotes: '',
  currentTheme: 'dark-mode',
  buttonRadius: 6,
  accentColor: '#3b82f6',
  aiSpeechEnabled: true
};

// Speech recognition variables
let recognizing = false;
let recognition;
let currentUtterance = null;

// Storage for models and history
let chatHistory = [];
let customModels = [];
let isApiKeyValid = false;

// Initialize speech recognition if available
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
}
