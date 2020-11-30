'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const {verifyAdmin} = require('../../../middlewares/verify_auth');
// middleware

// Administrator Controller
const AuthenticationController = require('../controllers/authentication');


router.post('/login', AuthenticationController.login);
router.post('/role', verifyAdmin, AuthenticationController.createRole);
router.get('/role', verifyAdmin, AuthenticationController.getRole);
router.delete('/role/:roleId', verifyAdmin, AuthenticationController.deleteRole);
module.exports = router;
