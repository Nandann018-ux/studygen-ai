const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function preSave() {
  if (!this.isModified('password')) return;

  // If controller already hashed the password, avoid hashing again.
  // bcrypt hashes typically start with "$2a$", "$2b$", or "$2y$".
  if (typeof this.password === 'string' && this.password.startsWith('$2')) return;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(this.password, saltRounds);
  this.password = hashedPassword;
});

module.exports = mongoose.model('User', userSchema);

