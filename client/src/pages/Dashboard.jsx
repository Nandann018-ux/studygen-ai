import React, { useState, useEffect } from 'react';
import { Book, Clock, AlertTriangle, Brain, Play, Sparkles, Edit3, Plus, Search, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [subjectsRes, planRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/plans')
        ]);
        setSubjects(subjectsRes.data);
        setPlan(planRes.data);
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
  
  // Find weakest subject by calculating the highest syllabus remaining or lowest proficiency
  const weakestSubject = subjects.length > 0 
    ? [...subjects].sort((a, b) => b.syllabusRemaining - a.syllabusRemaining)[0].subjectName
    : 'None';

  const formatTime = (timeInHours) => {
    const h = Math.floor(timeInHours);
    const m = Math.round((timeInHours - h) * 60);
    const date = new Date();
    date.setHours(h, m, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  let currentStartHour = 8; // 8:00 AM

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-10 mt-4">
        <h1 className="text-[44px] font-bold tracking-tight text-text-main mb-3 leading-tight">
          Welcome back, <span className="text-primary tracking-tight">Focus</span>
        </h1>
        <p className="text-text-muted text-[15px] font-medium max-w-2xl">
          Your cognitive performance is up 12% this week. Ready for another deep work cycle?
        </p>
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
          title="WEAK SUBJECTS" 
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
              View All
            </button>
          </div>
          
          <div className="space-y-5 flex-1">
            {loading ? (
              <div className="text-text-muted text-sm tracking-widest uppercase">Loading Plan...</div>
            ) : plan.length === 0 ? (
              <div className="bg-surface border border-surface-border rounded-[28px] p-7 text-center">
                <span className="text-text-muted font-bold text-sm tracking-widest uppercase block mb-2">No active blocks</span>
                <button onClick={() => navigate('/plan')} className="text-primary font-bold text-xs tracking-wider border border-primary/20 bg-primary/10 px-4 py-2 rounded-full uppercase transition-all active:scale-95 hover:bg-primary/20 hover:scale-105">Generate Now</button>
              </div>
            ) : (
              plan.slice(0, 3).map((item, idx) => {
                const start = formatTime(currentStartHour);
                currentStartHour += item.allocatedHours;
                const end = formatTime(currentStartHour);
                
                return (
                  <SessionCard 
                    key={item._id || idx}
                    intensity={item.allocatedHours > 2 ? "High Intensity" : "Balanced Session"}
                    intensityColor={item.allocatedHours > 2 ? "bg-primary/20 text-primary" : "bg-[#3b82f6]/20 text-[#3b82f6]"}
                    time={`${start} — ${end}`}
                    title={item.subjectName}
                    desc={`Execute ${item.allocatedHours.toFixed(1)} hours of deep focus based on retention algorithm.`}
                    progressLabel="FOCUS LEVEL"
                    progress={Math.floor(Math.random() * 40 + 60)} // Simulated live progress
                  />
                )
              })
            )}
          </div>
        </div>

        <div className="xl:col-span-7 flex flex-col">
          <div className="relative rounded-[32px] overflow-hidden mb-6 group border border-surface-border">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/80 to-transparent z-10 transition-opacity duration-500"></div>
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
              alt="Workspace" 
              className="w-full h-[320px] object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 blur-[2px] group-hover:blur-0 mix-blend-luminosity hover:mix-blend-normal"
            />
            
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-4 items-center">
               <button className="w-10 h-10 rounded-full bg-surface-hover/80 backdrop-blur-md border border-surface-border flex items-center justify-center text-text-muted hover:text-white transition-all shadow-xl active:scale-95 hover:scale-110 hover:border-primary/50">
                 <Edit3 size={16} />
               </button>
               <button 
                 onClick={() => navigate('/subjects')}
                 className="w-12 h-12 rounded-full bg-primary hover:bg-primary-light flex items-center justify-center text-[#0a0b10] transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
               >
                 <Plus size={24} strokeWidth={2.5} />
               </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-primary/20 rounded-lg backdrop-blur-sm">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">AI Insights</h3>
              </div>
              <p className="text-[#a1a1aa] font-medium leading-relaxed max-w-lg mb-6 text-sm">
                Based on your recent sessions, we recommend focusing on '{weakestSubject !== 'None' ? weakestSubject : 'New Topics'}' to boost global retention by 20%.
              </p>
              <button 
                onClick={() => navigate('/plan')}
                className="bg-primary hover:bg-primary-light text-[#0a0b10] px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-primary/30 active:scale-95 hover:scale-105"
              >
                Start Optimized Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface border border-surface-border rounded-3xl p-6 flex flex-col items-center justify-center text-center h-[120px] hover:bg-surface-hover transition-colors">
              <Timer size={22} className="text-primary mb-3" />
              <h4 className="text-white font-bold mb-1">Focus Timer</h4>
              <span className="text-[10px] text-text-muted font-bold tracking-[0.15em] uppercase">Pomo: 25/5</span>
            </div>
            <div className="bg-surface border border-surface-border rounded-3xl p-6 flex flex-col items-center justify-center text-center h-[120px] hover:bg-surface-hover transition-colors">
              <Sparkles size={22} className="text-primary mb-3" />
              <h4 className="text-white font-bold mb-1">Study AI</h4>
              <span className="text-[10px] text-text-muted font-bold tracking-[0.15em] uppercase">Always Active</span>
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


