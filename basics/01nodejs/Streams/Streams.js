const { read } = require('fs');
const { Readable, Writable } = require('stream');

const readableStream = new Readable({
    objectMode: true, //allows pushing JavaScript objects (instead of just strings or Buffers).
    highWaterMark: 2,// Buffer limit for queued data. Matters for (Event-Based Flow), not current implementation
    read(){} // No need to define read() when manually pushing data
})

const writableStream = new Writable({
    objectMode: true, 
    highWaterMark: 1,
    write(chunk, encoding, callback) {
        // encoding format is only relevant for non-objectMode streams
        console.log("Received Write:",JSON.stringify(chunk));

        setTimeout(() => {
            console.log("Finished Processing:", JSON.stringify(chunk));
            callback(); //notify writing is done
        }, 1000)
    }
})

const dataChunks = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Bob" },
    { id: 2, name: "Bob" }, // Duplicate entry (intentional)
];

/*
dataChunks.forEach(data => readableStream.push(data));
readableStream.push(null); // Signals the end of the stream

readableStream.on('data', (chunk) => {
    console.log("Received:", JSON.stringify(chunk));
    // writableStream.write(chunk);

    // Handle Backpressure
    if(!writableStream.write(chunk)){
        // true → Writable stream is ready to accept more data.
        // false → Writable stream is full (buffer is at highWaterMark).
        readableStream.pause();
        writableStream.once("drain", () => {
            console.log("Writable Stream drained, resuming readable stream.");
            readableStream.resume();
        })
    }
})

🔴 Issues:(Event-Based Flow)

Readable stream pushes data automatically whenever it has chunks.
It doesn’t strictly wait for the writable stream to finish before pushing more.
Even though we pause on backpressure, it’s not fully sequential.
*/

// Instaed of relying on readableStream.push, we manually do it. As as soon as data came readableStreeam pushed it in writable stream even when there was buffer limit.
function pushData(){
    if(dataChunks.length > 0){
        const data = dataChunks.shift();
        const canWrite = writableStream.write(data);

        console.log("Pushed:", JSON.stringify(data));

        if(!canWrite){
            readableStream.pause();
            writableStream.once("drain", () =>{
                console.log("Writable Stream drained, resuming readable stream.");
                readableStream.resume();
                pushData(); //continue pushing next data
            })
        }else{
            pushData();// Push next immediately if writable is not full
        }
    }else{
        readableStream.push(null);
    }
}

pushData();

readableStream.on("end", () => {
    console.log("Readable Stream ended.");
});
writableStream.on("finish", () => {
    console.log("Writable Stream finished Processing all data.");
})
/*
The output appears "mixed" because both the readable stream’s data event and the writable stream’s write method are logging to the console, and they run asynchronously within Node.js’s event loop.
*/