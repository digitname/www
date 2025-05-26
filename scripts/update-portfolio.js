const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const CONFIG = {
  // Input/output directories
  assetsDir: path.join(__dirname, '../assets/portfolio'),
  thumbnailsDir: 'thumbnails',
  iconsDir: 'icons',
  dataFile: 'data.json',
  
  // Thumbnail dimensions
  thumbnailWidth: 400,
  thumbnailHeight: 300,
  
  // Icon dimensions
  iconSize: 100
};

// Ensure directories exist
function ensureDirectories() {
  [CONFIG.thumbnailsDir, CONFIG.iconsDir].forEach(dir => {
    const dirPath = path.join(CONFIG.assetsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Process an image to create a thumbnail
async function createThumbnail(imagePath, outputPath) {
  try {
    await sharp(imagePath)
      .resize(CONFIG.thumbnailWidth, CONFIG.thumbnailHeight, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Error creating thumbnail for ${imagePath}:`, error);
    return false;
  }
}

// Process an image to create an icon
async function createIcon(imagePath, outputPath) {
  try {
    await sharp(imagePath)
      .resize(CONFIG.iconSize, CONFIG.iconSize, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Error creating icon for ${imagePath}:`, error);
    return false;
  }
}

// Update the portfolio data file
function updatePortfolioData(portfolioItems) {
  const dataPath = path.join(CONFIG.assetsDir, CONFIG.dataFile);
  const data = {
    lastUpdated: new Date().toISOString(),
    items: portfolioItems
  };
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`✅ Portfolio data updated: ${dataPath}`);
}

// Main function
async function main() {
  console.log('🚀 Starting portfolio update...');
  ensureDirectories();
  
  // This is a placeholder - in a real app, you would scan a directory for images
  // and generate thumbnails/icons for each one
  const portfolioItems = [
    {
      id: 'project1',
      title: 'Project 1',
      description: 'Description for project 1',
      image: 'project1.jpg',
      url: 'https://example.com/project1',
      tags: ['web', 'react', 'nodejs']
    },
    // Add more projects as needed
  ];
  
  // Process each portfolio item
  for (const item of portfolioItems) {
    const imagePath = path.join(CONFIG.assetsDir, item.image);
    const thumbPath = path.join(CONFIG.assetsDir, CONFIG.thumbnailsDir, item.image);
    const iconPath = path.join(CONFIG.assetsDir, CONFIG.iconsDir, item.image);
    
    // Create thumbnail and icon if they don't exist
    if (fs.existsSync(imagePath)) {
      if (!fs.existsSync(thumbPath)) {
        await createThumbnail(imagePath, thumbPath);
      }
      if (!fs.existsSync(iconPath)) {
        await createIcon(imagePath, iconPath);
      }
    }
    
    // Update paths in the portfolio item
    item.thumbnail = path.relative(CONFIG.assetsDir, thumbPath);
    item.icon = path.relative(CONFIG.assetsDir, iconPath);
  }
  
  // Update the portfolio data file
  updatePortfolioData(portfolioItems);
  
  console.log('✨ Portfolio update complete!');
}

// Run the script
main().catch(console.error);
