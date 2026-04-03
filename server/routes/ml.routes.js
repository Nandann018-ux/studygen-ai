const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');


router.post('/retrain', authenticateJWT, mlController.retrainModel);


router.get('/insights', authenticateJWT, mlController.getInsights);


router.post('/classify', authenticateJWT, mlController.getClassification);


router.post('/predict-score', authenticateJWT, mlController.getScorePrediction);


router.post('/tips', authenticateJWT, mlController.getStudyTips);

module.exports = router;
