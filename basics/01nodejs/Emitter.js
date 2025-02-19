const EventEmitter = require('events');
const fs = require('fs');

const userEmitter = new EventEmitter();

const countEvents = {
    login:0,
    logout:0,
    purchase:0,
    profileupdate:0
}

const logFile = "eventlog.json";
// in package.json: "dev": "nodemon --ignore eventlog.json 01nodejs/Emitter.js"

if(fs.existsSync(logFile)){
    const data = fs.readFileSync(logFile, "utf8");
    Object.assign(countEvents, JSON.parse(data));
}

function saveCounts(){
    fs.writeFileSync(logFile, JSON.stringify(countEvents, null, 2));
}

// create events
userEmitter.on("LOGIN", (username) => {
    countEvents.login++;
    console.log(`User ${username} logged in`);
    saveCounts();
})

userEmitter.on("LOGOUT", (username) => {
    countEvents.logout++;
    console.log(`User ${username} logged out`);
    saveCounts();
})

userEmitter.on("PURCHASE", (username, item) => {
    countEvents.purchase++;
    console.log(`User ${username} purchased ${item}`);
    saveCounts();
})

userEmitter.on("PROFILE_UPDATE", (username, field) => {
    countEvents.profileupdate++;
    console.log(`User ${username} updated ${field}`);
    saveCounts();
})

userEmitter.on("SUMMARY", () => {
    console.log("\n Event Summary");
    console.log(`Logins: ${countEvents.login}`);
    console.log(`Logouts: ${countEvents.logout}`);
    console.log(`Purchases: ${countEvents.purchase}`);
    console.log(`Profile Updates: ${countEvents.profileupdate}`);
})

// Emit events
userEmitter.emit("LOGIN", "john");
userEmitter.emit("LOGOUT", "john");
userEmitter.emit("PURCHASE", "john", "shoes");
userEmitter.emit("PROFILE_UPDATE", "john", "email");
userEmitter.emit("SUMMARY");
