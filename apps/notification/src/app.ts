import express from 'express';
import cors from 'cors';
import Notification from './models/Notification';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/notifications', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.patch('/api/v1/notifications/read-all', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await Notification.updateMany(
            { user_id: userId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/v1/health', (req, res) => {
    res.send('Notification Service is running');
});

export default app;
