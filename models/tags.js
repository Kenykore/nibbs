/* istanbul ignore file */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const model= new mongoose.Schema({
  name: String,
}, {
  timestamps: true
});


module.exports = mongoose.model('tag', model);


