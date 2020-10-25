/* istanbul ignore file */
require('dotenv').config();
const request = require('request-promise');
const mailjet = require('node-mailjet')
  .connect(process.env.SMTP_USERNAME, process.env.SMTP_PASSWORD);
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;
/**
 * script
 */
async function getDeliveryReport() {
  try {
    console.log('connecting to mailjet...');
    const request = mailjet.get('statcounters').request({
      SourceId: '5f76ded383ce345563ee4a7e',
      CounterSource: 'Campaign',
      CounterTiming: 'Message',
      CounterResolution: 'Lifetime',
    });
    console.log('fetching response from mailjet...');
    const response=await request;
    console.log(response.body, 'body');
    return response;
  } catch (error) {
    console.log(error);
  }
}

/**
 * test
 *
 * @return  {[type]}  [return description]
 */
async function getDeliveryReportTwo() {
  try {
    const options = {
      method: 'GET',
      uri: `https://api.mailjet.com/v3/REST/statcounters`,
      qs: {
        SourceId: '5f72c4f65f0c82b72a91f739',
        CounterSource: 'Campaign',
        CounterTiming: 'Message',
        CounterResolution: 'Lifetime'},
      headers: {
        Authorization: 'Basic ' + Buffer.from(process.env.SMTP_USERNAME + ':' + process.env.SMTP_PASSWORD).toString('base64')
      },
      json: true // Automatically stringifies the body to JSON
    };
    const response = await request(options);
    console.log(response, 'body');
    return response;
  } catch (error) {
    console.log(error);
  }
}
// getDeliveryReportTwo().then((res)=>{
//   console.log(res, 'res');
// }).catch((err)=>{
//   console.log(err, 'error');
// });
async function deleteDocument() {
  try {
    console.log('connecting to db...');
    const connection = await mongoose.createConnection('mongodb+srv://kenykore:boluwatife@cluster0-5qrlk.mongodb.net/nibbsdev?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('connected to db,Instating model..');
    const DB = await connection.db;
    const Document = DB.collection('documents');
    const doc=await Document.updateMany({}, {
      $set: {'signatories.$.page': 0}
    }, {new: true});

    await connection.close();
    return;
  } catch (error) {
    console.log(error);
  }
}
deleteDocument().then((res)=>{

});
