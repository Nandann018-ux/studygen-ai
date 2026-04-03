import React, { useState, useEffect } from 'react';
import { Activity, TrendingDown, Medal, Sparkles, Rocket, TrendingUp } from 'lucide-react';
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
  const [tips, setTips] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);

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
          
          // Neural Integration: Fetch Study Tips for the weakest node
          setTipsLoading(true);
          try {
            const tipsRes = await api.post('/ml/tips', {
              name: weakestSubject.name || weakestSubject.subjectName,
              difficulty: weakestSubject.difficulty || 3
            });
            setTips(tipsRes.data.tips || []);
          } catch (tErr) {
            console.error("Neural Tips Error:", tErr.message);
          } finally {
            setTipsLoading(false);
          }
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
  const weakestSubjectName = sortedByNeeds.length > 0 ? (sortedByNeeds[0].name || sortedByNeeds[0].subjectName) : 'None';
  const weakestSyllabus = sortedByNeeds.length > 0 ? sortedByNeeds[0].syllabusRemaining : 0;

  // Study Allocations aggregated by Subject
  const allocationsMap = {};
  plan.forEach(item => {
    const name = item.name || item.subjectName;
    allocationsMap[name] = (allocationsMap[name] || 0) + item.allocatedHours;
  });
  
  // Sort allocations descending
  let sortedAllocations = Object.entries(allocationsMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, hours]) => ({ name, hours }));

  const maxHours = sortedAllocations.length > 0 ? sortedAllocations[0].hours : 1;

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
        <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase flex items-center justify-center gap-2">
          Synthesizing Neural Analytics
          <div className="flex gap-1 ml-2">
            <span className="neural-dot"></span>
            <span className="neural-dot"></span>
            <span className="neural-dot"></span>
          </div>
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
                 {predictedScore !== null ? Math.round(predictedScore) : (subjects.length > 0 ? 'Analyzing' : '0')}
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
        <div className="lg:col-span-8 bg-surface rounded-[40px] p-1.5 border border-surface-border shadow-xl group overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-1000"></div>
          
          <div className="bg-surface-sidebar/40 backdrop-blur-2xl rounded-[38px] p-10 h-full flex flex-col md:flex-row items-center justify-between gap-12 border border-surface-border relative z-10">
            <div className="w-64 h-64 relative shrink-0 flex items-center justify-center">
               {/* Background Orbit */}
               <div className="absolute inset-4 rounded-full border border-surface-border bg-gradient-to-b from-transparent to-surface-hover/20 shadow-inner"></div>
               
               {/* The Neural Core (Chart) */}
               <div className="w-full h-full p-2 relative z-10">
                 <Doughnut data={doughnutData} options={{ 
                   responsive: true, 
                   maintainAspectRatio: false,
                   cutout: '88%', 
                   rotation: -90,
                   circumference: 360,
                   plugins: { 
                     tooltip: { enabled: false },
                     legend: { display: false }
                   },
                   animation: { duration: 2500, easing: 'easeOutQuart' }
                 }} />
               </div>

               {/* Central Readout */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                 <span className="text-[52px] font-bold text-text-main tracking-tighter leading-none mb-1 drop-shadow-[0_10_20px_rgba(0,208,132,0.2)]">{deepFlowPct}%</span>
                 <span className="text-[9px] font-bold tracking-[0.4em] text-primary uppercase opacity-80 pl-[0.4em]">Deep Flow</span>
               </div>
               
               {/* Status Beacon */}
               <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-primary shadow-[0_0_20px_rgba(0,208,132,1)] animate-pulse z-30"></div>
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
                Current algorithms indicate that <span className="font-bold text-text-main">{deepFlowPct}%</span> of your schedule is optimized for dense deep-work, facilitating rapid <span className="text-primary italic">synaptogenesis.</span>
              </p>
              
              <div className="grid grid-cols-2 gap-8 border-t border-surface-border pt-8">
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
          <div className="bg-primary/5 dark:bg-gradient-to-br from-[#00d084] to-[#088055] rounded-[32px] p-8 border border-primary/20 relative overflow-hidden group h-full flex flex-col justify-between">
            <Sparkles size={120} className="absolute -right-6 -bottom-6 text-primary/10 dark:text-white/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-primary/20 rounded-xl">
                    <Rocket size={18} className="text-primary dark:text-[#0a0b10]" />
                 </div>
                 <h3 className="text-xl font-bold text-text-main dark:text-[#0a0b10] tracking-tight">Neural Guidance</h3>
              </div>

              <div className="flex-1">
                {tipsLoading ? (
                   <span className="text-[10px] font-bold text-primary dark:text-[#0a0b10]/60 uppercase tracking-widest animate-pulse">Consulting AI...</span>
                ) : tips.length > 0 ? (
                  <div className="space-y-4">
                     {tips.slice(0, 3).map((tip, idx) => (
                       <div key={idx} className="flex gap-3 items-start animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-[#0a0b10] mt-1.5 shrink-0 opacity-40"></div>
                          <p className="text-text-main dark:text-[#0a0b10] font-bold leading-snug text-sm tracking-tight">{tip}</p>
                       </div>
                     ))}
                  </div>
                ) : (
                  <p className="text-text-muted dark:text-[#0a0b10] font-medium leading-relaxed text-sm opacity-80">
                    Register subjects in the Matrix to receive personalized neural optimization tips.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center relative z-10 mt-8">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-surface flex items-center justify-center text-[10px] font-bold text-text-main">AI</div>
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-surface/40 flex items-center justify-center text-[10px] font-bold text-text-muted">ML</div>
              </div>
              <button 
                onClick={() => window.location.href='/subjects'}
                className="bg-primary hover:bg-primary-light text-[#0a0b10] px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all active:scale-95 hover:scale-105 inline-block border border-transparent shadow-lg shadow-primary/20"
              >
                Provision
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
