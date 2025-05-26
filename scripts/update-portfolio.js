const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { promisify } = require('util');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);

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

/**
 * Ensure required directories exist
 * @returns {Promise<void>}
 */
async function ensureDirectories() {
  try {
    const dirs = [
      path.join(CONFIG.assetsDir, CONFIG.thumbnailsDir),
      path.join(CONFIG.assetsDir, CONFIG.iconsDir)
    ];

    for (const dir of dirs) {
      try {
        await access(dir);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`Creating directory: ${dir}`);
          await mkdir(dir, { recursive: true });
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring directories:', error);
    throw error;
  }
}

/**
 * Create a thumbnail from an image
 * @param {string} imagePath - Path to source image
 * @param {string} outputPath - Path to save thumbnail
 * @returns {Promise<boolean>}
 */
async function createThumbnail(imagePath, outputPath) {
  try {
    console.log(`Creating thumbnail: ${outputPath}`);
    await sharp(imagePath)
      .resize(CONFIG.thumbnailWidth, CONFIG.thumbnailHeight, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .toFormat('jpeg', {
        quality: 80,
        progressive: true,
        optimizeScans: true
      })
      .toFile(outputPath);
    console.log(`✅ Created thumbnail: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating thumbnail for ${imagePath}:`, error.message);
    return false;
  }
}

/**
 * Create an icon from an image
 * @param {string} imagePath - Path to source image
 * @param {string} outputPath - Path to save icon
 * @returns {Promise<boolean>}
 */
async function createIcon(imagePath, outputPath) {
  try {
    console.log(`Creating icon: ${outputPath}`);
    await sharp(imagePath)
      .resize(CONFIG.iconSize, CONFIG.iconSize, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .toFormat('png', {
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    console.log(`✅ Created icon: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating icon for ${imagePath}:`, error.message);
    return false;
  }
}

/**
 * Update the portfolio data file
 * @param {Array} portfolioItems - Array of portfolio items
 * @returns {Promise<void>}
 */
async function updatePortfolioData(portfolioItems) {
  const dataPath = path.join(CONFIG.assetsDir, CONFIG.dataFile);
  const data = {
    lastUpdated: new Date().toISOString(),
    items: portfolioItems,
    stats: {
      totalItems: portfolioItems.length,
      lastUpdated: new Date().toISOString()
    }
  };
  
  try {
    await writeFile(dataPath, JSON.stringify(data, null, 2));
    console.log(`✅ Portfolio data updated: ${dataPath}`);
    console.log(`📊 Total items: ${portfolioItems.length}`);
  } catch (error) {
    console.error(`❌ Error writing portfolio data to ${dataPath}:`, error.message);
    throw error;
  }
}

/**
 * Get all image files from a directory
 * @param {string} dir - Directory path
 * @returns {Promise<string[]>}
 */
async function getImageFiles(dir) {
  try {
    const files = await readdir(dir);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
  } catch (error) {
    console.error(`❌ Error reading directory ${dir}:`, error.message);
    return [];
  }
}

/**
 * Process a single portfolio item
 * @param {string} imageFile - Image filename
 * @returns {Promise<Object>}
 */
async function processPortfolioItem(imageFile) {
  const imageName = path.basename(imageFile, path.extname(imageFile));
  const imagePath = path.join(CONFIG.assetsDir, imageFile);
  
  try {
    // Check if source image exists
    await access(imagePath);
    
    const stats = await stat(imagePath);
    const imageInfo = await sharp(imagePath).metadata();
    
    const item = {
      id: imageName.toLowerCase().replace(/\s+/g, '-'),
      title: imageName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: `Description for ${imageName}`,
      image: imageFile,
      url: `https://example.com/projects/${imageName}`,
      tags: ['web', 'design'],
      date: stats.mtime.toISOString().split('T')[0],
      metadata: {
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
        size: (stats.size / 1024).toFixed(2) + ' KB'
      }
    };

    // Generate paths for thumbnails and icons
    const thumbPath = path.join(CONFIG.assetsDir, CONFIG.thumbnailsDir, imageFile);
    const iconPath = path.join(CONFIG.assetsDir, CONFIG.iconsDir, `${path.basename(imageFile, path.extname(imageFile))}.png`);
    
    // Create thumbnail and icon
    const [thumbSuccess, iconSuccess] = await Promise.all([
      createThumbnail(imagePath, thumbPath),
      createIcon(imagePath, iconPath)
    ]);

    if (thumbSuccess) item.thumbnail = path.relative(CONFIG.assetsDir, thumbPath);
    if (iconSuccess) item.icon = path.relative(CONFIG.assetsDir, iconPath);

    return item;
  } catch (error) {
    console.error(`❌ Error processing ${imageFile}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting portfolio update...');
  const startTime = Date.now();
  
  try {
    // Ensure required directories exist
    await ensureDirectories();
    
    // Get all image files in the assets directory
    const imageFiles = await getImageFiles(CONFIG.assetsDir);
    
    if (imageFiles.length === 0) {
      console.log('ℹ️ No image files found in the assets directory');
      return;
    }
    
    console.log(`📂 Found ${imageFiles.length} image(s) to process`);
    
    // Process all images in parallel
    const portfolioItems = await Promise.all(
      imageFiles.map(file => processPortfolioItem(file))
    );
    
    // Filter out any failed items
    const validItems = portfolioItems.filter(item => item !== null);
    
    if (validItems.length === 0) {
      console.log('⚠️ No valid portfolio items were processed');
      return;
    }
    
    // Update the portfolio data file
    await updatePortfolioData(validItems);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ Portfolio update completed in ${duration}s`);
    
  } catch (error) {
    console.error('❌ Portfolio update failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
