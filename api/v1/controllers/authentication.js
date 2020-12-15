const mongoose = require('mongoose');
const config = require('../../../config/index');
const status = require('http-status');
const fetch = require('node-fetch');

const request = require('request-promise');
const response = require('../../../utilities/response');
const validateReg = require('../../../validations/validate_reg');
const Tokenizer = require('../../../utilities/tokeniztion');
const User=require('../../../models/user');
const Role=require('../../../models/roles');

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

      // first validate that the email the user passed is a valid nibss email (ends with @nibss-plc.com.ng)
      // find the user in the db, if he or she does not exist, then return error
      /* istanbul ignore next */
      const {email, password} = req.body;

      const userName = email.split('@')[0];
      // // console.log('this is me here')
      /* istanbul ignore next */
      const encodedData = Buffer.from(`${userName}:${password}`).toString('base64');
      // // if he exists, then make a call to sso
      /* istanbul ignore next */
      const getData = await fetch(`${process.env.SINGLE_AUTH_SERVICE_BASE_URL}/login`, {
        method: 'get',
        headers: {Authorization: `Basic ${encodedData}`},
      });

      // console.log('this is me here');
      /* istanbul ignore next */
      if (!getData.ok) {
        /* istanbul ignore next */
        return response.sendError({res, statusCode: '401', message: 'Invalid email or password'});
      }
      // // if you need that user details
      /* istanbul ignore next */
      const userData = await getData.json();
      console.log('==========================>>>>>>>>>>>>>>>>', userData);
      /* istanbul ignore next */
      return await authenciateUser(req, res, next, userData);
      // example login data is

      // {
      //   meta: { status: 'okay', message: 'Login successful', info: 'success' },
      //   data: {
      //     dn: 'CN=Idris Kelani,OU=AzureSync,DC=nibsstest,DC=com',
      //     cn: 'Idris Kelani',
      //     sn: 'Kelani',
      //     givenName: 'Idris',
      //     displayName: 'Idris Kelani',
      //     memberOf: [
      //       'CN=ABC Team,OU=Groups,DC=nibsstest,DC=com',
      //       'CN=Devops Team,OU=Groups,DC=nibsstest,DC=com',
      //       'CN=All Staff,OU=Groups,DC=nibsstest,DC=com'
      //     ],
      //     name: 'Idris Kelani',
      //     sAMAccountName: 'ikelani',
      //     userPrincipalName: 'ikelani@nibsstest.com',
      //     lastLogonTimestamp: '132505361245464469',
      //     mail: 'ikelani@nibss-plc.com.ng'
      //   }
      // }

      // get user from the database and use the user information
    } catch (error) {
      /* istanbul ignore next */
      console.log(error);
      /* istanbul ignore next */
      return next(error);
    }
  }
  /**
   * Create a new role
   *
   * @param   {Object}  req   [req description]
   * @param   {Object}  res   [res description]
   * @param   {Function}  next  [next description]
   *
   * @return  {Object}    return role
   */
  static async createRole(req, res, next) {
    try {
      if (!req.body.name) {
        return response.sendError({res, message: 'name of role is required'});
      }
      const roleCreated=await Role.create(req.body);
      if (roleCreated) {
        return response.sendSuccess({res, body: {data: roleCreated}, message: 'Role added successfully'});
      }
      return response.sendError({res, message: 'Unable to add role'});
    } catch (error) {
      return next(error);
    }
  }
  /**
   * Get all roles
   *
   * @param   {Object}  req   [req description]
   * @param   {Object}  res   [res description]
   * @param   {Function}  next  [next description]
   *
   * @return  {Object}        [return description]
   */
  static async getRole(req, res, next) {
    try {
      const roleFound=await Role.find({}).lean();
      console.log(roleFound, 'role found');
      if (roleFound && roleFound.length) {
        return response.sendSuccess({res, message: 'Role found', body: {data: roleFound}});
      }
      return response.sendError({res, message: 'No role found', statusCode: status.NOT_FOUND});
    } catch (error) {
      return next(error);
    }
  }
  /**
   * Delete role
   *
   * @param   {Object}  req   [req description]
   * @param   {Object}  res   [res description]
   * @param   {Function}  next  [next description]
   *
   * @return  {Object}        [return description]
   */
  static async deleteRole(req, res, next) {
    try {
      const roleId=req.params.roleId;
      const roleDeleted=await Role.findByIdAndRemove(roleId);
      if (roleDeleted) {
        return response.sendSuccess({res, message: 'Role deleted'});
      }
      return response.sendError({res, message: 'Role could not be deleted'});
    } catch (error) {
      return next(error);
    }
  }
}
/**
 * Authenticate user
 *
 * @param   {Object}  req       [req description]
 * @param   {Object}  res       [res description]
 * @param   {Function}  next      [next description]
 * @param   {Object}  userData  [userData description]
 *
 * @return  {Promise<Object>}            [return description]
 */
async function authenciateUser(req, res, next, userData) {
  try {
    const userDetails={
      data: {
        email: req.body.email,
        username: userData.data.userPrincipalName,
        name: userData.data.name,
        mobile: '',
        role: 'user',
        status: 'inactive'
      }
    };
    console.log(userDetails.data, 'user details');
    if (!userDetails.data) {
      return response.sendError({res, message: userData.meta.message});
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
module.exports= AuthenticationController;
