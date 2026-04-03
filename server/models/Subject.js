const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5 },
    proficiency: { type: Number, min: 1, max: 5 },
    syllabusRemaining: { type: Number, default: 0 },
    examDate: { type: Date },
    previousScore: { type: Number, default: 0 },
    hoursPerDay: { type: Number, default: 2 },
    revisionRequired: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Subject', subjectSchema);
