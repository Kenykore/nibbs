/* istanbul ignore file */
require('dotenv').config();
const nodemailer = require('nodemailer');
const config=require('../config/index');
const hbs = require('nodemailer-express-handlebars');
const SendEmail = async (details={to: '', from: '', subject: '', template_name: '', bcc: undefined, replyTo: undefined, attachment: undefined}) => {
  try {
    if (process.env.ENVIRONMENT==='test') {
      return true;
    }
    const transportOptions = {
      host: 'in-v3.mailjet.com',
      port: 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    };
    const options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: 'emails',
        defaultLayout: `${details.template_name}`,
        partialsDir: 'emails'
      },
      viewPath: 'emails',
      extName: '.hbs'
    };
    const transporter = nodemailer.createTransport(transportOptions);
    transporter.use('compile', hbs(options));
    const emailPayload = {
      from: {
        name: 'Nibbs',
        address: 'anthony@zeedas.com'
      },
      to: details.to,
      priority: 'high',
      replyTo: details.replyTo || 'anthony@zeedas.com',
      attachments: details.attachment?details.attachment:[],
      bcc: details.bcc === undefined ?
        [] :
        [...details.bcc],
      subject: config.node_environment !== 'development' &&
      config.node_environment !== 'staging' ? details.subject:`[${config.node_environment}] ${details.subject}`,
      template: `${details.template_name}`,
      context: config.node_environment !== 'development' &&
      config.node_environment !== 'staging' ? details.data :{mailType: `This mail is sent from the ${config.node_environment} platform, 
      do not take action`, ...details.data}
    };
    // if (details.data.campaignId) {
    //   emailPayload.headers={
    //     'x-mailjet-campaign': details.data.campaignId.toString(),
    //     'x-mailjet-trackClick': '1'
    //   };
    // }
    const res = await transporter.sendMail(emailPayload);
    console.log(res, 'res mail');
    return true;
  } catch (error) {
    console.log(error, 'mail send error');
    return false;
  }
};

module.exports = SendEmail;
