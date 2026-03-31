import React, { useState } from 'react';
import { Search, Brain, Monitor, Target, Link as LinkIcon, Lock, Moon, Clock, Volume2 } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('neural');

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-12 mt-4 max-w-2xl">
        <h1 className="text-[52px] font-bold tracking-tight text-text-main mb-4 leading-none">
          System <span className="text-primary">Preferences</span>
        </h1>
        <p className="text-[#a1a1aa] text-lg leading-relaxed">
          Configure your cognitive sanctuary. Fine-tune your AI models, notification protocols, and visual environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search settings..." 
              className="w-full bg-surface border border-surface-border rounded-full py-3.5 pl-12 pr-6 text-sm text-text-main focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted hover:bg-surface-border/50 hover:shadow-sm"
            />
          </div>

          <nav className="space-y-2">
            <NavBtn 
              icon={<Brain size={18} />} 
              label="AI & Neural Models" 
              active={activeTab === 'neural'} 
              onClick={() => setActiveTab('neural')} 
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
              icon={<LinkIcon size={18} />} 
              label="Connectivity & APIs" 
              active={activeTab === 'apis'} 
              onClick={() => setActiveTab('apis')} 
            />
            <NavBtn 
              icon={<Lock size={18} />} 
              label="Data Sovereignty" 
              active={activeTab === 'data'} 
              onClick={() => setActiveTab('data')} 
            />
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          {activeTab === 'neural' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Box 1 */}
              <div className="bg-surface rounded-[32px] p-8 md:p-10 border border-surface-border mb-8 shadow-sm hover:border-[#383b4b] transition-colors">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Neural Network Configurations</h2>
                </div>

                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-bold text-text-main">Aggressiveness of Study Plan</label>
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">Intensive</span>
                    </div>
                    <p className="text-xs text-text-muted mb-6 leading-relaxed max-w-xl font-medium">
                      Currently set to highly intensive. The AI assumes you have a strong cognitive baseline and will minimize long breaks.
                    </p>
                    <div className="pt-4 relative">
                      <div className="w-full h-1.5 bg-surface-sidebar rounded-full">
                        <div className="absolute top-4 left-0 w-full flex justify-between px-1">
                           {[0, 1, 2, 3, 4].map(i => (
                             <div key={i} className={`w-1 h-3 rounded-full -mt-2 ${i <= 3 ? 'bg-primary' : 'bg-surface-border'}`}></div>
                           ))}
                        </div>
                        <div className="h-full bg-primary rounded-full relative z-10" style={{ width: '75%' }}>
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,208,132,0.8)] border border-[#e2e4ec]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-surface-border">
                    <label className="block text-sm font-bold text-text-main mb-4">Spaced Repetition Decay Rate</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SelectBtn label="Conservative" desc="Review often" active={false} />
                      <SelectBtn label="Optimal (AI Driven)" desc="Dynamic curves" active={true} />
                      <SelectBtn label="Aggressive" desc="Push limits" active={false} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2 */}
              <div className="bg-surface rounded-[32px] p-8 md:p-10 border border-surface-border mb-10 shadow-sm hover:border-[#383b4b] transition-colors">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-6 bg-text-muted rounded-full"></div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Sanctuary Mode Triggers</h2>
                </div>

                <div className="space-y-8">
                  <ToggleRow 
                    icon={<Moon size={18} />} 
                    title="Auto-enable Deep Work Mode" 
                    desc="Block distracting sites when a focus session begins."
                    active={true}
                  />
                  <ToggleRow 
                    icon={<Volume2 size={18} />} 
                    title="Ambient Cognitive Noise" 
                    desc="Play binaural beats (40Hz gamma waves) automatically."
                    active={true}
                  />
                  <ToggleRow 
                    icon={<Clock size={18} />} 
                    title="Strict Timeline Enforcement" 
                    desc="Lock the current session if you attempt to switch subjects early."
                    active={false}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-primary hover:bg-primary-light text-[#0a0b10] px-10 py-4 rounded-full font-bold text-sm tracking-wide shadow-xl shadow-primary/20 transition-all active:scale-95 hover:scale-105 group flex items-center gap-2 inline-block">
                  Save Changes
                </button>
              </div>

            </div>
          )}

          {activeTab !== 'neural' && (
            <div className="bg-surface rounded-[32px] p-20 border border-surface-border flex items-center justify-center text-center">
               <p className="text-text-muted font-medium">Settings module under construction for this section.</p>
            </div>
          )}
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

function SelectBtn({ label, desc, active }) {
  return (
    <button className={`p-4 rounded-2xl border text-left transition-all active:scale-95 hover:scale-105 hover:shadow-lg ${active ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-hover border-surface-border text-text-muted hover:border-text-muted'}`}>
      <span className="block font-bold text-sm mb-1 text-text-main">{label}</span>
      <span className="block text-xs opacity-80">{desc}</span>
    </button>
  );
}

function ToggleRow({ icon, title, desc, active }) {
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
      <button className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ${active ? 'bg-primary' : 'bg-surface-sidebar border border-surface-border'}`}>
        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-[26px] shadow-sm' : 'left-1'}`}></div>
      </button>
    </div>
  );
}
