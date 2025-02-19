
console.log(os.cpus().length);
console.log(os.type());
console.log(os.platform());
console.log(process.platform);
console.log(os.release());  // e.g., '10.0.19042' (Windows), '22.4.0' (Mac)
console.log(os.version());  // OS version info (on some platforms)
console.log(os.arch()); // 'x64', 'arm', 'arm64' , get GPU architecture
console.log(os.totalmem()); // Total RAM in bytes
console.log(os.freemem()); // Available RAM in bytes
console.log((os.freemem() / 1024 / 1024).toFixed(2) + ' MB');
console.log((os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB');
console.log(os.uptime()); // Uptime in seconds.  (how long the system has been running):
console.log((os.uptime() / 60 / 60).toFixed(2) + ' hours'); // Convert to hours
console.log(os.userInfo());
console.log(os.networkInterfaces());
