const Application=require('../../../models/apps');
const objectId= require('mongoose').Types.ObjectId;
const response = require('../../../utilities/response');
const crypto=require('crypto');

/**
 * Controller class for managing external applications
 */
class AppController {
  /* istanbul ignore next */
  static async create(req, res, next) {
    try {
      /* istanbul ignore next */
      const app=await Application.create({
        ...req.body,
        key: crypto.randomBytes(7).toString('hex').toUpperCase()
      });

      return response.sendSuccess({res, message: 'Application added', body: {data: app}});
    } catch (error) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      return next(error);
    }
  }
  /* istanbul ignore next */
  static async deleteApp(req, res, next) {
    try {
      const appDeleted=await Application.findOneAndDelete({key: req.body.key}).lean();

      return response.sendSuccess({res, message: 'Application deleted', body: {data: appDeleted}});
    } catch (error) {
      return next(error);
    }
  }
  /* istanbul ignore next */
  static async resetAppKey(req, res, next) {
    try {
      const app=await Application.findOneAndUpdate({key: req.body.key},
        {key: crypto.randomBytes(7).toString('hex').toUpperCase()}, {new: true, upsert: true}).lean();

      return response.sendSuccess({res, message: 'Application key refreshed', body: {data: app}});
    } catch (error) {
      return next(error);
    }
  }
}

module.exports=AppController;
