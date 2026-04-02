const { predictStudyHours } = require('../services/mlService');
async function generateStudyPlan(subjects, daysToPlan = 7) {
  const plan = [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  for (let dayOffset = 0; dayOffset < daysToPlan; dayOffset++) {
    const currentDate = new Date(startOfDay);
    currentDate.setDate(startOfDay.getDate() + dayOffset);
    const validSubjects = subjects.filter((sub) => {
      const examDate = new Date(sub.examDate);
      const daysLeftFromCurrent = Math.ceil(
        (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysLeftFromCurrent >= 0; 
    });
    if (validSubjects.length === 0) continue;
    const predictions = await Promise.all(
      validSubjects.map(async (sub) => {
        const examDate = new Date(sub.examDate);
        const daysLeftFromCurrent = Math.ceil(
          (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const effectiveDaysLeft = Math.max(1, daysLeftFromCurrent);
        const { predictedHours, reasons } = await predictStudyHours({
          userId: sub.userId,
          subjectId: sub._id,
          difficulty: sub.difficulty,
          syllabusRemaining: sub.syllabusRemaining,
          daysLeft: effectiveDaysLeft
        });
        const allocatedHours = Math.max(0.5, predictedHours);
        return {
          subjectId: sub._id,
          subjectName: sub.subjectName,
          allocatedHours,
          reasons,
          date: currentDate.toISOString().split('T')[0],
        };
      })
    );
    plan.push(...predictions);
  }
  plan.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return b.allocatedHours - a.allocatedHours;
  });
  return plan;
}
module.exports = { generateStudyPlan };
