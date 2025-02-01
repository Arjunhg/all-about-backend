const redis = require('redis');

//1: create a client
const client = redis.createClient({ //this client will be used to interact with the redis server
    host: 'localhost', //redis server is now hosted on localhost
    port: 6379, //default port
}) 

// 2: event listener
client.on('error', (error) => console.log('Redis client error occured', error));

// 3: connect to redis server for testing
async function testRedisConnection(){
    try {
        await client.connect();
        console.log('Redis client connected to server');

        await client.set("name", "Arjun");

        const extractValue = await client.get("name"); //if wrong key then it will return null
        console.log(extractValue);

        // delete key
        const deleteCount = await client.del("name");
        console.log(deleteCount); //gives integer output

        const extractUpdatedValue = await client.get("name");
        console.log(extractUpdatedValue); //null. Not error

        // inc and dec
        await client.set("counter", 10);
        const incCount = await client.incr("counter");
        console.log(incCount); //11

        const decCount = await client.decr("counter");
        console.log(decCount); //10

    } catch (error) {
        
        console.error(error);
        
    } finally {
        await client.quit(); //avoid open connection
    }
};

testRedisConnection();