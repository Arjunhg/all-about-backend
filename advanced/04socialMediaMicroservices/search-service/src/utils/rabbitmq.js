const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectRabbitMQ(){

    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to RabbitMQ');

        return channel;
    } catch (error) {
        logger.error('Error connecting to RabbitMQ', error);
        throw error;
    }
}


async function consumeEvent(routingKey, callback){
    if(!channel){
        await connectRabbitMQ();
    }

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (message) => {
        if(message !== null){
            const content = JSON.parse(message.content.toString());
            callback(content);
            channel.ack(message);
        }
    })

    logger.info(`Subscribed/Consumed to RabbitMQ Event with routing key ${routingKey}`);
}

module.exports = { connectRabbitMQ, consumeEvent };

