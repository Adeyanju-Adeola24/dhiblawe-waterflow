const fs = require('fs');
const apiBase = process.env.API_BASE || '';
const content = `window.API_BASE = '${apiBase}';\n`;
fs.writeFileSync('assets/js/env.js', content);
if (apiBase) {
  console.log('API_BASE set to:', apiBase);
} else {
  console.log('API_BASE not set — using empty string (same-origin)');
}
