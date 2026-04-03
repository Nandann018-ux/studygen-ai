const { spawn } = require('child_process');
const path = require('path');
const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');


function runAIScript(task, params) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', '..', 'ml-service', 'predict.py');
    const args = [scriptPath, '--task', task];


    if (params.difficulty !== undefined) args.push('--difficulty', params.difficulty.toString());
    if (params.proficiency !== undefined) args.push('--proficiency', params.proficiency.toString());
    if (params.syllabusRemaining !== undefined) args.push('--syllabus', params.syllabusRemaining.toString());
    if (params.daysLeft !== undefined) args.push('--days', params.daysLeft.toString());
    if (params.consistencyScore !== undefined) args.push('--consistency', params.consistencyScore.toFixed(2));
    if (params.pastAvgHours !== undefined) args.push('--avgHours', params.pastAvgHours.toFixed(1));
    if (params.previousScore !== undefined) args.push('--prevScore', params.previousScore.toString());
    if (params.name || params.subjectName) args.push('--subject', params.name || params.subjectName);

    const pythonProcess = spawn('python3', args);
    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => (stdoutData += data.toString()));
    pythonProcess.stderr.on('data', (data) => (stderrData += data.toString()));

    const timeout = setTimeout(() => {
        pythonProcess.kill();
        resolve({ error: 'Timeout', fallback: true });
    }, 5000);

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error(`[AI Script Error] Task: ${task}, Code: ${code}. Stderr: ${stderrData.trim()}`);
        return resolve({ error: 'Exit status non-zero', fallback: true });
      }

      try {
        const result = JSON.parse(stdoutData.trim());
        resolve(result);
      } catch (parseErr) {
        console.error(`[AI Parse Error] Task: ${task}, Error: ${parseErr.message}. Raw: ${stdoutData}`);
        resolve({ error: 'Parse error', fallback: true });
      }
    });
  });
}


function fallbackPredictor({ difficulty, syllabusRemaining, daysLeft }) {
  try {
    const complexityWeight = (difficulty / 5) * 2.0 + 1.0;
    const loadWeight = (syllabusRemaining / 100) * 2.5;
    const urgencyMultiplier = 1 + (2 / (Math.sqrt(daysLeft + 1)));

    let predictedHours = (complexityWeight + loadWeight) * (urgencyMultiplier / 2);
    return Math.min(6, Math.max(0.5, parseFloat(predictedHours.toFixed(1))));
  } catch (err) {
    return 1.5;
  }
}


function generateReasoning({ difficulty, syllabusRemaining, daysLeft, consistencyScore, pastAvgHours }) {
  const reasons = [];
  if (difficulty >= 4) reasons.push("Prioritizing due to high subject complexity");
  if (daysLeft <= 3) reasons.push("Urgent session: Exam is approaching rapidly");
  else if (daysLeft <= 7) reasons.push("Optimizing focus for upcoming deadline");
  if (syllabusRemaining >= 70) reasons.push("Extended block for heavy syllabus load");
  if (consistencyScore < 0.85) reasons.push("Adjusted for your recent focus consistency");
  if (pastAvgHours > 3.5) reasons.push("Matching your historical deep-work pace");
  if (reasons.length === 0) reasons.push("Standard cognitive load optimization");
  return reasons.slice(0, 3);
}


async function predictStudyHours({ userId, subjectId, difficulty, syllabusRemaining, daysLeft }) {
  const safeDifficulty = (difficulty !== undefined && difficulty !== null) ? Number(difficulty) : 3;
  const safeSyllabus = (syllabusRemaining !== undefined && syllabusRemaining !== null) ? Number(syllabusRemaining) : 0;
  const safeDays = (daysLeft !== undefined && daysLeft !== null) ? Number(daysLeft) : 1;

  let consistencyScore = 1.0;
  let pastAvgHours = 2.0;

  try {
    if (userId && StudySession.find) {
      const userHistory = await StudySession.find({ userId }).lean();
      if (userHistory.length > 0) {
        const totalPlanned = userHistory.reduce((s, h) => s + (h.plannedHours || 0), 0);
        const totalActual = userHistory.reduce((s, h) => s + (h.actualHours || 0), 0);
        consistencyScore = totalPlanned > 0 ? (totalActual / totalPlanned) : 1.0;
      }
      if (subjectId) {
        const subjectHistory = await StudySession.find({ userId, subjectId }).lean();
        if (subjectHistory.length > 0) {
          pastAvgHours = subjectHistory.reduce((s, h) => s + (h.actualHours || 0), 0) / subjectHistory.length;
        }
      }
    }
  } catch (dbErr) {
    console.error('Error fetching ML features:', dbErr.message);
  }

  const reasons = generateReasoning({
    difficulty: safeDifficulty,
    syllabusRemaining: safeSyllabus,
    daysLeft: safeDays,
    consistencyScore,
    pastAvgHours
  });

  const result = await runAIScript('hours', {
    difficulty: safeDifficulty,
    syllabusRemaining: safeSyllabus,
    daysLeft: safeDays,
    consistencyScore,
    pastAvgHours
  });

  if (result.fallback || !result.predictedHours) {
    return {
      predictedHours: fallbackPredictor({ difficulty: safeDifficulty, syllabusRemaining: safeSyllabus, daysLeft: safeDays }),
      reasons: [...reasons, "Rule-based fallback active"]
    };
  }

  return {
    predictedHours: Math.min(20, Math.max(0.5, result.predictedHours)),
    reasons
  };
}


