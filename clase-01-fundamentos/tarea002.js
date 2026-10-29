const fs = require("fs");

const data = fs.readFileSync("README.md", "utf8");

//console.log(data);

fs.writeFileSync("README-COPY.md", data.replace(/JavaScript/gi, "ECMAScript"));

const content = fs.readFileSync("README-COPY.md", "utf8");

const words = content.split(/\s+/).filter(word => word !== "");
const ecmaMatches = content.match(/ECMAScript/g) || [];

console.log(`Cantidad de palabras: ${words.length}`);
console.log(`Ocurrencias de "ECMAScript": ${ecmaMatches.length}`);