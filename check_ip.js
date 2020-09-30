require('dotenv').config();
const request = require('request-promise');
const mailjet = require('node-mailjet')
  .connect(process.env.SMTP_USERNAME, process.env.SMTP_PASSWORD);
/**
 * script
 */
async function getDeliveryReport() {
  try {
    const request = mailjet.get('statcounters').request({
      SourceID: '5f72c4f65f0c82b72a91f739',
      CounterSource: 'Campaign',
      CounterTiming: 'Message',
      CounterResolution: 'Lifetime',
    });
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
      uri: `https://api.mailjet.com/v3/REST/campaignoverview`,
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
getDeliveryReport().then((res)=>{
  console.log(res, 'res');
}).catch((err)=>{
  console.log(err, 'error');
});

