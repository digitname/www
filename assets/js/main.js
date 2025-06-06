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

// Import the main app
import App from './app.js';

// Import styles
import '../css/main.css';
import '../css/portfolio.css';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create and initialize the app
  const app = new App();
  
  // Make app available globally if needed (for debugging)
  if (process.env.NODE_ENV !== 'production') {
    window.app = app;
  }
  
  // Log environment info
  if (process.env.NODE_ENV !== 'production') {
    console.log('Application initialized in', process.env.NODE_ENV, 'mode');
  }
});

// Export the app instance for module imports
export default App;
