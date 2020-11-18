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
    try {
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
  verifyAdmin(req, res, next) {
    try {
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
module.exports = Secure;
