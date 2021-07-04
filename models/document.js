const mongoose = require('mongoose');
/* istanbul ignore file */
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const lodash=require('lodash');
const {randomNumber, formatPhoneNumber, addLeadingZeros, getFileUrl} = require('../utilities/utils');
const documentModel= new mongoose.Schema({
  ownerId: String,
  publicId: String,
  stats: {
    open: {
      type: Number,
      default: 0
    },
    spam: {
      type: Number,
      default: 0
    },
    blocked: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
  },
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
    name: String,
    page: Number,
    x_coordinate: Number,
    y_coordinate: Number,
  }],
  recipients: [{name: String, email: String, open: {type: Boolean, default: false}}],
  signatories: [{
    name: String,
    email: String,
    coordinates: [{
      x_coordinate: Number,
      y_coordinate: Number,
      absolute_x_coordinate: Number,
      absolute_y_coordinate: Number,
      page: String,
    }],
    signed: {
      type: Boolean,
      default: false
    },
    signature: String
  }],
}, {
  timestamps: true
});

documentModel.post('find', async (result, next) => {
  if (result && result.length && result.length>0) {
    result.file = await getFileUrl(result[0].publicId);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    result.file = await getFileUrl(result.publicId);
    return next();
  }
});
documentModel.post('findOne', async (result, next) => {
  if (result && result.length && result.length>0) {
    result.file = await getFileUrl(result[0].publicId);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    result.file = await getFileUrl(result.publicId);
    return next();
  }
});
module.exports = mongoose.model('document', documentModel);