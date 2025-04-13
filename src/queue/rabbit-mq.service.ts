import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import * as amqp from "amqplib";

/**
 * Service for managing RabbitMQ connections and operations
 *
 * This service provides functionality to:
 * - Connect and reconnect to RabbitMQ
 * - Create queues and exchanges
 * - Bind queues to exchanges
 * - Publish messages to queues/exchanges
 * - Consume messages from queues
 *
 * Supports two main messaging patterns:
 * 1. Work Queue Pattern - For distributing tasks across multiple workers
 * 2. PubSub Pattern - For publishing messages to multiple subscribers
 */
@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  // Connection object for RabbitMQ
  private connection: amqp.Connection;

  // Channel object for performing operations over the connection
  private channel: amqp.Channel;

  // Tracks the number of reconnection attempts
  private reconnectAttempts = 0;

  // Maximum number of times to attempt reconnection
  private readonly maxReconnectAttempts = 10;

  // Base interval between reconnection attempts (in milliseconds)
  private readonly reconnectInterval = 5000; // 5 seconds

  // Flag to indicate if service is shutting down to prevent reconnection attempts
  private isShuttingDown = false;

  /**
   * Initialize the RabbitMQ connection when the module starts
   * Implements NestJS OnModuleInit lifecycle hook
   */
  async onModuleInit() {
    await this.connect();
  }

  /**
   * Close the RabbitMQ connection when the module is destroyed
   * Implements NestJS OnModuleDestroy lifecycle hook
   */
  async onModuleDestroy() {
    this.isShuttingDown = true;
    await this.closeConnection();
  }

  /**
   * Establish a connection to RabbitMQ server
   * Sets up event handlers for connection errors and unexpected closures
   */
  async connect() {
    try {
      // Get RabbitMQ URL from environment variables or use default
      const url =
        process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672";
      this.logger.log(`Connecting to RabbitMQ at ${url}`);

      // Create a connection to RabbitMQ server
      this.connection = await amqp.connect(url);

      // Create a channel for communication
      this.channel = await this.connection.createChannel();

      // Set prefetch to 1 to ensure fair dispatch of messages
      // This means each consumer will only get one unacknowledged message at a time
      await this.channel.prefetch(1);

      this.logger.log("Successfully connected to RabbitMQ");
      this.reconnectAttempts = 0;

      // Handle connection errors
      this.connection.on("error", (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
        this.handleDisconnect();
      });

      // Handle unexpected connection closures
      this.connection.on("close", () => {
        if (!this.isShuttingDown) {
          this.logger.warn("RabbitMQ connection closed unexpectedly");
          this.handleDisconnect();
        }
      });
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      this.handleDisconnect();
    }
  }

  /**
   * Handles reconnection when connection is lost
   * Implements exponential backoff strategy for retry attempts
   */
  private handleDisconnect() {
    // Don't attempt to reconnect if service is shutting down
    if (this.isShuttingDown) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      // Calculate backoff time using exponential strategy (increases delay with each attempt)
      const timeout =
        this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

      this.logger.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${timeout}ms`,
      );

      // Schedule reconnection attempt
      setTimeout(async () => {
        await this.connect();
      }, timeout);
    } else {
      this.logger.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`,
      );
    }
  }

  /**
   * Gracefully close the RabbitMQ connection and channel
   */
  async closeConnection() {
    try {
      // Close channel first if it exists
      if (this.channel) {
        await this.channel.close();
      }

      // Then close the connection if it exists
      if (this.connection) {
        await this.connection.close();
      }

      this.logger.log("RabbitMQ connection closed");
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }

  /**
   * Get the current channel object for advanced operations
   *
   * @returns The current RabbitMQ channel
   */
  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error("Channel not established");
    }
    return this.channel;
  }

  // ===== COMMON UTILITY METHODS =====

  /**
   * Create a queue with specified options
   *
   * @param queue - Name of the queue to create
   * @param options - Queue configuration options
   */
  async createQueue(queue: string, options: amqp.Options.AssertQueue = {}) {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    // Default to durable queues that survive broker restarts
    const queueOptions = { durable: true, ...options };
    await this.channel.assertQueue(queue, queueOptions);
    this.logger.log(`Queue created: ${queue}`);
  }

  /**
   * Bind a queue to an exchange with a routing key
   *
   * @param queue - Name of the queue to bind
   * @param exchange - Name of the exchange to bind to
   * @param routingKey - The routing key pattern for message routing
   */
  async bindQueue(queue: string, exchange: string, routingKey: string) {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    // Ensure the exchange exists
    await this.channel.assertExchange(exchange, "topic", { durable: true });

    // Bind the queue to the exchange with the routing key
    await this.channel.bindQueue(queue, exchange, routingKey);
    this.logger.log(
      `Queue ${queue} bound to exchange ${exchange} with routing key ${routingKey}`,
    );
  }

  // ===== WORK QUEUE PATTERN METHODS =====

  /**
   * Publish a task to a work queue
   *
   * @param queue - Name of the work queue
   * @param task - The task data to be processed
   * @param options - Additional publish options
   * @returns - Boolean indicating if the task was published successfully
   */
  async publishTask(
    queue: string,
    task: any,
    options: amqp.Options.Publish = {},
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    try {
      // Ensure the queue exists
      await this.createQueue(queue, { durable: true });

      // Convert task to buffer
      const taskBuffer = Buffer.from(JSON.stringify(task));

      // Publish the task to the queue
      const published = this.channel.sendToQueue(queue, taskBuffer, {
        persistent: true,
        ...options,
      });

      if (published) {
        this.logger.debug(`Task published to work queue: ${queue}`);
      } else {
        this.logger.warn(`Failed to publish task to work queue: ${queue}`);
      }

      return published;
    } catch (error) {
      this.logger.error(
        `Error publishing task to work queue: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Process tasks from a work queue
   *
   * @param queue - Name of the work queue
   * @param processor - Function to process each task
   * @param options - Consumer options
   */
  async processTasks(
    queue: string,
    processor: (task: any) => Promise<void>,
    options: amqp.Options.Consume = {},
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    try {
      // Ensure the queue exists
      await this.createQueue(queue, { durable: true });

      // Set prefetch to 1 to ensure fair distribution of tasks
      await this.channel.prefetch(1);

      this.logger.log(`Starting to process tasks from queue: ${queue}`);

      // Start consuming tasks
      await this.channel.consume(
        queue,
        async (message) => {
          if (message) {
            try {
              // Parse the task data
              const task = JSON.parse(message.content.toString());

              // Process the task
              await processor(task);

              // Acknowledge the task after successful processing
              this.channel.ack(message);
            } catch (error) {
              this.logger.error(`Error processing task: ${error.message}`);

              // Reject the task and requeue it for retry
              // This allows the task to be processed by another worker
              this.channel.nack(message, false, true);
            }
          }
        },
        options,
      );
    } catch (error) {
      this.logger.error(`Error setting up task processor: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel task processing for a specific queue
   *
   * @param queue - Name of the work queue
   * @param consumerTag - The consumer tag to cancel (optional)
   */
  async cancelTaskProcessing(
    queue: string,
    consumerTag?: string,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    try {
      if (consumerTag) {
        // Cancel specific consumer
        await this.channel.cancel(consumerTag);
        this.logger.log(
          `Cancelled task processing for consumer: ${consumerTag}`,
        );
      } else {
        // Get all consumers for the queue
        const consumers = await this.channel.checkQueue(queue);

        // Cancel all consumers for the queue
        for (const consumer of consumers.consumers) {
          await this.channel.cancel(consumer.consumerTag);
          this.logger.log(
            `Cancelled task processing for consumer: ${consumer.consumerTag}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error cancelling task processing: ${error.message}`);
      throw error;
    }
  }

  // ===== PUBSUB PATTERN METHODS =====

  /**
   * Publish a message to an exchange with a routing key
   *
   * @param exchange - The exchange to publish to (empty string for default exchange)
   * @param routingKey - The routing key to use (queue name for default exchange)
   * @param message - The message to send (will be JSON stringified)
   * @returns - Boolean indicating if the publish was successful
   */
  async publishMessage(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    try {
      // Ensure the exchange exists if one is specified
      if (exchange) {
        await this.channel.assertExchange(exchange, "topic", { durable: true });
      }

      // Convert message to buffer for sending
      const messageBuffer = Buffer.from(JSON.stringify(message));

      // Publish the message
      const published = this.channel.publish(
        exchange || "",
        routingKey,
        messageBuffer,
        { persistent: true }, // Makes messages durable across broker restarts
      );

      if (!published) {
        this.logger.warn("Message was not published to queue");
      } else {
        this.logger.debug(
          `Message published to exchange: ${
            exchange || "default"
          }, routingKey: ${routingKey}`,
        );
      }

      return published;
    } catch (error) {
      this.logger.error(`Error publishing message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set up a consumer to process messages from a queue
   *
   * @param queue - Name of the queue to consume from
   * @param callback - Function to process received messages
   */
  async consumeMessage(
    queue: string,
    callback: (message: any) => Promise<void>,
  ) {
    if (!this.channel) {
      throw new Error("Channel not established");
    }

    // Ensure the queue exists before consuming (creates it if it doesn't exist)
    await this.channel.assertQueue(queue, { durable: true });
    this.logger.log(`Consuming messages from queue: ${queue}`);

    // Start consuming messages
    await this.channel.consume(queue, async (message) => {
      if (message) {
        try {
          // Parse the message content as JSON
          const content = JSON.parse(message.content.toString());

          // Process the message with the provided callback
          await callback(content);

          // Acknowledge message after successful processing
          this.channel.ack(message);
        } catch (error) {
          this.logger.error(`Error processing message: ${error.message}`);

          // Negative acknowledgment with requeue=false for parsing/processing errors
          // This prevents the message from being requeued if it's malformed
          this.channel.nack(message, false, false);
        }
      }
    });
  }
}
