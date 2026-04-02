const { runRetrainPipeline } = require('../services/mlService');

/**
 * Manually trigger the ML Model retraining pipeline.
 * Runs update_dataset.py then train.py via mlService.
 */
exports.retrainModel = async (req, res) => {
  try {
    console.log('Manual ML Retraining Triggered...');
    
    // Run the pipeline (awaiting response for the API)
    const result = await runRetrainPipeline();
    
    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    console.error('Retrain Controller Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Retraining failed',
      error: err.message
    });
  }
};
