const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user.id }).lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      user: req.user.id,
    };

    const category = await Category.create(payload);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = 'Category name already exists';
    }
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const upsertBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { month, year, amount } = req.body;

    if (
      !month ||
      !year ||
      typeof amount === 'undefined' ||
      month < 1 ||
      month > 12
    ) {
      const err = new Error('month (1-12), year and amount are required');
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.findOne({ _id: id, user: req.user.id });
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    const existingIdx = category.monthlyBudgets.findIndex(
      (budget) => budget.month === month && budget.year === year
    );

    if (existingIdx > -1) {
      category.monthlyBudgets[existingIdx].amount = amount;
    } else {
      category.monthlyBudgets.push({ month, year, amount });
    }

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const removeBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      const err = new Error('month and year are required');
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.findOne({ _id: id, user: req.user.id });
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    category.monthlyBudgets = category.monthlyBudgets.filter(
      (budget) => !(budget.month === month && budget.year === year)
    );

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  upsertBudget,
  removeBudget,
};