async function classifySubject(subjectData) {
  const result = await runAIScript('classify', subjectData);
  if (result.fallback || !result.level) {
    const prof = Number(subjectData.proficiency || 3);
    const diff = Number(subjectData.difficulty || 3);
    const prevScore = Number(subjectData.previousScore || 0);


    if (prof >= 4 && prevScore >= 80) return "Strong";
    if (prof >= 4 || prevScore >= 85) return "Strong";

    const scoreDiff = prof - diff;
    if (scoreDiff <= -2) return "Weak";
    if (scoreDiff === -1 && prevScore < 70) return "Weak";
    if (scoreDiff >= 1 || prevScore >= 75) return "Strong";
    return "Medium";
  }
  return result.level;
}


async function predictExamScore(subjectData) {
  const result = await runAIScript('score', subjectData);
  if (result.fallback || result.predictedScore === undefined) {
    const prof = Number(subjectData.proficiency || 3);
    const diff = Number(subjectData.difficulty || 3);
    const prevScore = Number(subjectData.previousScore || 0);


    const baseline = prevScore > 0 ? prevScore : 70;
    const diffMod = (prof - diff) * 4;
    const loadMod = (Number(subjectData.syllabusRemaining || 0) / 100) * -5;

    return Math.min(100, Math.max(0, baseline + diffMod + loadMod));
  }
  return result.predictedScore;
}


async function generateAITips(name, difficulty) {
  const result = await runAIScript('tips', { name, difficulty });
  if (result.fallback || !result.tips) {
    return [
      `Break down ${name} into smaller modules.`,
      "Use active recall techniques for better retention.",
      "Schedule regular breaks to avoid cognitive fatigue."
    ];
  }
  return result.tips;
}


async function getUserInsights(userId) {
  const defaultInsights = {
    strongest: "N/A",
    weakest: "N/A",
    recentConsistency: 0,
    consistencyTrend: "0.0",
    improvement: "Start studying to see insights",
    chartData: []
  };

  try {
    const sessions = await StudySession.find({ userId }).sort({ date: 1 }).lean();


    if (sessions.length === 0) {
      const allSubjects = await Subject.find({ userId }).lean();
      if (allSubjects.length > 0) {
         const prioritized = [...allSubjects].sort((a, b) => {
            const diffA = (a.difficulty !== undefined && a.difficulty !== null) ? a.difficulty : 3;
            const diffB = (b.difficulty !== undefined && b.difficulty !== null) ? b.difficulty : 3;
            if (diffB !== diffA) return diffB - diffA;
            return new Date(a.examDate || 0) - new Date(b.examDate || 0);
         });
         return {
            ...defaultInsights,
            weakest: prioritized[0].name || prioritized[0].subjectName,
            improvement: "Analyzing potential weak points based on syllabus complexity."
         };
      }
      return defaultInsights;
    }

    const recent = sessions.slice(-5);
    const previous = sessions.slice(-10, -5);

    const calculateConsistency = (list) => {
       if (list.length === 0) return 0;
       const planned = list.reduce((s, h) => s + (h.plannedHours || 0), 0);
       const actual = list.reduce((s, h) => s + (h.actualHours || 0), 0);
       return planned > 0 ? (actual / planned) * 100 : 0;
    };

    const recentCons = calculateConsistency(recent);
    const prevCons = calculateConsistency(previous);

    let trend = 0;
    if (previous.length > 0) {
        trend = recentCons - prevCons;
    } else if (recent.length > 0) {
        trend = recentCons;
    }

    const allSubjects = await Subject.find({ userId }).lean();
    const subjectStats = {};

    allSubjects.forEach(s => {
       const d = (s.difficulty !== undefined && s.difficulty !== null) ? Number(s.difficulty) : 3;
       const p = (s.proficiency !== undefined && s.proficiency !== null) ? Number(s.proficiency) : 3;
       subjectStats[s._id] = {
          name: s.name || s.subjectName || "Unknown",
          score: (p - d),
          sessions: 0
       };
    });

    sessions.forEach(s => {
       if (subjectStats[s.subjectId]) {
          subjectStats[s.subjectId].sessions += 1;
          const ratio = s.plannedHours > 0 ? (s.actualHours / s.plannedHours) : 1;
          subjectStats[s.subjectId].score += (ratio - 1) * 2;
       }
    });

    const sorted = Object.values(subjectStats).sort((a, b) => b.score - a.score);


    const dailyMap = {};
    sessions.slice(-7).forEach(s => {
       const day = s.date.toISOString().split('T')[0];
       if (!dailyMap[day]) dailyMap[day] = { planned: 0, actual: 0 };
       dailyMap[day].planned += s.plannedHours;
       dailyMap[day].actual += s.actualHours;
    });

    const chartData = Object.entries(dailyMap).map(([date, vals]) => ({
       date,
       planned: parseFloat(vals.planned.toFixed(1)),
       actual: parseFloat(vals.actual.toFixed(1))
    }));

    return {
       strongest: sorted.length > 0 ? sorted[0].name : "N/A",
       weakest: sorted.length > 0 ? sorted[sorted.length - 1].name : "N/A",
       recentConsistency: Math.round(recentCons),
       consistencyTrend: trend.toFixed(1),
       improvement: trend >= 5 ? "Significant neural growth detected!" : trend > 0 ? "Steady focus trajectory." : "Focus stabilization required.",
       chartData
    };
  } catch (err) {
    console.error('Error in getUserInsights:', err);
    return defaultInsights;
  }
}

module.exports = {
  predictStudyHours,
  classifySubject,
  predictExamScore,
  generateAITips,
  getUserInsights
};
