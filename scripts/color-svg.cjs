const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const illustrations = ['hunting', 'fishing', 'cargo', 'navigation', 'safety'];
const inputDir = './public/illustrations';
const outputDir = './public/illustrations';

function toHex(n) {
  const hex = Math.round(n).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

async function traceImage(name) {
  const inputPath = path.join(inputDir, `${name}.png`);
  console.log(`\nProcessing ${name}...`);
  
  // Use posterize with more steps for color preservation
  return new Promise((resolve, reject) => {
    potrace.posterize(inputPath, {
      steps: 6,
      threshold: 128,
      fillStrategy: potrace.FILL_DOMINANT,
      rangeDistribution: potrace.RANGES_AUTO,
    }, (err, svg) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Parse the SVG and extract color information from opacity values
      // Replace grayscale opacities with actual colors
      let coloredSvg = svg;
      
      // The posterized SVG has paths with fill-opacity representing different color levels
      // We'll map these to earth-tone colors
      const opacityMatches = svg.match(/fill-opacity="([0-9.]+)"/g) || [];
      const uniqueOpacities = [...new Set(opacityMatches.map(m => parseFloat(m.match(/[0-9.]+/)[0])))].sort((a, b) => b - a);
      
      console.log(`  Found ${uniqueOpacities.length} color levels`);
      
      // Map opacity levels to earth tone colors (light mode)
      const earthTones = [
        '#3d3630',  // Dark brown - shadows/deep
        '#6b5344',  // Medium brown
        '#8b7355',  // Warm brown  
        '#a67c5b',  // Clay
        '#c4a77d',  // Sand/light
        '#e8e4de',  // Cream/highlight
      ];
      
      // Dark mode colors (lightened for dark green background)
      const darkTones = [
        '#e8e4de',  // Light cream
        '#d4c5b0',  // Sand
        '#b8a898',  // Warm beige
        '#a09080',  // Light tan
        '#908070',  // Medium tan
        '#706050',  // Darker tan
      ];
      
      // Replace each unique opacity with a color
      uniqueOpacities.forEach((opacity, index) => {
        const color = earthTones[index % earthTones.length];
        const darkColor = darkTones[index % darkTones.length];
        
        // Replace opacity with solid fill color in light version
        const regex = new RegExp(`fill-opacity="${opacity}"`, 'g');
        coloredSvg = coloredSvg.replace(regex, `fill="${color}"`);
      });
      
      // Create dark variant
      let darkSvg = svg;
      uniqueOpacities.forEach((opacity, index) => {
        const darkColor = darkTones[index % darkTones.length];
        const regex = new RegExp(`fill-opacity="${opacity}"`, 'g');
        darkSvg = darkSvg.replace(regex, `fill="${darkColor}"`);
      });
      
      // Clean up - remove any remaining opacity attributes and add proper structure
      coloredSvg = coloredSvg.replace(/fill-opacity="[^"]*"/g, '');
      darkSvg = darkSvg.replace(/fill-opacity="[^"]*"/g, '');
      
      // Save light mode
      fs.writeFileSync(path.join(outputDir, `${name}-colored.svg`), coloredSvg);
      console.log(`  Created ${name}-colored.svg`);
      
      // Save dark mode  
      fs.writeFileSync(path.join(outputDir, `${name}-colored-dark.svg`), darkSvg);
      console.log(`  Created ${name}-colored-dark.svg`);
      
      resolve({ colors: uniqueOpacities.length });
    });
  });
}

async function main() {
  console.log('Converting illustrations with earth-tone colors...\n');
  
  for (const name of illustrations) {
    try {
      await traceImage(name);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
