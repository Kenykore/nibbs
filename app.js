
const port= process.env.PORT || 9700;
const path = require('path');
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

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/admin/users', adminUserRouter);
app.use('/users/invite', userInviteRouter);
app.use('/admin/invite', adminInviteRouter);


module.exports=app;


// users api

