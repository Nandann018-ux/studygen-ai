/**
 * Generates a rule-based study plan.
 * @param {Array} subjects - List of subjects to study.
 * @param {number} totalDailyHours - Total study hours available per day (default 4).
 * @returns {Array} List of study plan sessions.
 */
function generateStudyPlan(subjects, totalDailyHours = 4) {
  const plan = [];

  // Use today's date for days left calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalPriority = 0;

  // 1. Calculate priority and days left
  const mappedSubjects = subjects
    .map((sub) => {
      // Calculate priority score
      let priority = sub.difficulty * 2 + sub.syllabusRemaining - sub.proficiency * 2;
      
      // Ensure priority is at least 1 so every subject gets some time (or ignore negative priorities)
      priority = Math.max(1, priority);

      // Calculate days left
      const examDate = new Date(sub.examDate);
      const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

      // Skip past exams
      if (daysLeft < 0) return null;

      // The closer the exam, the higher the weight (priority / daysLeft)
      // If daysLeft is 0 (exam today), treat as 0.5 to give highest priority
      const effectiveDaysLeft = Math.max(0.5, daysLeft);
      const adjustedPriority = priority / effectiveDaysLeft;

      totalPriority += adjustedPriority;

      return {
        subjectName: sub.subjectName,
        adjustedPriority,
        daysLeft,
      };
    })
    .filter(Boolean);

  if (totalPriority === 0) return plan;

  // 2. Allocate study hours: more priority → more hours
  mappedSubjects.forEach((stats) => {
    // Determine fraction of total hours
    const ratio = stats.adjustedPriority / totalPriority;
    
    // Allocate hours and round to 1 decimal place
    let allocatedHours = Math.round(ratio * totalDailyHours * 10) / 10;

    if (allocatedHours > 0) {
      plan.push({
        subjectName: stats.subjectName,
        allocatedHours,
        date: today.toISOString().split('T')[0], // YYYY-MM-DD
      });
    }
  });

  // Sort by allocated hours descending
  plan.sort((a, b) => b.allocatedHours - a.allocatedHours);

  return plan;
}

module.exports = { generateStudyPlan };
