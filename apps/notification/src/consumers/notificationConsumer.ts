import { Channel } from 'amqplib';
import Notification from '../models/Notification';

export const startNotificationConsumer = async (channel: Channel) => {
    const queue = 'notification_queue';
    const exchange = 'order_events';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, '#');

    console.log(`Waiting for messages in ${queue}...`);

    channel.consume(queue, async (msg) => {
        if (msg) {
            try {
                const content = JSON.parse(msg.content.toString());
                console.log('Received notification event:', content);

                if (content.status === 'pending') {
                    channel.ack(msg);
                    return;
                }

                const amountInDollars = content.amount ? (content.amount / 100).toFixed(2) : '0.00';

                const notification = new Notification({
                    user_id: content.user_id || 'unknown_user',
                    type: content.type || 'ORDER_EVENT',
                    title: `Order Event: ${content.status || 'Update'}`,
                    message: `An event occurred for order #${content.order_id || 'unknown'}. Total Amount: $${amountInDollars}`,
                    data: content
                });
                
                await notification.save();
                console.log(`Saved notification to DB for user ${notification.user_id}`);

                channel.ack(msg);
            } catch (error) {
                console.error("Failed to process or save notification:", error);
            }
        }
    });
};
