const StudySession = require('../models/StudySession');
const { runRetrainPipeline } = require('../services/mlService');

async function saveSession(req, res) {
  try {
    const { subjectId, subjectName, plannedHours, actualHours, completion, date } = req.body;
    
    if (!subjectId || !subjectName || plannedHours === undefined || actualHours === undefined) {
      return res.status(400).json({ message: 'Missing required session data' });
    }

    const newSession = await StudySession.create({
      userId: req.user.userId,
      subjectId,
      subjectName,
      plannedHours,
      actualHours,
      completion,
      date: date || new Date(),
    });

    // --- Automatic ML Retraining Trigger ---
    // Check total session count; trigger retraining every 50 sessions
    const totalSessions = await StudySession.countDocuments();
    if (totalSessions > 0 && totalSessions % 50 === 0) {
      console.log(`Threshold reached (${totalSessions} sessions). Triggering auto-retrain...`);
      runRetrainPipeline().catch(err => {
        console.error('Background Auto-Retrain Failed:', err.message);
      });
    }

    return res.status(201).json(newSession);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getSessions(req, res) {
  try {
    const sessions = await StudySession.find({ userId: req.user.userId }).sort({ date: -1 });
    return res.status(200).json(sessions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { saveSession, getSessions };
