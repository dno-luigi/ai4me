// Theme management
function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
  config.currentTheme = theme;
  
  // Update the active theme button
  const themeButtons = [darkTheme, lightTheme, greenTheme, blueTheme, purpleTheme, darkblueTheme, darkpurpleTheme];
  themeButtons.forEach(button => {
    button.classList.remove('border-white');
    button.classList.add('border-transparent');
  });
  
  // Find the active theme button and highlight it
  let activeButton;
  switch(theme) {
    case 'dark-mode': activeButton = darkTheme; break;
    case 'light-mode': activeButton = lightTheme; break;
    case 'green-mode': activeButton = greenTheme; break;
    case 'blue-mode': activeButton = blueTheme; break;
    case 'purple-mode': activeButton = purpleTheme; break;
    case 'darkblue-mode': activeButton = darkblueTheme; break;
    case 'darkpurple-mode': activeButton = darkpurpleTheme; break;
  }
  
  if (activeButton) {
    activeButton.classList.remove('border-transparent');
    activeButton.classList.add('border-white');
  }
}

function setButtonRoundness(radius) {
  document.documentElement.style.setProperty('--button-radius', radius + 'px');
  localStorage.setItem('buttonRadius', radius);
  config.buttonRadius = radius;
}

function setAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
  localStorage.setItem('accentColor', color);
  config.accentColor = color;
  
  // Update the active color button
  const colorButtons = document.querySelectorAll('[data-color]');
  colorButtons.forEach(button => {
    button.classList.remove('border-white');
    button.classList.add('border-transparent');
  });
  
  const activeButton = document.querySelector(`[data-color="${color}"]`);
  if (activeButton) {
    activeButton.classList.remove('border-transparent');
    activeButton.classList.add('border-white');
  }
}
