'use strict';
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Class for methods relating to signing and verification of JSON web tokens
 */
class AuthenticationTokenizer {
  /**
     * method to generate and sign json web token - token expires in two days
     * @param   {Object}  userInformation  User information object
     * @return  {String}           token generated
     */
  static signToken(userInformation) {
    return jwt.sign({
      data: userInformation,
      expiresIn: '5 days'
    }, process.env.JWT_SECRET_KEY);
  }
  static signTemporaryToken(userInformation) {
    return jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (120), // 2 mins
      data: userInformation
    }, process.env.JWT_SECRET_KEY);
  }
  /**
     * method to verify authentication token
     * @param   {String}  authToken  Authentication token
     * @return  {Boolean}
     */
  static verifyToken(authToken) {
    return jwt.verify(authToken, process.env.JWT_SECRET_KEY);
  }
}


module.exports = AuthenticationTokenizer;
