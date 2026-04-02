const { spawn } = require('child_process');
const path = require('path');
const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');

/**
 * Helper to run the Python AI script for a specific task.
 */
function runAIScript(task, params) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'predict.py');
    const args = [scriptPath, '--task', task];

    // Map parameters to CLI flags
    if (params.difficulty) args.push('--difficulty', params.difficulty.toString());
    if (params.proficiency) args.push('--proficiency', params.proficiency.toString());
    if (params.syllabusRemaining) args.push('--syllabus', params.syllabusRemaining.toString());
    if (params.daysLeft) args.push('--days', params.daysLeft.toString());
    if (params.consistencyScore) args.push('--consistency', params.consistencyScore.toFixed(2));
    if (params.pastAvgHours) args.push('--avgHours', params.pastAvgHours.toFixed(1));
    if (params.previousScore) args.push('--prevScore', params.previousScore.toString());
    if (params.subjectName) args.push('--subject', params.subjectName);

    const pythonProcess = spawn('python3', args);
    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => (stdoutData += data.toString()));
    pythonProcess.stderr.on('data', (data) => (stderrData += data.toString()));

    const timeout = setTimeout(() => {
        pythonProcess.kill();
        resolve({ error: 'Timeout', fallback: true });
    }, 5000);

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error(`[AI Script Error] Task: ${task}, Code: ${code}. Stderr: ${stderrData.trim()}`);
        return resolve({ error: 'Exit status non-zero', fallback: true });
      }

      try {
        const result = JSON.parse(stdoutData.trim());
        resolve(result);
      } catch (parseErr) {
        console.error(`[AI Parse Error] Task: ${task}, Error: ${parseErr.message}. Raw: ${stdoutData}`);
        resolve({ error: 'Parse error', fallback: true });
      }
    });
  });
}

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
  return reasons.slice(0, 3);
}

/**
 * ML predictor for study hours.
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

  const result = await runAIScript('hours', {
    difficulty: safeDifficulty,
    syllabusRemaining: safeSyllabus,
    daysLeft: safeDays,
    consistencyScore,
    pastAvgHours
  });

  if (result.fallback || !result.predictedHours) {
    return {
      predictedHours: fallbackPredictor({ difficulty: safeDifficulty, syllabusRemaining: safeSyllabus, daysLeft: safeDays }),
      reasons: [...reasons, "Rule-based fallback active"]
    };
  }

  return {
    predictedHours: Math.min(20, Math.max(0.5, result.predictedHours)),
    reasons
  };
}

/**
 * Subject Level Classification (Weak/Medium/Strong)
 */
async function classifySubject(subjectData) {
  const result = await runAIScript('classify', subjectData);
  if (result.fallback || !result.level) {
    const diff = (subjectData.proficiency || 3) - (subjectData.difficulty || 3);
    if (diff <= -1) return "Weak";
    if (diff >= 1) return "Strong";
    return "Medium";
  }
  return result.level;
}

/**
 * Predicted Exam Score
 */
async function predictExamScore(subjectData) {
  const result = await runAIScript('score', subjectData);
  if (result.fallback || result.predictedScore === undefined) {
    const baseline = 70;
    const diffMod = ((subjectData.proficiency || 3) - (subjectData.difficulty || 3)) * 5;
    return Math.min(100, Math.max(0, baseline + diffMod));
  }
  return result.predictedScore;
}

/**
 * Generate AI-based study tips using NLP
 */
async function generateAITips(subjectName, difficulty) {
  const result = await runAIScript('tips', { subjectName, difficulty });
  if (result.fallback || !result.tips) {
    return [
      `Break down ${subjectName} into smaller modules.`,
      "Use active recall techniques for better retention.",
      "Schedule regular breaks to avoid cognitive fatigue."
    ];
  }
  return result.tips;
}

/**
 * Calculates long-term user performance insights.
 */
