const amqp = require('amqplib');
const logger = require('../../../media-service/src/utils/logger');

let connection = null;
let channel = null;

// unique exchange name
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
    }
}

module.exports = { connectRabbitMQ }

// to use this connection go to entry point of post service