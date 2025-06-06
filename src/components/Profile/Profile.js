import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <section className="profile-section">
      <div className="container">
        <div className="profile-container">
          <div className="profile-image">
            <div className="image-wrapper">
              <img 
                src="/profile-placeholder.jpg" 
                alt="Tom Sapletta" 
                className="profile-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=Tom+Sapletta&background=2b6cb0&color=fff&size=400';
                }}
              />
              <div className="status-badge">
                <span className="status-dot"></span>
                <span>Available for opportunities</span>
              </div>
            </div>
          </div>
          
          <div className="profile-content">
            <span className="profile-badge">DevOps & Cloud Engineer</span>
            <h1>Tom Sapletta</h1>
            <p className="profile-tagline">
              Transforming ideas into scalable, efficient, and reliable cloud-native solutions
            </p>
            
            <div className="profile-bio">
              <p>
                With over 5 years of experience in DevOps and cloud engineering, I specialize in designing 
                and implementing robust infrastructure solutions. My expertise spans across container 
                orchestration, CI/CD pipelines, and cloud architecture, with a strong focus on automation 
                and best practices in software development and operations.
              </p>
            </div>
            
            <div className="profile-meta">
              <div className="meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Germany / Remote</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-building"></i>
                <span>Open to full-time & contract roles</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-code-branch"></i>
                <span>Contributor @ GitHub</span>
              </div>
            </div>
            
            <div className="profile-cta">
              <a href="#contact" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i> Contact Me
              </a>
              <a href="/cv.pdf" className="btn btn-secondary" download>
                <i className="fas fa-file-download"></i> Download CV
              </a>
            </div>
            
            <div className="profile-social">
              <a href="https://github.com/sapletta" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com/in/tom-sapletta" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://twitter.com/sapletta" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://dev.to/sapletta" target="_blank" rel="noopener noreferrer" aria-label="Dev.to">
                <i className="fab fa-dev"></i>
              </a>
              <a href="mailto:contact@sapletta.com" aria-label="Email">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
