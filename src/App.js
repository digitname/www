import React from 'react';
import Profile from './components/Profile/Profile';
import Expertise from './components/Expertise/Expertise';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Tom Sapletta</h1>
          <p className="tagline">DevOps Engineer & Full Stack Developer</p>
        </div>
      </header>
      
      <main>
        <Profile />
        <Expertise />
        {/* Other sections will be added here */}
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Tom Sapletta. All rights reserved.</p>
          <div className="footer-links">
            <a href="https://github.com/sapletta" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://linkedin.com/in/tom-sapletta" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="mailto:contact@sapletta.com">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
