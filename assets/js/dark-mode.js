// Dark Mode Toggle
class DarkMode {
  constructor() {
    this.darkMode = false;
    this.init();
  }

  init() {
    // Check for saved user preference, if any, on load
    this.loadTheme();
    // Then show the page (prevents white flash in dark mode)
    document.documentElement.style.visibility = 'visible';
    
    // Create and append the toggle button
    this.createToggleButton();
    
    // Add system preference change listener
    this.addSystemPreferenceListener();
  }

  createToggleButton() {
    const toggle = document.createElement('button');
    toggle.className = 'dark-mode-toggle';
    toggle.innerHTML = this.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.setAttribute('aria-pressed', this.darkMode);
    
    toggle.addEventListener('click', () => this.toggleTheme());
    
    // Add to the page - you might want to adjust the selector based on your layout
    const header = document.querySelector('header') || document.body;
    header.appendChild(toggle);
    
    this.toggleButton = toggle;
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    this.updateToggleButton();
    this.saveTheme();
  }

  applyTheme() {
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  updateToggleButton() {
    if (!this.toggleButton) return;
    
    this.toggleButton.innerHTML = this.darkMode ? 
      '<i class="fas fa-sun"></i>' : 
      '<i class="fas fa-moon"></i>';
    this.toggleButton.setAttribute('aria-pressed', this.darkMode);
  }

  saveTheme() {
    try {
      localStorage.setItem('darkMode', this.darkMode);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }

  loadTheme() {
    // Check localStorage for saved preference
    try {
      const savedPreference = localStorage.getItem('darkMode');
      
      if (savedPreference !== null) {
        this.darkMode = savedPreference === 'true';
      } else {
        // No saved preference, use system preference
        this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      this.applyTheme();
    } catch (e) {
      console.warn('Could not load theme preference:', e);
    }
  }

  addSystemPreferenceListener() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeMediaQuery.addEventListener('change', (e) => {
      // Only update if there's no saved preference
      if (localStorage.getItem('darkMode') === null) {
        this.darkMode = e.matches;
        this.applyTheme();
        this.updateToggleButton();
      }
    });
  }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DarkMode();
});
