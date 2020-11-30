'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const {verifyUser} = require('../../../middlewares/verify_auth');
// middleware

// Administrator Controller
const DocumentController = require('../controllers/document');


router.post('/prepare', verifyUser, DocumentController.prepareDocument);
router.post('/sign', verifyUser, DocumentController.signDocument);
router.get('/', verifyUser, DocumentController.fetchAllDocument);
router.get('/:documentId', verifyUser, DocumentController.fetchSpecificDocument);
module.exports = router;
