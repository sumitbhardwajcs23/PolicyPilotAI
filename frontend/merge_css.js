const fs = require('fs');

const kimiCssPath = "c:\\\\Users\\\\Asus\\\\Desktop\\\\SD\\\\projects\\\\Guid wire\\\\Kimi_Agent_Full Webapp & User Guide\\\\app\\\\src\\\\index.css";
const targetCssPath = "c:\\\\Users\\\\Asus\\\\Desktop\\\\SD\\\\projects\\\\Guid wire\\\\gigshield-platform\\\\gigshield-platform\\\\frontend\\\\src\\\\index.css";

const kimiCss = fs.readFileSync(kimiCssPath, 'utf8');
const lines = kimiCss.split('\n');
const cleanLines = lines.filter(line => !line.startsWith('@tailwind'));
const cleanKimiCss = cleanLines.join('\n');

fs.appendFileSync(targetCssPath, '\n\n/* --- KIMI LANDING CSS --- */\n\n' + cleanKimiCss, 'utf8');
console.log('CSS merged successfully');
