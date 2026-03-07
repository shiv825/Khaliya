const fs = require('fs');
const pathJSON = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\backend\\menu.json';
const pathJSX = 'c:\\Users\\SHIV KUMAR\\OneDrive\\Desktop\\Khaliya-React-Node-Migrated\\frontend\\src\\components\\Menu.jsx';

const menuArray = JSON.parse(fs.readFileSync(pathJSON, 'utf8'));
const replacementStr = 'const getFallbackMenu = () => ' + JSON.stringify(menuArray, null, 8) + ';';

let jsx = fs.readFileSync(pathJSX, 'utf8');
const searchRegex = /const getFallbackMenu = \(\) => \[[\s\S]*?\];/;
jsx = jsx.replace(searchRegex, replacementStr);

fs.writeFileSync(pathJSX, jsx);
console.log("Synced JSON to JSX getFallbackMenu!");
