import React, { useState, useEffect } from 'react';
import { Play, FileText, BarChart2, Sparkles, Wand2, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

export default function StudyPlan() {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState({ actualHours: '', completion: 100 });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlan = async () => {
    try {
      const response = await api.get('/plans');
      setPlan(response.data);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/plans/generate');
      await fetchPlan();
    } catch (err) {
      console.error('Failed to generate plan:', err);
      alert('Error generating plan. Have you added subjects?');
    } finally {
      setGenerating(false);
    }
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
        date: new Date()
      });
      setShowModal(false);
      alert('Session tracked successfully!');
    } catch (err) {
      console.error('Failed to save session:', err);
      alert('Error saving session progress.');
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

  let currentStartHour = 8;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
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
                Loading Neural Roadmap...
              </div>
            ) : plan.length === 0 ? (
              <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase bg-surface border border-surface-border rounded-[32px]">
                No Plan Available. Generate one below!
              </div>
            ) : (
              plan.map((task, idx) => {
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
                    <div className="bg-surface border border-surface-border rounded-[32px] p-8 w-full hover:border-[#383b4b] transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block">
                            {startTimeStr} — {endTimeStr}
                          </span>
                          <h3 className="text-2xl font-bold text-text-main tracking-tight">
                            {task.subjectName}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-surface-hover border border-surface-border text-[9px] font-bold text-text-muted tracking-wider uppercase">
                            {task.allocatedHours > 2 ? 'High Intensity' : 'Standard'}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-muted leading-relaxed max-w-2xl mb-8">
                        Allocated {task.allocatedHours.toFixed(1)} hours of focus time for this subject based on your spaced repetition needs.
                      </p>
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide hover:text-primary-light transition-all active:scale-95 hover:translate-x-1">
                          <Play size={16} className="fill-current" /> Start Focus Session
                        </button>
                        <button 
                          onClick={() => handleMarkCompleted(task)}
                          className="flex items-center gap-2 text-text-muted font-bold text-sm tracking-wide hover:text-text-main transition-all active:scale-95"
                        >
                          <CheckCircle2 size={16} /> Mark as Completed
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-8 pl-14">
              <button 
                onClick={handleRegenerate}
                disabled={generating}
                className="w-full bg-primary hover:bg-primary-light text-[#0a0b10] py-5 rounded-full font-bold text-lg tracking-tight transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-primary/40"
              >
                <Wand2 size={20} className={generating ? "animate-spin" : "group-hover:rotate-12 transition-transform"} /> 
                {generating ? 'Calculating Neural Pathways...' : 'Regenerate Neural Plan'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface border border-surface-border rounded-[32px] p-8 sticky top-6">
            <div className="flex items-center gap-3 mb-10">
              <BarChart2 size={24} className="text-primary" />
              <h2 className="text-xl font-bold text-text-main tracking-tight">Plan Analytics</h2>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-text-muted">Daily Commitment</span>
                <span className="text-3xl font-bold text-text-main leading-none">
                  {plan.reduce((acc, curr) => acc + curr.allocatedHours, 0).toFixed(1)}
                  <span className="text-base text-text-muted ml-1">hrs</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-surface-sidebar rounded-2xl p-5 border border-surface-border">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">Total Tasks</span>
                <span className="text-2xl font-bold text-text-main leading-none">{plan.length}</span>
              </div>
              <div className="bg-surface-sidebar rounded-2xl p-5 border border-surface-border">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">Intensity</span>
                <span className="text-2xl font-bold text-text-main leading-none">High</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-surface-border group">
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-10"></div>
              <div className="h-28 w-full bg-surface-sidebar flex items-end opacity-50 px-2 pt-4 gap-[2px]">
                {Array.from({length: 40}).map((_, i) => (
                  <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                ))}
              </div>
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-[10px] font-bold tracking-widest uppercase text-primary block mb-1">AI Insights</span>
                <span className="text-sm font-semibold text-text-main">Neural plasticity peaking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-border w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-main tracking-tight">Session Protocol</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-main">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitSession} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">Actual Focus Duration (hrs)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={sessionData.actualHours}
                  onChange={(e) => setSessionData({...sessionData, actualHours: e.target.value})}
                  className="w-full bg-surface-sidebar border border-surface-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-2 flex justify-between">
                  Syllabus Completion
                  <span className="text-primary">{sessionData.completion}%</span>
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
                className="w-full bg-primary hover:bg-primary-light text-[#0a0b10] py-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {submitting ? 'Archiving Neural Data...' : 'Log Session Success'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

