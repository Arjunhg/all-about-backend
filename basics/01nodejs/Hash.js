const crypto = require('crypto');

/* Using createHash
const randomValues = crypto.randomBytes(10); //The number of bytes to generate. The size must not be larger than 2**31 - 1.
// console.log(randomValues); --> Gives buffer
console.log(randomValues.toString('hex')); // --> Gives hex string

const hashValue = crypto.createHash('sha256').update("Arjun").digest('hex');
console.log(hashValue);

const inputValue = "Arjun";
const matchValue = crypto.createHash("sha256").update(inputValue).digest('hex');

if(hashValue===matchValue){
    console.log("You can login");
}else{
    console.log("You cannot login");
}

NOT secure for passwords

General-purpose, fast hash function
No built-in salt
Too computationally efficient (vulnerable to brute force)
*/


// Using pbkdf2
function hashPasswordWithPBKDF2(password){
    return new Promise((resolve, reject) => {

        const salt = crypto.randomBytes(16);

        const iterations = 310000;
        const keylen = 32;
        const digest = "sha256";

        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
            if(err) reject(err);

            const hash = {
                salt: salt.toString('hex'),
                hash: derivedKey.toString('hex'),
                iterations
            };
            resolve(hash);
        })
    })
}
/*1️⃣ Promise-Based Approach (Non-Blocking, Concurrent Execution)
function verifyPasswordPBKDF2(password, storedHash) {
  return new Promise((resolve, reject) => {
    const salt = Buffer.from(storedHash.salt, 'hex');
    
    crypto.pbkdf2(password, salt, storedHash.iterations, 32, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === storedHash.hash);
    });
  });
}
*/
//2️⃣ Async/Await Approach (Blocking, Sequential Execution)
async function verifyPasswordPBKDF2(password, hash){

    const salt = Buffer.from(hash.salt, 'hex');

    // crypto.pbkdf2 is a callback and not a promise. And since async/await works with promises, we need to wrap it in a promise
    try {
        const derivedKey = await new Promise((resolve, reject) => {
            crypto.pbkdf2(
                password,
                salt,
                hash.iterations,
                32,
                'sha256',
                (err, key) => {
                    if(err) reject(err);
                    else resolve(key);
                }
            )
        })
        return derivedKey.toString('hex') === hash.hash;
    } catch (error) {
        throw err;
    }

}
/*
crypto.pbkdf2 - Secure for passwords

Password-specific with configurable parameters
Requires manual salt management
Iteration count for key stretching
NIST-approved standard
*/


// Using bcrypt
const bcrypt = require('bcrypt');

async function hasPasswordWithBcrypt(password){
    try {
        const saltRounds = 12;
        const hashedPassword  = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.rttot('Error Hashing Password', error);
        throw error;
    }
}
async function verifyPasswordWithBcrypt(password, hashedPassword){
    try {
        const passwordMatches = await bcrypt.compare(password, hashedPassword);
        return passwordMatches;
    } catch (error) {
        console.error("Error verifying password", error);
        throw error;
    }
}
/*
Secure for passwords

Purpose-built for password storage
Automatic salt generation and management
Built-in work factor control
Simple API designed specifically for authentication
*/
/*
Difference between pbkdf2 and bcrypt
- bcrypt methods (bcrypt.hash, bcrypt.compare) natively return Promises, making them directly compatible with async/await
- crypto.pbkdf2 uses traditional Node.js callbacks, requiring manual Promise wrapping to work with async/await
*/

// example
async function example(){
    try {
        
        const password = "user-secure-password";
        const hashedPassword = await hasPasswordWithBcrypt(password);
        console.log("Hashed Password:", hashedPassword);

        const isMatch = await verifyPasswordWithBcrypt(password, hashedPassword);
        console.log("Password verification:", isMatch ? "Successful" : "Failed");

        const isWrongMatch = await verifyPasswordWithBcrypt("wrong-password", hashedPassword);
        console.log("Wrong Password verification:", isWrongMatch ? "Successful" : "Failed");
    } catch (error) {
        console.error("Authentication Error", error);
    }
}
example();