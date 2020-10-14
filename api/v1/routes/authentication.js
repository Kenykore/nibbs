'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware

// Administrator Controller
const AuthenticationController = require('../controllers/authentication');


router.post('/login', AuthenticationController.login);

module.exports = router;
