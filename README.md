# E-Commerce Backend API

## Table of Contents

- [Description](#description)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)

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
