const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/contact/_/ContactDetailsSection.tsx',
  'app/about-us/_/AboutUsOurRegionalSection.tsx',
  'content/knowledge/about-shift-pn.yaml',
  'content/knowledge/about-shift-pn.compact.yaml',
  'docs/HANDOFF-shifty-bot.md'
];

for (const file of filesToUpdate) {
  const fullPath = path.join('/Users/juan/shiftpn-web', file);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping missing file: ${fullPath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace the specific placeholder emails with the actual ones.
  // We must do holaholahola first to avoid substring matching issues with holahola.
  content = content.replace(/holaholahola@shiftpn\.com/g, 'fmartinez@shiftpn.co.cr');
  content = content.replace(/holahola@shiftpn\.com/g, 'rcastro@shiftpn.co.cr');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated: ${file}`);
}
