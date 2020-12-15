/* istanbul ignore file */
'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const {verifyAdmin} = require('../../../middlewares/verify_auth');
// middleware

// Administrator Controller
const ApplicationController = require('../controllers/application');


router.post('/create', ApplicationController.create);
router.post('/reset/key', ApplicationController.resetAppKey);
router.post('/remove', ApplicationController.deleteApp);
module.exports = router;
