const potrace = require('potrace');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Jimp = require('jimp');

const illustrations = ['hunting', 'fishing', 'cargo', 'navigation', 'safety'];
const inputDir = './public/illustrations';
const outputDir = './public/illustrations';
const tempDir = './temp_color_traces';

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Extract dominant colors from image
async function extractColors(imagePath, numColors = 6) {
  const image = await Jimp.read(imagePath);
  const width = image.getWidth();
  const height = image.getHeight();
  
  // Sample pixels to find dominant colors
  const colorMap = new Map();
  
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const rgba = image.getPixelColor(x, y);
      const r = (rgba >> 24) & 255;
      const g = (rgba >> 16) & 255;
      const b = (rgba >> 8) & 255;
      const a = rgba & 255;
      
      if (a < 128) continue; // Skip transparent
      
      // Quantize colors to reduce variation
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      const key = `${qr},${qg},${qb}`;
      
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
  }
  
  // Sort by frequency and get top colors
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
  const dominant = sorted.slice(0, numColors).map(([key]) => {
    const [r, g, b] = key.split(',').map(Number);
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    return { r, g, b, hex };
  });
  
  return dominant;
}

// Create mask for a specific color
async function createColorMask(imagePath, targetColor, tolerance, outputPath) {
  const image = await Jimp.read(imagePath);
  const width = image.getWidth();
  const height = image.getHeight();
  
  const mask = new Jimp(width, height, 0xFFFFFFFF); // White background
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rgba = image.getPixelColor(x, y);
      const hex = rgba.toString(16).padStart(8, '0');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const a = parseInt(hex.substr(6, 2), 16);
      
      // Calculate color distance
      const dist = Math.sqrt(
        Math.pow(r - targetColor.r, 2) +
        Math.pow(g - targetColor.g, 2) +
        Math.pow(b - targetColor.b, 2)
      );
      
      if (dist < tolerance && a > 128) {
        mask.setPixelColor(0x000000FF, x, y); // Black for this color
      }
    }
  }
  
  await mask.writeAsync(outputPath);
}

// Trace a mask to SVG path using potrace
async function traceMaskToPath(maskPath) {
  return new Promise((resolve, reject) => {
    potrace.trace(maskPath, {
      threshold: 128,
      blackOnWhite: true,
      optCurve: true,
      optTolerance: 0.2,
    }, (err, svg) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });
}

// Extract just the path data from SVG
function extractPaths(svgContent) {
  const paths = [];
  const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g;
  let match;
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

// Convert single illustration with color preservation
async function convertWithColors(name) {
  const inputPath = path.join(inputDir, `${name}.png`);
  console.log(`\nProcessing ${name}.png...`);
  
  try {
    // Step 1: Extract dominant colors
    console.log('  Extracting colors...');
    const colors = await extractColors(inputPath, 8);
    console.log(`  Found ${colors.length} dominant colors`);
    
    // Step 2: Create masks and trace each color
    const colorLayers = [];
    
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const maskPath = path.join(tempDir, `${name}_color_${i}.bmp`);
      
      console.log(`  Processing color ${i + 1}/${colors.length}: ${color.hex}`);
      
      await createColorMask(inputPath, color, 80, maskPath);
      const svgContent = await traceMaskToPath(maskPath);
      const paths = extractPaths(svgContent);
      
      if (paths.length > 0) {
        colorLayers.push({
          color: color.hex,
          paths: paths
        });
      }
    }
    
    // Step 3: Build combined SVG
    const image = await Jimp.read(inputPath);
    const width = image.getWidth();
    const height = image.getHeight();
    
    let svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
    
    // Add each color layer
    for (const layer of colorLayers) {
      for (const pathData of layer.paths) {
        svgParts.push(`  <path fill="${layer.color}" d="${pathData}"/>`);
      }
    }
    
    svgParts.push('</svg>');
    const fullSvg = svgParts.join('\n');
    
    // Step 4: Save color SVG
    const outputPath = path.join(outputDir, `${name}-colored.svg`);
    fs.writeFileSync(outputPath, fullSvg);
    console.log(`  Created ${name}-colored.svg with ${colorLayers.length} color layers`);
    
    // Step 5: Create dark mode variant (lighten colors)
    const darkSvg = fullSvg.replace(/fill="#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})"/g, (match, r, g, b) => {
      const rv = parseInt(r, 16);
      const gv = parseInt(g, 16);
      const bv = parseInt(b, 16);
      // Lighten for dark background
      const lighten = (v) => Math.min(255, Math.floor(v + (255 - v) * 0.4));
      const newR = lighten(rv).toString(16).padStart(2, '0');
      const newG = lighten(gv).toString(16).padStart(2, '0');
      const newB = lighten(bv).toString(16).padStart(2, '0');
      return `fill="#${newR}${newG}${newB}"`;
    });
    
    const darkPath = path.join(outputDir, `${name}-colored-dark.svg`);
    fs.writeFileSync(darkPath, darkSvg);
    console.log(`  Created ${name}-colored-dark.svg`);
    
    return { colorLayers: colorLayers.length };
    
  } catch (err) {
    console.error(`Error processing ${name}:`, err.message);
    throw err;
  }
}

// Main process
async function main() {
  console.log('Starting color-preserving vectorization...\n');
  
  const results = [];
  
  for (const illustration of illustrations) {
    try {
      const result = await convertWithColors(illustration);
      results.push({ name: illustration, ...result });
    } catch (err) {
      console.error(`Failed: ${illustration}`);
      results.push({ name: illustration, error: err.message });
    }
  }
  
  // Cleanup temp files
  console.log('\nCleaning up...');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  
  console.log('\nDone! Results:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  ${r.name}: ERROR - ${r.error}`);
    } else {
      console.log(`  ${r.name}: ${r.colorLayers} color layers`);
    }
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
