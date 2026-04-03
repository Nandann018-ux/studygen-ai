const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dailyStudyHours: { type: Number, default: 4 },
    avatar: { type: String, default: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Julian' },
  },
  { timestamps: true }
);
userSchema.pre('save', async function preSave() {
  if (!this.isModified('password')) return;
  if (typeof this.password === 'string' && this.password.startsWith('$2')) return;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(this.password, saltRounds);
  this.password = hashedPassword;
});
module.exports = mongoose.model('User', userSchema);
