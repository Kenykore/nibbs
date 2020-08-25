'use strict';
require('dotenv').config();
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyUser} = require('../../../../middlewares/verify_auth');


const UserController = require('../../../v1/controllers/user');

router.get('/', verifyUser, UserController.fetchSelf);
router.put('/', verifyUser, UserController.updateUser);
router.post('/add/signature', verifyUser, UserController.addSignature);

module.exports = router;
