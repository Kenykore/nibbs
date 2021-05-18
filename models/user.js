/* istanbul ignore file */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const {randomNumber, formatPhoneNumber, addLeadingZeros, getFileUrl} = require('../utilities/utils');
const lodash=require('lodash');
const {ObjectID} = require('bson');
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
  signatures: [{
    url: String
  }],
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
    console.log(signature, 'signature');
    result[0].signatures=await mapData(signature, result[0].createdAt);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    const signature=result.signatures;
    result.signatures=await mapData(signature, result.createdAt);
    return next();
  }
});
userModel.post('findOne', async (result, next) => {
  if (result && result.length && result.length>0) {
    const signature=result[0].signatures;
    result[0].signatures=await mapData(signature, result[0].createdAt);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    const signature=result.signatures;
    result.signatures=await mapData(signature, result.createdAt);
    return next();
  }
});
userModel.post('updateOne', async (result, next) => {
  if (result && result.length && result.length>0) {
    const signature=result[0].signatures;
    result[0].signatures=await mapData(signature, result[0].createdAt);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    const signature=result.signatures;
    result.signatures=await mapData(signature, result.createdAt);
    return next();
  }
});
userModel.post('update', async (result, next) => {
  if (result && result.length && result.length>0) {
    const signature=result[0].signatures;
    result[0].signatures=await mapData(signature, result[0].createdAt);
    return next();
  }
  if (result && !lodash.isArray(result)) {
    const signature=result.signatures;
    result.signatures=await mapData(signature, result.createdAt);
    return next();
  }
});
/**
 * [mapData description]
 *
 * @param   {Array}  data  [data description]
 * @param   {String}       date  [date description]
 *
 * @return  {Promise<any>}                [return description]
 */
const mapData=async (data=[], date)=>{
  return Promise.all(data.map(async (y)=>{
    const img=await getFileUrl(y.url || y);
    console.log(img, 'image');
    if (img) {
      return {url: img, _id: y._id || y};
    }
    return {url: y.url || y, _id: y._id || y};
  }));
};
module.exports = mongoose.model('user', userModel);


