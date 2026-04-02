import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, FileText, BarChart2, Sparkles, Wand2, CheckCircle2, X, Info } from 'lucide-react';
import api from '../services/api';

export default function StudyPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState({ actualHours: '', completion: 100 });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPlan = async () => {
    try {
      const response = await api.get('/plans');
      // For the first couple of tasks, fetch AI tips
      const planWithTips = await Promise.all(response.data.map(async (task, i) => {
        if (i < 3) { // Only fetch tips for the next 3 tasks to save resources
          try {
            const tipsRes = await api.post('/ml/tips', { subjectName: task.subjectName, difficulty: task.difficulty || 3 });
            return { ...task, aiTips: tipsRes.data.tips };
          } catch (e) {
            return task;
          }
        }
        return task;
      }));
      setPlan(planWithTips);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const showFeedback = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };
// ... rest of logic stays similar ...
// Moving down to JSX updates
// Around line 170 in original file (task card)

  const handleRegenerate = async () => {
    setGenerating(true);
    console.log("Starting plan regeneration...");
    try {
      const response = await api.post('/plans/generate');
      console.log("Plan generated successfully:", response.data);
      
      // If default subjects were seeded, we should ideally refresh the subjects context 
      // but fetchPlan() will at least show the new sessions immediately.
      await fetchPlan(); 
      showFeedback("Neural pathways recalibrated 🧠");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to generate plan";
      console.error("Plan Generation Error:", errMsg, err);
      showFeedback(`${errMsg}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartFocus = (task) => {
    navigate('/focus', { state: { subject: task } });
  };

  const handleMarkCompleted = (task) => {
    setSelectedTask(task);
    setSessionData({ 
      actualHours: task.allocatedHours.toFixed(1), 
      completion: 100 
    });
    setShowModal(true);
  };

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/session', {
        subjectId: selectedTask.subjectId,
        subjectName: selectedTask.subjectName,
        plannedHours: selectedTask.allocatedHours,
        actualHours: parseFloat(sessionData.actualHours),
        completion: parseInt(sessionData.completion),
        date: new Date(),
        planId: selectedTask._id // Crucial for persistence
      });

      // Update local state for immediate visual feedback
      setPlan(prev => prev.map(t => 
        t._id === selectedTask._id ? { ...t, isCompleted: true } : t
      ));

      setShowModal(false);
      showFeedback("AI updated your study pattern 📈");
      // Optional: fetch insights if needed, or just let dashboard handle it
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeInHours) => {
    const h = Math.floor(timeInHours);
    const m = Math.round((timeInHours - h) * 60);
    const date = new Date();
    date.setHours(h, m, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const todayDate = new Date().toISOString().split('T')[0];
  // Standardize comparison by splitting full ISO strings from the backend
  const todayPlan = plan.filter(task => task.date && task.date.split('T')[0] === todayDate);
  let currentStartHour = 8;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 relative">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-primary text-[#0a0b10] px-6 py-3 rounded-full font-bold shadow-2xl animate-in slide-in-from-top-10 duration-300 flex items-center gap-2">
          <Sparkles size={18} />
          {toast}
        </div>
      )}

      <div className="mb-12 mt-4 max-w-2xl">
        <h1 className="text-[52px] font-bold tracking-tight text-text-main mb-4 leading-none">
          Today's Peak <span className="text-primary">Sanctuary</span>
        </h1>
        <p className="text-text-muted text-lg leading-relaxed">
          Your neural-optimized study path. Designed by AI for maximum retention and cognitive endurance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 relative">
          <div className="absolute left-[11px] top-6 bottom-32 w-[2px] bg-surface-border"></div>

          <div className="space-y-8 flex flex-col relative z-10">
            {loading ? (
              <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase">
                Synchronizing Neural Roadmap...
              </div>
            ) : todayPlan.length === 0 ? (
              <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase bg-surface border border-surface-border rounded-[32px]">
                No Sessions Scheduled for Today.
              </div>
            ) : (
              todayPlan.map((task, idx) => {
                const startTimeStr = formatTime(currentStartHour);
                const endTimeStr = formatTime(currentStartHour + task.allocatedHours);
                currentStartHour += task.allocatedHours;

                return (
                  <div key={task._id || idx} className="flex gap-8 relative group">
                    <div className="mt-8 flex-shrink-0 z-10">
                      <div className="w-6 h-6 rounded-full bg-surface border-4 border-surface-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,208,132,0.8)]"></div>
                      </div>
                    </div>
                    <div className={`bg-surface border border-surface-border rounded-[32px] p-8 w-full transition-all ${task.isCompleted ? 'opacity-60 grayscale-[0.3]' : 'hover:border-[#383b4b]'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">
                            {startTimeStr} — {endTimeStr}
                          </span>
                          <h3 className={`text-2xl font-bold text-text-main tracking-tight ${task.isCompleted ? 'line-through decoration-primary/50' : ''}`}>
                            {task.subjectName}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          {task.isCompleted ? (
                            <span className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/50 text-[9px] font-bold text-primary tracking-wide uppercase flex items-center gap-1">
                              <CheckCircle2 size={10} /> Neural Goal Met
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full bg-surface-hover border border-surface-border text-[9px] font-bold text-text-muted tracking-wide uppercase">
                              {task.allocatedHours > 2 ? 'High Intensity' : 'Standard Session'}
                            </span>
                          )}
                        </div>
                      </div>

                      {task.reasons && task.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 animate-in slide-in-from-left-4 duration-500">
                          {task.reasons.map((reason, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-1.5 bg-primary/5 border border-primary/10 px-3 py-1 rounded-lg">
                              <Info size={10} className="text-primary" />
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-text-muted leading-relaxed max-w-2xl mb-8 font-medium">
                        Allocated {task.allocatedHours.toFixed(1)} hours of focus time based on retention algorithms and your cognitive profile.
                      </p>

                      {task.aiTips && task.aiTips.length > 0 && !task.isCompleted && (
                        <div className="mb-8 p-6 bg-surface-sidebar rounded-2xl border border-primary/20 relative overflow-hidden group/tips">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/tips:opacity-20 transition-opacity">
                            <Sparkles size={40} className="text-primary" />
                          </div>
                          <h4 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-4 flex items-center gap-2">
                             <TrendingUp size={12} /> Neural Strategy
                          </h4>
                          <ul className="space-y-3">
                            {task.aiTips.map((tip, tIdx) => (
                              <li key={tIdx} className="text-sm text-text-main flex gap-3 leading-relaxed">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse"></div>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {!task.isCompleted ? (
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => handleStartFocus(task)}
                            className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide hover:text-primary-light transition-all active:scale-95 group/btn"
                          >
                            <Play size={16} className="fill-current group-hover/btn:scale-110 transition-transform" /> Start Focus Session
                          </button>
                          <button 
                            onClick={() => handleMarkCompleted(task)}
                            className="flex items-center gap-2 text-text-muted font-bold text-sm tracking-wide hover:text-text-main transition-all active:scale-95"
                          >
                            <CheckCircle2 size={16} /> Mark as Completed
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-text-muted/50 font-bold text-xs tracking-widest uppercase">
                          <Sparkles size={14} className="text-primary/40" /> Neural State Captured
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-8 pl-14">
              <button 
                onClick={handleRegenerate}
                disabled={generating}
                className="w-full bg-primary hover:bg-primary-light text-[#0a0b10] py-5 rounded-full font-bold text-lg tracking-tight transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-primary/40 overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-white/20 transition-transform duration-1000 ${generating ? 'translate-x-0' : '-translate-x-full'}`}></div>
                <Wand2 size={20} className={generating ? "animate-spin" : "group-hover:rotate-12 transition-transform"} /> 
                {generating ? 'Rebuilding Cognitive Grid...' : 'Regenerate Neural Plan'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface border border-surface-border rounded-[32px] p-8 sticky top-6 hover:border-[#383b4b] transition-colors">
            <div className="flex items-center gap-3 mb-10">
              <BarChart2 size={24} className="text-primary" />
              <h2 className="text-xl font-bold text-text-main tracking-tight">Plan Analytics</h2>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-text-muted">Remaining Commitment</span>
                <span className="text-3xl font-bold text-text-main leading-none">
                  {todayPlan
                    .filter(t => !t.isCompleted)
                    .reduce((acc, curr) => acc + Number(curr.allocatedHours), 0)
                    .toFixed(1)}
                  <span className="text-base text-text-muted ml-1 font-medium">hrs</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-surface-sidebar rounded-2xl p-5 border border-surface-border">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">Total Tasks</span>
                <span className="text-2xl font-bold text-text-main leading-none">{todayPlan.length}</span>
              </div>
              <div className="bg-surface-sidebar rounded-2xl p-5 border border-surface-border">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">Neural Load</span>
                <span className="text-2xl font-bold text-text-main leading-none">Optimal</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-surface-border group p-1 bg-surface-sidebar">
               <div className="h-32 w-full flex items-end justify-center gap-1.5 px-2 pb-2">
                  {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className="w-full bg-primary/20 rounded-t-lg transition-all duration-700 hover:bg-primary/40" style={{ height: `${Math.random() * 60 + 20}%`, transitionDelay: `${i * 50}ms` }}></div>
                   ))}
               </div>
               <div className="absolute top-4 left-4 z-20">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1 block">Live Flow</span>
                  <span className="text-xs font-bold text-white">Focus peaking now</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-border w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-main tracking-tight">Session Success</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitSession} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Actual Focus Duration (hrs)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  autoFocus
                  value={sessionData.actualHours}
                  onChange={(e) => setSessionData({...sessionData, actualHours: e.target.value})}
                  className="w-full bg-surface-sidebar border border-surface-border rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-4 flex justify-between">
                  Syllabus Mastered
                  <span className="text-primary font-bold">{sessionData.completion}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sessionData.completion}
                  onChange={(e) => setSessionData({...sessionData, completion: e.target.value})}
                  className="w-full accent-primary bg-surface-sidebar h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-light text-[#0a0b10] py-4 rounded-xl font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20 hover:scale-[1.02]"
              >
                {submitting ? 'Synthesizing Results...' : 'Log Session Success'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

