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
        uri: `http://vi-singleauth.nibss-plc.com/singleauth/login`,
        headers: {
          Authorization: 'Basic ' + Buffer.from(req.body.username + ':' + req.body.password).toString('base64')
        },
        json: true // Automatically stringifies the body to JSON
      };
      // const userDetailstwo = await request(options);
      // console.log(userDetailstwo, 'user details from SSO');
      const userDetails={
        data: {
          email: req.body.email || '',
          username: req.body.username,
          name: 'Oluwakorede',
          mobile: '+2348133699506'
        }
      };
      console.log(userDetails.data, 'user details');
      if (!userDetails.data) {
        return response.sendError({res, message: userDetails.meta.message});
      }
      let verified=false;
      const data={user: userDetails.data};
      const userExist = await User.findOne( {email: data.user.email}).lean();
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
      console.log('gotten here');
      return response.sendSuccess({
        res,
        message: 'Login successful',
        body: {_token: accessToken, data: {...data.user, userCount: await User.countDocuments()}}
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports= AuthenticationController;
