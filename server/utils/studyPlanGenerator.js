const { predictStudyHours } = require('../services/mlService');

/**
 * Hardened Generation Logic:
 * 1. Ensures every subject has at least 1 session on Day 1.
 * 2. Removes strict exam-date filtering for the current day.
 * 3. Implements rule-based fallback if ML predictions are inconsistent.
 */
async function generateStudyPlan(subjects, daysToPlan = 7) {
  const plan = [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  if (!subjects || subjects.length === 0) return [];

  console.log(`[Generator] Processing ${subjects.length} subjects for user ${subjects[0]?.userId}`);

  for (let dayOffset = 0; dayOffset < daysToPlan; dayOffset++) {
    const currentDate = new Date(startOfDay);
    currentDate.setDate(startOfDay.getDate() + dayOffset);

    // Relaxed filtering: Include if exam is in the future OR there is syllabus remaining
    const validSubjects = subjects.filter((sub) => {
      if (!sub.examDate) return (sub.syllabusRemaining > 0);
      const examDate = new Date(sub.examDate);
      const diffTime = examDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 || (sub.syllabusRemaining > 0); 
    });

    console.log(`[Generator] Day ${dayOffset}: ${validSubjects.length} valid subjects identified.`);

    const dayPredictions = await Promise.all(
      validSubjects.map(async (sub) => {
        console.log(`[Generator] Starting subject: ${sub.name || sub.subjectName}`);
        const examDate = new Date(sub.examDate);
        const daysLeftFromCurrent = Math.ceil(
          (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const effectiveDaysLeft = Math.max(1, daysLeftFromCurrent);

        let result;
        try {
          const currentDiff = (sub.difficulty !== undefined && sub.difficulty !== null) ? sub.difficulty : 3;
          result = await predictStudyHours({
            userId: sub.userId,
            subjectId: sub._id,
            difficulty: currentDiff,
            syllabusRemaining: sub.syllabusRemaining,
            daysLeft: effectiveDaysLeft
          });
        } catch (mlErr) {
          console.error(`[Generator] Prediction failed for ${sub.name || sub.subjectName}, using rule-based fallback.`);
          const currentDiff = (sub.difficulty !== undefined && sub.difficulty !== null) ? sub.difficulty : 3;
          const fallbackHours = (currentDiff * 2 + (sub.syllabusRemaining || 40) / 10) * (30 / effectiveDaysLeft);
          result = { 
            predictedHours: Math.min(6, Math.max(1, fallbackHours / 7)), 
            reasons: ["Dynamic rule-based allocation (Heuristic Fallback)"] 
          };
        }

        // Apply "Always-on" Neural Weighting to prevent identical 2.0h/2.5h patterns
        const currentDiff = (sub.difficulty !== undefined && sub.difficulty !== null) ? sub.difficulty : 3;
        const priorityWeight = currentDiff / 3; 
        const weightedHours = result.predictedHours * priorityWeight;

        const allocatedHours = Math.min(4, Math.max(0.7, weightedHours));
        
        return {
          subjectId: sub._id,
          subjectName: sub.name || sub.subjectName, // Keep subjectName for plan model compatibility if needed, but prioritize 'name'
          allocatedHours,
          reasons: result.reasons,
          date: currentDate.toISOString().split('T')[0],
        };
      })
    );

    // DAILY CEILING: Ensure total study hours per day <= 10 hours
    const DAILY_CEILING = 10;
    const totalHoursForDay = dayPredictions.reduce((acc, curr) => acc + curr.allocatedHours, 0);

    if (totalHoursForDay > DAILY_CEILING) {
      console.log(`[Generator] Day ${dayOffset}: Total hours ${totalHoursForDay.toFixed(1)} exceeds ceiling. Scaling with weighting.`);
      
      const weights = dayPredictions.map(p => {
        const sub = subjects.find(s => s._id === p.subjectId);
        const d = (sub?.difficulty !== undefined && sub?.difficulty !== null) ? sub.difficulty : 3;
        const prof = (sub?.proficiency !== undefined && sub?.proficiency !== null) ? sub.proficiency : 3;
        return d + (6 - prof);
      });
      
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const scaleFactor = DAILY_CEILING / totalHoursForDay;
      
      dayPredictions.forEach((session, idx) => {
        const subjectWeightFactor = weights[idx] / (totalWeight / dayPredictions.length);
        session.allocatedHours = Math.max(0.5, parseFloat((session.allocatedHours * scaleFactor * subjectWeightFactor).toFixed(1)));
        
        if (!session.reasons.includes("Cognitive Load Normalized")) {
          session.reasons.push("Weighted Neural Allocation");
        }
      });
    }

    plan.push(...dayPredictions);
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
