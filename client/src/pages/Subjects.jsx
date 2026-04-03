import React, { useState, useEffect } from 'react';
import { Plus, Activity, Cpu, Brain, Banknote, FlaskConical, Sparkles, TrendingUp, X, BookOpen, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);


  const subjectDataset = [
    "Data Structures & Algorithms",
    "Web Architecture",
    "Systems Design",
    "Engineering Mathematics",
    "Artificial Intelligence",
    "Computer Networks",
    "Operating Systems",
    "Database Management",
    "Quantum Mechanics",
    "Linear Algebra",
    "Organic Chemistry",
    "Macroeconomics",
    "Software Engineering",
    "Machine Learning",
    "Discrete Mathematics",
    "Thermodynamics",
    "Psychology",
    "Microprocessors",
    "Environmental Science",
    "Digital Logic Design"
  ].sort();

  const initialFormState = {
    name: '',
    difficulty: 3,
    proficiency: 3,
    syllabusRemaining: 50,
    examDate: '',
    previousScore: 0,
    hoursPerDay: 2,
    revisionRequired: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');

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
    console.log("Submitting subject:", formData);
    try {
      if (isEditing) {
        await api.put(`/subjects/${editId}`, formData);
      } else {
        await api.post('/subjects', formData);
      }

      setFormData(initialFormState);
      setIsModalOpen(false);
      setIsEditing(false);
      setEditId(null);
      fetchSubjects();
    } catch (err) {
      console.error('Failed to save subject:', err);
      alert('Error saving subject. Please try again.');
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name || subject.subjectName || '',
      difficulty: Number(subject.difficulty) || 3,
      proficiency: Number(subject.proficiency) || 3,
      syllabusRemaining: Number(subject.syllabusRemaining) || 0,
      examDate: subject.examDate ? new Date(subject.examDate).toISOString().split('T')[0] : '',
      previousScore: Number(subject.previousScore) || 0,
      hoursPerDay: Number(subject.hoursPerDay) || 2,
      revisionRequired: Boolean(subject.revisionRequired)
    });
    setEditId(subject._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the neural node for "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
      } catch (err) {
        console.error('Failed to delete subject:', err);
        alert('Error deleting subject.');
      }
    }
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const getDifficultyStyles = (diff, level) => {
    if (level === 'Weak') return { text: 'HIGH ATTENTION', color: 'text-[#ff4e4e] bg-[#ff4e4e]/10', dot: 'bg-[#ff4e4e]' };
    const d = (diff !== undefined && diff !== null) ? Number(diff) : 3;
    if (d >= 4) return { text: 'COMPLEX', color: 'text-[#ff4e4e] bg-[#ff4e4e]/10', dot: 'bg-[#ff4e4e]' };
    if (d === 3) return { text: 'BALANCED', color: 'text-primary bg-primary/10', dot: 'bg-primary' };
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
            onClick={openAddModal}
            className="bg-transparent border-2 border-dashed border-surface-border rounded-[32px] p-8 min-h-[260px] flex flex-col items-center justify-center cursor-pointer hover:bg-surface-hover/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center text-text-muted mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="text-text-muted font-semibold group-hover:text-text-main transition-colors">Register New Subject</span>
          </div>

          {subjects.map((subject) => {
            const styles = getDifficultyStyles(subject.difficulty, subject.level);
            const progress = 100 - (subject.syllabusRemaining !== undefined ? Number(subject.syllabusRemaining) : 100);
            const displayName = subject.name || subject.subjectName || "Unnamed Node";

            return (
              <div key={subject._id} className="bg-surface border border-surface-border rounded-[32px] p-8 flex flex-col justify-between hover:border-[#383b4b] transition-all group relative overflow-hidden">
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                   <button
                     onClick={(e) => { e.stopPropagation(); handleEdit(subject); }}
                     className="p-2 bg-surface-sidebar border border-surface-border rounded-xl text-text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                     title="Reconfigure Node"
                   >
                      <Edit2 size={14} />
                   </button>
                   <button
                     onClick={(e) => { e.stopPropagation(); handleDelete(subject._id, displayName); }}
                     className="p-2 bg-surface-sidebar border border-surface-border rounded-xl text-text-muted hover:text-[#ff4e4e] hover:border-[#ff4e4e]/30 transition-all active:scale-95"
                     title="Terminate Node"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>

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
                  <h3 className="text-2xl font-bold text-text-main mb-2 tracking-tight truncate pr-16">{displayName}</h3>
                  <div className="flex gap-4 mb-8">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Proficiency</span>
                        <span className="text-xs font-bold text-text-main">{(subject.proficiency !== undefined ? subject.proficiency : 3)}/5</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Commitment</span>
                        <span className="text-xs font-bold text-text-main">{(subject.hoursPerDay !== undefined ? subject.hoursPerDay : 2)}h/day</span>
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

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0a0b10]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-surface border border-surface-border rounded-[32px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-text-muted hover:text-text-main hover:bg-surface-hover p-2 rounded-full transition-all active:scale-95"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold text-text-main mb-2">
                {isEditing ? 'Reconfigure Subject' : 'Register Subject'}
            </h2>
            <p className="text-text-muted text-sm mb-8">
                {isEditing ? 'Update your cognitive parameters for real-time AI recalibration.' : 'Provision your cognitive parameters for AI model training.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Subject Identity</label>
                <input
                  type="text"
                  list="subject-dataset"
                  placeholder="Select or type subject node..."
                  className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <datalist id="subject-dataset">
                  {subjectDataset.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Difficulty (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50"
                    value={formData.difficulty}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(5, Math.max(1, Number(e.target.value)));
                      setFormData({...formData, difficulty: val});
                    }}
                    onBlur={() => {
                        if (formData.difficulty === '') setFormData({...formData, difficulty: 3});
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Proficiency (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50"
                    value={formData.proficiency}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(5, Math.max(1, Number(e.target.value)));
                      setFormData({...formData, proficiency: val});
                    }}
                    onBlur={() => {
                        if (formData.proficiency === '') setFormData({...formData, proficiency: 3});
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Syllabus left (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50"
                    value={formData.syllabusRemaining}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value)));
                      setFormData({...formData, syllabusRemaining: val});
                    }}
                    onBlur={() => {
                        if (formData.syllabusRemaining === '') setFormData({...formData, syllabusRemaining: 50});
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Study Daily (0.5-12 Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50"
                    value={formData.hoursPerDay}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(12, Math.max(0.5, Number(e.target.value)));
                      setFormData({...formData, hoursPerDay: val});
                    }}
                    onBlur={() => {
                        if (formData.hoursPerDay === '') setFormData({...formData, hoursPerDay: 2});
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">Previous Exam Score (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-5 py-4 text-text-main text-sm focus:outline-none focus:border-primary/50"
                    value={formData.previousScore}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value)));
                      setFormData({...formData, previousScore: val});
                    }}
                    onBlur={() => {
                        if (formData.previousScore === '') setFormData({...formData, previousScore: 60});
                    }}
                    required
                  />
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
                  {isEditing ? 'Synchronize Neural Data' : 'Initialize Neural Data Path'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
