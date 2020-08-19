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
   * @return {object}
     * Login user
     */
  static async login() {
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
      const userDetails = await request(options);
      console.log(userDetails, 'user details');
      if (!userDetails.data) {
        return response.sendError({res, message: userDetails.meta.message});
      }
      let verified=false;
      const data={user: userDetails.data};
      const userExist = await User.findOne({email: user.email});
      if (userExist) {
        verified=true;
        data.user=userExist;
      }
      const accessToken = Tokenizer.signToken({
        ...data.user,
        verified: verified
      });
      return response.sendSuccess({
        res,
        message: 'Login successful',
        body: {_token: accessToken, data: userDetails.data}
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports= AuthenticationController;
