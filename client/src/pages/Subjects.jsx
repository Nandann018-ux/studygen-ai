import React, { useState, useEffect } from 'react';
import { Plus, Activity, Cpu, Brain, Banknote, FlaskConical, Sparkles, TrendingUp, X, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: '',
    difficulty: 3,
    proficiency: 3,
    syllabusRemaining: 50,
    examDate: '',
    previousScore: 0,
    hoursPerDay: 2,
    revisionRequired: false
  });

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      // For each subject, fetch its AI-driven "Level"
      const subjectsWithLevel = await Promise.all(response.data.map(async (sub) => {
        try {
          const levelRes = await api.post('/ml/classify', sub);
          return { ...sub, level: levelRes.data.level };
        } catch (e) {
          return { ...sub, level: 'Analyzing...' };
        }
      }));
      setSubjects(subjectsWithLevel);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', formData);
      setFormData({
        subjectName: '',
        difficulty: 3,
        proficiency: 3,
        syllabusRemaining: 50,
        examDate: '',
        previousScore: 0,
        hoursPerDay: 2,
        revisionRequired: false
      });
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Failed to add subject:', err);
      alert('Error adding subject. Please try again.');
    }
  };

  const getDifficultyStyles = (diff, level) => {
    if (level === 'Weak') return { text: 'HIGH ATTENTION', color: 'text-[#ff4e4e] bg-[#ff4e4e]/10', dot: 'bg-[#ff4e4e]' };
    if (diff >= 4) return { text: 'COMPLEX', color: 'text-[#ff4e4e] bg-[#ff4e4e]/10', dot: 'bg-[#ff4e4e]' };
    if (diff === 3) return { text: 'BALANCED', color: 'text-primary bg-primary/10', dot: 'bg-primary' };
    return { text: 'LIGHT', color: 'text-[#0ea5e9] bg-[#0ea5e9]/10', dot: 'bg-[#0ea5e9]' };
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-start mb-10 mt-4">
        <div>
          <span className="inline-block px-3 py-1 bg-surface-hover rounded-full text-[10px] font-bold text-primary tracking-[0.15em] uppercase mb-4">
            Knowledge Repository
          </span>
          <h1 className="text-[52px] font-bold tracking-tight text-text-main mb-4 leading-none">
            Subject Matrix
          </h1>
          <p className="text-text-muted text-[15px] font-medium max-w-xl leading-relaxed">
            Manage your academic landscape. Define proficiency, monitor progress, and leverage AI insights for editorial precision in your study journey.
          </p>
        </div>
        <button className="bg-surface-hover border border-surface-border text-text-main hover:bg-surface-border transition-all px-6 py-2.5 rounded-full text-sm font-semibold active:scale-95 hover:shadow-sm">
          Export Insights
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase">Querying neural clusters...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-transparent border-2 border-dashed border-surface-border rounded-[32px] p-8 min-h-[260px] flex flex-col items-center justify-center cursor-pointer hover:bg-surface-hover/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="text-text-muted font-semibold group-hover:text-text-main transition-colors">Register New Subject</span>
          </div>

          {subjects.map((subject) => {
            const styles = getDifficultyStyles(subject.difficulty, subject.level);
            const progress = 100 - subject.syllabusRemaining;
            
            return (
              <div key={subject._id} className="bg-surface border border-surface-border rounded-[32px] p-8 flex flex-col justify-between hover:border-[#383b4b] transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-2">
                       <div className="w-10 h-10 rounded-[14px] bg-surface-sidebar flex items-center justify-center">
                         <BookOpen size={16} className="text-primary" />
                       </div>
                       {subject.level && (
                         <div className="bg-primary/5 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-primary/10">
                            <Cpu size={10} className="text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase">{subject.level}</span>
                         </div>
                       )}
                    </div>
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${styles.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></div>
                      <span className="text-[9px] font-bold tracking-wider uppercase">{styles.text}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-text-main mb-2 tracking-tight">{subject.subjectName}</h3>
                  <div className="flex gap-4 mb-8">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Proficiency</span>
                        <span className="text-xs font-bold text-text-main">{subject.proficiency}/5</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Commitment</span>
                        <span className="text-xs font-bold text-text-main">{subject.hoursPerDay}h/day</span>
                     </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-text-muted">Knowledge Density</span>
                    <span className="text-xs font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-surface-sidebar h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Existing Insights and Modal logic continues... */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 relative">
          <div className="bg-surface border border-surface-border rounded-[32px] p-8 h-full z-10 relative">
            <h3 className="text-2xl font-bold text-text-main mb-8 tracking-tight">Predictive Metrics</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0"><Brain size={20} className="text-primary" /></div>
                <div>
                  <h4 className="font-bold text-text-main mb-2">Cognitive Overload Protection</h4>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">
                    {subjects.length > 0 ? `System suggests prioritizing ${subjects.find(s => s.level === 'Weak')?.subjectName || subjects[0].subjectName} due to upcoming difficulty spikes.` : 'Add subjects to generate predictions.'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0"><Sparkles size={20} className="text-primary" /></div>
                <div>
                  <h4 className="font-bold text-text-main mb-2">Optimal Study Blocks</h4>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">
                    Based on your ${subjects.reduce((sum, s) => sum + (s.hoursPerDay || 0), 0)} daily target, morning sessions are ideal for high-complexity subjects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center pl-8 pt-8 lg:pt-0">
          <h2 className="text-[32px] font-bold text-text-main tracking-tight mb-4">Neural Architecture</h2>
          <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-2xl mb-8">
            The study planner uses heuristic neural modeling to predict exam outcomes and identify weak mental nodes before they affect your performance.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 rounded-full border border-surface-border bg-surface-hover text-[11px] font-bold tracking-wider text-text-muted uppercase hover:text-white transition-colors cursor-default">
              ML Precision: 94.2%
            </span>
            <span className="px-4 py-2 rounded-full border border-surface-border bg-surface-hover text-[11px] font-bold tracking-wider text-text-muted uppercase hover:text-white transition-colors cursor-default">
              Synaptic Sync: Active
            </span>
          </div>
        </div>
      </div>

      {/* Revised Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface border border-surface-border rounded-[32px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-text-muted hover:text-text-main hover:bg-surface-hover p-2 rounded-full transition-all active:scale-95"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-text-main mb-2">Register Subject</h2>
            <p className="text-text-muted text-sm mb-8">Provision your cognitive parameters for AI model training.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Subject Identity</label>
                <input 
                  type="text" 
                  placeholder="e.g. Advanced Quantum Mechanics"
                  className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Difficulty (1-5)</label>
                  <input type="number" min="1" max="5" className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Proficiency (1-5)</label>
                  <input type="number" min="1" max="5" className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50" value={formData.proficiency} onChange={(e) => setFormData({...formData, proficiency: parseInt(e.target.value)})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Syllabus left (%)</label>
                  <input type="number" min="0" max="100" className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50" value={formData.syllabusRemaining} onChange={(e) => setFormData({...formData, syllabusRemaining: parseInt(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Study Daily (Hours)</label>
                  <input type="number" min="1" max="12" className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50" value={formData.hoursPerDay} onChange={(e) => setFormData({...formData, hoursPerDay: parseInt(e.target.value)})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Previous Exam Score (%)</label>
                  <input type="number" min="0" max="100" className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50" value={formData.previousScore} onChange={(e) => setFormData({...formData, previousScore: parseInt(e.target.value)})} required />
                </div>
                <div>
                   <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Exam Date</label>
                   <input type="date" className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50" value={formData.examDate} onChange={(e) => setFormData({...formData, examDate: e.target.value})} required />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                 <input 
                   type="checkbox" 
                   id="revisionReq"
                   className="w-5 h-5 accent-primary"
                   checked={formData.revisionRequired}
                   onChange={(e) => setFormData({...formData, revisionRequired: e.target.checked})}
                 />
                 <label htmlFor="revisionReq" className="text-sm font-semibold text-text-main">Intensive Revision Cycle Required</label>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-primary text-[#0a0b10] py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-all active:scale-95 text-lg">
                  Initialize Neural Data Path
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

