const { predictStudyHours } = require('../services/mlService');

/**
 * Generates an ML-driven study plan distributed across multiple days.
 * 
 * Why ML is used here:
 * Instead of rigid arbitrary mathematical weights, an ML model (RandomForest) trained on 
 * historical data gives a more natural prediction of effort based on syllabus completion
 * and exam proximity.
 * 
 * Features used: 
 * - difficulty (1-5)
 * - syllabusRemaining (perc 0-100)
 * - daysLeft (integer > 0)
 */
async function generateStudyPlan(subjects, daysToPlan = 7) {
  const plan = [];

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < daysToPlan; dayOffset++) {
    const currentDate = new Date(startOfDay);
    currentDate.setDate(startOfDay.getDate() + dayOffset);

    // Filter subjects eligible for study on this day
    const validSubjects = subjects.filter((sub) => {
      const examDate = new Date(sub.examDate);
      const daysLeftFromCurrent = Math.ceil(
        (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysLeftFromCurrent >= 0; 
    });

    if (validSubjects.length === 0) continue;

    // Fetch predictions for all valid subjects simultaneously for the current date
    const predictions = await Promise.all(
      validSubjects.map(async (sub) => {
        const examDate = new Date(sub.examDate);
        const daysLeftFromCurrent = Math.ceil(
          (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Ensure days input is realistic for prediction
        const effectiveDaysLeft = Math.max(1, daysLeftFromCurrent);

        // Call ML Service Endpoint
        let allocatedHours = await predictStudyHours({
          difficulty: sub.difficulty,
          syllabusRemaining: sub.syllabusRemaining,
          daysLeft: effectiveDaysLeft
        });

        // Ensure minimum 0.5 hours
        allocatedHours = Math.max(0.5, allocatedHours);

        return {
          subjectName: sub.subjectName,
          allocatedHours,
          date: currentDate.toISOString().split('T')[0],
        };
      })
    );

    plan.push(...predictions);
  }

  // Sort by date ascending, then by allocated hours descending per day
  plan.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return b.allocatedHours - a.allocatedHours;
  });

  return plan;
}

module.exports = { generateStudyPlan };
