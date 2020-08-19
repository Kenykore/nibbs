const mongoose = require('mongoose');
const config = require('../../../config/index');
const status = require('http-status');
const request = require('request-promise');
const response = require('../../../utilities/response');
const User=require('../../../models/user');
const Invite=require('../../../models/invite');
const Tokenizer = require('../../../utilities/tokeniztion');
const sendEmail = require('../../../services/Notification');
const validateInvite = require('../../../validations/validate_invite');
const validateAcceptInvite = require('../../../validations/validate_accept_invite');

const {randomNumber, formatPhoneNumber, addLeadingZeros} = require('../../../utilities/utils');
/**
 * User class
 */
class UserController {
  /**
     * Invite a user
     *
     * @return  {Object}
     */
  static async inviteUser() {
    try {
      const {error} = validateInvite(req.body);
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      const inviteData=[];
      for (const d of req.body.data) {
        // send email
        const userExist = await Invite.findOne({email: d.email});
        if (userExist) {
          continue;
        }
        const invite= await Invite.create(d);
        inviteData.push(invite);
      }
      return response.sendSuccess({res, message: 'Invite sent Successfully', body: {data: inviteData}});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async completeInvite() {
    try {
      const user=req.userDetails;
      const inviteFound=await Invite.findOne({email: user.email});
      if (!inviteFound) {
        return response.sendError({
          res,
          message: 'This user has not been invited to mail merge'
        });
      }
      const {error} = validateAcceptInvite({...req.body, role: inviteFound.role, ...user});
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      const userExist = await User.findOne({email: user.email});
      if (userExist) {
        return response.sendError({
          res,
          message: 'Email already exists'
        });
      }
      const userCreated= await User.create({...req.body, email: user.email, mobile: user.mobile, name: user.name, role: inviteFound.role});
      await Invite.findByIdAndRemove(inviteFound._id);
      if (userCreated) {
        const accessToken = Tokenizer.signToken({
          ...userCreated.toObject(),
          verified: true
        });
        return response.sendSuccess({res, message: 'User created Successfully', body: {data: userCreated, _token: accessToken}});
      }
      return response.sendError({res, message: 'Unable to create User'});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchAllUser(req, res, next) {
    try {
      const usersPerPage = parseInt(req.query.limit) || 10;
      const currentPage = parseInt(req.query.page) || 0;
      const skip = currentPage * usersPerPage;

      const totalusers = await User.find({}).countDocuments();
      const users = await User.find({}).sort({_id: 'desc'}).skip(skip).limit(usersPerPage);
      const totalPages = Math.ceil(totalusers / usersPerPage);

      if (users && users.length) {
        const responseContent = {
          'total_users': totalusers,
          'pagination': {
            'current': currentPage,
            'number_of_pages': totalPages,
            'perPage': usersPerPage,
            'next': currentPage === totalPages ? currentPage : currentPage + 1
          },
          'data': users
        };
        return response.sendSuccess({res, message: 'Users  found', body: responseContent});
      }
      return response.sendError({res, message: 'No User found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchSpecificUser(req, res, next) {
    try {
      if (!req.params.userId) {
        return response.sendError({res, message: 'User id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return response.sendError({res, message: 'Invalid User id'});
      }

      const user=await User.findById(req.params.userId).lean();
      if (user) {
        return response.sendSuccess({
          res,
          message: 'User found',
          body: {user: user}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to find user,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchSelf(req, res, next) {
    try {
      const userDetails=req.userDetails;
      const user=await User.findById(userDetails.userId).lean();
      if (user) {
        return response.sendSuccess({
          res,
          message: 'User found',
          body: {user: user}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to find user,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async updateUser(req, res, next) {
    try {
      const userDetails=req.userDetails;
      const update=req.body;
      if (update['email']) {
        const userFound=await User.findById(userDetails._id).lean();
        if (userFound.email !==req.body.email) {
          const userExist = await User.findOne({email: req.body.email});
          if (userExist) {
            return response.sendError({
              res,
              message: 'Email already exists'
            });
          }
        }
      }

      const userUpdated=await User.findByIdAndUpdate(userDetails._id, update, {new: true}).lean();
      if (userUpdated) {
        const accessToken = Tokenizer.signToken({
          userId: user_updated._id,
          ...userUpdated
        });
        return response.sendSuccess({
          res,
          message: 'Profile update successful',
          body: {user: user_updated, _token: accessToken}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to update Profile,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async updateUserAdmin(req, res, next) {
    try {
      if (!req.params.userId) {
        return response.sendError({res, message: 'User id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return response.sendError({res, message: 'Invalid User id'});
      }
      const update=req.body;
      if (update['email']) {
        const userFound=await User.findById(userDetails._id).lean();
        if (userFound.email !==req.body.email) {
          const userExist = await User.findOne({email: req.body.email});
          if (userExist) {
            return response.sendError({
              res,
              message: 'Email already exists,update failed'
            });
          }
        }
      }

      const userUpdated=await User.findByIdAndUpdate(req.params.userId, update, {new: true}).lean();
      if (userUpdated) {
        return response.sendSuccess({
          res,
          message: 'User Profile update successful',
          body: {user: user_updated}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to update Profile,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async updateUserRole(req, res, next) {
    try {
      if (!req.params.userId) {
        return response.sendError({res, message: 'User id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return response.sendError({res, message: 'Invalid User id'});
      }
      if (!req.body.role) {
        return response.sendError({res, message: 'User role missing'});
      }
      const userUpdated=await User.findByIdAndUpdate(req.params.userId, {role: req.body.role}, {new: true}).lean();
      if (userUpdated) {
        return response.sendSuccess({
          res,
          message: 'User role updated successful',
          body: {user: user_updated}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to update user role,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async deleteUser(req, res, next) {
    try {
      if (!req.params.userId) {
        return response.sendError({res, message: 'User id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return response.sendError({res, message: 'Invalid User id'});
      }
      const userUpdated=await User.findByIdAndRemove(req.params.userId, {new: true}).lean();
      if (userUpdated) {
        return response.sendSuccess({
          res,
          message: 'User deleted successful',
          body: {user: user_updated}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to delete user role,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchInvitedUser(req, res, next) {
    try {
      const usersPerPage = parseInt(req.query.limit) || 10;
      const currentPage = parseInt(req.query.page) || 0;
      const skip = currentPage * usersPerPage;

      const totalusers = await Invite.find({}).countDocuments();
      const users = await Invite.find({}).sort({_id: 'desc'}).skip(skip).limit(usersPerPage);
      const totalPages = Math.ceil(totalusers / usersPerPage);

      if (users && users.length) {
        const responseContent = {
          'total_users': totalusers,
          'pagination': {
            'current': currentPage,
            'number_of_pages': totalPages,
            'perPage': usersPerPage,
            'next': currentPage === totalPages ? currentPage : currentPage + 1
          },
          'data': users
        };
        return response.sendSuccess({res, message: 'Invited Users  found', body: responseContent});
      }
      return response.sendError({res, message: 'No Invited User found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async searchAllUser(req, res, next) {
    try {
      const usersPerPage = parseInt(req.query.limit) || 10;
      const currentPage = parseInt(req.query.page) || 0;
      const skip = currentPage * usersPerPage;
      const search = req.query.search;
      const totalusers = await User.find({
        $or: [
          {name: new RegExp(search, 'i')},
          {mobile: new RegExp(search, 'i')},
          {email: new RegExp(search, 'i')},
        ],
      }).countDocuments();
      const users = await User.find({
        $or: [
          {name: new RegExp(search, 'i')},
          {mobile: new RegExp(search, 'i')},
          {email: new RegExp(search, 'i')},
        ],
      }).sort({_id: 'desc'}).skip(skip).limit(usersPerPage);
      const totalPages = Math.ceil(totalusers / usersPerPage);
      if (users && users.length) {
        const responseContent = {
          'total_users': totalusers,
          'pagination': {
            'current': currentPage,
            'number_of_pages': totalPages,
            'perPage': usersPerPage,
            'next': currentPage === totalPages ? currentPage : currentPage + 1
          },
          'data': users
        };
        return response.sendSuccess({res, message: 'Users  found', body: responseContent});
      }
      return response.sendError({res, message: 'No User found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async filterAllUser(req, res, next) {
    try {
      const usersPerPage = parseInt(req.query.limit) || 10;
      const currentPage = parseInt(req.query.page) || 0;
      const skip = currentPage * usersPerPage;
      delete req.query.page;
      delete req.query.limit;
      const totalusers = await User.find({
        ...req.query
      }).countDocuments();
      const users = await User.find({
        ...req.query
      }).sort({_id: 'desc'}).skip(skip).limit(usersPerPage);
      const totalPages = Math.ceil(totalusers / usersPerPage);
      if (users && users.length) {
        const responseContent = {
          'total_users': totalusers,
          'pagination': {
            'current': currentPage,
            'number_of_pages': totalPages,
            'perPage': usersPerPage,
            'next': currentPage === totalPages ? currentPage : currentPage + 1
          },
          'data': users
        };
        return response.sendSuccess({res, message: 'Users  found', body: responseContent});
      }
      return response.sendError({res, message: 'No User found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports=UserController;
