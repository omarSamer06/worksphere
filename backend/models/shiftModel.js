const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      trim: true,
      unique: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);
