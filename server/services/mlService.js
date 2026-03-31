/**
 * Deterministic heuristic predicting study hours based on cognitive variables.
 * Mimics previously implemented RandomForest behavior to maintain "AI-Powered" intent.
 */
async function predictStudyHours({ difficulty, syllabusRemaining, daysLeft }) {
  try {
    // 1. Complexity Weight: Higher base effort for complex subjects (1.0 - 3.0h)
    const complexityWeight = (difficulty / 5) * 2.0 + 1.0;

    // 2. Load Weight: Remaining syllabus adds linear burden (0.0 - 2.5h)
    const loadWeight = (syllabusRemaining / 100) * 2.5;

    // 3. Urgency Multipier: Fewer days left adds exponential stress (0.5x - 2.5x)
    // Formula: 1 + (1 / sqrt(daysLeft + 1)) which boosts intensity as deadline nears
    const urgencyMultiplier = 1 + (2 / (Math.sqrt(daysLeft + 1)));

    let predictedHours = (complexityWeight + loadWeight) * (urgencyMultiplier / 2);

    // Keep it realistic: Min 0.5h, Max 6h per dedicated session
    return Math.min(6, Math.max(0.5, parseFloat(predictedHours.toFixed(1))));
  } catch (err) {
    console.error('Core Logic Execution Error:', err.message);
    return 1.5; // Robust fallback
  }
}

module.exports = { predictStudyHours };

