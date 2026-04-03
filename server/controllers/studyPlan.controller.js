const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../utils/studyPlanGenerator');

async function generatePlan(req, res) {
  try {
    console.log("Generating study plan...");
    
    const subjects = await Subject.find({ userId: req.user.userId });
    
    if (subjects.length === 0) {
      console.log("[Generator] No active subjects. Aborting plan creation.");
      return res.status(200).json([]);
    }

    const planData = await generateStudyPlan(subjects);
    
    if (!planData || planData.length === 0) {
      return res.status(500).json({ message: "Neural engine failed to allocate time. Please try adding more subjects." });
    }

    
    await StudyPlan.deleteMany({ userId: req.user.userId });
    
    
    const plansToSave = planData.map((item) => ({
      userId: req.user.userId,
      subjectId: item.subjectId,
      name: item.name || item.subjectName,
      allocatedHours: Number(item.allocatedHours),
      reasons: item.reasons,
      date: item.date,
    }));
    
    const savedPlan = await StudyPlan.insertMany(plansToSave);
    return res.status(201).json(savedPlan);
  } catch (err) {
    console.error("Critical Plan Generation Error:", err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

async function getPlan(req, res) {
  try {
    const plan = await StudyPlan.find({ userId: req.user.userId }).sort({ date: 1 });
    return res.status(200).json(plan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { generatePlan, getPlan };
