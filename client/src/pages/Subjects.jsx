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
    examDate: ''
  });

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
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
        examDate: ''
      });
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Failed to add subject:', err);
      alert('Error adding subject. Please try again.');
    }
  };

  const getDifficultyStyles = (diff) => {
    if (diff >= 4) return { text: 'HIGH DIFFICULTY', color: 'text-[#ff4e4e] bg-[#ff4e4e]/10', dot: 'bg-[#ff4e4e]' };
    if (diff === 3) return { text: 'BALANCED', color: 'text-primary bg-primary/10', dot: 'bg-primary' };
    return { text: 'LIGHT EFFORT', color: 'text-[#0ea5e9] bg-[#0ea5e9]/10', dot: 'bg-[#0ea5e9]' };
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
            Curate your mental garden. Define difficulty, track neuro-plasticity progress, and master your domain with editorial precision.
          </p>
        </div>
        <button className="bg-surface-hover border border-surface-border text-text-main hover:bg-surface-border transition-all px-6 py-2.5 rounded-full text-sm font-semibold active:scale-95 hover:shadow-sm">
          Export Data
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted font-bold tracking-widest uppercase">Initializing neural databanks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-transparent border-2 border-dashed border-surface-border rounded-[32px] p-8 min-h-[220px] flex flex-col items-center justify-center cursor-pointer hover:bg-surface-hover/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="text-text-muted font-semibold group-hover:text-text-main transition-colors">Add New Subject</span>
          </div>

          {subjects.map((subject) => {
            const styles = getDifficultyStyles(subject.difficulty);
            const progress = 100 - subject.syllabusRemaining;
            
            return (
              <div key={subject._id} className="bg-surface border border-surface-border rounded-[32px] p-8 flex flex-col justify-between hover:border-[#383b4b] transition-all">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-[16px] bg-surface-sidebar flex items-center justify-center">
                      <BookOpen size={18} className="text-primary" />
                    </div>
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${styles.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></div>
                      <span className="text-[9px] font-bold tracking-wider uppercase">{styles.text}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-text-main mb-3 tracking-tight">{subject.subjectName}</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm">
                    {subject.examDate ? `Targeting mastery by ${new Date(subject.examDate).toLocaleDateString()}` : 'Continuous learning track without fixed deadline.'}
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-text-muted">Mastery</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 relative">
          <div className="bg-surface border border-surface-border rounded-[32px] p-8 h-full z-10 relative">
            <h3 className="text-2xl font-bold text-text-main mb-8 tracking-tight">AI Insights</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0"><Sparkles size={20} className="text-primary" /></div>
                <div>
                  <h4 className="font-bold text-text-main mb-2">Spaced Repetition Alert</h4>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">
                    {subjects.length > 0 ? `${subjects[0].subjectName} retention is dipping. Schedule a review session for tomorrow.` : 'Add subjects to generate insights.'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0"><TrendingUp size={20} className="text-primary" /></div>
                <div>
                  <h4 className="font-bold text-text-main mb-2">Momentum Gained</h4>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">
                    Global neural mastery increased by 12% this week. You're in a "Flow State" cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center pl-8 pt-8 lg:pt-0">
          <h2 className="text-[32px] font-bold text-text-main tracking-tight mb-4">Editorial Progress View</h2>
          <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-2xl mb-8">
            Our AI doesn't just track hours; it monitors cognitive load and neural density metrics. The more you focus, the sharper the sanctuary becomes.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 rounded-full border border-surface-border bg-surface-hover text-[11px] font-bold tracking-wider text-text-muted uppercase hover:text-white hover:border-text-muted transition-colors cursor-default">
              Neural Load: 82%
            </span>
            <span className="px-4 py-2 rounded-full border border-surface-border bg-surface-hover text-[11px] font-bold tracking-wider text-text-muted uppercase hover:text-white hover:border-text-muted transition-colors cursor-default">
              Deep Work: 6.4h Avg
            </span>
            <span className="px-4 py-2 rounded-full border border-surface-border bg-surface-hover text-[11px] font-bold tracking-wider text-text-muted uppercase hover:text-white hover:border-text-muted transition-colors cursor-default">
              Mastery Goal: 90%
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface border border-surface-border rounded-[32px] p-10 w-full max-w-xl shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-text-muted hover:text-text-main hover:bg-surface-hover p-2 rounded-full transition-all active:scale-95"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-text-main mb-8">Add New Subject</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Subject Name</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all hover:bg-surface-border/50"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Difficulty (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all hover:bg-surface-border/50"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value ? parseInt(e.target.value) : ''})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Syllabus left (%)</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all hover:bg-surface-border/50"
                    value={formData.syllabusRemaining}
                    onChange={(e) => setFormData({...formData, syllabusRemaining: e.target.value ? parseInt(e.target.value) : ''})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Exam Date</label>
                <input 
                  type="date" 
                  className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all hover:bg-surface-border/50"
                  value={formData.examDate}
                  onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary text-[#0a0b10] px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-all active:scale-95">
                  Initialize Neural Path
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

