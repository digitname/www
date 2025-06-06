import * as Icons from '@tabler/icons-react';

// Find all icon names that include 'hugging' or 'face'
const huggingFaceIcons = Object.keys(Icons)
  .filter(key => key.toLowerCase().includes('hugging') || key.toLowerCase().includes('face'));

console.log('Available Hugging Face related icons:', huggingFaceIcons);
