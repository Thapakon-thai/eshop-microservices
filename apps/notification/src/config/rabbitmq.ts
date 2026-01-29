import { connect, Connection, Channel } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

// let connection: Connection;
// let channel: Channel;
let connection: any;
let channel: any;

export const connectRabbitMQ = async () => {
    try {
        connection = await connect(rabbitUrl);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        process.exit(1);
    }
};

export const getChannel = () => channel;
