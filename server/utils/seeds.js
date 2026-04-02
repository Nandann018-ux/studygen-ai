const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');

/**
 * Seeds the user with a balanced academic profile.
 */
async function seedUserDashboard(userId) {
  try {
    console.log(`[Seeder] Bootstrapping neural nodes for ${userId}...`);

    // 1. Clear existing nodes (optional but cleaner for demo)
    await Subject.deleteMany({ userId });
    await StudySession.deleteMany({ userId });
    await StudyPlan.deleteMany({ userId });

    // 2. Provision core subjects (High-Fidelity academic profile)
    const subjects = await Subject.insertMany([
      {
        userId,
        subjectName: 'DSA',
        difficulty: 5,
        proficiency: 2,
        syllabusRemaining: 75,
        examDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
        previousScore: 65,
        hoursPerDay: 3
      },
      {
        userId,
        subjectName: 'FSD',
        difficulty: 4,
        proficiency: 3,
        syllabusRemaining: 50,
        examDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), 
        previousScore: 78,
        hoursPerDay: 2.5
      },
      {
        userId,
        subjectName: 'SESD',
        difficulty: 3,
        proficiency: 4,
        syllabusRemaining: 30,
        examDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), 
        previousScore: 82,
        hoursPerDay: 2
      },
      {
        userId,
        subjectName: 'MATHS',
        difficulty: 5,
        proficiency: 1,
        syllabusRemaining: 90,
        examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 
        previousScore: 45,
        hoursPerDay: 3.5
      }
    ]);

    // 3. Populate historical sessions for data charts (Last 5 days) 
    // Varying actual vs planned to create "Real" non-flat trends
    const sessions = [];
    const now = new Date();
    for(let i = 5; i >= 1; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        subjects.forEach((sub, sIdx) => {
            const baseHours = sub.hoursPerDay;
            const variance = (sIdx % 2 === 0 ? 0.3 : -0.2) * i; // Distinct variance for each subject
            sessions.push({
                userId,
                subjectId: sub._id,
                subjectName: sub.subjectName,
                plannedHours: baseHours,
                actualHours: Math.max(0, baseHours + variance),
                completion: 80 + (sIdx * 5),
                date
            });
        });
    }
    await StudySession.insertMany(sessions);

    console.log(`[Seeder] Provisioned ${subjects.length} subjects and ${sessions.length} sessions.`);
    return subjects;
  } catch (err) {
    console.error('[Seeder] Provisioning Error:', err.message);
    return null;
  }
}

module.exports = { seedUserDashboard };
