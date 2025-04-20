import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { BMINotification } from './in-app-notification.interface';

/**
 * Notification topics that clients can subscribe to
 * 
 * - BMI: Body Mass Index notifications
 * - BMR: Basal Metabolic Rate notifications 
 * - GENERAL: General system notifications
 */
export enum NotificationTopic {
  BMI = 'bmi_notification',
  BMR = 'bmr_notification',
  GENERAL = 'general_notification',
}

/**
 * WebSocket Gateway for handling real-time notifications
 * 
 * This gateway uses Socket.IO under the hood, which provides:
 * - Bi-directional communication between client/server
 * - Automatic reconnection handling
 * - Room-based message broadcasting
 * - Event-based message system
 * 
 * @WebSocketGateway decorator configures:
 * - CORS settings for browser security
 * - The namespace 'notifications' - clients connect to this specific namespace
 */
@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify your allowed origins
  },
  namespace: 'notifications',
})
@Injectable()
export class InAppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  /**
   * The Socket.IO server instance, injected by NestJS
   * Used to emit events to connected clients
   */
  @WebSocketServer() server: Server;
  
  private readonly logger = new Logger(InAppGateway.name);
  
  /**
   * Tracks whether the server has been properly initialized
   */
  private isServerInitialized = false;
  
  /**
   * Maps user IDs to their socket IDs
   * This allows us to send messages to specific users by their ID
   * A user can have multiple sockets (connections from multiple devices)
   */
  private userSocketMap = new Map<string, string[]>();
  
  /**
   * Maps topics to sets of socket IDs
   * Tracks which sockets are subscribed to which notification topics
   */
  private topicSubscriptions = new Map<string, Set<string>>();

  /**
   * Implements OnModuleInit from NestJS
   * This runs when the module is initialized by NestJS DI system
   */
  onModuleInit() {
    this.logger.log('Notification WebSocket Gateway module initialized');
    // At this point, the server property might not be available yet
  }

  /**
   * Called when the gateway is initialized
   * @param server The Socket.IO server instance
   */
  afterInit(server: Server) {
    this.logger.log('Notification WebSocket Server initialized successfully');
    this.isServerInitialized = true;
    
    // Optional: Set up server-level configurations if needed
    this.server.use((socket, next) => {
      // Example middleware for all sockets
      this.logger.debug(`Socket middleware processing socket: ${socket.id}`);
      next();
    });
  }

  /**
   * Called when a client connects to the gateway
   * @param client The Socket.IO client socket
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Note: At this point, the client is connected but not authenticated
    // They must call registerUser to associate their user ID with their socket
  }

  /**
   * Called when a client disconnects from the gateway
   * Cleans up user and topic registrations
   * @param client The Socket.IO client socket
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove the disconnected socket from userSocketMap
    this.removeSocketFromUser(client.id);
    // Remove socket from topic subscriptions
    this.removeSocketFromTopics(client.id);
  }

  /**
   * Checks if the WebSocket server is ready to send messages
   * @returns True if the server is initialized and ready
   */
  private isServerReady(): boolean {
    if (!this.isServerInitialized) {
      this.logger.warn('WebSocket server not initialized yet');
      return false;
    }
    
    if (!this.server) {
      this.logger.warn('WebSocket server instance is undefined');
      return false;
    }
    
    return true;
  }

  /**
   * Helper method to remove a socket from user registration
   * @param socketId The socket ID to remove
   */
  private removeSocketFromUser(socketId: string) {
    // Look through all users and their registered sockets
    for (const [userId, socketIds] of this.userSocketMap.entries()) {
      const index = socketIds.indexOf(socketId);
      if (index !== -1) {
        // Remove this socket from the user's socket list
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          // If this was the user's last socket, remove the user entirely
          this.userSocketMap.delete(userId);
        } else {
          // Otherwise update the user's socket list
          this.userSocketMap.set(userId, socketIds);
        }
        break;
      }
    }
  }

  /**
   * Helper method to remove a socket from topic subscriptions
   * @param socketId The socket ID to remove
   */
  private removeSocketFromTopics(socketId: string) {
    // Look through all topics and their subscribers
    for (const [topic, subscribers] of this.topicSubscriptions.entries()) {
      if (subscribers.has(socketId)) {
        // Remove this socket from the topic's subscriber set
        subscribers.delete(socketId);
        if (subscribers.size === 0) {
          // If this was the topic's last subscriber, remove the topic entirely
          this.topicSubscriptions.delete(topic);
        }
      }
    }
  }

  /**
   * Returns the current status of the WebSocket server
   * This can be used by other services to check server readiness
   */
  getServerStatus() {
    return {
      initialized: this.isServerInitialized,
      hasServer: !!this.server,
      connectedClients: this.server ? Array.from(this.server.sockets.sockets.keys()).length : 0,
      registeredUsers: this.userSocketMap.size,
      activeTopics: Array.from(this.topicSubscriptions.keys()),
    };
  }

  /**
   * Event handler for when a client wants to register as a specific user
   * Creates a link between a user ID and socket ID
   * 
   * @param userId The user ID to register
   * @param client The client socket
   * @returns A status response
   * 
   * Client usage: socket.emit('registerUser', 'user123', callback)
   */
  @SubscribeMessage('registerUser')
  handleRegisterUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
    // Add this socket to the user's socket list
    const existingSocketIds = this.userSocketMap.get(userId) || [];
    if (!existingSocketIds.includes(client.id)) {
      existingSocketIds.push(client.id);
      this.userSocketMap.set(userId, existingSocketIds);
    }
    
    // Join the user to a room with their user ID
    // Socket.IO rooms allow sending messages to groups of users
    client.join(userId);
    
    return { status: 'success', message: 'User registered for notifications' };
  }

  /**
   * Event handler for when a client wants to unregister a user
   * Removes the link between a user ID and socket ID
   * 
   * @param userId The user ID to unregister
   * @param client The client socket
   * @returns A status response
   * 
   * Client usage: socket.emit('unregisterUser', 'user123', callback)
   */
  @SubscribeMessage('unregisterUser')
  handleUnregisterUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`User ${userId} unregistered from socket ${client.id}`);
    // Remove this socket from the user's socket list
    const existingSocketIds = this.userSocketMap.get(userId) || [];
    const index = existingSocketIds.indexOf(client.id);
    
    if (index !== -1) {
      existingSocketIds.splice(index, 1);
      if (existingSocketIds.length === 0) {
        this.userSocketMap.delete(userId);
      } else {
        this.userSocketMap.set(userId, existingSocketIds);
      }
    }
    
    // Leave the user's room
    client.leave(userId);
    
    return { status: 'success', message: 'User unregistered from notifications' };
  }

  /**
   * Event handler for when a client wants to subscribe to notification topics
   * 
   * @param data Object containing userId and topic(s) to subscribe to
   * @param client The client socket
   * @returns A status response
   * 
   * Client usage:
   * socket.emit('subscribeTopic', { userId: 'user123', topic: 'bmi_notification' }, callback)
   * or for multiple topics:
   * socket.emit('subscribeTopic', { userId: 'user123', topic: ['bmi_notification', 'bmr_notification'] }, callback)
   */
  @SubscribeMessage('subscribeTopic')
  handleSubscribeTopic(
    @MessageBody() data: { userId: string, topic: string | string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, topic } = data;
    this.logger.log(`User ${userId} subscribing to topics: ${typeof topic === 'string' ? topic : topic.join(', ')}`);
    
    // Convert single topic to array for consistent handling
    const topics = Array.isArray(topic) ? topic : [topic];
    
    topics.forEach(topicName => {
      // Register topic subscription
      const subscribers = this.topicSubscriptions.get(topicName) || new Set();
      subscribers.add(client.id);
      this.topicSubscriptions.set(topicName, subscribers);
      
      // Join the client to a room for this topic
      // Using 'topic:' prefix to avoid conflicts with user rooms
      client.join(`topic:${topicName}`);
    });
    
    return { 
      status: 'success', 
      message: `Subscribed to ${topics.length} topic(s)`,
      topics
    };
  }

  /**
   * Event handler for when a client wants to unsubscribe from notification topics
   * 
   * @param data Object containing userId and topic(s) to unsubscribe from
   * @param client The client socket
   * @returns A status response
   * 
   * Client usage:
   * socket.emit('unsubscribeTopic', { userId: 'user123', topic: 'bmi_notification' }, callback)
   * or for multiple topics:
   * socket.emit('unsubscribeTopic', { userId: 'user123', topic: ['bmi_notification', 'bmr_notification'] }, callback)
   */
  @SubscribeMessage('unsubscribeTopic')
  handleUnsubscribeTopic(
    @MessageBody() data: { userId: string, topic: string | string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, topic } = data;
    this.logger.log(`User ${userId} unsubscribing from topics: ${typeof topic === 'string' ? topic : topic.join(', ')}`);
    
    // Convert single topic to array for consistent handling
    const topics = Array.isArray(topic) ? topic : [topic];
    
    topics.forEach(topicName => {
      // Update topic subscription registry
      const subscribers = this.topicSubscriptions.get(topicName);
      if (subscribers) {
        subscribers.delete(client.id);
        if (subscribers.size === 0) {
          this.topicSubscriptions.delete(topicName);
        } else {
          this.topicSubscriptions.set(topicName, subscribers);
        }
      }
      
      // Leave the topic room
      client.leave(`topic:${topicName}`);
    });
    
    return { 
      status: 'success', 
      message: `Unsubscribed from ${topics.length} topic(s)`,
      topics
    };
  }

  /**
   * Sends a notification to a specific user
   * Uses Socket.IO rooms for efficient message delivery
   * 
   * @param userId User ID to send the notification to
   * @param notification The notification data to send
   * @returns True if the notification was sent, false otherwise
   * 
   * Client handling:
   * socket.on('newNotification', (notification) => { console.log(notification); });
   */
  sendNotificationToUser(userId: string, notification: any): boolean {
    if (!this.isServerReady()) {
      return false;
    }
    
    this.logger.log(`Sending notification to user: ${userId}`);
    // Emit to the user's room
    // All sockets in the room with the same name as userId will receive this message
    this.server.to(userId).emit('newNotification', notification);
    return true;
  }

  /**
   * Sends a notification to all clients subscribed to a specific topic
   * 
   * @param topic The topic to send to (e.g., 'bmi_notification')
   * @param notification The notification data to send
   * @returns True if the notification was sent, false otherwise
   * 
   * Client handling:
   * socket.on('topicNotification', ({ topic, notification }) => { console.log(topic, notification); });
   */
  sendNotificationToTopic(topic: string, notification: any): boolean {
    if (!this.isServerReady()) {
      return false;
    }
    
    this.logger.log(`Sending notification to topic: ${topic}`);
    // Emit to the topic room
    // All sockets that have joined this topic room will receive this message
    this.server.emit('topicNotification', {
      topic,
      notification
    });
    return true;
  }

  /**
   * Convenience method to send a BMI notification
   * @param notification The BMI notification data
   * @returns True if the notification was sent, false otherwise
   */
  sendBMINotification(notification: BMINotification): boolean {
    return this.sendNotificationToTopic(NotificationTopic.BMI, notification);
  }

  /**
   * Convenience method to send a BMR notification
   * @param notification The BMR notification data
   * @returns True if the notification was sent, false otherwise
   */
  sendBMRNotification(notification: any): boolean {
    return this.sendNotificationToTopic(NotificationTopic.BMR, notification);
  }

  /**
   * Sends a notification to all connected clients
   * @param notification The notification data to send
   * @returns True if the notification was sent, false otherwise
   */
  sendNotificationToAll(notification: any): boolean {
    if (!this.isServerReady()) {
      return false;
    }
    
    this.logger.log('Broadcasting notification to all connected users');
    // Emit to all connected sockets in this namespace
    this.server.emit('newNotification', notification);
    return true;
  }

  /**
   * Sends a notification to multiple users
   * @param userIds Array of user IDs to send to
   * @param notification The notification data
   * @returns True if the notification was sent, false otherwise
   */
  sendNotificationToUsers(userIds: string[], notification: any): boolean {
    if (!this.isServerReady()) {
      return false;
    }
    
    this.logger.log(`Sending notification to users: ${userIds.join(', ')}`);
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
    return true;
  }
} 