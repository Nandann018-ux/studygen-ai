const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');

/**
 * Seeds the user with a balanced academic profile.
 * Standardized on 'name' field for reliability.
 */
async function seedUserDashboard(userId) {
  try {
    console.log(`[Seeder] Bootstrapping neural nodes for ${userId}...`);

    // 1. Clear existing nodes (optional but cleaner for demo)
    await Subject.deleteMany({ userId });
    await StudySession.deleteMany({ userId });
    await StudyPlan.deleteMany({ userId });

    // 2. Provision core subjects (High-Fidelity academic profile with high variance)
    const subjects = await Subject.insertMany([
      {
        userId,
        name: 'Data Structures',
        difficulty: 5,
        proficiency: 2,
        syllabusRemaining: 75,
        examDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
        previousScore: 65,
        hoursPerDay: 4 // Varied from 3
      },
      {
        userId,
        name: 'Web Architecture',
        difficulty: 4,
        proficiency: 3,
        syllabusRemaining: 40, // Varied from 50
        examDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), 
        previousScore: 78,
        hoursPerDay: 2.5
      },
      {
        userId,
        name: 'Systems Design',
        difficulty: 3,
        proficiency: 4,
        syllabusRemaining: 20, // Varied from 30
        examDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), 
        previousScore: 82,
        hoursPerDay: 1.5 // Varied from 2
      },
      {
        userId,
        name: 'Engineering Maths',
        difficulty: 5,
        proficiency: 1,
        syllabusRemaining: 85, // Varied from 90
        examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 
        previousScore: 45,
        hoursPerDay: 5 // Varied from 3.5
      }
    ]);

    // 3. Populate historical sessions for data charts (Last 5 days) 
    const sessions = [];
    const now = new Date();
    for(let i = 5; i >= 1; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        subjects.forEach((sub, sIdx) => {
            const baseHours = sub.hoursPerDay || 2;
            const variance = (sIdx % 2 === 0 ? 0.4 : -0.3) * (i / 2); 
            sessions.push({
                userId,
                subjectId: sub._id,
                name: sub.name,
                plannedHours: baseHours,
                actualHours: Math.max(0.5, baseHours + variance),
                completion: Math.min(100, 70 + (sIdx * 8) + (i * 2)),
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
