const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const planRoutes = require('./routes/plan.routes');
const sessionRoutes = require('./routes/studySession.routes');
const mlRoutes = require('./routes/ml.routes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/ml', mlRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint Not Found' });
});


app.use((err, req, res, next) => {
  console.error('\x1b[31m%s\x1b[0m', '!! Neural Server Error:', err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;