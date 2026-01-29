import { Channel } from 'amqplib';

export const startNotificationConsumer = async (channel: Channel) => {
    const queue = 'notification_queue';
    const exchange = 'order_events'; // Assuming order service publishes to this exchange

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, '#'); // Listen to all events for now

    console.log(`Waiting for messages in ${queue}...`);

    channel.consume(queue, (msg) => {
        if (msg) {
            const content = JSON.parse(msg.content.toString());
            console.log('Received notification event:', content);
            
            // Simulate sending email
            console.log(`[SIMULATION] Sending email to ${content.email || 'user@example.com'}: ${content.type} - ${JSON.stringify(content.data)}`);

            channel.ack(msg);
        }
    });
};
