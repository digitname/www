import React from 'react';
import './Expertise.css';

const expertiseAreas = [
  {
    title: 'DevOps & Cloud Engineering',
    skills: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'Infrastructure as Code', 'AWS', 'Azure', 'GCP']
  },
  {
    title: 'Software Development',
    skills: ['JavaScript/TypeScript', 'Python', 'PHP', 'Node.js', 'React', 'Next.js', 'Java']
  },
  {
    title: 'Edge Computing & IoT',
    skills: ['Distributed Systems', 'Sensor Networks', 'Real-time Processing', 'Embedded Systems']
  },
  {
    title: 'Research & Innovation',
    skills: ['TextToSoftware', 'Hypermodularization', 'Model-Based Systems Engineering', 'DSLs']
  }
];

const Expertise = () => {
  return (
    <section className="expertise-section">
      <h2 className="section-title">Areas of Expertise</h2>
      <div className="expertise-grid">
        {expertiseAreas.map((area, index) => (
          <div key={index} className="expertise-card">
            <h3>{area.title}</h3>
            <ul className="skills-list">
              {area.skills.map((skill, skillIndex) => (
                <li key={skillIndex} className="skill-item">
                  <i className="fas fa-check-circle"></i>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Expertise;
