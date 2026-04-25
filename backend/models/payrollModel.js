const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required (YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    leaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// One record per user per month — supports regeneration via upsert
payrollSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
