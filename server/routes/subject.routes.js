const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { addSubject, getSubjects } = require('../controllers/subject.controller');
router.post('/', authenticateJWT, addSubject);
router.get('/', authenticateJWT, getSubjects);
module.exports = router;
