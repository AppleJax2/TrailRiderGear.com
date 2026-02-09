const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const illustrations = ['hunting', 'fishing', 'cargo', 'navigation', 'safety'];
const inputDir = './public/illustrations';
const outputDir = './public/illustrations';

// Color mappings for light and dark mode
// These will replace the auto-generated colors from potrace
const lightModeColors = {
  // Map dark colors to earth tones for light mode
  '#000000': '#3d3630',    // Dark brown instead of pure black
  '#1a1a1a': '#5a4d3f',     // Medium brown
  '#333333': '#7a6b5a',     // Light brown
  '#4d4d4d': '#a09080',     // Warm gray
  '#666666': '#b8a898',     // Light warm gray
  '#808080': '#d4c5b0',     // Sand
};

const darkModeColors = {
  // Lighten colors for dark green background visibility
  '#000000': '#e8e4de',    // Light cream instead of black
  '#1a1a1a': '#d4c5b0',     // Sand
  '#333333': '#c8b8a0',     // Light sand
  '#4d4d4d': '#b8a898',     // Warm beige
  '#666666': '#a09080',     // Light tan
  '#808080': '#908070',     // Medium tan
};

// Function to replace colors in SVG
function replaceColors(svg, colorMap) {
  let result = svg;
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    // Replace fill colors
    const regex = new RegExp(`fill="${oldColor}"`, 'gi');
    result = result.replace(regex, `fill="${newColor}"`);
    // Replace in style attributes
    const styleRegex = new RegExp(`fill:${oldColor}`, 'gi');
    result = result.replace(styleRegex, `fill:${newColor}`);
  }
  return result;
}

// Function to add CSS custom properties for dynamic theming
function makeThemeAware(svg) {
  // Extract viewBox
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100';
  
  // Extract paths
  const paths = [];
  const pathRegex = /<path[^>]*>/g;
  let match;
  let index = 0;
  while ((match = pathRegex.exec(svg)) !== null) {
    const path = match[0];
    // Replace fill with CSS custom property
    const newPath = path
      .replace(/fill="[^"]*"/g, '')
      .replace(/>$/, ` class="illustration-path path-${index}"/>`);
    paths.push(newPath);
    index++;
  }
  
  return { viewBox, paths };
}

// Convert single illustration
async function convertIllustration(name) {
  const inputPath = path.join(inputDir, `${name}.png`);
  
  console.log(`Converting ${name}.png...`);
  
  return new Promise((resolve, reject) => {
    // Use posterize to retain color information
    potrace.posterize(inputPath, {
      steps: 4,
      threshold: 128,
      fillStrategy: potrace.FILL_DOMINANT,
      rangeDistribution: potrace.RANGES_AUTO,
    }, function(err, svg) {
      if (err) {
        reject(err);
        return;
      }
      
      // Save original SVG
      fs.writeFileSync(path.join(outputDir, `${name}.svg`), svg);
      console.log(`  Created ${name}.svg`);
      
      // Create light mode variant
      const lightSvg = replaceColors(svg, lightModeColors);
      fs.writeFileSync(path.join(outputDir, `${name}-light.svg`), lightSvg);
      console.log(`  Created ${name}-light.svg`);
      
      // Create dark mode variant
      const darkSvg = replaceColors(svg, darkModeColors);
      fs.writeFileSync(path.join(outputDir, `${name}-dark.svg`), darkSvg);
      console.log(`  Created ${name}-dark.svg`);
      
      // Create CSS-variable based version for dynamic theming
      const themeAware = makeThemeAware(svg);
      const cssSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${themeAware.viewBox}" class="theme-aware-illustration" data-illustration="${name}">
${themeAware.paths.join('\n')}
</svg>`;
      fs.writeFileSync(path.join(outputDir, `${name}-themed.svg`), cssSvg);
      console.log(`  Created ${name}-themed.svg`);
      
      resolve();
    });
  });
}

// Main conversion process
async function main() {
  console.log('Starting PNG to SVG conversion...\n');
  
  for (const illustration of illustrations) {
    try {
      await convertIllustration(illustration);
      console.log('');
    } catch (err) {
      console.error(`Error converting ${illustration}:`, err);
    }
  }
  
  console.log('Conversion complete!');
  console.log('\nGenerated files:');
  console.log('  - [name].svg: Original traced version');
  console.log('  - [name]-light.svg: Light mode optimized colors');
  console.log('  - [name]-dark.svg: Dark mode optimized colors');
  console.log('  - [name]-themed.svg: CSS variable based for dynamic theming');
}

main().catch(console.error);
