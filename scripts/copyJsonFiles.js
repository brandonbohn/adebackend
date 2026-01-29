#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../json');
const distDir = path.join(__dirname, '../dist/json');

// Ensure dist/json exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files that should be copied only if they don't exist (data files)
const dataFiles = ['contacts.json', 'donations.json', 'donors.json', 'volunteers.json'];

// Files that should always be copied (config files)
const configFiles = ['adedata.json', 'donationform.json', 'voluteerform.json'];

// Copy config files (always overwrite)
configFiles.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied config: ${file}`);
  }
});

// Copy data files (only if they don't exist in dist)
dataFiles.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(distDir, file);
  
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      // File doesn't exist in dist, copy it
      fs.copyFileSync(src, dest);
      console.log(`✓ Created data file: ${file}`);
    } else {
      // File exists in dist, preserve it
      console.log(`⊘ Skipped (preserving data): ${file}`);
    }
  }
});

console.log('✓ JSON files ready');
