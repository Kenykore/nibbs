
require("dotenv").config();
const nodemailer = require("nodemailer");
const config=require("../config/index")
var hbs = require('nodemailer-express-handlebars');
const SendEmail = async (details={to:"",from:"",subject:"",template_name:"",bcc:undefined,replyTo:undefined}) => {
    try {
        console.log("sending mail started")
        const transportOptions = {
            host: 'smtp.gmail.com',
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
        var options = {
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'emails',
                defaultLayout: `${details.template_name}`,
                partialsDir: 'emails'
            },
            viewPath: 'emails',
            extName: '.hbs'
        };
        console.log("creating mail transporter")
        const transporter = nodemailer.createTransport(transportOptions);
        transporter.use('compile', hbs(options));
        console.log("complied mail transporter")
        console.log(config.node_environment,"node env")
        const emailPayload = {
            from: {
                name: details.from || "Powercase",
                address: "powercube.powercase@gmail.com"
            },
            to: details.to,
            replyTo: details.replyTo || "powercube.powercase@gmail.com",
            bcc: details.bcc === undefined ? ["moshood.korede@hotmail.com","martha@natterbase.com"] : ["moshood.korede@hotmail.com","martha@natterbase.com", ...details.bcc],
            subject:config.node_environment !== "development" && config.node_environment !== "staging" ? details.subject:`[${config.node_environment}] ${details.subject}`,
            template: `${details.template_name}`,
            context: config.node_environment !== "development" && config.node_environment !== "staging" ? details.data :{mailType:`This mail is sent from the ${config.node_environment} platform, do not take action`,...details.data}
        };
        console.log("sending mail....")
        let res = await transporter.sendMail(emailPayload);
        console.log(res, "mail sent");
        return

    } catch (error) {
        console.log(error, "mail send error");
    }
};

module.exports = SendEmail;