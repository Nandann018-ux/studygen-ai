const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const StudySession = require('../models/StudySession');
async function addSubject(req, res) {
  try {
    const { 
      name, 
      difficulty, 
      proficiency, 
      syllabusRemaining, 
      examDate,
      previousScore,
      hoursPerDay,
      revisionRequired 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const newSubject = await Subject.create({
      userId: req.user.userId,
      name,
      difficulty: Number(difficulty),
      proficiency: Number(proficiency),
      syllabusRemaining: Number(syllabusRemaining),
      examDate,
      previousScore: Number(previousScore),
      hoursPerDay: Number(hoursPerDay),
      revisionRequired: Boolean(revisionRequired)
    });
    return res.status(201).json(newSubject);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
async function getSubjects(req, res) {
  try {
    const subjects = await Subject.find({ userId: req.user.userId });
    return res.status(200).json(subjects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
async function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const { 
      name, 
      difficulty, 
      proficiency, 
      syllabusRemaining, 
      examDate,
      previousScore,
      hoursPerDay,
      revisionRequired 
    } = req.body;

    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { 
        name, 
        difficulty: Number(difficulty),
        proficiency: Number(proficiency),
        syllabusRemaining: Number(syllabusRemaining),
        examDate,
        previousScore: Number(previousScore),
        hoursPerDay: Number(hoursPerDay),
        revisionRequired: Boolean(revisionRequired)
      },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    return res.status(200).json(updatedSubject);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function deleteSubject(req, res) {
  try {
    const { id } = req.params;
    
    
    const deletedSubject = await Subject.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    
    await StudyPlan.deleteMany({ subjectId: id, userId: req.user.userId });
    await StudySession.deleteMany({ subjectId: id, userId: req.user.userId });

    return res.status(200).json({ message: 'Subject and associated study data deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { addSubject, getSubjects, updateSubject, deleteSubject };
