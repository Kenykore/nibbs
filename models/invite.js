const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const inviteModel= new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
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


module.exports = mongoose.model('invite', inviteModel);


