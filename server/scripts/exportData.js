const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studygen';
const EXPORT_PATH = path.join(__dirname, '../../ai-service/ml-service/data/study_data.csv');

async function exportToCSV() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for export...');

    const sessions = await StudySession.find().populate('subjectId');

    if (sessions.length === 0) {
      console.log('No sessions found to export.');
      process.exit(0);
    }

    const headers = ['difficulty', 'syllabusRemaining', 'daysLeft', 'actualHours'];
    const rows = sessions.map(s => {
      const sub = s.subjectId;
      if (!sub) return null;


      const daysLeft = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate) - new Date()) / (1000 * 60 * 60 * 24))) : 30;

      return [
        sub.difficulty || 3,
        sub.syllabusRemaining || 50,
        daysLeft,
        s.actualHours
      ].join(',');
    }).filter(row => row !== null);

    const csvContent = [headers.join(','), ...rows].join('\n');


    const dir = path.dirname(EXPORT_PATH);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(EXPORT_PATH, csvContent);
    console.log(`Successfully exported ${rows.length} records to ${EXPORT_PATH}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  }
}

exportToCSV();
