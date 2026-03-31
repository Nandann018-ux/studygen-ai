const axios = require('axios');
const ML_API_URL = process.env.ML_API_URL || 'http:
async function predictStudyHours({ difficulty, syllabusRemaining, daysLeft }) {
  try {
    const response = await axios.post(`${ML_API_URL}/predict`, {
      difficulty,
      syllabusRemaining,
      daysLeft
    });
    if (response.data && response.data.studyHours) {
      return response.data.studyHours;
    }
    return 1.0; 
  } catch (err) {
    console.error('Error connecting to ML service:', err.message);
    return 1.5; 
  }
}
module.exports = { predictStudyHours };
