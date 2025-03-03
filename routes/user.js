const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

router.post('/api/signup', userCtrl.signup);
router.post('/api.login', userCtrl.login);

module.exports = router;