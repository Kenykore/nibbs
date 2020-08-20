const mongoose = require('mongoose');
const config = require('../../../config/index');
const status = require('http-status');
const request = require('request-promise');
const response = require('../../../utilities/response');
const validateReg = require('../../../validations/validate_reg');
const Tokenizer = require('../../../utilities/tokeniztion');
const User=require('../../../models/user');
const {randomNumber, formatPhoneNumber, addLeadingZeros} = require('../../../utilities/utils');
/**
 * Authemtication class
 */
class AuthenticationController {
  /**
  * [async description]
  *
  * @param   {Object}  req   [req description]
  * @param   {object}  res   [res description]
  * @param   {Function}  next  [next description]
  *
  * @return  {Object}        [return description]
  */
  static async login(req, res, next) {
    try {
      const {error} = validateReg(req.body);
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      const options = {
        method: 'GET',
        uri: `https://vi-singleauth.nibss-plc.com/singleauth/login`,
        headers: {
          Authorization: 'Basic ' + new Buffer(req.body.username + ':' + req.body.password).toString('base64')
        },
        json: true // Automatically stringifies the body to JSON
      };
      //  const userDetails = await request(options);
      const userDetails={
        data: {
          email: req.body.email || '',
          username: req.body.username,
          name: 'Oluwakorede',
          mobile: '+2348133699506'
        }
      };
      console.log(userDetails, 'user details');
      if (!userDetails.data) {
        return response.sendError({res, message: userDetails.meta.message});
      }
      let verified=false;
      const data={user: userDetails.data};
      const userExist = await User.findOne({$or: [{username: data.user.username}, {email: data.user.email}]});
      console.log(userExist, 'uset exist');
      if (userExist) {
        verified=true;
        data.user=userExist;
      }
      console.log(data.user, 'user');
      const accessToken = Tokenizer.signToken({
        ...data.user,
        userId: data.user._id || undefined,
        verified: verified
      });
      return response.sendSuccess({
        res,
        message: 'Login successful',
        body: {_token: accessToken, data: data.user}
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports= AuthenticationController;
