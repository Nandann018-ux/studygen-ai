const { spawn } = require('child_process');
const path = require('path');

/**
 * Heuristic fallback predictor (deterministic rule-based logic).
 * Used when the ML service is unavailable or fails.
 */
function fallbackPredictor({ difficulty, syllabusRemaining, daysLeft }) {
  try {
    const complexityWeight = (difficulty / 5) * 2.0 + 1.0;
    const loadWeight = (syllabusRemaining / 100) * 2.5;
    const urgencyMultiplier = 1 + (2 / (Math.sqrt(daysLeft + 1)));
    
    let predictedHours = (complexityWeight + loadWeight) * (urgencyMultiplier / 2);
    return Math.min(6, Math.max(0.5, parseFloat(predictedHours.toFixed(1))));
  } catch (err) {
    return 1.5; // Final absolute fallback
  }
}

/**
 * ML predictor for study hours based on cognitive variables.
 * Uses child_process.spawn to run python-based RandomForest inference.
 */
function predictStudyHours({ difficulty, syllabusRemaining, daysLeft }) {
  return new Promise((resolve) => {
    // 1. Sanitize Inputs
    const safeDifficulty = Number(difficulty) || 3;
    const safeSyllabus = Number(syllabusRemaining) || 0;
    const safeDays = Number(daysLeft) || 1;

    // 2. Prepare Fallback
    const fallback = () => resolve(fallbackPredictor({
      difficulty: safeDifficulty,
      syllabusRemaining: safeSyllabus,
      daysLeft: safeDays
    }));

    try {
      const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'predict.py');
      
      // 3. Spawn Python process
      const pythonProcess = spawn('python3', [
        scriptPath,
        safeDifficulty.toString(),
        safeSyllabus.toString(),
        safeDays.toString()
      ]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.warn(`ML service exited with code ${code}. Stderr: ${stderrData}`);
          return fallback();
        }

        try {
          const result = JSON.parse(stdoutData.trim());
          
          if (result.error) {
            console.error('ML Prediction Script Error:', result.error);
            return fallback();
          }

          if (typeof result.predictedHours !== 'number') {
            console.warn('ML Prediction result is not a number:', result);
            return fallback();
          }

          // Return ML prediction (clamped for safety)
          resolve(Math.min(20, Math.max(0.5, result.predictedHours)));
        } catch (parseErr) {
          console.error('Failed to parse ML output JSON:', parseErr, 'Raw:', stdoutData);
          fallback();
        }
      });

      // Handle spawn errors (e.g. python3 not found)
      pythonProcess.on('error', (err) => {
        console.error('Failed to start ML child process:', err.message);
        fallback();
      });

    } catch (err) {
      console.error('Unexpected ML Service Error:', err.message);
      fallback();
    }
  });
}

/**
 * Runs the ML retraining pipeline (Update Dataset -> Train Model).
 * Returns a Promise that resolves when complete.
 */
function runRetrainPipeline() {
  return new Promise((resolve, reject) => {
    const updateScript = path.join(__dirname, '..', '..', 'ml-service', 'update_dataset.py');
    const trainScript = path.join(__dirname, '..', '..', 'ml-service', 'train.py');

    console.log('Starting ML Retraining Pipeline in Background...');

    // 1. Run Update Dataset
    const updateProcess = spawn('python3', [updateScript]);
    let updateOutput = '';
    let updateError = '';

    updateProcess.stdout.on('data', (data) => (updateOutput += data.toString()));
    updateProcess.stderr.on('data', (data) => (updateError += data.toString()));

    updateProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Update script failed with code ${code}: ${updateError}`);
        return reject(new Error(updateError || updateOutput));
      }

      console.log('Dataset updated. Starting training...');

      // 2. Run Training
      const trainProcess = spawn('python3', [trainScript]);
      let trainOutput = '';
      let trainError = '';

      trainProcess.stdout.on('data', (data) => (trainOutput += data.toString()));
      trainProcess.stderr.on('data', (data) => (trainError += data.toString()));

      trainProcess.on('close', (trainCode) => {
        if (trainCode !== 0) {
          console.error(`Training script failed with code ${trainCode}: ${trainError}`);
          return reject(new Error(trainError || trainOutput));
        }

        console.log('ML Retraining Complete.');
        resolve({
          message: 'Model retrained successfully',
          output: trainOutput.trim()
        });
      });
    });
  });
}

module.exports = { predictStudyHours, runRetrainPipeline };
