const status = require('http-status');
const Tokenizer = require('../utilities/tokeniztion');
const crypto = require('crypto');
const ObjectID= require('mongoose').Types.ObjectId;
// helper
const response = require('../utilities/response');
const authFailure='Authorization token not found';
const authFormatFailure='Invalid authorization string. Token must start with Bearer';
const Secure = {
  verifyUser(req, res, next) {
    let token = req.header('Authorization');
    if (!token) {
      return response.sendError({res, message: authFailure, statusCode: status.UNAUTHORIZED});
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    } else {
      return response.sendError({res, message: authFormatFailure, statusCode: status.UNAUTHORIZED});
    }

    try {
      const verified = Tokenizer.verifyToken(token);
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
    let token = req.header('Authorization');
    if (!token) {
      return response.sendError({res, message: 'Authorization token not found', statusCode: status.UNAUTHORIZED});
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    } else {
      return response.sendError({res, message: 'Invalid authorization string. Token must start with Bearer', statusCode: status.UNAUTHORIZED});
    }

    try {
      const verified = Tokenizer.verifyToken(token);
      req.userDetails = verified.data;
      if (!verified) {
        return response.sendError({res, message: 'Not Authorised. Protected route,token invalid', statusCode: status.UNAUTHORIZED});
      }
      return next();
    } catch (error) {
      return next(error);
    }
  },
  verifyAdmin(req, res, next) {
    let token = req.header('Authorization');
    if (!token) {
      return response.sendError({res, message: 'Authorization token not found', statusCode: status.UNAUTHORIZED});
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    } else {
      return response.sendError({res, message: 'Invalid authorization string. Token must start with Bearer', statusCode: status.UNAUTHORIZED});
    }

    try {
      const verified = Tokenizer.verifyToken(token);
      req.adminDetails = verified.data;

      // check if role is administrator
      const role = req.adminDetails.role;
      if ((role !== 'administrator') && (!req.adminDetails.verified)) {
        return response.sendError({res, message: 'Not Authorised. Protected admin route', statusCode: status.UNAUTHORIZED});
      }
      return next();
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = Secure;
