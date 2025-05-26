const fs = require('fs');
const path = require('path');

// A simple 800x600 transparent PNG (1x1 pixel, but will be resized)
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, '../assets/portfolio');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create a test image
const imagePath = path.join(testDir, 'test-project.png');
const imageBuffer = Buffer.from(base64Image, 'base64');

// Write the image file
fs.writeFileSync(imagePath, imageBuffer);
console.log(`✅ Created test image at: ${imagePath}`);

// Create a sample data.json file
const dataPath = path.join(testDir, 'data.json');
const sampleData = {
  lastUpdated: new Date().toISOString(),
  items: [
    {
      id: 'test-project',
      title: 'Test Project',
      description: 'This is a test project for the portfolio system',
      image: 'test-project.png',
      thumbnail: 'thumbnails/test-project.png',
      icon: 'icons/test-project.png',
      url: 'https://example.com/test-project',
      tags: ['test', 'example'],
      date: new Date().toISOString().split('T')[0]
    }
  ]
};

// Write the data file
fs.writeFileSync(dataPath, JSON.stringify(sampleData, null, 2));
console.log(`✅ Created sample data at: ${dataPath}`);
