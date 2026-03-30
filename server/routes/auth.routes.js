const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');

const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateJWT, getMe);

module.exports = router;

