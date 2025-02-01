const { log } = require('console');
const fs = require('fs');
const zlib = require('zlib'); //module by node js to compress and decompress data
const crypto = require('crypto'); //for encrption
const { Transform } = require('stream');

class EncryptStream extends Transform{

    constructor(key, vector){
        super();
        this.key = key;
        this.vector = vector;
    }

    _transform(chunk, encoding, callback){
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.vector);
        const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]); //encrypt the chunk data
        this.push(encrypted);
        callback(); //to know its completed
    }
}

const key = crypto.randomBytes(32); //random 32 byte key
const vector = crypto.randomBytes(16); //random 16 byte vector

// from which file we need to read the data
const readableStream = fs.createReadStream('SD.txt');

// new gzip object to compress stream of data
const gzipStream = zlib.createGzip();

// new encryptStream object to encrypt stream of data
const encryptStream = new EncryptStream(key, vector);

// from which file we need to write the data
const writableStream = fs.createWriteStream('SD.txt.gz.enc');

// Now chain all the streams together: read -> compress -> encrypt -> write
// to do this we can use pipe method
readableStream.pipe(gzipStream).pipe(encryptStream).pipe(writableStream);

log('Streaming -> Compressing -> Encrypting -> Writing');