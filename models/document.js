const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const documentModel= new mongoose.Schema({
  ownerId: String,
  publicId: String,
  signed: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  file: {
    type: String,
    required: true
  },
  documentBody: {
    type: String,
    default: 'Nibbs',
    required: true
  },
  documentTitle: {
    type: String,
    default: 'Nibbs'
  },
  documentProperty: [{
    type: String,
    x_coordinate: Number,
    y_coordinate: Number,
  }],
  recipients: [{name: String, email: String}],
  signatories: [{
    page: String,
    name: String,
    email: String,
    x_coordinate: Number,
    y_coordinate: Number,
    signed: {
      type: Boolean,
      default: false
    },
    signature: String
  }],
}, {
  timestamps: true
});


module.exports = mongoose.model('document', documentModel);


