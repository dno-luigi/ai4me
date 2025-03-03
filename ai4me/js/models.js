// Custom Model Management
function loadCustomModels() {
  // Clear existing custom model options
  while (customModelsGroup.firstChild) {
    customModelsGroup.removeChild(customModelsGroup.firstChild);
  }
  
  // Add each custom model from storage
  customModels.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name || model.id;
    option.dataset.custom = 'true';
    
    // Add to the appropriate category group if specified
    if (model.category && model.category !== 'customModelsGroup') {
      const categoryGroup = document.getElementById(model.category);
      if (categoryGroup) {
        categoryGroup.appendChild(option);
        return;
      }
    }
    
    // Default to custom models group
    customModelsGroup.appendChild(option);
  });
}

function saveCustomModelsToStorage() {
  localStorage.setItem('customModels', JSON.stringify(customModels));
}

function addCustomModel(id, name, category = 'customModelsGroup') {
  // Check if model already exists
  const existingModel = customModels.find(model => model.id === id);
  if (existingModel) {
    alert('This model ID already exists in your list');
    return false;
  }
  
  // Add to our custom models array
  customModels.push({
    id: id,
    name: name || id, // Use ID as name if no name provided
    category: category
  });
  
  // Save to localStorage
  saveCustomModelsToStorage();
  
  // Reload the dropdown
  loadCustomModels();
  return true;
}

function deleteSelectedModel() {
  const selectedOption = modelSelect.options[modelSelect.selectedIndex];
  const modelId = selectedOption.value;
  
  // Check if it's a custom model
  const modelIndex = customModels.findIndex(model => model.id === modelId);
  if (modelIndex === -1) {
    alert('You can only delete custom models');
    return;
  }
  
  // Confirm deletion
  if (confirm(`Are you sure you want to delete the model "${selectedOption.textContent}"?`)) {
    // Remove from array
    customModels.splice(modelIndex, 1);
    // Save to localStorage
    saveCustomModelsToStorage();
    // Reload the dropdown
    loadCustomModels();
    // Reset selection
    modelSelect.value = '';
    // Hide manage controls
    modelManageContainer.classList.add('hidden');
  }
}

function showAddModelDialog() {
  addModelDialog.classList.remove('hidden');
  newModelId.value = '';
  newModelName.value = '';
  newModelCategory.value = 'customModelsGroup';
}

function hideAddModelDialog() {
  addModelDialog.classList.add('hidden');
}
