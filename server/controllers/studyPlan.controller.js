const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../utils/studyPlanGenerator');
async function generatePlan(req, res) {
  try {
    console.log("Generating study plan...");
    console.log("Generate plan API hit for user:", req.user.userId);
    
    let subjects = await Subject.find({ userId: req.user.userId });
    
    // TASK 7: Automatic Seeding if no subjects exist
    if (subjects.length === 0) {
      console.log("No subjects found. Seeding default subjects for user...");
      const defaultSubjects = [
        { 
          userId: req.user.userId, 
          subjectName: 'Data Structures & Algorithms', 
          difficulty: 4, 
          proficiency: 2, 
          syllabusRemaining: 80, 
          examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        },
        { 
          userId: req.user.userId, 
          subjectName: 'Database Management Systems', 
          difficulty: 3, 
          proficiency: 3, 
          syllabusRemaining: 60, 
          examDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) 
        },
        { 
          userId: req.user.userId, 
          subjectName: 'Operating Systems', 
          difficulty: 3, 
          proficiency: 4, 
          syllabusRemaining: 50, 
          examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
        }
      ];
      subjects = await Subject.insertMany(defaultSubjects);
      console.log(`Successfully seeded ${subjects.length} default subjects.`);
    }

    const plan = await generateStudyPlan(subjects);
    
    if (!plan || plan.length === 0) {
      console.error("Generator returned 0 sessions even after seeding.");
      return res.status(500).json({ message: "Neural engine failed to allocate time. Please try adding more subjects." });
    }

    // Clear existing plan
    await StudyPlan.deleteMany({ userId: req.user.userId });
    
    // Process and save the new plan
    const plansToSave = plan.map((item) => ({
      userId: req.user.userId,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      allocatedHours: item.allocatedHours,
      reasons: item.reasons,
      date: item.date,
    }));
    
    const savedPlan = await StudyPlan.insertMany(plansToSave);
    console.log(`Plan successfully generated and saved: ${savedPlan.length} sessions.`);
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
