const { spawn } = require('child_process');
const path = require('path');
const StudySession = require('../models/StudySession');

// --- Production Safety State ---
let lastRetrainTime = 0;
const RETRAIN_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const MIN_SESSIONS_BETWEEN_RETRAINS = 50;

/**
 * Heuristic fallback predictor (deterministic rule-based logic).
 */
function fallbackPredictor({ difficulty, syllabusRemaining, daysLeft }) {
  try {
    const complexityWeight = (difficulty / 5) * 2.0 + 1.0;
    const loadWeight = (syllabusRemaining / 100) * 2.5;
    const urgencyMultiplier = 1 + (2 / (Math.sqrt(daysLeft + 1)));
    
    let predictedHours = (complexityWeight + loadWeight) * (urgencyMultiplier / 2);
    return Math.min(6, Math.max(0.5, parseFloat(predictedHours.toFixed(1))));
  } catch (err) {
    return 1.5;
  }
}

/**
 * Generates human-readable reasoning for the ML prediction.
 */
function generateReasoning({ difficulty, syllabusRemaining, daysLeft, consistencyScore, pastAvgHours }) {
  const reasons = [];
  
  if (difficulty >= 4) reasons.push("Prioritizing due to high subject complexity");
  if (daysLeft <= 3) reasons.push("Urgent session: Exam is approaching rapidly");
  else if (daysLeft <= 7) reasons.push("Optimizing focus for upcoming deadline");
  
  if (syllabusRemaining >= 70) reasons.push("Extended block for heavy syllabus load");
  if (consistencyScore < 0.85) reasons.push("Adjusted for your recent focus consistency");
  if (pastAvgHours > 3.5) reasons.push("Matching your historical deep-work pace");
  
  if (reasons.length === 0) reasons.push("Standard cognitive load optimization");
  
  return reasons.slice(0, 3); // Return top 3 reasons
}

/**
 * ML predictor for study hours.
 * Returns { predictedHours, reasons }.
 */
async function predictStudyHours({ userId, subjectId, difficulty, syllabusRemaining, daysLeft }) {
  const safeDifficulty = Number(difficulty) || 3;
  const safeSyllabus = Number(syllabusRemaining) || 0;
  const safeDays = Number(daysLeft) || 1;

  let consistencyScore = 1.0;
  let pastAvgHours = 2.0;

  try {
    if (userId && StudySession.find) {
      const userHistory = await StudySession.find({ userId }).lean();
      if (userHistory.length > 0) {
        const totalPlanned = userHistory.reduce((s, h) => s + (h.plannedHours || 0), 0);
        const totalActual = userHistory.reduce((s, h) => s + (h.actualHours || 0), 0);
        consistencyScore = totalPlanned > 0 ? (totalActual / totalPlanned) : 1.0;
      }
      if (subjectId) {
        const subjectHistory = await StudySession.find({ userId, subjectId }).lean();
        if (subjectHistory.length > 0) {
          pastAvgHours = subjectHistory.reduce((s, h) => s + (h.actualHours || 0), 0) / subjectHistory.length;
        }
      }
    }
  } catch (dbErr) {
    console.error('Error fetching ML features:', dbErr.message);
  }

  const reasons = generateReasoning({ 
    difficulty: safeDifficulty, 
    syllabusRemaining: safeSyllabus, 
    daysLeft: safeDays,
    consistencyScore,
    pastAvgHours
  });

  return new Promise((resolve) => {
    const fallback = () => resolve({
      predictedHours: fallbackPredictor({ difficulty: safeDifficulty, syllabusRemaining: safeSyllabus, daysLeft: safeDays }),
      reasons: [...reasons, "Rule-based fallback active"]
    });

    try {
      const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'predict.py');
      const pythonProcess = spawn('python3', [
        scriptPath,
        safeDifficulty.toString(),
        safeSyllabus.toString(),
        safeDays.toString(),
        consistencyScore.toFixed(2),
        pastAvgHours.toFixed(1)
      ]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => (stdoutData += data.toString()));
      pythonProcess.stderr.on('data', (data) => (stderrData += data.toString()));

      pythonProcess.on('close', (code) => {
        if (code !== 0) return fallback();

        try {
          const result = JSON.parse(stdoutData.trim());
          if (result.error) throw new Error(result.error);
          resolve({
            predictedHours: Math.min(20, Math.max(0.5, result.predictedHours)),
            reasons
          });
        } catch (parseErr) {
          fallback();
        }
      });

      pythonProcess.on('error', () => fallback());
    } catch (err) {
      fallback();
    }
  });
}

