import React, { useState, useEffect } from 'react';
import { Book, Clock, AlertTriangle, Brain, Sparkles, Edit3, Plus, Timer, TrendingUp, TrendingDown } from 'lucide-react';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [subjectsRes, planRes, insightsRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/plans'),
          api.get('/ml/insights')
        ]);
        setSubjects(subjectsRes.data);
        setPlan(planRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalHours = plan.reduce((acc, p) => acc + p.allocatedHours, 0).toFixed(1);
  const upcomingDeadlines = subjects.filter(s => s.examDate).length;
  
  const weakestSubject = insights?.weakest || 'Analyzing...';
  const strongestSubject = insights?.strongest || 'Analyzing...';

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

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="mb-10 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-[44px] font-bold tracking-tight text-text-main mb-3 leading-tight">
            Welcome back, <span className="text-primary tracking-tight">Focus</span>
          </h1>
          <p className="text-text-muted text-[15px] font-medium max-w-2xl">
            {insights?.improvement || 'Analyzing your recent cognitive patterns...'}
            <span className="text-primary ml-2">Keep up the momentum.</span>
          </p>
        </div>
        {!loading && insights && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl animate-pulse">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">{insights.recentConsistency}% CONSISTENCY</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<Book size={18} className="text-primary" />} 
          badge={subjects.length > 0 ? "Active" : "Add One"}
          badgeColor="text-primary bg-primary/10"
          title="TOTAL SUBJECTS" 
          value={loading ? '-' : subjects.length.toString()} 
        />
        <StatCard 
          icon={<Clock size={18} className="text-primary" />} 
          badge="Daily Load"
          badgeColor="text-primary bg-primary/10"
          title="STUDY HOURS TODAY" 
          value={loading ? '-' : `${totalHours}h`} 
        />
        <StatCard 
          icon={<AlertTriangle size={18} className="text-[#ff4e4e]" />} 
          badge={upcomingDeadlines > 0 ? "Tracking" : "Clear"}
          badgeColor="text-[#ff4e4e] bg-[#ff4e4e]/10"
          title="DEADLINES" 
          value={loading ? '-' : upcomingDeadlines.toString()} 
        />
        <StatCard 
          icon={<Brain size={18} className="text-[#a1a1aa]" />} 
          badge="Action Needed"
          badgeColor="text-[#a1a1aa] bg-[#2a2d3a]"
          title="WEAK SUBJECT" 
          value={loading ? '-' : weakestSubject.substring(0, 15)} 
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
            ) : plan.length === 0 ? (
              <div className="bg-surface border border-surface-border rounded-[28px] p-10 text-center">
                <span className="text-text-muted font-bold text-sm tracking-widest uppercase block mb-4">No active blocks</span>
                <button onClick={() => navigate('/plan')} className="text-primary font-bold text-xs tracking-wider border border-primary/20 bg-primary/10 px-6 py-2.5 rounded-full uppercase transition-all hover:bg-primary/20 hover:scale-105 active:scale-95">Generate Now</button>
              </div>
            ) : (
              plan.slice(0, 3).map((item, idx) => {
                const start = formatTime(currentStartHour);
                currentStartHour += item.allocatedHours;
                const end = formatTime(currentStartHour);
                
                return (
                  <SessionCard 
                    key={item._id || idx}
                    intensity={item.allocatedHours > 2 ? "High Intensity" : "Standard Focus"}
                    intensityColor={item.allocatedHours > 2 ? "bg-primary/20 text-primary" : "bg-[#3b82f6]/20 text-[#3b82f6]"}
                    time={`${start} — ${end}`}
                    title={item.subjectName}
                    desc={item.reasons ? item.reasons[0] : `Execute ${item.allocatedHours.toFixed(1)} hours of deep focus.`}
                    progressLabel={item.reasons && item.reasons.length > 1 ? item.reasons[1] : "FOCUS LEVEL"}
                    progress={Math.floor(Math.random() * 20 + 75)}
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
                   <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-text-muted mb-1">Consistency Trend</span>
                      <div className="flex items-center gap-1">
                         {Number(insights?.consistencyTrend) >= 0 ? <TrendingUp size={14} className="text-primary" /> : <TrendingDown size={14} className="text-[#ff4e4e]" />}
                         <span className={`text-sm font-bold ${Number(insights?.consistencyTrend) >= 0 ? 'text-primary' : 'text-[#ff4e4e]'}`}>
                            {insights?.consistencyTrend || '0.0'}%
                         </span>
                      </div>
                   </div>
                </div>

                <div className="h-24 w-full mt-4">
                   {insights?.chartData && <Line data={chartData} options={chartOptions} />}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                   <div className="flex gap-6">
                      <div>
                         <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Peak Performance</span>
                         <span className="text-sm font-bold text-text-main">{strongestSubject}</span>
                      </div>
                      <div>
                         <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Target Area</span>
                         <span className="text-sm font-bold text-text-main">{weakestSubject}</span>
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
            <div className="bg-surface border border-surface-border rounded-[28px] p-6 flex flex-col items-center justify-center text-center transition-all hover:border-primary/30 group">
              <Timer size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-text-main font-bold mb-1">Deep Work Timer</h4>
              <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase">25 / 5 Cycle</span>
            </div>
            <div className="bg-surface border border-surface-border rounded-[28px] p-6 flex flex-col items-center justify-center text-center transition-all hover:border-primary/30 group">
              <Brain size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-text-main font-bold mb-1">Neural AI</h4>
              <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase">Live Synthesis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, badge, badgeColor, title, value }) {
  return (
    <div className="bg-surface rounded-[28px] p-6 border border-surface-border flex flex-col justify-between h-[150px] transition-all hover:border-[#383b4b]">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-[14px] bg-surface-sidebar flex items-center justify-center">
          {icon}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-text-main tracking-tight">{value}</p>
      </div>
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


