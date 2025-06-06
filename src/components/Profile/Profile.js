import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-image-container">
          <img 
            src="https://sapletta.github.io/about/image.png" 
            alt="Tom Sapletta" 
            className="profile-image"
            loading="lazy"
          />
        </div>
        <div className="profile-info">
          <h1>Tom Sapletta</h1>
          <h2>DevOps Engineer & Full Stack Developer</h2>
          <div className="profile-links">
            <a href="https://sapletta.com" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-globe"></i> sapletta.com
            </a>
            <a href="https://github.com/sapletta" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i> GitHub
            </a>
            <a href="https://linkedin.com/in/tom-sapletta" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
            <a href="mailto:contact@sapletta.com">
              <i className="fas fa-envelope"></i> Email
            </a>
          </div>
        </div>
      </div>
      
      <div className="profile-bio">
        <p>
          With over 12 years of experience as a DevOps Engineer, Software Developer, and Systems Architect, 
          I specialize in creating human-technology connections through innovative solutions. My expertise 
          spans edge computing, hypermodularization, and automated software development lifecycles.
        </p>
        <p>
          Currently, as the founder and CEO of <a href="https://www.telemonit.com/" target="_blank" rel="noopener noreferrer">Telemonit</a>, 
          I'm developing <a href="https://www.portigen.com/" target="_blank" rel="noopener noreferrer">Portigen</a> - an innovative 
          power supply system with integrated edge computing functionality.
        </p>
      </div>
    </div>
  );
};

export default Profile;
