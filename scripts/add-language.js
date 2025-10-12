#!/usr/bin/env node

/**
 * Script to add a new language to the i18n system
 *
 * Usage: node scripts/add-language.js <locale> <name>
 * Example: node scripts/add-language.js fr Français
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing arguments');
  console.log('\nUsage: node scripts/add-language.js <locale> <name>');
  console.log('Example: node scripts/add-language.js fr Français\n');
  process.exit(1);
}

const [locale, languageName] = args;

// Validate locale format
if (!/^[a-z]{2}$/.test(locale)) {
  console.error('❌ Error: Locale must be a 2-letter code (e.g., fr, de, pt)');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const messagesDir = path.join(rootDir, 'messages');
const configPath = path.join(rootDir, 'src', 'i18n', 'config.ts');
const enFilePath = path.join(messagesDir, 'en.json');
const newFilePath = path.join(messagesDir, `${locale}.json`);

console.log(`\n🌍 Adding new language: ${languageName} (${locale})\n`);

// Step 1: Check if messages directory exists
if (!fs.existsSync(messagesDir)) {
  console.error('❌ Error: messages/ directory not found');
  process.exit(1);
}

// Step 2: Check if locale already exists
if (fs.existsSync(newFilePath)) {
  console.error(`❌ Error: Language '${locale}' already exists at ${newFilePath}`);
  process.exit(1);
}

// Step 3: Copy English file as template
console.log(`📋 Creating ${locale}.json from en.json template...`);
const enContent = fs.readFileSync(enFilePath, 'utf8');
fs.writeFileSync(newFilePath, enContent);
console.log(`✅ Created ${newFilePath}`);

// Step 4: Update config.ts
console.log(`\n⚙️  Updating i18n config...`);
let configContent = fs.readFileSync(configPath, 'utf8');

// Add to locales array
const localesRegex = /(export const locales = \[)([^\]]+)(\] as const)/;
const localesMatch = configContent.match(localesRegex);

if (localesMatch) {
  const currentLocales = localesMatch[2].split(',').map(s => s.trim().replace(/'/g, ''));
  if (!currentLocales.includes(locale)) {
    const newLocales = [...currentLocales, `'${locale}'`].join(', ');
    configContent = configContent.replace(localesRegex, `$1${newLocales}$3`);
    console.log(`✅ Added '${locale}' to locales array`);
  }
}

// Add to localeNames
const localeNamesRegex = /(export const localeNames: Record<Locale, string> = \{)([^}]+)(\})/s;
const localeNamesMatch = configContent.match(localeNamesRegex);

if (localeNamesMatch) {
  const existingEntries = localeNamesMatch[2];
  if (!existingEntries.includes(`${locale}:`)) {
    const newEntry = `\n  ${locale}: '${languageName}'`;
    configContent = configContent.replace(localeNamesRegex, `$1${existingEntries}${newEntry}\n$3`);
    console.log(`✅ Added '${locale}: ${languageName}' to localeNames`);
  }
}

fs.writeFileSync(configPath, configContent);

console.log('\n✨ Success! New language added.\n');
console.log('📝 Next steps:');
console.log(`1. Translate the content in: messages/${locale}.json`);
console.log(`2. The language will automatically appear in the language switcher`);
console.log(`3. Test the new language in your app\n`);
