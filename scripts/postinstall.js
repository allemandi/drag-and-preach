const fs = require('fs');
const path = require('path');

const tsLibPath = path.join(process.cwd(), 'node_modules', 'typescript', 'lib');
if (fs.existsSync(tsLibPath)) {
  const tsJsPath = path.join(tsLibPath, 'typescript.js');
  if (!fs.existsSync(tsJsPath)) {
    fs.writeFileSync(tsJsPath, 'module.exports = require("../");\n');
  }
  const tsServerJsPath = path.join(tsLibPath, 'tsserverlibrary.js');
  if (!fs.existsSync(tsServerJsPath)) {
    fs.writeFileSync(tsServerJsPath, 'module.exports = require("../");\n');
  }
}
