import dotenv from 'dotenv';
import { connectRabbitMQ } from './config/rabbitmq';
import { startNotificationConsumer } from './consumers/notificationConsumer';

dotenv.config();

const start = async () => {
    const channel = await connectRabbitMQ();
    await startNotificationConsumer(channel);
};

start();
