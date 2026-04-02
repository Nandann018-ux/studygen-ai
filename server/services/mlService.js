const { exec } = require('child_process');
const path = require('path');

/**
 * ML predictor for study hours based on cognitive variables.
 * Uses a Python script to run inference on the RandomForestRegressor model.
 */
function predictStudyHours({ difficulty, syllabusRemaining, daysLeft }) {
  return new Promise((resolve, reject) => {
    try {
      // Input validation handling for edge cases
      const safeDifficulty = Math.max(1, Math.min(5, difficulty)) || 3;
      const safeSyllabus = Math.max(0, syllabusRemaining) || 0;
      const safeDays = Math.max(1, daysLeft) || 1;

      const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'predict.py');
      
      exec(`python3 ${scriptPath} ${safeDifficulty} ${safeSyllabus} ${safeDays}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Python Script Error:', error.message);
          return resolve(1.5); // Robust fallback
        }
        
        try {
          const result = JSON.parse(stdout.trim());
          if (result.error) {
            console.error('Core Logic Execution Error:', result.error);
            return resolve(1.5); // Fallback
          }
          
          let predictedHours = result.predicted_hours;
          return resolve(Math.min(6, Math.max(0.5, parseFloat(predictedHours.toFixed(1)))));
        } catch (parseErr) {
          console.error('Error parsing Python output:', parseErr, stdout);
          return resolve(1.5);
        }
      });
    } catch (err) {
      console.error('Execution Error:', err.message);
      return resolve(1.5); // Robust fallback
    }
  });
}

module.exports = { predictStudyHours };
