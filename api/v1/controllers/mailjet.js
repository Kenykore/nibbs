const User=require('../../../models/user');
const Document=require('../../../models/document');
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
        if (d.event==='open') {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.open': 1}});
        }
        if (d.event==='click') {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.clicked': 1}});
        }
        if (d.event==='bounce') {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.bounced': 1}});
        }
        if (d.event==='blocked') {
          await Document.findByIdAndUpdate(d.customcampaign, {$inc: {'stats.blocked': 1}});
        }
        if (d.event==='spam') {
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
