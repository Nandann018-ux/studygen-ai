const { 
  runRetrainPipeline, 
  getUserInsights, 
  classifySubject, 
  predictExamScore, 
  generateAITips 
} = require('../services/mlService');
const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');


exports.retrainModel = async (req, res) => {
  try {
    const result = await runRetrainPipeline();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Retraining failed', error: err.message });
  }
};


exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    
    const insights = await getUserInsights(userId);
    
    const subjectCount = await Subject.countDocuments({ userId });
    
    
    if (subjectCount === 0) {
        await StudyPlan.deleteMany({ userId });
        await StudySession.deleteMany({ userId });
        return res.json(insights);
    }

    const currentPlan = await StudyPlan.find({ userId });
    const isWeighted = currentPlan.some(p => p.reasons && p.reasons.includes("Weighted Neural Allocation"));
    
    if (!isWeighted && subjectCount > 0) {
        console.log(`[Neural Engine] Legacy or flat study pattern detected for ${userId}. Optimizing distribution...`);
        const allSubs = await Subject.find({ userId });
        const { generateStudyPlan } = require('../utils/studyPlanGenerator');
        const planData = await generateStudyPlan(allSubs);
        
        await StudyPlan.deleteMany({ userId });
        const plansToSave = planData.map(item => ({
            userId,
            subjectId: item.subjectId,
            name: item.name || item.subjectName,
            allocatedHours: Number(item.allocatedHours),
            reasons: item.reasons,
            date: item.date
        }));
        await StudyPlan.insertMany(plansToSave);
    }

    res.json({
        ...insights
    });
  } catch (err) {
    console.error('Insights Controller Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch insights' });
  }
};


exports.getClassification = async (req, res) => {
  try {
    const level = await classifySubject(req.body);
    res.json({ level });
  } catch (err) {
    res.status(500).json({ message: 'Classification failed' });
  }
};


exports.getScorePrediction = async (req, res) => {
  try {
    const score = await predictExamScore(req.body);
    res.json({ predictedScore: score });
  } catch (err) {
    res.status(500).json({ message: 'Score prediction failed' });
  }
};


exports.getStudyTips = async (req, res) => {
  try {
    const { name, subjectName, difficulty } = req.body;
    const tips = await generateAITips(name || subjectName, difficulty);
    res.json({ tips });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate tips' });
  }
};
