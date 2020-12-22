const Document=require('../../../models/document');
const objectId= require('mongoose').Types.ObjectId;
const response = require('../../../utilities/response');
/**
 * Controller class for mailjet hook
 */
class MailJetController {
  /* istanbul ignore next */
  static async recordData(req, res, next) {
    try {
      console.log(req.body, 'body');
      /* istanbul ignore next */
      for (const d of req.body) {
        await processStats(d);
      }

      return response.sendSuccess({res, message: 'Stats added'});
    } catch (error) {
      /* istanbul ignore next */
      console.log(error);
      /* istanbul ignore next */
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
    /* istanbul ignore next */
    if (d.customcampaign.length>0) {
      let dataToSave={

      };
      /* istanbul ignore next */
      switch (d.event) {
      /* istanbul ignore next */
      case 'open': {
        dataToSave={'stats.open': 1};
        await Document.findOneAndUpdate({'_id': objectId(d.customcampaign), 'recipients.email': d.email}, {$set: {'recipients.$.open': true}});
        break;
      }
      /* istanbul ignore next */
      case 'click': {
        dataToSave= {'stats.clicked': 1};
        break;
      }
      /* istanbul ignore next */
      case 'bounce': {
        dataToSave={'stats.bounced': 1};
        break;
      }
      /* istanbul ignore next */
      case 'blocked': {
        dataToSave= {'stats.blocked': 1};
        break;
      }
      /* istanbul ignore next */
      case 'spam': {
        dataToSave={'stats.spam': 1};
        break;
      }
      }
      /* istanbul ignore next */
      await Document.findByIdAndUpdate(d.customcampaign, {$inc: dataToSave});
      /* istanbul ignore next */
      return;
    }
    return;
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
  }
}
module.exports=MailJetController;
