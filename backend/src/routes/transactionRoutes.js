const express = require('express');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/transactions').get(getTransactions).post(createTransaction);

router
  .route('/transactions/:id')
  .patch(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;

