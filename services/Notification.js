
require('dotenv').config();
const nodemailer = require('nodemailer');
const config=require('../config/index');
const hbs = require('nodemailer-express-handlebars');
const SendEmail = async (details={to: '', from: '', subject: '', template_name: '', bcc: undefined, replyTo: undefined, attachment: undefined}) => {
  try {
    console.log('sending mail started');
    console.log(process.env.SMTP_USERNAME, process.env.SMTP_PASSWORD);
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
    console.log('creating mail transporter');
    const transporter = nodemailer.createTransport(transportOptions);
    transporter.use('compile', hbs(options));
    console.log('complied mail transporter');
    console.log(config.node_environment, 'node env');
    const emailPayload = {
      from: {
        name: 'Nibbs',
        address: 'info@zeedas.com'
      },
      to: details.to,
      replyTo: details.replyTo || 'info@zeedas.com',
      attachments: details.attachment?details.attachment:[],
      bcc: details.bcc === undefined ?
        ['moshood.korede@hotmail.com', 'kenykore@gmail.com'] :
        ['moshood.korede@hotmail.com', 'martha@natterbase.com', ...details.bcc],
      subject: config.node_environment !== 'development' &&
      config.node_environment !== 'staging' ? details.subject:`[${config.node_environment}] ${details.subject}`,
      template: `${details.template_name}`,
      context: config.node_environment !== 'development' &&
      config.node_environment !== 'staging' ? details.data :{mailType: `This mail is sent from the ${config.node_environment} platform, 
      do not take action`, ...details.data}
    };
    if (details.data.campaignId) {
      emailPayload.headers={
        'X-Mailjet-Campaign': details.data.campaignId
      };
    }
    console.log('sending mail....', emailPayload);
    const res = await transporter.sendMail(emailPayload);
    console.log(res, 'mail sent');
    return res;
  } catch (error) {
    console.log(error, 'mail send error');
  }
};

module.exports = SendEmail;
