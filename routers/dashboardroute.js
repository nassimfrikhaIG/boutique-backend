const express = require('express');
const router = express.Router();
const dashboardController = require('../models/contact');

// Get dashboard data - requires admin role
router.get('/dashboard', dashboardController.getDashboardData);

module.exports = router;