const Transaction = require('../models/Transaction');

const getTransactions = async (req, res, next) => {
  try {
    const { from, to, sort = 'desc', categoryId, type } = req.query;

    const query = { user: req.user.id };

    if (categoryId) {
      query.category = categoryId;
    }

    if (type) {
      query.type = type;
    }

    if (from || to) {
      query.transactionDate = {};
      if (from) query.transactionDate.$gte = new Date(from);
      if (to) query.transactionDate.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query)
      .populate('category')
      .sort({ transactionDate: sort === 'asc' ? 1 : -1 })
      .lean();

    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    const transaction = await Transaction.create(payload);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

