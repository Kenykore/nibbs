'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyUser, verifyAdmin, verifyUserInvite} = require('../../../../middlewares/verify_auth');

const UserController = require('../../controllers/user');
router.post('/complete', verifyUserInvite, UserController.completeInvite);
module.exports = router;
