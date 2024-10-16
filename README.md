# E-Commerce Backend API

## Table of Contents

- [Description](#description)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [TroubleShooting](#troubleshooting)

## Description

The backend of this application provides a robust RESTful API that enables seamless interaction between users and the e-commerce platform. It supports essential functionalities such as user authentication, product management, and cart operations. Key features include:

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Swagger (for API documentation)

## Features

- **User Authentication**: Secure login and registration processes with JWT-based authentication.
- **User Authorization**: Clear seperation of roles, allowing only authorized users to perform actions like adding a product.
- **Product Management**: CRUD operations for products, including the ability to create, read, update, and delete product listings along with pagination, search and filter support.
- **Cart Functionality**: Users can add items to their cart, update quantities, remove items, and proceed to checkout.
- **Role-Based Access Control**: Admin users have elevated permissions for managing products and overseeing the platform's operations.
- **Product Search**: An efficient search feature that allows users to find products quickly based on name and description of product.
- **API Documentation**: Comprehensive documentation is provided via Swagger, making it easy for developers to understand and interact with the API.

## Installation

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (or a MongoDB cloud instance)
- A code editor (like [Visual Studio Code](https://code.visualstudio.com/))

### Steps to Run Locally

1. Clone the repository:
   ```bash
   https://github.com/jaimindfire/ecommerce-backend
   cd ecommerce-backend
   code . (to open project in vscode)
   ```
2. Create a .env file in the root of the project with the following environment variables:

   ```bash
    PORT=5000
    MONGO_URI="YOUR_MONGO_URI"
    JWT_SECRET="YOUR_SECRET_KEY"
    JWT_EXPIRES_IN=1d
   ```

3. Run the following command to install all required dependencies:
   ```bash
    npm install
   ```
4. You can compile the TypeScript files to JavaScript by running:
   ```bash
   npm run build
   ```
5. You can run the application in development mode using:
   ```bash
   npm run dev
   ```
   This will start the server, and it will be running on http://localhost:PORT

### API Documentation

To explore the API endpoints using Swagger, follow these steps:

1. Ensure that your application is up and running locally or on the desired server:
   ```bash
    npm run dev
   ```
2. Open your browser and navigate to the following URL to access the Swagger UI:
   ```bash
    http://localhost:PORT/api-docs
   ```
   Replace PORT with the port number on which your application is running

- You will see an interactive Swagger UI where you can explore all available API endpoints.
- Click on any endpoint to view details, parameters, and try out the API directly from the Swagger UI.
- For protected routes, you may need to authorize using a JWT token.
- Click on the "Authorize" button at the top of the Swagger UI and enter the token in the provided field.

## Running Tests

Run following command to run integeration tests.

```bash
npm test
```

## Troubleshooting
1. **Server not starting**
   - **Error Message**: `Error: listen EADDRINUSE: address already in use ::1:5000`
     - **Solution**: Ensure that another instance of the server or another application is not running on the same port (5000). You can change the port in your `.env` file or terminate the process using the port.

2. **Database connection issues**
   - **Error Message**: `MongoNetworkError: failed to connect to server`
     - **Solution**: Verify that your MongoDB URI is correct in the `.env` file. Make sure the MongoDB service is running, and you have access permissions to the database.

3. **JWT Authentication failed**
   - **Error Message**: `JsonWebTokenError: invalid signature`
     - **Solution**: Ensure that your JWT_SECRET in the `.env` file is correctly set. If you recently changed it, all previously issued tokens will be invalid.

4. **Missing Environment Variables**
   - **Error Message**: `TypeError: Cannot read property 'PORT' of undefined`
     - **Solution**: Ensure that your `.env` file exists and contains all the necessary environment variables. Restart the server after making changes.

5. **Server Errors**
   - **Error Message**: `You encounter a 500 Internal Server Error when accessing certain endpoints.`
     - **Solution**: Check the server logs for more specific error messages that can guide you in diagnosing the issue.

6. **Authentication Failures**
   - **Error Message**: `401 Unauthorized`
     - **Solution**: Ensure you are including the JWT token in the Authorization header as Bearer YOUR_JWT_TOKEN

7. **Validation Errors on Requests**
   - **Error Message**: `You receive validation errors for requests even when the data seems correct.`
     - **Solution**: Double-check the request payload to ensure it matches the expected format and data types as defined in the API documentation.
