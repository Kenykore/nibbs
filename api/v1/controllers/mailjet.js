/* istanbul ignore file */
const User=require('../../../models/user');
const Document=require('../../../models/document');
const objectId= require('mongoose').Types.ObjectId;
const status = require('http-status');
const request = require('request-promise');
const response = require('../../../utilities/response');
/**
 * Controller class for mailjet hook
 */
class MailJetController {
  static async recordData(req, res, next) {
    try {
      console.log(req.body, 'body');
      for (const d of req.body) {
        if (d.event==='open' && d.customcampaign.length>0) {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.open': 1}});
          await Document.findOneAndUpdate({'_id': objectId(d.customcampaign), 'recipients.email': d.email}, {$set: {'recipients.$.open': true}});
        }
        if (d.event==='click' && d.customcampaign.length>0) {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.clicked': 1}});
        }
        if (d.event==='bounce' && d.customcampaign.length>0) {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.bounced': 1}});
        }
        if (d.event==='blocked' && d.customcampaign.length>0) {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.blocked': 1}});
        }
        if (d.event==='spam' && d.customcampaign.length>0) {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.spam': 1}});
        }
      }

      return response.sendSuccess({res, message: 'Stats added'});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports=MailJetController;
