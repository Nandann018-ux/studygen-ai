const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { saveSession, getSessions } = require('../controllers/studySession.controller');

router.post('/', authenticateJWT, saveSession);
router.get('/', authenticateJWT, getSessions);

module.exports = router;
