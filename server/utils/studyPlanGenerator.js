/**
 * Generates a rule-based study plan distributed across multiple days.
 * @param {Array} subjects - List of subjects to study.
 * @param {number} totalDailyHours - Total study hours available per day (default 4).
 * @param {number} daysToPlan - How many days to span in the generated plan.
 * @returns {Array} List of study plan sessions.
 */
function generateStudyPlan(subjects, totalDailyHours = 4, daysToPlan = 7) {
  const plan = [];

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < daysToPlan; dayOffset++) {
    const currentDate = new Date(startOfDay);
    currentDate.setDate(startOfDay.getDate() + dayOffset);

    // Calculate priority and adjust based on days left for the CURRENT loop day
    let totalPriority = 0;

    const dailySubjects = subjects
      .map((sub) => {
        let priority = sub.difficulty * 2 + sub.syllabusRemaining - sub.proficiency * 2;
        priority = Math.max(1, priority);

        const examDate = new Date(sub.examDate);
        const daysLeftFromCurrent = Math.ceil(
          (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Skip past exams
        if (daysLeftFromCurrent < 0) return null;

        const effectiveDaysLeft = Math.max(0.5, daysLeftFromCurrent);
        const adjustedPriority = priority / effectiveDaysLeft;

        totalPriority += adjustedPriority;

        return { subjectName: sub.subjectName, adjustedPriority };
      })
      .filter(Boolean);

    if (totalPriority === 0) continue;

    dailySubjects.forEach((stats) => {
      const ratio = stats.adjustedPriority / totalPriority;
      let allocatedHours = Math.round(ratio * totalDailyHours * 10) / 10;

      // Ensure minimum 0.5 hours per subject study session
      if (allocatedHours > 0 && allocatedHours < 0.5) {
        allocatedHours = 0.5;
      }

      if (allocatedHours >= 0.5) {
        plan.push({
          subjectName: stats.subjectName,
          allocatedHours,
          date: currentDate.toISOString().split('T')[0],
        });
      }
    });
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
