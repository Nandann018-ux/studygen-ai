const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/ml/retrain
 * @desc    Triggers the ML model update and retraining pipeline
 * @access  Private (Admin or Internal logic)
 */
router.post('/retrain', authenticateJWT, mlController.retrainModel);

/**
 * @route   GET /api/ml/insights
 * @desc    Fetch ML-driven user insights and performance trends
 * @access  Private
 */
router.get('/insights', authenticateJWT, mlController.getInsights);

/**
 * @route   POST /api/ml/classify
 * @desc    Get subject classification (Weak/Medium/Strong)
 * @access  Private
 */
router.post('/classify', authenticateJWT, mlController.getClassification);

/**
 * @route   POST /api/ml/predict-score
 * @desc    Get predicted exam score
 * @access  Private
 */
router.post('/predict-score', authenticateJWT, mlController.getScorePrediction);

/**
 * @route   POST /api/ml/tips
 * @desc    Get AI study tips
 * @access  Private
 */
router.post('/tips', authenticateJWT, mlController.getStudyTips);

module.exports = router;
