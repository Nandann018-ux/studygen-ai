import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Brain, CheckCircle2, ChevronLeft, Sparkles, Timer, Zap, XCircle } from 'lucide-react';

export default function Focus() {
  const location = useLocation();
  const navigate = useNavigate();
  const subject = location.state?.subject || { subjectName: 'General Focus', reasons: ['Deep work session'] };

  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus' or 'break'
  
  // Timer sync engine
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionEnd();
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionEnd = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {}); 
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchSession = (type) => {
    setSessionType(type);
    setIsActive(false);
    setTimeLeft(type === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = sessionType === 'focus' ? 25 * 60 : 5 * 60;
  // Precision math for the radial progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 relative select-none">
      <button 
        onClick={() => navigate('/plan')}
        className="absolute top-0 left-0 flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-sm group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Roadmap
      </button>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-text-main tracking-tight mb-4">
          Focus Session: <span className="text-primary">{subject.subjectName}</span>
        </h1>
        <div className="flex justify-center gap-2">
          {subject.reasons?.map((reason, idx) => (
            <span key={idx} className="px-4 py-1.5 bg-primary/5 border border-primary/10 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] rounded-lg">
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="relative group border border-surface-border rounded-[60px] p-2 bg-surface/30 backdrop-blur-3xl shadow-2xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
        
        <div className="bg-surface rounded-[52px] p-20 flex flex-col items-center relative z-10 w-[440px]">
           {/* Mathematical Precision SVG Timer */}
           <svg viewBox="0 0 200 200" className="absolute inset-4 -rotate-90 w-[calc(100%-32px)] h-[calc(100%-32px)] drop-shadow-2xl">
             <circle 
               cx="100" 
               cy="100" 
               r={radius} 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="8" 
               className="text-surface-sidebar"
             />
             <circle 
               cx="100" 
               cy="100" 
               r={radius} 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="8" 
               strokeDasharray={circumference}
               strokeDashoffset={strokeDashoffset}
               strokeLinecap="round"
               className="text-primary transition-all duration-300 ease-linear shadow-primary/40"
               style={{ filter: 'drop-shadow(0 0 8px rgba(0,208,132,0.6))' }}
             />
           </svg>

           <div className="mb-6 z-10 flex flex-col items-center gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(0,208,132,1)]' : 'bg-text-muted opacity-30 shadow-none'}`}></div>
             <span className={`text-[11px] font-black tracking-[0.3em] uppercase transition-all duration-500 ${sessionType === 'focus' ? 'text-primary' : 'text-blue-400'} ${isActive ? 'opacity-100' : 'opacity-40'}`}>
               {sessionType === 'focus' ? 'Neural Load Active' : 'Restoration Phase'}
             </span>
           </div>

           <div className={`text-[100px] font-bold text-text-main tracking-tighter mb-8 tabular-nums leading-none transition-transform duration-700 ${isActive ? 'scale-105 animate-pulse' : 'scale-100'}`}>
             {formatTime(timeLeft)}
           </div>

           <div className="flex items-center gap-6 z-10">
              <button 
                onClick={resetTimer}
                className="w-14 h-14 rounded-full bg-surface-sidebar hover:bg-surface-border text-text-muted hover:text-text-main flex items-center justify-center transition-all border border-surface-border active:scale-95"
                title="Reset Clock"
              >
                <RotateCcw size={20} />
              </button>

              <button 
                onClick={toggleTimer}
                className="w-20 h-20 rounded-full bg-primary hover:bg-primary-light text-surface flex items-center justify-center transition-all shadow-2xl shadow-primary/30 hover:scale-110 active:scale-90"
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1.5" />}
              </button>

              <button 
                onClick={() => {
                  if (window.confirm("End session and return to roadmap?")) {
                    navigate('/plan');
                  }
                }}
                className="w-14 h-14 rounded-full bg-surface-sidebar hover:bg-red-500/10 hover:border-red-500/30 text-text-muted hover:text-red-500 flex items-center justify-center transition-all border border-surface-border active:scale-95"
                title="Finish Session Early"
              >
                <XCircle size={20} />
              </button>
           </div>
        </div>
      </div>

      <div className="flex gap-4 p-2 bg-surface-sidebar border border-surface-border rounded-full mb-12 shadow-inner">
        <button 
          onClick={() => switchSession('focus')}
          className={`flex items-center gap-2 px-10 py-4 rounded-full font-black text-xs transition-all tracking-[0.1em] uppercase ${sessionType === 'focus' ? 'bg-surface text-primary border border-surface-border shadow-2xl ring-1 ring-primary/20' : 'text-text-muted hover:text-text-main'}`}
        >
          <Zap size={14} className={sessionType === 'focus' ? 'animate-pulse' : ''} /> 25:00 Focus
        </button>
        <button 
          onClick={() => switchSession('break')}
          className={`px-10 py-4 rounded-full font-black text-xs transition-all tracking-[0.1em] uppercase ${sessionType === 'break' ? 'bg-surface text-blue-400 border border-surface-border shadow-2xl ring-1 ring-blue-400/20' : 'text-text-muted hover:text-text-main'}`}
        >
          05:00 Break
        </button>
      </div>

      <div className="flex items-center gap-16 opacity-30 hover:opacity-60 transition-opacity duration-500">
        <div className="flex items-center gap-3">
          <Brain size={18} className="text-primary" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Neural Capacity: Optimized</span>
        </div>
        <div className="flex items-center gap-3">
          <Timer size={18} className="text-primary" />
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Framework: Pomodoro</span>
        </div>
      </div>
    </div>
  );
}
