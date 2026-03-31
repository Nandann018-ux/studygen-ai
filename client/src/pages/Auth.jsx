import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, Sparkles } from 'lucide-react';
export default function Auth() {
  const navigate = useNavigate();
  const handleDummyLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  return (
    <div className="flex min-h-screen bg-[#f4f5f8] font-sans">
      <div className="hidden lg:flex flex-col w-1/2 bg-[#e8e9ef] p-12 relative overflow-hidden justify-between">
        <div className="flex items-center gap-2 mb-12 relative z-10">
          <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <span className="font-semibold text-primary text-xl tracking-tight">AI Smart Study Planner</span>
        </div>
        <div className="max-w-xl relative z-10 flex-1 flex flex-col justify-center mt-[-10vh]">
          <h1 className="text-6xl font-bold text-text-main mb-6 leading-tight tracking-tight">
            Study smarter, <br />
            <span className="text-primary">not harder.</span>
          </h1>
          <p className="text-xl text-[#5b617c] leading-relaxed max-w-lg font-medium">
            An intelligent scheduling system using spaced repetition and cognitive load targeting.
          </p>
        </div>
        <div className="relative z-10 bg-[#f4f5f8]/80 backdrop-blur-xl p-6 rounded-3xl max-w-sm shadow-sm border border-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-400 overflow-hidden border border-white flex justify-center items-end">
              <svg className="w-10 h-10 text-slate-800" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <div>
              <h4 className="font-semibold text-text-main text-sm">Alex Chen</h4>
              <p className="text-xs text-text-muted">Cognitive Science Student</p>
            </div>
          </div>
          <p className="text-sm text-[#5b617c] italic leading-relaxed">
            "The spatial flexibility of this platform changed how I organize my research. It feels like a premium workspace, not just a tool."
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white/20 rounded-full blur-2xl pointer-events-none opacity-40 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-bold text-white/10 select-none pointer-events-none tracking-tighter mix-blend-overlay">AI</div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8f9fc]">
        <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-xl shadow-slate-200/50">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-main mb-3">Welcome back</h2>
            <p className="text-text-muted text-sm font-medium">Log in to your dashboard</p>
          </div>
          <form onSubmit={handleDummyLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#5b617c] mb-2 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="block w-full pl-12 pr-4 py-3.5 bg-[#f4f5f8] border-transparent rounded-xl text-text-main placeholder-text-muted/60 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-[#5b617c] uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="block w-full pl-12 pr-12 py-3.5 bg-[#f4f5f8] border-transparent rounded-xl text-text-main placeholder-text-muted/60 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none"
                  required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Eye className="h-5 w-5 text-text-muted hover:text-text-main transition-colors" />
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] mt-2"
            >
              Enter Workspace
            </button>
          </form>
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-slate-400 font-semibold uppercase tracking-widest">Or continue with</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-[#f4f5f8] hover:bg-[#ebedf3] py-3 rounded-xl transition-colors font-semibold text-sm text-text-main">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#f4f5f8] hover:bg-[#ebedf3] py-3 rounded-xl transition-colors font-semibold text-sm text-text-main">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.365 21.46c-1.39.957-2.73 1.942-4.33 1.942-1.585 0-2.458-.962-4.32-.962-1.87 0-2.858.93-4.35.962C1.865 23.447.385 22.38 0 17.65c-.074-1.12.036-2.66.44-4.22.61-2.31 1.83-4.27 3.65-5.32 1.67-1 3.37-1.16 4.39-1.16 1.77 0 3.04.992 4.26.992 1.134 0 2.378-.967 4.54-.967 1.5 0 3.24.464 4.52 1.81-3.69 2.06-3 5.92-.81 6.94-1.22 2.89-3.23 4.88-4.635 5.79zm-4.32-20.94c.934 0 2.15.534 2.84 1.294.62.66.974 1.63 1.05 2.508-1.04.032-2.18-.328-2.92-1.01-.76-.69-1.2-1.72-1.07-2.618.1-.03.22-.05.37-.05z"/>
                </svg>
                Apple
              </button>
            </div>
            <p className="mt-10 text-center text-sm text-[#5b617c] font-medium">
              Don't have an account? <a href="#" className="font-semibold text-primary hover:text-primary-dark transition-colors">Create account</a>
            </p>
          </div>
        </div>
        <div className="absolute bottom-6 flex gap-8 text-xs font-semibold text-[#808298]">
          <a href="#" className="hover:text-text-main transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-text-main transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-text-main transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
