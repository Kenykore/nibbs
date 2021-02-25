/* istanbul ignore file */
require('dotenv').config();
const port= process.env.PORT || 9700;
const path = require('path');
const fileUpload = require('express-fileupload');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const app = express();
app.disable('x-powered-by');
const config = require('./config/index');
// 2.Express Configuration
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(methodOverride());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));
// var cors_options =
const allowedOrigins=[config.frontend_url];
app.use(cors({
  origin: function(origin, callback) {
    console.log(origin);
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    console.log(origin);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  }
}));
// 1.notification variables


// authentication router
const authRouter = require('./api/v1/routes/authentication');
// document router
const documentRouter = require('./api/v1/routes/document');
// mailjet hook router
const mailjetRouter = require('./api/v1/routes/mailjet');
// apps router
const appsRouter = require('./api/v1/routes/application');
// user router
const adminUserRouter = require('./api/v1/routes/administrators/users');
const userRouter = require('./api/v1/routes/users/users');
// invite router
const adminInviteRouter = require('./api/v1/routes/administrators/invite');
const userInviteRouter = require('./api/v1/routes/users/invite');
// recipient router
const adminRecipientRouter = require('./api/v1/routes/administrators/recipient');
app.use('/auth', authRouter);
app.use('/documents', documentRouter);
app.use('/mailjet', mailjetRouter);
app.use('/application', appsRouter);
app.use('/users', userRouter);
app.use('/admin/users', adminUserRouter);
app.use('/users/invite', userInviteRouter);
app.use('/admin/invite', adminInviteRouter);
app.use('/admin/recipient', adminRecipientRouter);
app.get('/', (req, res, next)=>{
  return res.send(`Your ip address is ${req.ip} and ${req.ips}`);
});
const mongoose= require('mongoose');
const databaseConfig = require('./config/index.js');
// configuration
// 1. Database Connection
mongoose.connect(databaseConfig.database_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const db= mongoose.connection;
// db.dropCollection('orders')
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', (()=>{
  console.log('connected to db');
}));
module.exports=app;


// users api

