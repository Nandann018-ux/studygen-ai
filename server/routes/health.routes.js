const router = require('express').Router();

/**
 * @route   GET /api/health
 * @desc    System health check
 */
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date(),
    service: "Neural Backend"
  });
});

module.exports = router;
