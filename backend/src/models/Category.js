const mongoose = require('mongoose');

const monthlyBudgetSchema = new mongoose.Schema(
  {
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, min: 0, required: true },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'investment'],
      required: true,
    },
    subCategory: {
      type: String,
      enum: ['need', 'want','investment'],
      required: true,
    },
    monthlyBudgets: [monthlyBudgetSchema],
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, type: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

