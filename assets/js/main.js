// Import the main app
import App from './app.js';

// Import styles
import '../css/main.css';
import '../css/portfolio.css';

// Initialize the application
const app = new App();

// Make app available globally if needed
window.app = app;

export default app;
