const mongoose = require('mongoose');
const studyPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    subjectName: { type: String, required: true },
    allocatedHours: { type: Number, required: true },
    reasons: [String],
    date: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('StudyPlan', studyPlanSchema);