async function getUserInsights(userId) {
  const defaultInsights = {
    strongest: "N/A",
    weakest: "N/A",
    recentConsistency: 0,
    consistencyTrend: "0.0",
    improvement: "Start studying to see insights",
    chartData: []
  };

  try {
    const sessions = await StudySession.find({ userId }).sort({ date: 1 }).lean();
    
    // Proactive Fallback: If no sessions, find the "Weakest" based on difficulty
    if (sessions.length === 0) {
      const allSubjects = await Subject.find({ userId }).lean();
      if (allSubjects.length > 0) {
         // Sort by difficulty (desc) then examDate (asc)
         const prioritized = [...allSubjects].sort((a, b) => {
            if (b.difficulty !== a.difficulty) return (b.difficulty || 0) - (a.difficulty || 0);
            return new Date(a.examDate || 0) - new Date(b.examDate || 0);
         });
         return {
            ...defaultInsights,
            weakest: prioritized[0].subjectName,
            improvement: "Analyzing potential weak points based on syllabus complexity."
         };
      }
      return defaultInsights;
    }

    // 1. Consistency Trend (Last 5 vs Previous 5)
    const recent = sessions.slice(-5);
    const previous = sessions.slice(-10, -5);
    
    const calculateConsistency = (list) => {
       if (list.length === 0) return 0;
       const planned = list.reduce((s, h) => s + (h.plannedHours || 0), 0);
       const actual = list.reduce((s, h) => s + (h.actualHours || 0), 0);
       return planned > 0 ? (actual / planned) * 100 : 0;
    };

    const recentCons = calculateConsistency(recent);
    const prevCons = calculateConsistency(previous);
    
    // If no previous sessions, trend is 0. If prev was 0, it's 100% improvement if recent > 0
    let trend = 0;
    if (previous.length > 0) {
        trend = recentCons - prevCons;
    } else if (recent.length > 0) {
        trend = recentCons; // Baseline improvement
    }

    // 2. Strongest/Weakest subjects (Weighted toward recent performance)
    const allSubjects = await Subject.find({ userId }).lean();
    const subjectStats = {};
    
    // Initialize all subjects with baseline (using difficulty/proficiency as a start)
    allSubjects.forEach(sub => {
      const baseline = (sub.proficiency || 3) - (sub.difficulty || 3);
      subjectStats[sub.subjectName] = { score: baseline * 10, weight: 1.0 }; 
    });

    sessions.forEach((s, index) => {
      if (!subjectStats[s.subjectName]) subjectStats[s.subjectName] = { score: 0, weight: 0 };
      
      const recencyWeight = index > sessions.length * 0.7 ? 3 : 1;
      const sessionRatio = s.plannedHours > 0 ? (s.actualHours / s.plannedHours) : 1;
      
      subjectStats[s.subjectName].score += sessionRatio * 100 * recencyWeight;
      subjectStats[s.subjectName].weight += recencyWeight;
    });

    const statsArray = Object.entries(subjectStats).map(([name, stat]) => ({
      name,
      weightedRatio: stat.score / stat.weight
    }));

    const strongest = [...statsArray].sort((a, b) => b.weightedRatio - a.weightedRatio)[0].name;
    const weakest = [...statsArray].sort((a, b) => a.weightedRatio - b.weightedRatio)[0].name;

    // 3. Planned vs Actual data for charts (Last 7 active days)
    const dateMap = {};
    sessions.forEach(s => {
      if (!s.date) return;
      const d = new Date(s.date).toISOString().split('T')[0];
      if (!dateMap[d]) dateMap[d] = { date: d, planned: 0, actual: 0 };
      dateMap[d].planned += (s.plannedHours || 0);
      dateMap[d].actual += (s.actualHours || 0);
    });

    const chartData = Object.values(dateMap)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7);

    // 4. Growth Trend (Syllabus Completion over 4 weeks)
    const avgSyllabus = allSubjects.reduce((acc, s) => acc + (s.syllabusRemaining || 0), 0) / (allSubjects.length || 1);
    const growthTrend = [
        Math.max(0, (100 - avgSyllabus) * 0.2).toFixed(0),
        Math.max(0, (100 - avgSyllabus) * 0.5).toFixed(0),
        Math.max(0, (100 - avgSyllabus) * 0.8).toFixed(0),
        (100 - avgSyllabus).toFixed(0)
    ];

    return {
      strongest,
      weakest,
      recentConsistency: Math.round(recentCons),
      consistencyScore: Math.round(recentCons), // Explicitly for the UI card
      consistencyTrend: trend.toFixed(1),
      improvement: trend > 0 ? "Neural focus improving" : (trend < 0 ? "Cognitive fatigue detected" : "Analyzing baseline activity"),
      chartData,
      growthTrend
    };
  } catch (err) {
    console.error('Insights Error:', err.message);
    return defaultInsights;
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
