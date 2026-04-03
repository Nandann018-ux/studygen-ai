const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');
const Subject = require('../models/Subject');

async function saveSession(req, res) {
  try {
    const { subjectId, name, subjectName, plannedHours, actualHours, completion, date, planId } = req.body;
    
    
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

    
    if (planId) {
      console.log(`[Session] Marking StudyPlan ${planId} as completed.`);
      const updatedPlan = await StudyPlan.findByIdAndUpdate(
        planId,
        { isCompleted: true },
        { new: true }
      );
      if (!updatedPlan) {
        console.warn(`[Session] WARNING: StudyPlan ${planId} not found in DB! Could not mark as completed.`);
      } else {
        console.log(`[Session] StudyPlan ${planId} marked isCompleted=${updatedPlan.isCompleted} successfully.`);
      }
    } else {
      console.warn('[Session] No planId provided – plan item will NOT be marked as completed.');
    }

    if (Number(completion) >= 100) {
      await Subject.findByIdAndUpdate(subjectId, { isCompleted: true });
    }

    try {
      const subject = await Subject.findById(subjectId);
      if (subject && subject.syllabusRemaining > 0) {
        const reduction = (Number(actualHours) * (Number(completion || 100) / 100)) * 2;
        const newSyllabusRemaining = Math.max(0, subject.syllabusRemaining - reduction);
        
        console.log(`[Neural Sync] Subject ${subject.name} progress: ${subject.syllabusRemaining}% -> ${newSyllabusRemaining.toFixed(1)}%`);
        await Subject.findByIdAndUpdate(subjectId, { syllabusRemaining: newSyllabusRemaining });
      }
    } catch (e) {
      console.warn("Subject progress sync failed:", e.message);
    }

    
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
