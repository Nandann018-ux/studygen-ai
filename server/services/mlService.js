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

module.exports = { predictStudyHours };
