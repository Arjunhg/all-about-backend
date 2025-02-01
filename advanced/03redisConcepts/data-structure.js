const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

client.on('error', (error) => console.log('Redis client error occured', error));

async function redisDataStructure(){

    try {

        await client.connect();

        // Strings -> set (store string value with key), get (extract that value), mset(multiple key value pairs), mget(multiple keys)
        await client.set('user:name', 'Arjun Sharma');
        const name  = await client.get('user:name');
        console.log(name);

        // multiple values
        await client.mSet([
            "user:email","rex@gmail.com",
            "user:age","60",
            "user:country","India",
        ]);
        const [email, age, location] = await client.mGet([
            "user:email",
            "user:age",
            "user:country",
        ]);
        console.log(email, age, location);

        // list: Lpush(insert element at start),Rpush(insert element at end), Lpop(remove element from start), Rpop(remove element from end, Lrange(get range of elements), Lindex(get element at index)
        // await client.lPush('notes', ['note1', 'note2', 'note3']);
        // const extractAllNotes = await client.lRange('notes', 0, -1);
        // console.log(extractAllNotes);

        // const firstNotes = await client.lPop('notes');
        // console.log(firstNotes);

        // const remainingNotes = await client.lRange('notes', 0, -1);
        // console.log(remainingNotes);

        // sets: Sadd(add one or more member to the set), Smembers(get all members of the set), Srem(remove one or more member from the set), Sismember(check if member exists in the set)
        // await client.sAdd('user:nickname', ['john', 'jane', 'joe']);
        // const extractAllNicknames = await client.sMembers('user:nickname');
        // console.log(extractAllNicknames);

        // const isJaneExists = await client.sIsMember('user:nickname', 'jane');
        // console.log(isJaneExists);

        // await client.sRem('user:nickname', 'jane');
        // const remainingNicknames = await client.sMembers('user:nickname');
        // console.log(remainingNicknames);

        // Sorted Sets: Each element has a score associated with it and redis will maintain the order based on the score associated with that, Zadd(add one or more member to the set with score), Zcard(get number of elements in the set), Zrange(get range of elements with score), Zscore(get score of element)
        // await client.zAdd('cart', [
        //     {
        //         score: 100,
        //         value: 'Cart 1'
        //     },
        //     {
        //         score: 150,
        //         value: 'Cart 2'
        //     },
        //     {
        //         score: 30,
        //         value: 'Cart 3'
        //     }
        // ]);
        // const getTopCartItems = await client.zRange('cart', 0, -1);
        // console.log(getTopCartItems); //ascending order by default

        // const extractAllCartItemsWithScore = await client.zRangeWithScores('cart', 0, -1);
        // console.log(extractAllCartItemsWithScore);

        // const cartTwoRank = await client.zRank('cart', 'Cart 2');
        // console.log(cartTwoRank);

        // Hashes: Hset(add one or more member to the set), Hget(get one or more member from the set), Hmset(multiple key value pairs), Hmget(multiple keys)
        await client.hSet('product:1',{
            name: 'Product 1',
            price: 100,
            description: 'This is product 1'
        })
        const getProductPrice = await client.hGet('product:1', 'price');
        console.log(getProductPrice);

        const getProductDetails = await client.hGetAll('product:1');
        console.log(getProductDetails);

        await client.hDel('product:1', 'price');

        const updatedProductDetails = await client.hGetAll('product:1', 'price');
        console.log(updatedProductDetails);
        
    } catch (error) {
        console.error(error);
    } finally{
        client.quit();
    }
}

redisDataStructure();
