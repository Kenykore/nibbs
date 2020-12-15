const status = require('http-status');
const Tokenizer = require('../utilities/tokeniztion');
const crypto = require('crypto');
const ObjectID= require('mongoose').Types.ObjectId;
const User=require('../models/user');
const Application=require('../models/apps');

// helper
const response = require('../utilities/response');
const authFailure='Authorization token not found';
const authFormatFailure='Invalid authorization string. Token must start with Bearer';
const Secure = {
  async verifyUser(req, res, next) {
    try {
      const keyNeeded=await checkIfAppKeyValid(req, res);
      const userDetails=await verifyUserViaKey(req, res, next);
      if (keyNeeded && req.query.userId && userDetails) {
        console.log('verified');
        req.userDetails= {...userDetails, userId: userDetails._id};
        return next();
      }
      const verified = Tokenizer.verifyToken(checkTokenIsValid(req, res));
      req.userDetails = verified.data;
      if (!req.userDetails.verified) {
        return response.sendError({res, message: 'Not Authorised. Protected route,account not verified yet', statusCode: status.UNAUTHORIZED});
      }
      return next();
    } catch (error) {
      return next(error);
    }
  },
  verifyUserInvite(req, res, next) {
    try {
      const verified = Tokenizer.verifyToken(checkTokenIsValid(req, res));
      req.userDetails = verified.data;
      /* istanbul ignore next */
      if (!verified) {
        return response.sendError({res, message: 'Not Authorised. Protected route,token invalid', statusCode: status.UNAUTHORIZED});
      }
      return next();
    } catch (error) {
      /* istanbul ignore next */
      return next(error);
    }
  },
  async verifyAdmin(req, res, next) {
    try {
      const keyNeeded=await checkIfAppKeyValid(req, res);
      const userDetails=await verifyUserViaKey(req, res, next);
      if (keyNeeded && req.query.userId && userDetails) {
        req.adminDetails= {...userDetails, userId: userDetails._id};
        const adminrole = req.adminDetails.role;
        console.log(adminrole, 'role');
        if (adminrole !== 'administrator') {
          return response.sendError({res, message: 'Not Authorised. Protected admin route', statusCode: status.UNAUTHORIZED});
        }
        return next();
      }
      const verified = Tokenizer.verifyToken(checkTokenIsValid(req, res));
      req.adminDetails = verified.data;

      // check if role is administrator
      const role = req.adminDetails.role;
      console.log(role, 'role');
      if ((role !== 'administrator') || (!req.adminDetails.verified)) {
        return response.sendError({res, message: 'Not Authorised. Protected admin route', statusCode: status.UNAUTHORIZED});
      }
      return next();
      /* istanbul ignore next */
    } catch (error) {
      /* istanbul ignore next */
      return next(error);
    }
  },
};
/**
 * check if token is valid
 *@param {Object} req request
 @param {Object} res
 * @return  {string}  [return description]
 */
function checkTokenIsValid(req, res) {
  let token = req.header('Authorization');
  if (!token) {
    return response.sendError({res, message: authFailure, statusCode: status.UNAUTHORIZED});
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  } else {
    return response.sendError({res, message: authFormatFailure, statusCode: status.UNAUTHORIZED});
  }
  return token;
}
/**
 * [checkIfAppKeyValid description]
 *
 * @param {Object} req request
 * @param {Object} res description]
 *
 * @return  {Promise<Boolean>}       [return description]
 */
async function checkIfAppKeyValid(req, res) {
  try {
    const key = req.header('x-access-key');
    if (!key) {
      return false;
    }
    const keyExist=await Application.findOne({key: key}).lean();
    if (!keyExist) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}/**
 * [async description]
 *
 * @param   {Object}  req   [req description]
 * @param   {Object}  res   [res description]
 * @param   {Function}  next  [next description]
 *
 * @return  {Promise<Object|null>}        [return description]
 */
async function verifyUserViaKey(req, res, next) {
  try {
    const user=await User.findById(req.query.userId).lean();
    return user;
  } catch (error) {
    console.log(error);
    return next(error);
  }
}
module.exports = Secure;
