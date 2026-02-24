import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user_id: string; // ID of the user to notify
  type: string;    // e.g., 'ORDER_CREATED', 'PAYMENT_SUCCESS'
  title: string;
  message: string;
  data: any;       // Arbitrary data related to the notification
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user_id: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
