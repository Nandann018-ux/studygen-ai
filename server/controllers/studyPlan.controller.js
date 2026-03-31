const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../utils/studyPlanGenerator');
async function generatePlan(req, res) {
  try {
    const subjects = await Subject.find({ userId: req.user.userId });
    const plan = await generateStudyPlan(subjects);
    await StudyPlan.deleteMany({ userId: req.user.userId });
    const plansToSave = plan.map((item) => ({
      userId: req.user.userId,
      subjectName: item.subjectName,
      allocatedHours: item.allocatedHours,
      date: item.date,
    }));
    const savedPlan = await StudyPlan.insertMany(plansToSave);
    return res.status(201).json(savedPlan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
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
