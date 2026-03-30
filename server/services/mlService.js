const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

/**
 * Calls the ML Python microservice to predict the needed study hours for a single subject session.
 * 
 * Why ML here?
 * Using a simple rule-based approach can become too rigid. By passing historical or generated
 * patterns (such as closer exams needing more intense study sessions), a Regression model
 * can output a more organic mapping of hours given non-linear pressure environments.
 * 
 * Features used:
 * - difficulty: How hard the subject is (1-5)
 * - syllabusRemaining: How much % is uncovered (0-100)
 * - daysLeft: How many days until exam
 * 
 * @param {Object} input
 * @param {number} input.difficulty
 * @param {number} input.syllabusRemaining
 * @param {number} input.daysLeft
 * @returns {Promise<number>} - Predicted base study hours
 */
async function predictStudyHours({ difficulty, syllabusRemaining, daysLeft }) {
  try {
    // Prediction works by passing our 3 features to the ML API which passes them 
    // to a trained Scikit-Learn RandomForestRegressor to return mapped `studyHours`
    const response = await axios.post(`${ML_API_URL}/predict`, {
      difficulty,
      syllabusRemaining,
      daysLeft
    });

    if (response.data && response.data.studyHours) {
      return response.data.studyHours;
    }
    
    // Fallback if data structure fails
    return 1.0; 
  } catch (err) {
    console.error('Error connecting to ML service:', err.message);
    // If the ML Flask API is down, we use a graceful fallback to not break user experience
    return 1.5; 
  }
}

module.exports = { predictStudyHours };
