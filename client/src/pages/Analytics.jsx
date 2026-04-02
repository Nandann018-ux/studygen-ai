import React, { useState, useEffect } from 'react';
import { Activity, TrendingDown, Medal, Sparkles, Rocket } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler
);

export default function Analytics() {
  const [subjects, setSubjects] = useState([]);
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [predictedScore, setPredictedScore] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [subjectsRes, planRes, insightsRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/plans'),
          api.get('/ml/insights')
        ]);
        
        const subs = subjectsRes.data;
        setSubjects(subs);
        setPlan(planRes.data);
        setInsights(insightsRes.data);

        // Fetch predicted score for the weakest subject
        if (subs.length > 0) {
          const weakestSubject = [...subs].sort((a, b) => b.syllabusRemaining - a.syllabusRemaining)[0];
          const scoreRes = await api.post('/ml/predict-score', weakestSubject);
          setPredictedScore(scoreRes.data.predictedScore);
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  // -- Derived Data Calculations --

  // Weakest subject (highest syllabus remaining or lowest proficiency)
  const sortedByNeeds = [...subjects].sort((a, b) => b.syllabusRemaining - a.syllabusRemaining);
  const weakestSubjectName = sortedByNeeds.length > 0 ? sortedByNeeds[0].subjectName : 'None';
  const weakestSyllabus = sortedByNeeds.length > 0 ? sortedByNeeds[0].syllabusRemaining : 0;

  // Study Allocations aggregated by Subject
  const allocationsMap = {};
  plan.forEach(item => {
    allocationsMap[item.subjectName] = (allocationsMap[item.subjectName] || 0) + item.allocatedHours;
  });
  
  // Sort allocations descending
  let sortedAllocations = Object.entries(allocationsMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, hours]) => ({ name, hours }));

  const maxHours = sortedAllocations.length > 0 ? sortedAllocations[0].hours : 1;
  const highInvestmentSub = sortedAllocations.length > 0 ? sortedAllocations[0].name : 'None';
  const highInvestmentHours = sortedAllocations.length > 0 ? sortedAllocations[0].hours : 0;

  const totalAllocated = plan.reduce((acc, curr) => acc + curr.allocatedHours, 0) || 1;
  
  // High Intensity vs Standard (Doughnut data proxy) - Real deep work is > 3h
  const highIntensityHours = plan.filter(p => p.allocatedHours >= 3).reduce((acc, curr) => acc + curr.allocatedHours, 0);
  const deepFlowPct = plan.length > 0 ? Math.round((highIntensityHours / totalAllocated) * 100) : 0;

  const lineData = {
    labels: ['WEEK 01', 'WEEK 02', 'WEEK 03', 'WEEK 04'],
    datasets: [
      {
        label: 'Current',
        data: insights?.growthTrend || [0, 0, 0, 0],
        borderColor: '#00d084',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Previous',
        data: [15, 25, 30, (insights?.growthTrend?.[0] || 20) - 5],
        borderColor: '#232532',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#8e92a4', font: { size: 10, weight: 'bold' } },
        border: { display: false }
      },
      y: { 
        display: false,
        min: 0,
        max: 100
      }
    }
  };

  const doughnutData = {
    labels: ['Deep Flow', 'Casual'],
    datasets: [
      {
        data: [deepFlowPct, 100 - deepFlowPct],
        backgroundColor: ['#00d084', '#111218'],
        borderWidth: 0,
        cutout: '85%'
      }
    ]
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
        <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase">
          Synthesizing Neural Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-10 mt-4">
        <div>
          <h1 className="text-[52px] font-bold tracking-tight text-text-main mb-4 leading-none">
            Neural Performance<br/><span className="text-primary">Optimization</span>
          </h1>
          <p className="text-text-muted text-[15px] font-medium max-w-xl leading-relaxed">
            Your cognitive patterns analyzed across {totalAllocated.toFixed(1)} deep work hours this month. Visualizing the path to mastery.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-hover border border-surface-border text-text-main hover:bg-surface-border transition-all active:scale-95 hover:shadow-sm px-6 py-2.5 rounded-full text-sm font-semibold inline-block">
            Download Report
          </button>
          <button className="bg-primary hover:bg-primary-light text-[#0a0b10] px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 hover:scale-105 inline-block">
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface rounded-[32px] p-8 border border-surface-border flex flex-col justify-between h-[220px] hover:border-[#383b4b] transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-[14px] bg-surface-sidebar flex items-center justify-center">
              <Activity size={18} className="text-primary" />
            </div>
            <span className="text-[10px] font-bold text-primary px-3 py-1.5 rounded-full bg-primary/10 tracking-widest uppercase">
              +12% vs last week
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted tracking-[0.15em] uppercase mb-2 block">Consistency Score</span>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-[56px] font-bold tracking-tighter text-text-main leading-none">
                {insights?.consistencyScore || 0}
              </span>
              <span className="text-xl font-bold text-text-muted mb-2">/100</span>
            </div>
            <div className="w-full bg-surface-sidebar h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${insights?.consistencyScore || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-[32px] p-8 border border-surface-border flex flex-col justify-between h-[220px] hover:border-[#383b4b] transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-[14px] bg-surface-sidebar flex items-center justify-center">
              <TrendingDown size={18} className="text-[#ff4e4e]" />
            </div>
            {weakestSubjectName !== 'None' && (
              <span className="text-[10px] font-bold text-[#ff4e4e] px-3 py-1.5 rounded-full bg-[#ff4e4e]/10 tracking-widest uppercase">
                Needs Review
              </span>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted tracking-[0.15em] uppercase mb-2 block">Weakest Subject</span>
            <span className="text-2xl font-bold tracking-tight text-text-main block mb-2">{weakestSubjectName}</span>
            <p className="text-sm font-medium text-text-muted leading-relaxed">
              {weakestSubjectName !== 'None' ? `Syllabus is ${weakestSyllabus}% unlearned.` : 'No data available yet.'}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-[32px] p-8 border border-surface-border flex flex-col justify-between h-[220px] hover:border-[#383b4b] transition-colors group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-[14px] bg-surface-sidebar flex items-center justify-center">
              <Sparkles size={18} className="text-primary group-hover:animate-pulse" />
            </div>
            {predictedScore !== null && (
              <span className="text-[10px] font-bold text-primary px-3 py-1.5 rounded-full bg-primary/10 tracking-widest uppercase">
                AI CONFIDENCE: 92%
              </span>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted tracking-[0.15em] uppercase mb-2 block">Predicted Exam Mastery</span>
            <div className="flex items-end gap-1 mb-2">
               <span className="text-[44px] font-bold tracking-tighter text-text-main leading-none">
                 {predictedScore !== null ? Math.round(predictedScore) : 'Analyzing'}
               </span>
               <span className="text-xl font-bold text-text-muted mb-1.5">%</span>
            </div>
            <p className="text-xs font-medium text-text-muted leading-relaxed">
              {weakestSubjectName !== 'None' ? `Projected performance in ${weakestSubjectName} based on current neural trajectory.` : 'Add subjects to generate predictions.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8 bg-surface rounded-[32px] p-8 border border-surface-border hover:border-[#383b4b] transition-colors relative">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-bold text-text-main tracking-tight">Cognitive Growth</h3>
              <p className="text-sm text-text-muted font-medium mt-1">Aggregate knowledge retention over time</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-surface-border"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Previous</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full relative">
            <div className="absolute top-[40%] right-[30%] bg-surface-sidebar px-3 py-1.5 rounded-full border border-surface-border z-10">
               <span className="text-[10px] font-bold text-primary tracking-widest uppercase">+{insights?.consistencyTrend || 0}% Efficiency</span>
            </div>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface rounded-[32px] p-8 border border-surface-border hover:border-[#383b4b] transition-colors flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-main tracking-tight mb-8">Study Allocation</h3>
            <div className="space-y-6">
              {sortedAllocations.length > 0 ? sortedAllocations.slice(0, 5).map((item, idx) => (
                <ProgressBar 
                  key={idx}
                  label={item.name} 
                  val={`${item.hours.toFixed(1)}h`} 
                  pct={(item.hours / maxHours) * 100} 
                />
              )) : (
                <div className="text-text-muted text-sm border-2 border-dashed border-surface-border rounded-xl p-4 text-center">
                  Generate study plans to see subject allocations map.
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4">
            <div className="mt-1 flex-shrink-0"><Sparkles size={16} className="text-primary" /></div>
            <div>
              <span className="text-[11px] font-bold text-primary tracking-widest uppercase mb-1 block">AI Suggestion</span>
              <p className="text-xs font-medium text-text-muted leading-relaxed">
                {weakestSubjectName !== 'None' ? `Reallocate focus hours heavily into ${weakestSubjectName} to eliminate knowledge gaps.` : 'Maintain current cross-domain synergy.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#0d0e14] rounded-[40px] p-1.5 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-1000"></div>
          
          <div className="bg-[#111218]/40 backdrop-blur-2xl rounded-[38px] p-10 h-full flex flex-col md:flex-row items-center justify-between gap-12 border border-white/5 relative z-10">
            <div className="w-64 h-64 relative shrink-0">
               <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-b from-transparent to-white/5 shadow-inner"></div>
               <div className="p-6 h-full w-full">
                 <Doughnut data={doughnutData} options={{ 
                   responsive: true, 
                   cutout: '85%', 
                   plugins: { tooltip: { enabled: false } },
                   animation: { duration: 2000, easing: 'easeOutQuart' }
                 }} />
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[52px] font-bold text-white tracking-tighter leading-none mb-1 drop-shadow-[0_0_15px_rgba(0,208,132,0.5)]">{deepFlowPct}%</span>
                 <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase opacity-80">Deep Flow</span>
               </div>
               
               <div className="absolute top-8 left-8 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(0,208,132,1)] animate-pulse"></div>
            </div>
  
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-primary px-3 py-1.5 rounded-full bg-primary/10 tracking-widest uppercase border border-primary/20">
                  Neural Latency Sync
                </span>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary/40"></div>)}
                </div>
              </div>
              
              <h2 className="text-[36px] font-bold text-text-main tracking-tight leading-[1.1] mb-5">
                Your neural latency is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">decreasing.</span>
              </h2>
              
              <p className="text-text-muted font-medium leading-relaxed max-w-md mb-10 text-[15px]">
                Current algorithms indicate that <span className="text-white font-bold">{deepFlowPct}%</span> of your schedule is optimized for dense deep-work, facilitating rapid <span className="text-primary italic">synaptogenesis.</span>
              </p>
              
              <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div>
                  <span className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase mb-1.5 block opacity-60">Peak Performance</span>
                  <span className="text-2xl font-bold text-text-main tracking-tight group-hover:text-primary transition-colors duration-500">08:30 AM</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase mb-1.5 block opacity-60">Neural Focus Cap</span>
                  <span className="text-2xl font-bold text-text-main tracking-tight group-hover:text-primary transition-colors duration-500">
                    {plan.length > 0 ? (totalAllocated * 60 / plan.length).toFixed(0) : 0} Min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#00d084] to-[#088055] rounded-[32px] p-8 shadow-xl shadow-primary/10 relative overflow-hidden group h-full flex flex-col justify-between">
            <Rocket size={120} className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            
            <div>
              <h3 className="text-xl font-bold text-[#0a0b10] tracking-tight mb-3 relative z-10">Ascension Challenge</h3>
              <p className="text-[#0a0b10] font-medium leading-relaxed text-sm mb-6 max-w-[200px] relative z-10">
                Maintain your deep work streak for 3 more days to reach the 'Zenith' tier.
              </p>
            </div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex -space-x-2">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=A" className="w-8 h-8 rounded-full border-2 border-[#00d084] bg-white" alt="user" />
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=B" className="w-8 h-8 rounded-full border-2 border-[#00d084] bg-white" alt="user" />
                <div className="w-8 h-8 rounded-full border-2 border-[#00d084] bg-[#0a0b10] flex items-center justify-center text-[10px] font-bold text-white">+12</div>
              </div>
              <button className="bg-[#0a0b10] text-primary hover:bg-[#13151a] px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all active:scale-95 hover:scale-105 inline-block border border-transparent hover:border-primary/50">
                Join Sprint
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, val, pct }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[11px] font-bold tracking-wider text-text-muted uppercase max-w-[120px] truncate" title={label}>{label}</span>
        <span className="text-[11px] font-bold text-text-main">{val}</span>
      </div>
      <div className="w-full bg-surface-sidebar h-1.5 rounded-full overflow-hidden">
        <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

