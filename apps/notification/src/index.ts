import dotenv from 'dotenv';
import { connectRabbitMQ } from './config/rabbitmq';
import { startNotificationConsumer } from './consumers/notificationConsumer';
import { connectDB } from './config/db';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5004;

const start = async () => {
    await connectDB();

    const channel = await connectRabbitMQ();
    await startNotificationConsumer(channel);

    app.listen(PORT, () => {
        console.log(`Notification Service running on port ${PORT}`);
    });
};

start();
