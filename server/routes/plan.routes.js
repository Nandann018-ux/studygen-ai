const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { generatePlan, getPlan } = require('../controllers/studyPlan.controller');

router.post('/generate', authenticateJWT, generatePlan);
router.get('/', authenticateJWT, getPlan);

module.exports = router;
