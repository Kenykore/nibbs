/* istanbul ignore file */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const model= new mongoose.Schema({
  name: String,
  key: String,
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('app', model);


