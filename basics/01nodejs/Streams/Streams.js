const { Readable, Writable } = require('stream');

const readableStream = new Readable({
    objectMode: true, //allows pushing JavaScript objects (instead of just strings or Buffers).
    highWaterMark: 2,
    read(){} // No need to define read() when manually pushing data
})

const writableStream = new Writable({
    objectMode: true, 
    write(s){
        console.log("Received Write:",JSON.stringify(s));
    }
})

readableStream.push({id: 1, name: "John Doe"});
readableStream.push({id: 2, name: "Bob"});
readableStream.push(null); // Signals the end of the stream

readableStream.on('data', (chunk) => {
    console.log("Received:", JSON.stringify(chunk));
    writableStream.write(chunk);
})

readableStream.on("end", () => {
    console.log("Stream ended.");
});