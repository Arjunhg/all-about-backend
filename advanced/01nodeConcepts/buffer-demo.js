const { log } = require('console');

const buff1 = Buffer.alloc(10); //allocating a buffer of 10 bytes -> initialize all with zero
log(buff1);

const buffFromString = Buffer.from('Hellonnnnnnmm');
log(buffFromString);

const buffFromArrayOfInteger = Buffer.from([1, 2, 3,4,5,6,7,8,6,7,8,8]);
log(buffFromArrayOfInteger);

// creating buffers. Write a string to buffer
buff1.write('Node js');
log('After writing Node js to buff1', buff1.toString());

// read single byte from paricular buffer
log(buffFromString[0]);

// slice buffer
log(buffFromString.slice(0, 5));

// concat
const concatBuff = Buffer.concat([buff1, buffFromString]);
log(concatBuff);

// convert buff to json
log(concatBuff.toJSON());