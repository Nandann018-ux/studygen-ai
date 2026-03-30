const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectName: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5 },
    proficiency: { type: Number, min: 1, max: 5 },
    syllabusRemaining: { type: Number },
    examDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
