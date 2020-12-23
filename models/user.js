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
userModel.post('find', async function(result, next) {
  console.log(this instanceof mongoose.Query); // true
  console.log(result, 'result');
  if (result && result.length && result.length>0) {
    console.log(result[0].signatures, 'signature in model');
    const signature=result[0].signatures;
    console.log(signature, 'signatures');
    result[0].signatures=signature.map(async (y)=>{
      const img=await getFileUrl(y);
      if (img) {
        return img;
      }
      return y;
    });
    return next();
  }
  if (result && !lodash.isArray(result)) {
    console.log(result.signatures, 'signature in model');
    const signature=result.signatures;
    console.log(signatures, 'signatures');
    result.signatures=signature.map(async (y)=>{
      return await getFileUrl(y);
    });
    return next();
  }
});

module.exports = mongoose.model('user', userModel);


