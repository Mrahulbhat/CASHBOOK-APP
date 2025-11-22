const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  upsertBudget,
  removeBudget,
} = require('../controllers/categoryController');

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getCategories).post(createCategory);

router
  .route('/:id')
  .patch(updateCategory)
  .delete(deleteCategory);

router.route('/:id/budget').put(upsertBudget).delete(removeBudget);

module.exports = router;

