# Cashbook Mobile App

React Native mobile application for the Cashbook expense tracking system.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_BACKEND_URL/api';
```

For Android emulator, use `http://10.0.2.2:5000/api`
For iOS simulator, use `http://localhost:5000/api`
For physical device, use your computer's IP address (e.g., `http://192.168.1.100:5000/api`)

## Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Features

- User authentication (Login/Register)
- Dashboard with income/expense summary
- Transaction management (CRUD operations)
- Category management
- Filter transactions by type and category
- Pull to refresh

## Project Structure

```
frontend/
├── App.js                 # Main app component
├── src/
│   ├── context/           # React context providers
│   ├── navigation/        # Navigation setup
│   ├── screens/           # Screen components
│   └── services/          # API service layer
└── package.json
```

