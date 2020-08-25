
const port= process.env.PORT || 9700;
const path = require('path');
const fileUpload = require('express-fileupload');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const app = express();


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


// 1.notification variables


// authentication router
const authRouter = require('./api/v1/routes/authentication');

// user router
const adminUserRouter = require('./api/v1/routes/administrators/users');
const userRouter = require('./api/v1/routes/users/users');
// invite router
const adminInviteRouter = require('./api/v1/routes/administrators/invite');
const userInviteRouter = require('./api/v1/routes/users/invite');
// recipient router
const adminRecipientRouter = require('./api/v1/routes/administrators/recipient');
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/admin/users', adminUserRouter);
app.use('/users/invite', userInviteRouter);
app.use('/admin/invite', adminInviteRouter);
app.use('/admin/recipient', adminRecipientRouter);

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

