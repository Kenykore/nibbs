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
        await processStats(d);
      }

      return response.sendSuccess({res, message: 'Stats added'});
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}
/**
 * Process mailjet hook stats update
 *
 * @param   {Object}  d  each stats event
 *
 * @return  {Promise<void>}     [return description]
 */
async function processStats(d) {
  try {
    if (d.customcampaign.length>0) {
      let dataToSave={

      };
      switch (d.event) {
      case 'open': {
        dataToSave={'stats.open': 1};
        await Document.findOneAndUpdate({'_id': objectId(d.customcampaign), 'recipients.email': d.email}, {$set: {'recipients.$.open': true}});
        break;
      }
      case 'click': {
        dataToSave= {'stats.clicked': 1};
        break;
      }
      case 'bounce': {
        dataToSave={'stats.bounced': 1};
        break;
      }
      case 'blocked': {
        dataToSave= {'stats.blocked': 1};
        break;
      }
      case 'spam': {
        dataToSave={'stats.spam': 1};
        break;
      }
      }
      await Document.findByIdAndUpdate(d.customcampaign, {$inc: dataToSave});
      return;
    }
    return;
  } catch (error) {
    console.log(error);
  }
}
module.exports=MailJetController;
