const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: ['annual', 'sick'],
      default: 'annual',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    days: {
      type: Number,
      min: [1, 'Leave must be at least 1 day'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

leaveSchema.pre('validate', async function () {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  if (this.startDate && this.endDate && this.endDate >= this.startDate) {
    const ms = this.endDate - this.startDate;
    this.days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
