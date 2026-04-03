const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { addSubject, getSubjects, updateSubject, deleteSubject } = require('../controllers/subject.controller');

router.post('/', authenticateJWT, addSubject);
router.get('/', authenticateJWT, getSubjects);
router.put('/:id', authenticateJWT, updateSubject);
router.delete('/:id', authenticateJWT, deleteSubject);

module.exports = router;
