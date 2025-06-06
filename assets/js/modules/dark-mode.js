/**
 * Dark Mode Toggle Module
 * Handles theme switching between light and dark modes
 */

export class DarkMode {
  constructor() {
    this.themeToggle = document.getElementById('dark-mode-toggle');
    this.currentTheme = localStorage.getItem('theme') || this.getSystemPreference();
    
    this.init();
  }
  
  /**
   * Initialize the dark mode toggle
   */
  init() {
    // Set the initial theme
    this.setTheme(this.currentTheme);
    
    // Add event listener to the toggle button
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
      this.updateToggleIcon();
    }
    
    // Watch for system theme changes
    this.watchSystemTheme();
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(this.currentTheme);
    this.updateToggleIcon();
    
    // Save preference to localStorage
    localStorage.setItem('theme', this.currentTheme);
    
    // Dispatch a custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: this.currentTheme } 
    }));
  }
  
  /**
   * Set the theme on the document
   * @param {string} theme - The theme to set ('light' or 'dark')
   */
  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
  
  /**
   * Update the toggle button icon based on current theme
   */
  updateToggleIcon() {
    if (!this.themeToggle) return;
    
    const icon = this.themeToggle.querySelector('i');
    if (!icon) return;
    
    if (this.currentTheme === 'dark') {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      this.themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      this.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
  
  /**
   * Get the user's system color scheme preference
   * @returns {string} - The preferred theme ('light' or 'dark')
   */
  getSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  
  /**
   * Watch for system theme changes and update accordingly
   */
  watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Only update if user hasn't explicitly set a preference
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.currentTheme = newTheme;
        this.setTheme(newTheme);
        this.updateToggleIcon();
      }
    });
  }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dark-mode-toggle')) {
    new DarkMode();
  }
});
