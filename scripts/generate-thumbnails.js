const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// List of thumbnails to generate with their titles and colors
const thumbnails = [
  { 
    name: 'python-packages.jpg', 
    title: 'Python Packages',
    color: '#3776AB' // Python blue
  },
  { 
    name: 'domainleak.jpg',
    title: 'DomainLeak',
    color: '#4F46E5' // Indigo
  },
  { 
    name: 'askdomainer.jpg',
    title: 'AskDomainer',
    color: '#10B981' // Emerald
  }
];

// Generate each thumbnail
thumbnails.forEach(({ name, title, color }) => {
  const width = 400;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Add title
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Adjust font size based on title length
  const fontSize = Math.min(48, Math.floor(width / (title.length * 0.5)));
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Add text shadow for better visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Draw title
  ctx.fillText(title, width / 2, height / 2);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  
  // Save to file
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(path.join(thumbnailsDir, name), buffer);
});

console.log(`Generated ${thumbnails.length} thumbnails in ${thumbnailsDir}`);
