import React, { useState, useEffect } from 'react';
import { Search, Brain, Monitor, Target, Link as LinkIcon, Lock, Moon, Sun, Clock, Volume2, LogOut, User, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('interface');
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState({ name: '', email: '', dailyStudyHours: 4 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studygen_token');
    localStorage.removeItem('studygen_user');
    window.location.href = '/auth';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        name: user.name,
        dailyStudyHours: user.dailyStudyHours
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-12 mt-4 max-w-2xl">
        <h1 className="text-[52px] font-bold tracking-tight text-text-main mb-4 leading-none">
          System <span className="text-primary">Preferences</span>
        </h1>
        <p className="text-text-muted text-lg leading-relaxed">
          Configure your cognitive sanctuary. Fine-tune your AI models, notification protocols, and visual environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <nav className="space-y-2">
            <NavBtn 
              icon={<User size={18} />} 
              label="Profile & Identity" 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
            />
            <NavBtn 
              icon={<Monitor size={18} />} 
              label="Interface & Workspace" 
              active={activeTab === 'interface'} 
              onClick={() => setActiveTab('interface')} 
            />
            <NavBtn 
              icon={<Target size={18} />} 
              label="Cognitive Limits" 
              active={activeTab === 'cognitive'} 
              onClick={() => setActiveTab('cognitive')} 
            />
            <NavBtn 
              icon={<Brain size={18} />} 
              label="AI & Neural Models" 
              active={activeTab === 'neural'} 
              onClick={() => setActiveTab('neural')} 
            />
          </nav>

          <div className="pt-8 border-t border-surface-border">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-semibold text-sm active:scale-95"
            >
              <LogOut size={18} />
              Terminate Session
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="bg-surface rounded-[32px] p-8 md:p-10 border border-surface-border shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Profile Credentials</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className="w-full bg-surface-sidebar border border-surface-border rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Email Endpoint</label>
                    <input 
                      type="email" 
                      value={user.email}
                      disabled
                      className="w-full bg-surface-sidebar border border-surface-border rounded-xl py-3 px-4 text-text-muted cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interface' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="bg-surface rounded-[32px] p-8 md:p-10 border border-surface-border shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Visual Environment</h2>
                </div>
                <ToggleRow 
                  icon={theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} 
                  title="Dark Architecture" 
                  desc="Switch between light and dark visual sanctuary themes."
                  active={theme === 'dark'}
                  onToggle={toggleTheme}
                />
              </div>
            </div>
          )}

          {activeTab === 'cognitive' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="bg-surface rounded-[32px] p-8 md:p-10 border border-surface-border shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Cognitive Thresholds</h2>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-4 flex justify-between">
                    Daily Active Focus Capacity
                    <span className="text-primary">{user.dailyStudyHours} hrs</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="16" 
                    value={user.dailyStudyHours}
                    onChange={(e) => setUser({...user, dailyStudyHours: parseInt(e.target.value)})}
                    className="w-full accent-primary bg-surface-sidebar h-2 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="mt-4 text-xs text-text-muted font-medium">
                    Adjusting this limits the total study hours the AI will allocate per day.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'neural' && (
            <div className="bg-surface rounded-[32px] p-20 border border-surface-border flex items-center justify-center text-center">
               <p className="text-text-muted font-medium">Neural settings are optimized automatically by the model.</p>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-light text-[#0a0b10] px-10 py-4 rounded-full font-bold text-sm tracking-wide shadow-xl shadow-primary/20 transition-all active:scale-95 group flex items-center gap-2 hover:scale-105 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Syncing...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-semibold text-sm active:scale-[0.98]
        ${active 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'text-text-muted hover:bg-surface hover:text-text-main border border-transparent hover:translate-x-1'
        }`}
    >
      <div className={`${active ? 'text-primary' : 'text-text-muted'}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}

function ToggleRow({ icon, title, desc, active, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex gap-4">
        <div className="mt-1 flex-shrink-0 text-text-muted">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-text-main text-sm mb-1">{title}</h4>
          <p className="text-xs text-text-muted font-medium">{desc}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ${active ? 'bg-primary' : 'bg-surface-sidebar border border-surface-border'}`}
      >
        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-[26px] shadow-sm' : 'left-1'}`}></div>
      </button>
    </div>
  );
}
