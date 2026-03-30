const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { generatePlan } = require('../controllers/studyPlan.controller');

router.post('/generate', authenticateJWT, generatePlan);

module.exports = router;
