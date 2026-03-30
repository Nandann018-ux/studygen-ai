const router = require('express').Router();

// GET /api/health
router.get('/', (req, res) => {
  res.status(200).send('Server running');
});

module.exports = router;

