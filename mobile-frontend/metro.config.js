// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package exports to fix import.meta error with three.js
config.resolver.unstable_enablePackageExports = false;

// Ensure mjs is supported just in case
config.resolver.sourceExts.push('mjs');

// Support 3D models natively
config.resolver.assetExts.push('glb', 'gltf', 'bin');

module.exports = config;
