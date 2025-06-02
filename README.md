# Node.js E-commerce Project

This is a back-end Node.js-based e-commerce application built to handle user authentication, product management, shopping cart, order processing, and more.  

## 🚀 Features

✅ User signup, login, password reset  
✅ JWT authentication with cookies  
✅ Product CRUD (create, read, update, delete)  
✅ Cart management  
✅ Order placement and tracking  
✅ Admin dashboard for managing products and users  
✅ Real-time updates using Socket.io  
✅ Secure password hashing with bcrypt  
✅ Image upload handling with Multer  
✅ RESTful API design  

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT, bcrypt  
- **File Uploads:** Multer  
- **Real-time:** Socket.io  
- **Validation:** express-validator, validator  
- **Environment:** dotenv  
- **Security:** CORS, Helmet, rate limiting  

## 📦 Installation

1️⃣ Clone the repo  
```bash
git clone https://github.com/mahmoudAliaboElhassan/Node.js-E-commerce-Project.git
cd Node.js-E-commerce-Project
```

2️⃣ Install dependencies  
```bash
npm install
```

3️⃣ Set up environment variables  
Create a `.env` file and configure:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4️⃣ Run the project  
```bash
npm run dev
```

## 📂 Folder Structure

```
/controllers
/routes
/models
/middlewares
/utils
/public
```

## 📄 API Endpoints

| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| POST   | /api/auth/signup  | Register new user       |
| POST   | /api/auth/login   | User login              |
| GET    | /api/products     | List all products       |
| POST   | /api/products     | Add a new product (admin) |
| PUT    | /api/products/:id | Update product (admin)  |
| DELETE | /api/products/:id | Delete product (admin)  |
| POST   | /api/orders       | Place an order          |

_(You can expand this table with more routes you have!)_

## 💡 Future Improvements

- Add payment integration (Stripe/PayPal)  
- Add product reviews & ratings  
- Enhance admin analytics dashboard  
- Add user profile management  

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.
