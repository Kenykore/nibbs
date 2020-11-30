/* istanbul ignore file */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const userModel= new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: false,
    required: false
  },
  mobile: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  signatures: [String],
  name: {
    type: String, default: 'Nibbs'
  },
  role: {
    type: String,
    enum: ['user', 'administrator'],
    default: 'user'
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('user', userModel);


