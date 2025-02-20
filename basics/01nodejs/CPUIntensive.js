// process.env.UV_THREADPOOL_SIZE = require('os').cpus().length;
const crypto = require('crypto');

let start = Date.now();

// password based key derivation function 2
for (let i = 0; i < 10; i++) {
    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
      console.log(`${Date.now() - start}ms Done`);
    });
  }

console.log('UV_THREADPOOL_SIZE:', process.env.UV_THREADPOOL_SIZE); // If not set then default is 4

