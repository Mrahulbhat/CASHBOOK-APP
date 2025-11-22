# Cashbook Backend

Express + MongoDB backend for managing users, categories, transactions and monthly budgets.

## Prerequisites
- Node.js 18+
- MongoDB instance (local or hosted)

## Setup
```bash
npm install
cp .env.example .env
# update .env with your values
```

## Development
```bash
npm run dev
```

## Production
```bash
npm start
```

## Environment
- `PORT` server port
- `MONGODB_URI` Mongo connection string
- `NODE_ENV` runtime mode
- `JWT_SECRET` key for signing access tokens

## API Overview
- `POST /api/auth/register` create user
- `POST /api/auth/login` login, receive JWT
- `GET /api/auth/me` get current profile (requires `Authorization: Bearer <token>`)
- `GET /api/transactions` list transactions (filters: `from`, `to`, `type`, `categoryId`)
- `POST /api/transactions` create transaction (`amount`, `type`, `transactionDate`, `paymentMode`, `category`, `description`)
- `PATCH /api/transactions/:id` update transaction
- `DELETE /api/transactions/:id` delete transaction
- `GET /api/categories` list categories + budgets
- `POST /api/categories` create category (`name`, `subCategory` = need/want)
- `PATCH /api/categories/:id` edit category
- `DELETE /api/categories/:id` delete category
- `PUT /api/categories/:id/budget` set/update monthly budget (`month`, `year`, `amount`)
- `DELETE /api/categories/:id/budget` remove monthly budget (pass `month`, `year` in body)

All category and transaction routes require a valid JWT via the `Authorization` header.
