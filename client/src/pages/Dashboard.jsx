import React, { useState, useEffect } from 'react';
import { Book, Clock, AlertTriangle, Brain, Sparkles, Edit3, Plus, Timer, TrendingUp, TrendingDown, X, CheckCircle2, Calendar, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [plan, setPlan] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Focus');
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  useEffect(() => {

    const userData = localStorage.getItem('studygen_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name) setUserName(user.name.split(' ')[0]);
      } catch (e) {}
    }
    const fetchDashboardData = async () => {
      console.log("Fetching dashboard insights...");
      try {
        const [subjectsRes, planRes, insightsRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/plans'),
          api.get('/ml/insights')
        ]);

        setSubjects(subjectsRes.data);
        setPlan(planRes.data);
        setInsights(insightsRes.data);

        console.log("Dashboard state synchronized with neural engine.");
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayPlan = plan.filter(task => task.date && task.date.split('T')[0] === todayDate);
  const totalHours = todayPlan
    .filter(p => !p.isCompleted)
    .reduce((acc, p) => acc + Number(p.allocatedHours), 0)
    .toFixed(1);


  useEffect(() => {
    if (!loading && subjects.length > 0 && todayPlan.length === 0) {
      console.log("[Neural Engine] Subjects detected but no active plan. Suggesting initialization.");
    }
  }, [loading, subjects, todayPlan]);

  const now = new Date();
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const relevantSubjects = subjects.filter(s => {
    if (!s.examDate) return false;
    const d = new Date(s.examDate);
    return d >= now && d <= fourteenDaysFromNow;
  }).sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  const upcomingDeadlinesCount = relevantSubjects.length;
  const hasUrgentDeadline = relevantSubjects.some(s => new Date(s.examDate) <= threeDaysFromNow);

  const weakestSubject = loading ? (subjects.length > 0 ? 'Analyzing...' : 'N/A') : (insights?.weakest || 'N/A');
  const strongestSubject = loading ? (subjects.length > 0 ? 'Analyzing...' : 'N/A') : (insights?.strongest || 'N/A');

  const formatTime = (timeInHours) => {
    const h = Math.floor(timeInHours);
    const m = Math.round((timeInHours - h) * 60);
    const date = new Date();
    date.setHours(h, m, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = {
    labels: (insights?.chartData || []).map(d => d.date.split('-').slice(1).join('/')),
    datasets: [
      {
        label: 'Actual',
        data: (insights?.chartData || []).map(d => d.actual),
        borderColor: '#00d084',
        backgroundColor: 'rgba(0, 208, 132, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#00d084'
      },
      {
        label: 'Planned',
        data: (insights?.chartData || []).map(d => d.planned),
        borderColor: '#232532',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111218',
        titleColor: '#8e92a4',
        bodyColor: '#fff',
        borderColor: '#232532',
        borderWidth: 1,
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  let currentStartHour = 8;

  const hasChartData = insights?.chartData && insights.chartData.length > 0;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="mb-10 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-[44px] font-bold tracking-tight text-text-main mb-3 leading-tight">
            Welcome back, <span className="text-primary tracking-tight">{userName}</span>
          </h1>
          {loading && (
            <div className="w-64 h-[2px] bg-primary/10 rounded-full overflow-hidden mb-4 relative">
              <div className="absolute inset-0 bg-primary animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
          )}
          <p className="text-text-muted text-[15px] font-medium max-w-2xl">
            {loading ? 'Analyzing your recent cognitive patterns...' : (insights?.improvement || 'Neural engine initialized.')}
            {!loading && <span className="text-primary ml-2">Keep up the momentum.</span>}
          </p>
        </div>
        {!loading && (insights?.recentConsistency > 0 || String(insights?.consistencyTrend) !== '0.0') && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl animate-in zoom-in-95 duration-500">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {insights?.recentConsistency || 100}% FOCUS SYNC
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Book size={18} className="text-primary" />}
          badge={subjects.filter(s => !s.isCompleted).length > 0 ? "Active" : "Add One"}
          badgeColor="text-primary bg-primary/10"
          title="TOTAL SUBJECTS"
          value={loading ? '-' : subjects.filter(s => !s.isCompleted).length.toString()}
          onClick={subjects.filter(s => !s.isCompleted).length > 0 ? () => setShowSubjectModal(true) : undefined}
          isActionable={subjects.filter(s => !s.isCompleted).length > 0}
        />
        <StatCard
          icon={<Clock size={18} className="text-primary" />}
          badge="Daily Load"
          badgeColor="text-primary bg-primary/10"
          title="STUDY HOURS TODAY"
          value={loading ? '-' : `${totalHours}h`}
        />
        <StatCard
          icon={upcomingDeadlinesCount > 0 ? <AlertTriangle size={18} className={hasUrgentDeadline ? "text-[#ff4e4e]" : "text-primary"} /> : <CheckCircle2 size={18} className="text-primary" />}
          badge={upcomingDeadlinesCount > 0 ? (hasUrgentDeadline ? "Urgent" : "Tracking") : "Pristine"}
          badgeColor={upcomingDeadlinesCount > 0 ? (hasUrgentDeadline ? "text-[#ff4e4e] bg-[#ff4e4e]/10 font-black" : "text-primary bg-primary/10") : "text-primary bg-primary/10"}
          title="DEADLINES"
          value={loading ? '-' : (upcomingDeadlinesCount > 0 ? upcomingDeadlinesCount.toString() : "All Clear! 🏆")}
          onClick={upcomingDeadlinesCount > 0 ? () => setShowDeadlineModal(true) : undefined}
          isActionable={upcomingDeadlinesCount > 0}
        />
        <StatCard
          icon={<Brain size={18} className={insights?.weakest !== 'N/A' ? "text-[#ff4e4e]" : "text-[#a1a1aa]"} />}
          badge={insights?.weakest !== 'N/A' ? "Action Needed" : "Gathering Data"}
          badgeColor={insights?.weakest !== 'N/A' ? "text-[#ff4e4e] bg-[#ff4e4e]/10 font-bold" : "text-[#a1a1aa] bg-[#2a2d3a] font-bold"}
          title="WEAK SUBJECT"
          value={loading ? '-' : (weakestSubject.substring(0, 15) || 'N/A')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-text-main tracking-tight">Today's Deep Work Plan</h2>
            <button
              onClick={() => navigate('/plan')}
              className="text-primary text-sm font-bold tracking-wide hover:text-primary-light transition-all active:scale-95 hover:scale-105 inline-block"
            >
              View Roadmap
            </button>
          </div>

          <div className="space-y-5 flex-1">
            {loading ? (
              <div className="text-text-muted text-sm tracking-widest uppercase">Initializing Neural Paths...</div>
                        ) : todayPlan.filter(task => !task.isCompleted).length === 0 ? (
              <div className="bg-surface border border-surface-border rounded-[28px] p-10 text-center">
                <span className="text-text-muted font-bold text-sm tracking-widest uppercase block mb-4">All Sessions Captured! 🏆</span>
                <button onClick={() => navigate('/plan')} className="text-primary font-bold text-xs tracking-wider border border-primary/20 bg-primary/10 px-6 py-2.5 rounded-full uppercase transition-all hover:bg-primary/20 hover:scale-105 active:scale-95">Recalibrate Plan</button>
              </div>
            ) : (
              todayPlan.filter(task => !task.isCompleted).slice(0, 3).map((item, idx) => {
                const start = formatTime(currentStartHour);
                currentStartHour += item.allocatedHours;
                const end = formatTime(currentStartHour);

                return (
                  <SessionCard
                    key={item._id || idx}
                    intensity={item.allocatedHours > 2 ? "High Intensity" : "Standard Focus"}
                    intensityColor={item.allocatedHours > 2 ? "bg-primary/20 text-primary" : "bg-[#3b82f6]/20 text-[#3b82f6]"}
                    time={`${start} — ${end}`}
                    title={item.name || item.subjectName}
                    desc={item.reasons ? item.reasons[0] : `Execute ${Number(item.allocatedHours).toFixed(1)} hours of deep focus.`}
                    progressLabel={item.reasons && item.reasons.length > 1 ? item.reasons[1] : "FOCUS LEVEL"}
                    progress={item.isCompleted ? 100 : 0}
                  />
                )
              })
            )}
          </div>
        </div>

        <div className="xl:col-span-7 flex flex-col">
          <div className="relative rounded-[32px] overflow-hidden mb-8 group border border-surface-border h-[280px]">
             <div className="absolute inset-0 bg-surface/50 backdrop-blur-xl z-0"></div>

             <div className="absolute inset-0 p-8 z-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-xl">
                         <Sparkles size={18} className="text-primary" />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-text-main tracking-tight">Focus Analytics</h3>
                         <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Planned vs Actual</span>
                      </div>
                   </div>
                   {!loading && (
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-text-muted mb-1">Consistency Trend</span>
                        <div className="flex items-center gap-1">
                          {Number(insights?.consistencyTrend) >= 0 ? <TrendingUp size={14} className="text-primary" /> : <TrendingDown size={14} className="text-[#ff4e4e]" />}
                          <span className={`text-sm font-bold ${Number(insights?.consistencyTrend) >= 0 ? 'text-primary' : 'text-[#ff4e4e]'}`}>
                              {insights?.consistencyTrend || '0.0'}%
                          </span>
                        </div>
                    </div>
                   )}
                </div>

                <div className="h-24 w-full mt-4 flex items-center justify-center">
                   {loading ? (
                      <span className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Syncing neural data...</span>
                   ) : hasChartData ? (
                      <Line data={chartData} options={chartOptions} />
                   ) : (
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">No neural data yet</span>
                        <span className="text-[9px] text-text-muted/60 uppercase tracking-tighter">Your first session will appear here</span>
                      </div>
                   )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                   <div className="flex gap-6">
                      <div>
                         <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Peak Performance</span>
                         <span className="text-sm font-bold text-text-main">{loading ? '...' : strongestSubject}</span>
                      </div>
                      <div>
                         <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Target Area</span>
                         <span className="text-sm font-bold text-text-main">{loading ? '...' : weakestSubject}</span>
                      </div>
                   </div>
                   <button
                     onClick={() => navigate('/plan')}
                     className="bg-primary hover:bg-primary-light text-[#0a0b10] px-6 py-2 rounded-full font-bold text-xs transition-all hover:scale-105 active:scale-95"
                   >
                     Optimized Plan
                   </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <button
              onClick={() => navigate('/focus')}
              className="bg-surface border border-surface-border rounded-[28px] p-6 flex flex-col items-center justify-center text-center transition-all hover:border-primary/30 hover:bg-surface-hover group active:scale-[0.98]"
            >
              <Timer size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-text-main font-bold mb-1">Deep Work Timer</h4>
              <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase">25 / 5 Cycle</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-surface border border-surface-border rounded-[28px] p-6 flex flex-col items-center justify-center text-center transition-all hover:border-primary/30 hover:bg-surface-hover group active:scale-[0.98]"
            >
              <Brain size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-text-main font-bold mb-1">Neural AI</h4>
              <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase">Live Synthesis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Inventory Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface border border-surface-border rounded-[32px] p-10 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowSubjectModal(false)}
              className="absolute top-8 right-8 text-text-muted hover:text-text-main hover:bg-surface-hover p-2 rounded-full transition-all active:scale-95"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Book size={24} className="text-primary" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-text-main">Neural Inventory</h2>
                  <p className="text-text-muted text-sm tracking-tight font-medium">Visualization of all active subject nodes.</p>
               </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {subjects.map((sub, idx) => (
                 <div key={sub._id || idx} className="bg-surface-sidebar border border-surface-border rounded-2xl p-5 flex justify-between items-center group hover:border-primary/30 transition-all cursor-pointer" onClick={() => navigate('/subjects')}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-surface-border group-hover:border-primary/20">
                          <Target size={18} className="text-primary/60 group-hover:text-primary transition-colors" />
                       </div>
                       <span className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">{sub.name || sub.subjectName || "Unnamed Node"}</span>
                    </div>
                    <ChevronRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                 </div>
               ))}
            </div>

            <div className="mt-10">
               <button
                 onClick={() => navigate('/subjects')}
                 className="w-full bg-surface-sidebar text-text-main border border-surface-border py-4 rounded-xl font-bold hover:bg-surface-hover transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Edit3 size={16} /> Manage Subjects
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Detail Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface border border-surface-border rounded-[32px] p-10 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowDeadlineModal(false)}
              className="absolute top-8 right-8 text-text-muted hover:text-text-main hover:bg-surface-hover p-2 rounded-full transition-all active:scale-95"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-primary" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-text-main">Neural Deadlines</h2>
                  <p className="text-text-muted text-sm tracking-tight font-medium">Critical academic checkpoints detected within 14 days.</p>
               </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {relevantSubjects.map((sub, idx) => {
                 const examDate = new Date(sub.examDate);
                 const diffTime = examDate.getTime() - now.getTime();
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 const isUrgent = diffDays <= 3;

                 return (
                   <div key={sub._id || idx} className="bg-surface-sidebar border border-surface-border rounded-2xl p-5 flex justify-between items-center group hover:border-primary/30 transition-all">
                      <div className="flex flex-col">
                         <span className="text-lg font-bold text-text-main leading-tight mb-1">{sub.name || sub.subjectName || "Unnamed Node"}</span>
                         <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-text-muted" />
                            <span className="text-xs font-semibold text-text-muted">
                               {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isUrgent ? 'bg-[#ff4e4e]/10 text-[#ff4e4e]' : 'bg-primary/10 text-primary'}`}>
                            {diffDays === 0 ? 'Today' : `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} left`}
                         </span>
                         {isUrgent && <span className="text-[9px] font-bold text-[#ff4e4e] mt-1.5 animate-pulse uppercase tracking-[0.1em]">Critically Urgent</span>}
                      </div>
                   </div>
                 )
               })}
            </div>

            <div className="mt-10">
               <button
                 onClick={() => navigate('/plan')}
                 className="w-full bg-primary text-[#0a0b10] py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Edit3 size={16} /> Optimize Study Plan
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, badge, badgeColor, title, value, onClick, isActionable }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-[28px] p-6 border border-surface-border flex flex-col justify-between h-[150px] transition-all hover:border-[#383b4b] ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} relative group`}
    >
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-[14px] bg-surface-sidebar flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-bold text-text-main tracking-tight ${value.length > 10 ? 'text-xl' : 'text-3xl'} transition-colors ${onClick ? 'group-hover:text-primary' : ''}`}>
          {value}
        </p>
      </div>
      {isActionable && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-60 transition-opacity">
          <Plus size={16} className="text-primary" />
        </div>
      )}
    </div>
  );
}

function SessionCard({ intensity, intensityColor, time, title, desc, progressLabel, progress }) {
  return (
    <div className="bg-surface border border-surface-border rounded-[28px] p-7 transition-all hover:bg-surface-hover group">
      <div className="flex justify-between items-center mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${intensityColor}`}>
          {intensity}
        </span>
        <span className="text-text-muted text-xs font-bold tracking-wider">{time}</span>
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed mb-6 font-medium">
        {desc}
      </p>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">{progressLabel}</span>
          <span className="text-xs font-bold text-text-muted">{progress}%</span>
        </div>
        <div className="w-full bg-surface-sidebar h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}
