const Redis = require('ioredis');

// ioredis is a redis client library for nodejs
//  Gives automcatic pipelining, built-in clusters, typescript support

const redis = new Redis();

async function ioRedisDemo(){

    try {

        // await redis.connect(); --> gives error: Already connected
        await redis.set('key', 'value');
        const val = await redis.get('key');
        console.log(val); // prints: value
        
    } catch (error) {
        console.error(error);
    } finally {
        redis.quit();
    }
}

ioRedisDemo();