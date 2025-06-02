
# Node.js eCommerce API

A backend API for a simple eCommerce application built with Node.js, Express, and MongoDB. This project supports user authentication, product management, order processing, and AI integration.

## Features

- User registration and authentication
- CRUD operations for products
- Order management with status updates
- Password management
- AI-powered endpoints (customizable)
- JWT-based authentication with cookies
- Pagination and filtering for products and orders
- Error handling and validation with express-validator
- Security best practices (Helmet, CORS, Morgan logging)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- dotenv for environment variables
- express-validator for input validation
- Helmet for security headers
- Morgan for HTTP request logging
- Cors for handling cross-origin requests
- Cookie-parser for cookie handling

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecommerce-api.git
   cd ecommerce-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:

   ```env
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000` (or the port you specified).

## 📄 API Endpoints

| Method | Endpoint                          | Description                          |
|--------|---------------------------------|------------------------------------|
| POST   | /api/users/register              | Register a new user                 |
| POST   | /api/users/login                 | Login user                         |
| GET    | /api/users/:id                   | Get user by ID                    |
| POST   | /api/users/change-password/:id   | Change password                    |
| POST   | /api/user-password/forget        | Forget password                    |
| POST   | /api/user-password/reset/:id/:token | Reset password                  |
| GET    | /api/products                   | Get all products with filtering and pagination |
| GET    | /api/products/:id              | Get product by ID                     |
| POST   | /api/products                  | Create new product                   |
| PUT    | /api/products/:id              | Update product                      |
| DELETE | /api/products/:id              | Delete product                     |
| POST   | /api/products/:id/buy          | Buy a product                      |
| GET    | /api/orders                    | Get all orders (paginated)         |
| GET    | /api/orders/:id                | Get order by ID                    |
| PUT    | /api/orders/:id/status         | Update order status                |

### Other Routes

- Password management, AI endpoints, etc.

## Error Handling

The API returns structured error responses with HTTP status codes and descriptive messages.

## Postman Collection

You can find the Postman collection for testing the API here:  
[Postman Collection](https://node-js-e-commerce-project.vercel.app/)

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes and new features.

