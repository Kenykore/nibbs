const mongoose = require('mongoose');
const config = require('../../../config/index');
const status = require('http-status');
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
          mobile: '+2348133699506',
          role: 'user',
          status: 'inactive'
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
      if (roleFound) {
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
      if (!roleId) {
        return response.sendError({res, message: 'Role id is required'});
      }
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
module.exports= AuthenticationController;
