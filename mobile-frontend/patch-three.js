const fs = require('fs');
const files = [
  'node_modules/three/examples/jsm/loaders/DRACOLoader.js',
  'node_modules/three/examples/jsm/loaders/KTX2Loader.js',
  'node_modules/three/examples/jsm/inspector/tabs/Settings.js'
];
files.forEach(f => {
  if(fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/import\.meta\.url/g, '""');
    fs.writeFileSync(f, content);
    console.log('Patched ' + f);
  }
});
