const express = require('express');

const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewsController.getOverview);

router.get('/tours/:tourName', viewsController.getTour);

router.get('/login', viewsController.getLoginForm)

module.exports = router;