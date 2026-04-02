const { 
  runRetrainPipeline, 
  getUserInsights, 
  classifySubject, 
  predictExamScore, 
  generateAITips 
} = require('../services/mlService');
const Subject = require('../models/Subject');
const { seedUserDashboard } = require('../utils/seeds');

/**
 * Manually trigger the ML Model retraining pipeline.
 */
exports.retrainModel = async (req, res) => {
  try {
    const result = await runRetrainPipeline();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Retraining failed', error: err.message });
  }
};

const StudyPlan = require('../models/StudyPlan');

/**
 * Fetch ML-driven user insights and performance trends.
 */
exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    let seededSubjects = null;
    let seededPlan = null;
    
    // Proactive Seeding: If no subjects exist, initialize demo profile
    const subjectCount = await Subject.countDocuments({ userId });
    if (subjectCount === 0) {
        console.log(`[Neural Engine] No subject nodes for ${userId}. Bootstrapping demo data.`);
        seededSubjects = await seedUserDashboard(userId);
        
        // After seeding, trigger an initial plan generation to fill the dashboard
        const { generateStudyPlan } = require('../utils/studyPlanGenerator');
        const planData = await generateStudyPlan(seededSubjects);
        const plansToSave = planData.map(item => ({
            userId,
            subjectId: item.subjectId,
            subjectName: item.subjectName,
            allocatedHours: item.allocatedHours,
            reasons: item.reasons,
            date: item.date
        }));
        seededPlan = await StudyPlan.insertMany(plansToSave);
    }

    const insights = await getUserInsights(userId);
    
    // HEURISTIC RESET: If the plan is flat (identically 17.5h) or legacy, refresh it
    const currentPlan = await StudyPlan.find({ userId });
    const isFlat = currentPlan.length > 0 && currentPlan.every(p => p.allocatedHours === currentPlan[0].allocatedHours);
    const isWeighted = currentPlan.some(p => p.reasons.includes("Weighted Neural Allocation"));
    
    if (seededSubjects === null && (isFlat || !isWeighted) && subjectCount > 0) {
        console.log(`[Neural Engine] Flat study pattern detected for ${userId}. Optimizing distribution...`);
        const allSubs = await Subject.find({ userId });
        const { generateStudyPlan } = require('../utils/studyPlanGenerator');
        const planData = await generateStudyPlan(allSubs);
        
        await StudyPlan.deleteMany({ userId });
        const plansToSave = planData.map(item => ({
            userId,
            subjectId: item.subjectId,
            subjectName: item.subjectName,
            allocatedHours: item.allocatedHours,
            reasons: item.reasons,
            date: item.date
        }));
        seededPlan = await StudyPlan.insertMany(plansToSave);
    }

    // Return unified payload if seeded/regenerated, otherwise standard insights
    res.json({
        ...insights,
        seededSubjects: seededSubjects,
        seededPlan: seededPlan
    });
  } catch (err) {
    console.error('Insights Controller Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch insights' });
  }
};

/**
 * Get subject classification (Weak/Medium/Strong)
 */
exports.getClassification = async (req, res) => {
  try {
    const level = await classifySubject(req.body);
    res.json({ level });
  } catch (err) {
    res.status(500).json({ message: 'Classification failed' });
  }
};

/**
 * Get predicted exam score
 */
exports.getScorePrediction = async (req, res) => {
  try {
    const score = await predictExamScore(req.body);
    res.json({ predictedScore: score });
  } catch (err) {
    res.status(500).json({ message: 'Score prediction failed' });
  }
};

/**
 * Get AI Study Tips
 */
exports.getStudyTips = async (req, res) => {
  try {
    const { subjectName, difficulty } = req.body;
    const tips = await generateAITips(subjectName, difficulty);
    res.json({ tips });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate tips' });
  }
};
