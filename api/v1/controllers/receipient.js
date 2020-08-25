const mongoose = require('mongoose');
const config = require('../../../config/index');
const status = require('http-status');
const request = require('request-promise');
const response = require('../../../utilities/response');
const sendEmail = require('../../../services/Notification');
const Recipient=require('../../../models/recipients');
const Tag=require('../../../models/tags');
const validateRecipient = require('../../../validations/validate_recipients');
/**
 * Receipient class
 */
class ReceipientController {
/**
     * Create Receipient
     *@param {Object} req
     @param {Object} res
     @param {Function} next
     * @return  {Object}
     */
  static async create(req, res, next) {
    try {
      const {error} = validateRecipient(req.body);
      if (error) {
        return response.sendError({
          res,
          message: error.details[0].message
        });
      }
      const recipientExist=await Recipient.findOne({email: req.body.email});
      if (recipientExist) {
        return response.sendError({res, message: 'Recipient Exist, Unable to add recipients'});
      }
      const recipientsAdded= await Recipient.create(req.body);
      if (recipientsAdded) {
        return response.sendSuccess({res, message: 'Recipient added Successfully', body: {data: recipientsAdded}});
      }
      return response.sendError({res, message: 'Unable to add recipients'});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  /**
     * Create Receipient
     *@param {Object} req
     @param {Object} res
     @param {Function} next
     * @return  {Object}
     */
  static async createTag(req, res, next) {
    try {
      if (!req.body.name) {
        return response.sendError({
          res,
          message: 'Tag name is required'
        });
      }
      const tagFound=await Tag.findOne({name: req.body.name});
      if (tagFound) {
        return response.sendError({res, message: 'Tag exist,Unable to add tag'});
      }
      const tagAdded= await Tag.create(req.body);
      if (tagAdded) {
        return response.sendSuccess({res, message: 'Tag added Successfully', body: {data: tagAdded}});
      }
      return response.sendError({res, message: 'Unable to add tag'});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchAllTag(req, res, next) {
    try {
    //   const tagPerPage = parseInt(req.query.limit) || 10;
    //   const currentPage = parseInt(req.query.page) || 0;
    //   const skip = currentPage * tagPerPage;

      const totaltag = await Tag.find({}).countDocuments();
      const tag = await Tag.find().sort({_id: 'desc'});
      //   const totalPages = Math.ceil(totaltag / tagPerPage);

      if (tag && tag.length) {
        const responseContent = {
          'total_tags': totaltag,
          'data': tag
        };
        return response.sendSuccess({res, message: 'tags  found', body: responseContent});
      }
      return response.sendError({res, message: 'No Tag found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchAll(req, res, next) {
    try {
      const recipientsPerPage = parseInt(req.query.limit) || 10;
      const currentPage = parseInt(req.query.page) || 0;
      const skip = currentPage * recipientsPerPage;

      const totalrecipients = await Recipient.find({}).countDocuments();
      const recipients = await Recipient.find({}).sort({_id: 'desc'}).skip(skip).limit(recipientsPerPage);
      const totalPages = Math.ceil(totalrecipients / recipientsPerPage);

      if (recipients && recipients.length) {
        const responseContent = {
          'total_recipientss': totalrecipients,
          'pagination': {
            'current': currentPage,
            'number_of_pages': totalPages,
            'perPage': recipientsPerPage,
            'next': currentPage === totalPages ? currentPage : currentPage + 1
          },
          'data': recipients
        };
        return response.sendSuccess({res, message: 'recipientss  found', body: responseContent});
      }
      return response.sendError({res, message: 'No Receipient found', statusCode: status.NOT_FOUND});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async fetchSpecificReceipient(req, res, next) {
    try {
      if (!req.params.recipientsId) {
        return response.sendError({res, message: 'Recipient id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.recipientsId)) {
        return response.sendError({res, message: 'Invalid Recipient id'});
      }

      const recipients=await Recipient.findById(req.params.recipientsId).lean();
      if (recipients) {
        return response.sendSuccess({
          res,
          message: 'Recipient found',
          body: {data: recipients}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to find recipient,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async updateRecipient(req, res, next) {
    try {
      if (!req.params.recipientsId) {
        return response.sendError({res, message: 'Recipient id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.recipientsId)) {
        return response.sendError({res, message: 'Invalid Recipient id'});
      }
      const update=req.body;
      if (update['email']) {
        const recipientFound=await Recipient.findById(req.params.recipientsId).lean();
        if (recipientFound.email !==req.body.email) {
          const recipientExist = await Recipient.findOne({email: req.body.email});
          if (recipientExist) {
            return response.sendError({
              res,
              message: 'Email already exists'
            });
          }
        }
      }
      const recipientUpdated=await Recipient.findByIdAndUpdate(req.params.recipientsId, update, {new: true}).lean();
      if (recipientUpdated) {
        return response.sendSuccess({
          res,
          message: 'Recipient update successful',
          body: {data: recipientUpdated}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to update recipient,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  static async deleteRecipient(req, res, next) {
    try {
      if (!req.params.recipientsId) {
        return response.sendError({res, message: 'Recipient id is missing in request parameters'});
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.recipientsId)) {
        return response.sendError({res, message: 'Invalid Recipient id'});
      }
      const recipientUpdated=await Recipient.findByIdAndRemove(req.params.recipientsId, {new: true}).lean();
      if (recipientUpdated) {
        return response.sendSuccess({
          res,
          message: 'Recipient deleted successful',
          body: {recipient: recipientUpdated}
        });
      }
      return response.sendError({
        res,
        message: 'Unable to delete recipient,try again'
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports=ReceipientController;