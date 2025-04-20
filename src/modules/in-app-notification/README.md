# In-App Notification Module

This module provides real-time notification functionality using WebSockets.

## Data Model

The in-app notification model uses snake_case for field names, following the project's convention:

```typescript
export const InAppNotificationSchema = new Schema(
  {
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: Object.values(NOTIFICATION_TYPES) 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    is_read: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    read_at: { type: Date },
    created_at: Number,
    updated_at: Number,
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
```

## Features

- Real-time notifications via Socket.IO
- Persistent notification storage in MongoDB
- Topic-based notification system (BMI, BMR, etc.)
- Server initialization safeguards and status reporting
- Mark notifications as read
- Count unread notifications
- Soft delete notifications
- User-specific notification filtering

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/in-app-notifications | Create a new notification |
| POST | /api/in-app-notifications/bulk | Create multiple notifications |
| GET | /api/in-app-notifications/user/:userId | Get notifications for a user |
| GET | /api/in-app-notifications/user/:userId/count-unread | Count unread notifications |
| PUT | /api/in-app-notifications/:id/mark-as-read | Mark a notification as read |
| PUT | /api/in-app-notifications/user/:userId/mark-all-as-read | Mark all user notifications as read |
| DELETE | /api/in-app-notifications/:id | Delete a notification (soft delete) |

## WebSocket Events

### Server -> Client Events
- `newNotification` - Sent when a new notification is created for the user
- `topicNotification` - Sent to all connected clients when a topic-specific notification is published

### Client -> Server Events
- `registerUser` - Register a socket connection with a user ID
- `unregisterUser` - Unregister a socket connection from a user ID
- `subscribeTopic` - Subscribe to specific notification topics (BMI, BMR)
- `unsubscribeTopic` - Unsubscribe from notification topics

## Supported Notification Topics

The gateway supports the following predefined notification topics:

```typescript
export enum NotificationTopic {
  BMI = 'bmi_notification',
  BMR = 'bmr_notification',
  GENERAL = 'general_notification',
}
```

## Server Initialization and Status

The gateway includes safeguards to ensure the WebSocket server is properly initialized:

```typescript
// Check server status programmatically
const serverStatus = inAppGateway.getServerStatus();
console.log(`Server initialized: ${serverStatus.initialized}`);
console.log(`Connected clients: ${serverStatus.connectedClients}`);

// Methods will safely handle cases where the server isn't ready
const success = inAppGateway.sendBMINotification(notification);
if (!success) {
  console.log('Notification was not sent - server not ready');
}
```

## Frontend Integration Example

```typescript
// Using Socket.IO client in a frontend application
import { io } from 'socket.io-client';

// Connect to the notification namespace
const socket = io('http://your-api-domain/notifications');

// Function to register the user with the socket server
function registerUser(userId) {
  socket.emit('registerUser', userId, (response) => {
    console.log('Registration response:', response);
  });
}

// Subscribe to specific notification topics (BMI, BMR)
function subscribeToTopics(userId) {
  socket.emit('subscribeTopic', {
    userId,
    topic: ['bmi_notification', 'bmr_notification']
  }, (response) => {
    console.log('Topic subscription response:', response);
  });
}

// Listen for user-specific notifications
socket.on('newNotification', (notification) => {
  console.log('New notification received:', notification);
  // Handle the notification (e.g., show a toast, update notification list)
});

// Listen for topic-based notifications (sent to all connected clients)
socket.on('topicNotification', ({ topic, notification }) => {
  console.log(`New ${topic} notification:`, notification);
  
  // Check if this notification is for a topic you're interested in
  if (topic === 'bmi_notification') {
    // Handle BMI notification
    updateBMIChart(notification);
  } else if (topic === 'bmr_notification') {
    // Handle BMR notification
    updateBMRStats(notification);
  }
});

// Example: When user logs in
const userId = 'user-123'; // Get this from your authentication system
registerUser(userId);
subscribeToTopics(userId);

// Example: Unregister when user logs out
function logout() {
  socket.emit('unregisterUser', userId);
  socket.emit('unsubscribeTopic', {
    userId,
    topic: ['bmi_notification', 'bmr_notification']
  });
  // Perform other logout actions
}
```

## Backend Integration Example

```typescript
// In your notification-handlings.service.ts
import { Injectable } from '@nestjs/common';
import { InAppNotificationService } from '../in-app-notification/in-app-notification.service';
import { InAppGateway, NotificationTopic } from '../in-app-notification/in-app-notification.gateway';

@Injectable()
export class NotificationHandlingsService {
  constructor(
    private readonly inAppNotificationService: InAppNotificationService,
    private readonly inAppGateway: InAppGateway,
  ) {}

  async handleBMIUpdate(data: any) {
    try {
      // Check if WebSocket server is ready
      const serverStatus = this.inAppGateway.getServerStatus();
      
      // Store notification in database
      const bmiNotification = await this.inAppNotificationService.create({
        user_id: data.userId,
        user_name: data.userName,
        type: 'bmi_notification',
        title: 'BMI Update',
        message: `Your BMI has been updated to ${data.bmi}`,
        data: {
          bmi: data.bmi,
          category: data.category,
          previousBmi: data.previousBmi
        },
        is_read: false,
        is_deleted: false
      });
      
      // Send broadcast notification with topic info
      // All connected clients will receive this, and they can filter by topic
      const notificationSent = this.inAppGateway.sendBMINotification(bmiNotification);
      
      if (!notificationSent) {
        console.log('BMI notification broadcast failed - server not ready');
      }
      
      // Also send a user-specific notification
      this.inAppGateway.sendNotificationToUser(data.userId, bmiNotification);
      
      return bmiNotification;
    } catch (error) {
      console.error('Error handling BMI update:', error);
      throw error;
    }
  }

  async handleBMRUpdate(data: any) {
    try {
      // Store notification in database
      const bmrNotification = await this.inAppNotificationService.create({
        user_id: data.userId,
        user_name: data.userName,
        type: 'bmr_notification',
        title: 'BMR Update',
        message: `Your BMR has been updated to ${data.bmr} calories/day`,
        data: {
          bmr: data.bmr,
          previousBmr: data.previousBmr
        },
        is_read: false,
        is_deleted: false
      });
      
      // Send broadcast notification with topic info
      this.inAppGateway.sendBMRNotification(bmrNotification);
      
      // Also send to the specific user
      this.inAppGateway.sendNotificationToUser(data.userId, bmrNotification);
      
      return bmrNotification;
    } catch (error) {
      console.error('Error handling BMR update:', error);
      throw error;
    }
  }
}
``` 