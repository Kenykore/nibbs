'use strict';
require('dotenv').config();
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyAdmin} = require('../../../../middlewares/verify_auth');


const UserController = require('../../../v1/controllers/user');

router.get('/', UserController.fetchAllUser);
router.get('/search', UserController.searchAllUser);
router.get('/download/pdf', UserController.downloadAllUserPdf);
router.get('/download/csv', UserController.downloadAllUserCsv);
router.get('/filter', UserController.filterAllUser);
router.get('/:userId', UserController.fetchSpecificUser);
router.put('/role/:userId', verifyAdmin, UserController.updateUserRole);
router.put('/:userId', verifyAdmin, UserController.updateUserAdmin);
router.delete('/:userId', verifyAdmin, UserController.deleteUser);

module.exports = router;
