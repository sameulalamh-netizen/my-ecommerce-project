const mongoose = require('mongoose');

const sellerApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  shopDescription: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const SellerApplication = mongoose.model('SellerApplication', sellerApplicationSchema);

module.exports = SellerApplication;