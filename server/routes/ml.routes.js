const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/ml/retrain
 * @desc    Triggers the ML model update and retraining pipeline
 * @access  Private (Admin or Internal logic)
 */
router.post('/retrain', protect, mlController.retrainModel);

module.exports = router;
