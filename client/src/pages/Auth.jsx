import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('studygen_token', response.data.token);
        localStorage.setItem('studygen_user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true);
        setError('Account created! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-bg font-sans transition-colors duration-300">
      <div className="hidden lg:flex flex-col w-1/2 bg-surface-hover p-12 relative overflow-hidden justify-between transition-colors duration-300">
        <div className="flex items-center gap-2 mb-12 relative z-10">
          <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <span className="font-semibold text-primary text-xl tracking-tight">StudyGen AI</span>
        </div>
        
        <div className="max-w-xl relative z-10 flex-1 flex flex-col justify-center mt-[-10vh]">
          <h1 className="text-6xl font-bold text-text-main mb-6 leading-tight tracking-tight">
            Master your mind, <br />
            <span className="text-primary">{isLogin ? 'accelerate mastery.' : 'evolve faster.'}</span>
          </h1>
          <p className="text-xl text-text-muted leading-relaxed max-w-lg font-medium">
            An advanced neural engine designed for high-performance cognitive development and intelligent study orchestration.
          </p>
        </div>

        <div className="relative z-10 bg-surface-bg/80 backdrop-blur-xl p-6 rounded-3xl max-w-sm shadow-sm border border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden border border-white flex justify-center items-end">
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <div>
              <h4 className="font-semibold text-text-main text-sm">Stephen Hawking</h4>
              <p className="text-xs text-text-muted">Theoretical Physicist</p>
            </div>
          </div>
          <p className="text-sm text-text-muted italic leading-relaxed">
            "Intelligence is the ability to adapt to change. StudyGen AI provides the perfect cognitive framework to navigate that internal evolution with precision."
          </p>
        </div>

        {}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white/20 rounded-full blur-2xl pointer-events-none opacity-40 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-bold text-white/10 select-none pointer-events-none tracking-tighter mix-blend-overlay">AI</div>
      </div>

      {}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-sidebar transition-colors duration-300">
        <div className="w-full max-w-md bg-surface p-10 rounded-[32px] shadow-xl shadow-black/5 border border-surface-border transition-colors duration-300">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-main mb-3">
              {isLogin ? 'Welcome back' : 'Join Cognitive Sanctuary'}
            </h2>
            <p className="text-text-muted text-sm font-medium">
              {isLogin ? 'Log in to your dashboard' : 'Begin your intelligent study path today'}
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Public Name</label>
                <input 
                  type="text" 
                  placeholder="Julian M." 
                  className="block w-full px-5 py-3.5 bg-surface-bg border-transparent rounded-xl text-text-main placeholder-text-muted/60 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none border hover:border-surface-border"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-bg border-transparent rounded-xl text-text-main placeholder-text-muted/60 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none border hover:border-surface-border"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide">Password</label>
                {isLogin && <a href="#" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">Forgot?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="block w-full pl-12 pr-12 py-3.5 bg-surface-bg border-transparent rounded-xl text-text-main placeholder-text-muted/60 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium outline-none border hover:border-surface-border"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Eye className="h-5 w-5 text-text-muted hover:text-text-main transition-colors" />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Enter Workspace' : 'Create Account')}
            </button>
          </form>

          <div className="mt-10">
            <p className="text-center text-sm text-text-muted font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-semibold text-primary hover:text-primary-dark transition-transform active:scale-95 inline-block"
              >
                {isLogin ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-6 flex gap-8 text-xs font-semibold text-text-muted">
          <a href="#" className="hover:text-text-main transition-colors hover:scale-105 active:scale-95 block">Privacy Policy</a>
          <a href="#" className="hover:text-text-main transition-colors hover:scale-105 active:scale-95 block">Terms of Service</a>
          <a href="#" className="hover:text-text-main transition-colors hover:scale-105 active:scale-95 block">Contact Support</a>
        </div>
      </div>
    </div>
  );
}

