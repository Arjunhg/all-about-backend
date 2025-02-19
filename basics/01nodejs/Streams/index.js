const http = require("http");
const fs = require("fs");
const { Transform, pipeline } = require("stream");

const server = http.createServer((req, res) => {

    // Downloading bad way: Its synchronouis and blocking so not good for large files
    // const file = fs.readFileSync("bigfile.txt");
    // return res.end(file);
    // // readFile is async and non blocking but it also loads entire file at once. So good for json types of data but not audios, videos...

    // // Downloading files good way: Streams
    // const readableStreams = fs.createReadStreams("bigfile.txt");
    // readableStreams.pipe(res);

    // // Copying big files bad way
    // const file1 = fs.readFileSync("bigfile.txt");
    // fs.writeFileSync("output.txt", file1);
    // res.end();
    // // Copying big files good way
    // const readStream = fs.createReadStream("bigfile.txt", { encoding: "utf-8" });
    // const writeStream = fs.createWriteStream("output.txt");

    // readStream.on('data', (chunk) => {
    //     // console.log('Chunk', chunk.toString());
    //     console.log('Chunk', chunk);
    //     writeStream.write(chunk);
    // })

    const sampleFileStream = fs.createReadStream("sample.txt", { encoding: "utf8" });
    const outputWritableStream = fs.createWriteStream("output.txt");

    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            // Ensure chunk is a string (safe conversion)
            const modifiedWord = chunk
                .toUpperCase()
                .replace(/ipsum/gi, "Hello")

            callback(null, modifiedWord);
        }
    });

      // !Bad way to tranforming chunks
    // samplefilestream.on("data" , (chunk)=>{
    //     const modifiedWord = chunk.toString().toUpperCase().replaceAll(ipsum/gi , "Hello")
    //     outputwritablestream.write(modifiedWord)
    // })

    sampleFileStream
        .pipe(transformStream) // Apply transformations
        .pipe(outputWritableStream) // Write to output.txt
        .on("finish", () => console.log("Transformation complete!"));
    
    res.end();
})

server.listen(3000, () => console.log("Server is running on port 3000"));