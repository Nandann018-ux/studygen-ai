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

    // Preserve completed plans — only delete incomplete ones
    const completedPlans = await StudyPlan.find({ 
      userId: req.user.userId, 
      isCompleted: true 
    });
    
    console.log(`[Generator] Preserving ${completedPlans.length} completed plan items.`);
    
    // Delete only INCOMPLETE plans
    await StudyPlan.deleteMany({ userId: req.user.userId, isCompleted: false });
    
    // Build a set of completed (subjectId + date) combos so we don't create duplicates
    const completedKeys = new Set(
      completedPlans.map(p => {
        const dateStr = p.date ? p.date.toISOString().split('T')[0] : '';
        return `${p.subjectId}_${dateStr}`;
      })
    );
    
    // Filter out any new plan items that would duplicate a completed one
    const plansToSave = planData
      .filter((item) => {
        const dateStr = typeof item.date === 'string' 
          ? item.date.split('T')[0] 
          : new Date(item.date).toISOString().split('T')[0];
        const key = `${item.subjectId}_${dateStr}`;
        if (completedKeys.has(key)) {
          console.log(`[Generator] Skipping ${item.name || item.subjectName} on ${dateStr} — already completed.`);
          return false;
        }
        return true;
      })
      .map((item) => ({
        userId: req.user.userId,
        subjectId: item.subjectId,
        name: item.name || item.subjectName,
        allocatedHours: Number(item.allocatedHours),
        reasons: item.reasons,
        date: item.date,
      }));
    
    let savedPlan = [];
    if (plansToSave.length > 0) {
      savedPlan = await StudyPlan.insertMany(plansToSave);
    }
    
    // Return ALL plans (completed + newly generated) 
    const allPlans = await StudyPlan.find({ userId: req.user.userId }).sort({ date: 1 });
    return res.status(201).json(allPlans);
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

async function markComplete(req, res) {
  try {
    const { id } = req.params;
    const updatedPlan = await StudyPlan.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isCompleted: true },
      { new: true }
    );
    
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan item not found.' });
    }
    
    console.log(`[Plan] Marked plan ${id} (${updatedPlan.name}) as completed.`);
    return res.status(200).json(updatedPlan);
  } catch (err) {
    console.error("[Plan] Mark complete error:", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { generatePlan, getPlan, markComplete };
