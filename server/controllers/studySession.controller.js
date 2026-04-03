const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');

async function saveSession(req, res) {
  try {
    const { subjectId, name, subjectName, plannedHours, actualHours, completion, date, planId } = req.body;
    
    // Support both 'name' and 'subjectName' for transition period, then use 'name'
    const finalName = name || subjectName;

    if (!subjectId || !finalName || plannedHours === undefined || actualHours === undefined) {
      return res.status(400).json({ message: 'Missing required session data: subjectId, name, and hours are mandatory.' });
    }

    const newSession = await StudySession.create({
      userId: req.user.userId,
      subjectId,
      name: finalName,
      plannedHours: Number(plannedHours),
      actualHours: Number(actualHours),
      completion: Number(completion || 0),
      date: date || new Date(),
    });

    // Mark the corresponding study plan entry as completed if planId is provided
    if (planId) {
      console.log(`[Session] Marking StudyPlan ${planId} as completed.`);
      await StudyPlan.findByIdAndUpdate(planId, { isCompleted: true });
    }

    // --- Automatic ML Retrain Trigger ---
    try {
      const { triggerAutoRetrain } = require('../services/mlService');
      if (triggerAutoRetrain) triggerAutoRetrain();
    } catch (e) {
      console.warn("ML Retrain trigger skipped:", e.message);
    }

    return res.status(201).json(newSession);
  } catch (err) {
    console.error("[Session Controller] Save Error:", err);
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
