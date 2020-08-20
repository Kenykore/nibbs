'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyUser, verifyAdmin} = require('../../../../middlewares/verify_auth');

const UserController = require('../../controllers/user');
router.get('/', verifyAdmin, UserController.fetchInvitedUser);
router.post('/', verifyAdmin, UserController.inviteUser);
module.exports = router;
