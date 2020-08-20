'use strict';
require('dotenv').config();
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

// middleware
const {verifyAdmin} = require('../../../../middlewares/verify_auth');


const UserController = require('../../../v1/controllers/user');

router.get('/', verifyAdmin, UserController.fetchAllUser);
router.get('/search', verifyAdmin, UserController.searchAllUser);
router.get('/filter', verifyAdmin, UserController.filterAllUser);
router.get('/:userId', verifyAdmin, UserController.fetchSpecificUser);
router.put('/role/:userId', verifyAdmin, UserController.updateUserRole);
router.put('/:userId', verifyAdmin, UserController.updateUserAdmin);
router.delete('/:userId', verifyAdmin, UserController.deleteUser);

module.exports = router;
