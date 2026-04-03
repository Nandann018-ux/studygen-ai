const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { generatePlan, getPlan, markComplete } = require('../controllers/studyPlan.controller');
router.post('/generate', authenticateJWT, generatePlan);
router.get('/', authenticateJWT, getPlan);
router.patch('/:id/complete', authenticateJWT, markComplete);
module.exports = router;
