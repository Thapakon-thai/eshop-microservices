import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
    url: redisUrl
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    await client.connect();
    console.log('Connected to Redis');
};

export default client;
