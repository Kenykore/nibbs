'use strict';
require('dotenv').config();
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyUser, verifyAdmin} = require('../../../../middlewares/verify_auth');
const recipient='recipientsId';
const RecipientController = require('../../controllers/receipient');
router.get('/', RecipientController.fetchAll);
router.get('/search', RecipientController.searchAll);
router.post('/', verifyAdmin, RecipientController.create);
router.post('/multiple', verifyAdmin, RecipientController.createRecipientMultiple);
router.post('/tag', verifyAdmin, RecipientController.createTag);
router.post('/tag/multiple', verifyAdmin, RecipientController.createMulipleTag);
router.get('/tag', RecipientController.fetchAllTag);
router.get(`/:${recipient}`, RecipientController.fetchSpecificReceipient);
router.put(`/:${recipient}`, verifyAdmin, RecipientController.updateRecipient);
router.delete('/tag/:tagId', verifyAdmin, RecipientController.deleteTag);
router.delete(`/:${recipient}`, verifyAdmin, RecipientController.deleteRecipient);

module.exports = router;
