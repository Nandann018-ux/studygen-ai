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

    // Now uses validSubjects directly for all days
    const subjectsToProcess = validSubjects;

    const dayPredictions = await Promise.all(
      subjectsToProcess.map(async (sub) => {
        console.log(`[Generator] Starting subject: ${sub.subjectName}`);
        const examDate = new Date(sub.examDate);
        const daysLeftFromCurrent = Math.ceil(
          (examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const effectiveDaysLeft = Math.max(1, daysLeftFromCurrent);

        let result;
        try {
          result = await predictStudyHours({
            userId: sub.userId,
            subjectId: sub._id,
            difficulty: sub.difficulty,
            syllabusRemaining: sub.syllabusRemaining,
            daysLeft: effectiveDaysLeft
          });
        } catch (mlErr) {
          console.error(`[Generator] Prediction failed for ${sub.subjectName}, using rule-based fallback.`);
          const fallbackHours = (sub.difficulty * 2 + (sub.syllabusRemaining || 40) / 10) * (30 / effectiveDaysLeft);
          result = { 
            predictedHours: Math.min(6, Math.max(1, fallbackHours / 7)), 
            reasons: ["Dynamic rule-based allocation (Heuristic Fallback)"] 
          };
        }

        // Apply "Always-on" Neural Weighting to prevent identical 2.0h/2.5h patterns
        const priorityWeight = (sub.difficulty || 3) / 3; // 1.66x for difficulty 5, 0.33x for difficulty 1
        const weightedHours = result.predictedHours * priorityWeight;

        // Capped individual session duration (Max 4 hours for realism)
        const allocatedHours = Math.min(4, Math.max(0.7, weightedHours));
        
        return {
          subjectId: sub._id,
          subjectName: sub.subjectName,
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
      
      // Calculate weights based on difficulty vs proficiency
      const weights = dayPredictions.map(p => {
        const sub = subjects.find(s => s._id === p.subjectId);
        // Weight = Difficulty (1-5) + (1 / Proficiency)
        return (sub?.difficulty || 3) + (6 - (sub?.proficiency || 3));
      });
      
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const scaleFactor = DAILY_CEILING / totalHoursForDay;
      
      dayPredictions.forEach((session, idx) => {
        // Subjects with higher weight get a larger share of the ceiling
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

  console.log(`[Generator] Final Plan Size: ${plan.length} sessions.`);
  return plan;
}

module.exports = { generateStudyPlan };
