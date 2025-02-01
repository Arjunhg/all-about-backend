// similar to socket
//  publisher will send a message to a channel
// subscriber will consume this messages
//  pub sub is a messaging pattern

const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

client.on('error', (error) => {
    console.log('Redis client error occured', error);
});

async function testAdditionalFeatures(){

    try {
        
        await client.connect(); //can think of this as a publisher

        // create a new client instance where we subscribe to message. This will allow us to listen to channel independantly
        const subscriber = client.duplicate(); //creates a new client but shares the same connection as the above initiated client

        await subscriber.connect();//connect to redis server for subscriber

        // subscribe to a channel
        await subscriber.subscribe('dummy-channel', (message, channel) => {
            console.log(`Received message from ${channel}: ${message}`);
        })

        // publish msg to dummy-channel
        await client.publish('dummy-channel', 'Some Dummy data from publisher'); //this will send content to the dummy channel
        await client.publish('dummy-channel', 'Some new message again from publisher');

        await new Promise((resolve) => setTimeout(resolve, 3000)); //ensuring that the message is published before unsubscribing

        await subscriber.unsubscribe('dummy-channel');
        await subscriber.quit(); //close the connection

    } catch (error) {
        console.error(error);
    } finally{
        client.quit();
    }
}

async function pipeliningAndTransaction() {
    try {

        await client.connect();

        // pipelining and transaction
        // P is a technique of sending multiple command to server in batch.
        // T is a technique of executing multiple commands in a single transaction.
        const multi = client.multi();
        //  add multiple commands to be executed in transaction
        multi.set('key-transaction1','value1');
        multi.set('key-transaction2','value2');

        multi.get('key-transaction1');
        multi.get('key-transaction2'); //executing multiple command as single unit

        const results = await multi.exec();
        console.log(results);

        // pipeline example
        const pipeline = client.multi();

        multi.set('key-pipeline1','value1');
        multi.set('key-piepeline2','value2');

        multi.get('key-pipeline1');
        multi.get('key-pipeline2');

        const pipelineResults = await multi.exec();
        console.log(pipelineResults);

        // difference
        // batch data operation ->
        const pipelineOne = client.multi();

        for(let i=0; i<1000; i++){
            pipelineOne.set(`user-${i}:action`, `Action-${i}`);
        }

        await pipelineOne.exec(); //inserting all the user actions at once in redis database

        // in transaction if either of the data fail then all the data will be rolled back ensuring consistency. Atomicity
        const transactionOne = client.multi();
        multi.decrBy('account:1234:balance', 100);
        multi.incrBy('account:0000:balance', 100);

        const finalResult = await multi.exec();

        // ex-2
        const cartExample = await client.multi();
        multi.hIncrBy('cart:1234', 'item_count', 1);
        multi.hIncrBy('cart:1234', 'total_price', 10);
        await multi.exec();

    } catch (error) {
        console.error(error);
    } finally {
        client.quit();
    }
}

async function pipeliningPerformanceExample(){

    try {
        
        await client.connect();

        console.log('Performance Test');

        console.time('Without Pipelining');
        for(let i=0; i<1000; i++){
            await client.set(`user${i}`, `User-Values${i}`);
        }
        console.timeEnd('Without Pipelining');

        console.time('With Pipelining');
        const bigPipeLine = client.multi();
        for(let i=0; i<1000; i++){
            bigPipeLine.set(`user_pipeline_key${i}`, `User-Pipeline-Values${i}`);
        }
        await bigPipeLine.exec();
        console.timeEnd('With Pipelining');

        /**
         $ node pub-sub.js
            Performance Test
            Without Pipelining: 351.525ms
            With Pipelining: 27.263ms
         */
        
    } catch (error) {
        console.error(error);
    } finally {
        client.quit();
    }
}

// testAdditionalFeatures();
// pipeliningAndTransaction();
pipeliningPerformanceExample();