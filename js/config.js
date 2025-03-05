// Global configuration and state variables
const config = {
  baseUrl: 'https://openrouter.ai/api/v1', // Fixed for OpenRouter
  apiKey: '',
  preferredModel: '',
  userInfo: '',
  responseInstructions: '',
  textSize: 16,
  aiNotes: '',
  currentTheme: 'dark-mode',
  buttonRadius: 6,
  accentColor: '#3b82f6',
  aiSpeechEnabled: true
};

// Load configuration from local storage
function loadConfig() {
  const storedConfig = JSON.parse(localStorage.getItem('userConfig'));
  if (storedConfig) {
    Object.assign(config, storedConfig);
  }
}

// Save configuration to local storage
function saveConfig() {
  localStorage.setItem('userConfig', JSON.stringify(config));
}

// Update a specific configuration setting
function updateConfig(key, value) {
  if (config.hasOwnProperty(key)) {
    config[key] = value;
    saveConfig();
  }
}

// Initialize configuration on load
loadConfig();
