'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware

// Administrator Controller
const MailJetController = require('../controllers/document');


router.post('/', verifyUser, DocumentController.prepareDocument);
module.exports = router;
