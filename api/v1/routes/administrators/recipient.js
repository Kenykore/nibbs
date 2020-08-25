'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyUser, verifyAdmin} = require('../../../../middlewares/verify_auth');

const RecipientController = require('../../controllers/receipient');
router.get('/', verifyAdmin, RecipientController.fetchAll);
router.post('/', verifyAdmin, RecipientController.create);
router.post('/tag', verifyAdmin, RecipientController.createTag);
router.get('/tag', verifyAdmin, RecipientController.fetchAllTag);
router.get('/:recipientsId', verifyAdmin, RecipientController.fetchSpecificReceipient);
router.put('/:recipientsId', verifyAdmin, RecipientController.updateRecipient);
router.delete('/:recipientsId', verifyAdmin, RecipientController.deleteRecipient);

module.exports = router;
