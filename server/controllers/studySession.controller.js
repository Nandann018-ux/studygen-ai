const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');
const { runRetrainPipeline } = require('../services/mlService');

async function saveSession(req, res) {
  try {
    const { subjectId, subjectName, plannedHours, actualHours, completion, date, planId } = req.body;
    
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

    // Mark the corresponding study plan entry as completed if planId is provided
    if (planId) {
      console.log(`[Session] Marking StudyPlan ${planId} as completed.`);
      await StudyPlan.findByIdAndUpdate(planId, { isCompleted: true });
    }

    // --- Automatic ML Retraining Trigger ---
    // Offload safety checks and background execution to the service
    const { triggerAutoRetrain } = require('../services/mlService');
    triggerAutoRetrain();

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
