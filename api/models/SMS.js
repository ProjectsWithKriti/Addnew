const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  messageBody: {
    type: String,
    required: true,
  },
  senderPhoneNumber: {
    type: String,
    required: true,
  },
  sentTime: {
    type: Date,
    required: true,
  },
  receiveTime: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true, // Automatically manage `createdAt` and `updatedAt` fields
});

const SMS = mongoose.model('SMS', smsSchema);

module.exports = SMS;
