const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const documentLogModel= new mongoose.Schema({
  ownerId: String,
  documentId: String,
  log: String,
}, {
  timestamps: true
});


module.exports = mongoose.model('documentLog', documentLogModel);


