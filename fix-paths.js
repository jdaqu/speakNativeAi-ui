#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixPaths(dir, depth = 0) {
  const prefix = depth === 0 ? './' : '../';

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && file !== '_next' && file !== 'node_modules') {
        fixPaths(filePath, depth + 1);
      } else if (file.endsWith('.html')) {
        console.log(`Fixing paths in: ${filePath}`);
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix CSS and JS paths
        content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
        content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);

        // Also fix any embedded JSON references
        content = content.replace(/"\/_next\//g, `"${prefix}_next/`);

        // Fix navigation links for static export
        content = content.replace(/href="\/([^"]*?)"/g, (match, path) => {
          if (path === '' || path === '/') {
            return `href="${prefix}index.html"`;
          }
          // Handle paths like "/login", "/register", "/dashboard"
          if (!path.includes('.') && !path.startsWith('_next')) {
            // Remove trailing slash if present, then add /index.html
            const cleanPath = path.replace(/\/$/, '');
            return `href="${prefix}${cleanPath}/index.html"`;
          }
          return match;
        });

        fs.writeFileSync(filePath, content);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
  }
}

// Start from the out directory
const outDir = path.join(__dirname, 'out');
if (fs.existsSync(outDir)) {
  console.log('Fixing Next.js export paths for Electron...');
  fixPaths(outDir);
  console.log('Path fixing complete!');
} else {
  console.error('out directory not found!');
}