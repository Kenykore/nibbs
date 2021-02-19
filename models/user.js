/* istanbul ignore file */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const {randomNumber, formatPhoneNumber, addLeadingZeros, getFileUrl} = require('../utilities/utils');
const lodash=require('lodash');
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
userModel.post('find', async (result, next) => {
  if (result && result.length && result.length>0) {
    const signature=result[0].signatures;
    result[0].signatures=await mapData(signature);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    const signature=result.signatures;
    result.signatures=await mapData(signature);
    return next();
  }
});
userModel.post('findOne', async (result, next) => {
  if (result && result.length && result.length>0) {
    const signature=result[0].signatures;
    result[0].signatures=await mapData(signature);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    const signature=result.signatures;
    result.signatures=await mapData(signature);
    return next();
  }
});
const mapData=async (data=[])=>{
  return Promise.all(data.map(async (y)=>{
    const img=await getFileUrl(y);
    if (img) {
      return img;
    }
    return y;
  }));
};
module.exports = mongoose.model('user', userModel);


