const Subject = require('../models/Subject');
async function addSubject(req, res) {
  try {
    const { 
      subjectName, 
      difficulty, 
      proficiency, 
      syllabusRemaining, 
      examDate,
      previousScore,
      hoursPerDay,
      revisionRequired 
    } = req.body;

    if (!subjectName) {
      return res.status(400).json({ message: 'subjectName is required' });
    }

    const newSubject = await Subject.create({
      userId: req.user.userId,
      subjectName,
      difficulty,
      proficiency,
      syllabusRemaining,
      examDate,
      previousScore,
      hoursPerDay,
      revisionRequired
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
module.exports = { addSubject, getSubjects };
