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
      if (req.body.event==='open') {
        await Document.findByIdAndUpdate(req.body.customcampaign, {$inc: {'stats.open': 1}});
      }
      if (req.body.event==='click') {
        await Document.findByIdAndUpdate(req.body.customcampaign, {$inc: {'stats.clicked': 1}});
      }
      if (req.body.event==='bounce') {
        await Document.findByIdAndUpdate(req.body.customcampaign, {$inc: {'stats.bounced': 1}});
      }
      if (req.body.event==='blocked') {
        await Document.findByIdAndUpdate(req.body.customcampaign, {$inc: {'stats.blocked': 1}});
      }
      if (req.body.event==='spam') {
        await Document.findByIdAndUpdate(req.body.customcampaign, {$inc: {'stats.spam': 1}});
      }
      return response.sendSuccess({res, message: 'Stats added'});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
module.exports=MailJetController;
