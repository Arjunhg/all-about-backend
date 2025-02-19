const fs = require("fs");
const os = require("os");

fs.writeFileSync("./text.txt", "Hello, World!"); //sync, blocking
fs.writeFile("./text2.txt", "Hello World I am async code", (err) => {
    console.log(err);
})

const res = fs.readFileSync("./text.txt", "utf8");
console.log(res);
// By default, fs.readFile and fs.readFileSync return a Buffer (raw binary data). Specifying 'utf8' converts this Buffer into a human-readable string.
fs.readFile("./text2.txt", "utf8", (err, res) => {
    if(err) console.log(err);
    console.log(res);
})

fs.appendFileSync("./text.txt", ` ${new Date().toISOString()}\n`);
fs.appendFile("./log.txt", `I am logged in at ${new Date().toISOString()}\n`, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Log updated successfully! ✅");
    }
});







