const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    name: { type: String, required: true },
    plannedHours: { type: Number, required: true },
    actualHours: { type: Number, required: true },
    completion: { type: Number, min: 0, max: 100, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