/**
 * Calculates long-term user performance insights.
 */
async function getUserInsights(userId) {
  try {
    const sessions = await StudySession.find({ userId }).sort({ date: 1 }).lean();
    if (sessions.length === 0) return null;

    // 1. Consistency Trend (Last 5 vs Previous 5)
    const recent = sessions.slice(-5);
    const previous = sessions.slice(-10, -5);
    
    const calculateConsistency = (list) => {
       if (list.length === 0) return 0;
       const planned = list.reduce((s, h) => s + h.plannedHours, 0);
       const actual = list.reduce((s, h) => s + h.actualHours, 0);
       return planned > 0 ? (actual / planned) * 100 : 0;
    };

    const recentCons = calculateConsistency(recent);
    const prevCons = calculateConsistency(previous);
    const trend = recentCons - prevCons;

    // 2. Strongest/Weakest subjects
    const subjectStats = {};
    sessions.forEach(s => {
      if (!subjectStats[s.subjectName]) subjectStats[s.subjectName] = { total: 0, comp: 0, count: 0 };
      subjectStats[s.subjectName].total += s.plannedHours;
      subjectStats[s.subjectName].comp += s.actualHours;
      subjectStats[s.subjectName].count++;
    });

    const statsArray = Object.entries(subjectStats).map(([name, stat]) => ({
      name,
      ratio: stat.total > 0 ? stat.comp / stat.total : 0,
      avgCompletion: stat.count > 0 ? stat.comp / stat.count : 0
    }));

    if (statsArray.length === 0) return null;

    const strongest = [...statsArray].sort((a, b) => b.ratio - a.ratio)[0].name;
    const weakest = [...statsArray].sort((a, b) => a.ratio - b.ratio)[0].name;

    // 3. Planned vs Actual data for charts
    // Aggregate by date
    const dateMap = {};
    sessions.slice(-20).forEach(s => {
      const d = s.date.toISOString().split('T')[0];
      if (!dateMap[d]) dateMap[d] = { date: d, planned: 0, actual: 0 };
      dateMap[d].planned += s.plannedHours;
      dateMap[d].actual += s.actualHours;
    });

    const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

    return {
      strongest,
      weakest,
      recentConsistency: Math.round(recentCons),
      consistencyTrend: trend.toFixed(1),
      improvement: trend > 0 ? "Neural focus improving" : (trend < 0 ? "Cognitive fatigue detected" : "Steady performance"),
      chartData
    };
  } catch (err) {
    console.error('Insights Error:', err.message);
    return null;
  }
}

/**
 * Public trigger for auto-retraining.
 */
async function triggerAutoRetrain() {
  try {
    const now = Date.now();
    const timeSinceLast = now - lastRetrainTime;
    if (timeSinceLast < RETRAIN_COOLDOWN_MS) return false;

    const totalSessions = await StudySession.countDocuments();
    if (totalSessions < 10 || totalSessions % MIN_SESSIONS_BETWEEN_RETRAINS !== 0) return false;

    runRetrainPipeline().then(() => {
      lastRetrainTime = Date.now();
    }).catch(err => console.error('Background ML Retrain Failed:', err.message));

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Runs the ML retraining pipeline.
 */
function runRetrainPipeline() {
  return new Promise((resolve, reject) => {
    const updateScript = path.join(__dirname, '..', '..', 'ml-service', 'update_dataset.py');
    const trainScript = path.join(__dirname, '..', '..', 'ml-service', 'train.py');

    const updateProcess = spawn('python3', [updateScript]);
    let updateError = '';

    updateProcess.stderr.on('data', (data) => (updateError += data.toString()));
    updateProcess.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Update Error: ${updateError}`));

      const trainProcess = spawn('python3', [trainScript]);
      let trainOutput = '';
      let trainError = '';

      trainProcess.stdout.on('data', (data) => (trainOutput += data.toString()));
      trainProcess.stderr.on('data', (data) => (trainError += data.toString()));

      trainProcess.on('close', (trainCode) => {
        if (trainCode !== 0) return reject(new Error(`Train Error: ${trainError}`));
        resolve({ message: 'Model updated', output: trainOutput.trim() });
      });
    });
  });
}

module.exports = { predictStudyHours, runRetrainPipeline, triggerAutoRetrain, getUserInsights };
