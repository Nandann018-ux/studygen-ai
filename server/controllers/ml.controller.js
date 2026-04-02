const { runRetrainPipeline, getUserInsights } = require('../services/mlService');

/**
 * Manually trigger the ML Model retraining pipeline.
 */
exports.retrainModel = async (req, res) => {
  try {
    console.log('Manual ML Retraining Triggered...');
    const result = await runRetrainPipeline();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Retrain Controller Error:', err.message);
    res.status(500).json({ success: false, message: 'Retraining failed', error: err.message });
  }
};

/**
 * Fetch ML-driven user insights and performance trends.
 */
exports.getInsights = async (req, res) => {
  try {
    const insights = await getUserInsights(req.user.userId);
    res.json(insights || { message: "Not enough data yet for deep insights." });
  } catch (err) {
    console.error('Insights Controller Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch insights' });
  }
};
