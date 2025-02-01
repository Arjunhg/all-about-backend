// timers -> pending callbacks -> idel, prepare -> poll -> check -> close callbacks

const fs = require('fs');
const crypto = require('crypto');
const { log } = require('console');

log('1. Script Start')

setTimeout(() => {
    log('2. SetTimeout 0s callback (macrotask)')
}, 0)

setTimeout(() => {
    log('3. SetTimeout 0s callback (macrotask)')
}, 0)

setImmediate(() => {
    log('4. SetImmediate 0s callback (check phase)')
})

Promise.resolve().then(() => {
    log('5. Promise resolved (microtask)')
})

process.nextTick(() => {
    log('6. Process.nextTick callback (microtask)')
});

fs.readFile(__filename, () => {
    log('7. File read opeartion (I/O callback)')
});

// cpu intensive operation
crypto.pbkdf2('secret', 'salt', 10000, 64, 'sha512', (err, key) => {
    if (err) throw err;
    log('8. pbkdf2 operation completed. CPU intensive operation (I/O callback)')
})  //asynchronous password base key derivation function

log('9. Script End')
