const mongoose = require('mongoose');


const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default:""
  },
  banner: {
    type: String,
    default:""
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }},
  {
    timestamps: true
  }
);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;