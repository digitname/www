// Import utility modules
import './utils/helpers.js';
import './utils/storage.js';
import './utils/animations.js';
import './utils/responsive.js';
import './utils/api.js';
import './utils/forms.js';
import './utils/cookies.js';
import './utils/events.js';
import './utils/navigation.js';
import './utils/feature-detection.js';
import { isDevelopment } from './utils/env.js';

// Import the main app
import App from './app.js';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Create and initialize the app
    const app = new App();
    
    // Make app available globally if needed (for debugging)
    if (isDevelopment()) {
      window.app = app;
      console.log('App initialized in development mode');
    }
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});

// Log environment info
if (isDevelopment()) {
  console.log('Development mode: Module system is working');
}

// Export the app instance for module imports
export default App;
