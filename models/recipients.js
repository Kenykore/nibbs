const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const model= new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  name: {
    type: String, default: 'Nibbs'
  },
  tag: [String],
  status: {
    type: String,
    default: 'active'
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('receipient', model);


