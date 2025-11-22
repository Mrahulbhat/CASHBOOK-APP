# Cashbook App

A complete expense tracking application with a Node.js/Express backend and React Native mobile frontend.

## Project Structure

```
CASHBOOK APP/
├── backend/          # Express.js API server
└── frontend/         # React Native Expo app
```

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cashbook
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/services/api.js` if needed (for physical devices, use your computer's IP address)

4. Start the Expo development server:
```bash
npm start
```

5. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## Features

### Backend
- User authentication (JWT-based)
- Transaction management (CRUD operations)
- Category management with monthly budgets
- RESTful API with proper error handling
- MongoDB database with Mongoose ODM

### Frontend (React Native)
- User login and registration
- Dashboard with income/expense summary
- Transaction list with filtering
- Add, edit, and delete transactions
- Category management
- Pull-to-refresh functionality
- Modern, responsive UI

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `PUT /api/categories/:id/budget` - Set monthly budget
- `DELETE /api/categories/:id/budget` - Remove monthly budget

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage
- React Native Paper
- date-fns

## Development

### Backend
```bash
cd backend
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend
```bash
cd frontend
npm start      # Start Expo dev server
npm run ios    # Run on iOS
npm run android # Run on Android
```

## Notes

- Make sure MongoDB is running before starting the backend
- For mobile development, ensure your device/emulator can reach the backend API
- Update CORS settings in backend if deploying to production
- Use environment variables for sensitive configuration

