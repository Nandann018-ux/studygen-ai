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
 * ML predictor for study hours.
 * Personalizes predictions using consistencyScore and pastAvgHours.
 */
async function predictStudyHours({ userId, subjectId, difficulty, syllabusRemaining, daysLeft }) {
  // 1. Sanitize Inputs
  const safeDifficulty = Number(difficulty) || 3;
  const safeSyllabus = Number(syllabusRemaining) || 0;
  const safeDays = Number(daysLeft) || 1;

  // 2. Fetch Personalized Features from MongoDB
  let consistencyScore = 1.0;
  let pastAvgHours = 2.0;

  try {
    if (userId && StudySession.find) {
      // consistencyScore: Global user ratio
      const userHistory = await StudySession.find({ userId }).lean();
      if (userHistory.length > 0) {
        const totalPlanned = userHistory.reduce((s, h) => s + (h.plannedHours || 0), 0);
        const totalActual = userHistory.reduce((s, h) => s + (h.actualHours || 0), 0);
        consistencyScore = totalPlanned > 0 ? totalActual / totalPlanned : 1.0;
        consistencyScore = Number(consistencyScore.toFixed(2));
      }

      // pastAvgHours: Subject specific
      if (subjectId) {
        const subjectHistory = await StudySession.find({ userId, subjectId }).lean();
        if (subjectHistory.length > 0) {
          pastAvgHours = subjectHistory.reduce((s, h) => s + (h.actualHours || 0), 0) / subjectHistory.length;
          pastAvgHours = Number(pastAvgHours.toFixed(1));
        }
      }
    }
  } catch (dbErr) {
    console.error('Error fetching ML features:', dbErr.message);
  }

  // 3. Inference with Python
  return new Promise((resolve) => {
    const fallback = () => resolve(fallbackPredictor({
      difficulty: safeDifficulty,
      syllabusRemaining: safeSyllabus,
      daysLeft: safeDays
    }));

    try {
      const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'predict.py');
      const pythonProcess = spawn('python3', [
        scriptPath,
        safeDifficulty.toString(),
        safeSyllabus.toString(),
        safeDays.toString(),
        consistencyScore.toString(),
        pastAvgHours.toString()
      ]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => (stdoutData += data.toString()));
      pythonProcess.stderr.on('data', (data) => (stderrData += data.toString()));

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.warn(`ML Prediction exited with code ${code}. Stderr: ${stderrData}`);
          return fallback();
        }

        try {
          const result = JSON.parse(stdoutData.trim());
          if (result.error) throw new Error(result.error);
          resolve(Math.min(20, Math.max(0.5, result.predictedHours)));
        } catch (parseErr) {
          console.error('ML Output Parse Error:', parseErr.message);
          fallback();
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('ML Child Process Startup Error:', err.message);
        fallback();
      });

    } catch (err) {
      console.error('Unexpected Inference Error:', err.message);
      fallback();
    }
  });
}

/**
 * Public trigger for auto-retraining.
 * Enforces production safety checks (Cooldown and Threshold).
 */
async function triggerAutoRetrain() {
  try {
    const now = Date.now();
    const timeSinceLast = now - lastRetrainTime;

    // Safety Check 1: Cooldown
    if (timeSinceLast < RETRAIN_COOLDOWN_MS) {
      console.log(`Retraining skipped: Cooldown still active (${Math.round((RETRAIN_COOLDOWN_MS - timeSinceLast) / 60000)}m left)`);
      return false;
    }

    // Safety Check 2: Minimum Sessions
    const totalSessions = await StudySession.countDocuments();
    if (totalSessions < 10 || totalSessions % MIN_SESSIONS_BETWEEN_RETRAINS !== 0) {
      // We only retrain at milestones (50, 100, 150...)
      return false;
    }

    console.log(`Safety conditions met. Triggering background retrain at ${totalSessions} sessions.`);
    
    // Non-blocking background retraining
    runRetrainPipeline().then(() => {
      lastRetrainTime = Date.now();
    }).catch(err => {
      console.error('Background ML Retrain Failed:', err.message);
    });

    return true;
  } catch (err) {
    console.error('Auto-Retrain Trigger Error:', err.message);
    return false;
  }
}

/**
 * Runs the ML retraining pipeline (Update Dataset -> Train Model).
 */
function runRetrainPipeline() {
  return new Promise((resolve, reject) => {
    const updateScript = path.join(__dirname, '..', '..', 'ml-service', 'update_dataset.py');
    const trainScript = path.join(__dirname, '..', '..', 'ml-service', 'train.py');

    // 1. Run Update Dataset (Append new records)
    const updateProcess = spawn('python3', [updateScript]);
    let updateError = '';

    updateProcess.stderr.on('data', (data) => (updateError += data.toString()));
    updateProcess.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Update Error: ${updateError}`));

      // 2. Run Training
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

module.exports = { predictStudyHours, runRetrainPipeline, triggerAutoRetrain };
