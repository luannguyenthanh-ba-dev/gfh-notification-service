# GFH Notification Service

A NestJS-based notification service that handles message queuing and notifications.

## Prerequisites

- Node.js (v20 or higher)
- MongoDB
- RabbitMQ
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gfh-notification-service
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
environment=development
# Add other required environment variables here
```

## Project Structure

```
gfh-notification-service/
├── src/                    # Source files
├── test/                   # Test files
├── environments/           # Environment configurations
├── dist/                   # Compiled files
└── package.json           # Project dependencies and scripts
```

## Available Scripts

- `npm run build` - Build the application
- `npm run format` - Format code using Prettier
- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode with hot-reload
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Lint the code
- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:cov` - Run unit tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## Dependencies

### Main Dependencies
- @nestjs/common: ^11.0.12
- @nestjs/core: ^11.0.12
- @nestjs/mongoose: ^11.0.3
- @nestjs/platform-express: ^11.0.12
- @nestjs/swagger: ^11.1.1
- amqplib: ^0.10.7
- mongoose: ^8.13.1
- class-validator: ^0.14.1
- class-transformer: ^0.5.1

### Development Dependencies
- @nestjs/cli: ^11.0.5
- typescript: ^4.7.4
- jest: 29.3.1
- eslint: ^8.0.1
- prettier: ^2.3.2

## API Documentation

The API documentation is available through Swagger UI when the application is running. Access it at:
```
http://localhost:3000/api
```

## Testing

The project uses Jest for testing. You can run tests using the following commands:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## License

This project is licensed under the UNLICENSED license.
