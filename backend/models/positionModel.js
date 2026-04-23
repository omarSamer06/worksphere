const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Position', positionSchema);
