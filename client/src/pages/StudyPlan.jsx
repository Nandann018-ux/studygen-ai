import { RefreshCw, Calculator, Brain, BookOpen, MoreVertical, Lightbulb, Activity, Scale, CalendarHeart } from 'lucide-react';
export default function StudyPlan() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-10">
        <div className="max-w-xl">
          <h1 className="text-[44px] font-bold tracking-tight text-[#1a1d2d] mb-4">Your AI Study Plan</h1>
          <p className="text-[#5b617c] font-medium text-[16px] leading-relaxed">
            Personalized schedule optimized for your cognitive peaks and upcoming deadlines.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#f4f5f8] hover:bg-[#e8e9ef] text-[#513ed9] px-6 py-3 rounded-xl font-bold transition-all shadow-sm">
          <RefreshCw size={16} /> Regenerate Plan
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#513ed9] rounded-full"></div>
                <h2 className="text-xl font-bold text-[#1a1d2d]">Today's Focus</h2>
              </div>
              <span className="bg-[#513ed9]/10 text-[#513ed9] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">Oct 24, 2023</span>
            </div>
            <div className="space-y-4">
              <ScheduleBlock 
                icon={<Calculator size={20} className="text-[#ec4899]" />} 
                bg="bg-[#faebf2]" 
                title="Advanced Thermodynamics" 
                subtitle="Focus: Entropy & Second Law" 
                time="09:00 - 11:30" 
                numHours="2.5 Hours" 
              />
              <ScheduleBlock 
                icon={<Brain size={20} className="text-[#513ed9]" />} 
                bg="bg-[#e8e9ef]" 
                title="Neural Networks" 
                subtitle="Focus: Backpropagation Lab" 
                time="13:00 - 15:00" 
                numHours="2.0 Hours" 
              />
              <ScheduleBlock 
                icon={<BookOpen size={20} className="text-[#8b5cf6]" />} 
                bg="bg-[#8b5cf6]/10" 
                title="Ethics in AI" 
                subtitle="Focus: Bias Mitigation Paper" 
                time="16:30 - 18:00" 
                numHours="1.5 Hours" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PreviewDay 
              title="Tomorrow" 
              dot="bg-[#f43f5e]" 
              hours="6.5 Hours" 
              subtitle="4 Subjects Scheduled" 
            />
            <PreviewDay 
              title="Wednesday" 
              dot="bg-[#513ed9]" 
              hours="4.0 Hours" 
              subtitle="Mid-week review session" 
            />
            <div className="bg-[#f8f9fc] rounded-3xl p-6 border-2 border-dashed border-[#e2e4ec] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e8e9ef]/50 transition-colors h-full min-h-[140px]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm text-[#808298] font-bold">+</div>
              <span className="text-[10px] font-bold text-[#808298] tracking-widest uppercase">View Full Calendar</span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#513ed9] rounded-[32px] p-8 shadow-xl shadow-[#513ed9]/30 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl rounded-full"></div>
            <h3 className="font-semibold text-lg mb-8 tracking-tight">Daily Summary</h3>
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-5xl font-bold tracking-tighter">6.0</span> <span className="text-lg font-medium text-white/70">hrs</span>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/50 mt-1">Total Study Time</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold tracking-tight">100%</span>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/50 mt-1">Goal Reached</p>
              </div>
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full mb-8 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-white/70" />
                <span className="text-xs font-bold tracking-wide">Cognitive Load</span>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded tracking-widest uppercase text-[10px] font-bold text-white shadow-sm">Optimal</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#808298] tracking-[0.15em] uppercase block mt-8 mb-4">AI Optimization Insights</span>
          <div className="bg-[#faebf2] rounded-3xl p-7 space-y-6 relative border border-white">
            <div className="flex items-start gap-4">
              <div className="mt-1"><Lightbulb size={20} className="text-[#ec4899] fill-[#ec4899]" /></div>
              <p className="text-[13px] font-medium text-[#1a1d2d] leading-relaxed">
                Your attention span peaks between <span className="font-bold text-[#ec4899]">10:00 AM - 12:00 PM</span>. We've shifted Thermodynamics to this slot.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1"><Activity size={20} className="text-[#ec4899]" /></div>
              <p className="text-[13px] font-medium text-[#1a1d2d] leading-relaxed">
                Take a 15-min nature walk after the Neural Networks lab to reset your visual cortex.
              </p>
            </div>
          </div>
          <div className="bg-[#f8f9fc] rounded-3xl p-7 mt-6">
            <h4 className="font-bold text-[#1a1d2d] text-sm mb-6">Weekly Distribution</h4>
            <div className="space-y-5">
              <DistBar label="STEM Subjects" pct="70%" color="bg-[#513ed9]" val={70} />
              <DistBar label="Humanities" pct="20%" color="bg-[#8b5cf6]" val={20} />
              <DistBar label="Revision" pct="10%" color="bg-[#ec4899]" val={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ScheduleBlock({ icon, bg, title, subtitle, time, numHours }) {
  return (
    <div className="bg-[#f8f9fc] border border-[#e8e9ef] p-4 rounded-2xl flex justify-between items-center transition-all hover:border-[#e2e4ec] group">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} shadow-sm group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-[#1a1d2d] text-[16px] leading-tight mb-1">{title}</h4>
          <p className="text-[#808298] text-[13px] font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="font-bold text-[#1a1d2d] text-sm block leading-tight">{time}</span>
          <span className="text-[#808298] text-xs font-medium">{numHours}</span>
        </div>
        <button className="w-10 h-10 rounded-full border border-[#e2e4ec] flex items-center justify-center text-[#808298] hover:bg-white hover:border-[#808298] transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
function PreviewDay({ title, dot, hours, subtitle }) {
  return (
    <div className="bg-[#f4f5f8] rounded-3xl p-6 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-bold text-[#1a1d2d] text-sm">{title}</span>
        <div className={`w-2 h-2 rounded-full ${dot}`}></div>
      </div>
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-[#1a1d2d] mb-1">{hours}</h3>
        <p className="text-[#808298] text-xs font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
function DistBar({ label, pct, color, val }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-[#1a1d2d]">{label}</span>
        <span className="text-xs font-bold text-[#1a1d2d]">{pct}</span>
      </div>
      <div className="w-full bg-[#e2e4ec] h-1.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }}></div>
      </div>
    </div>
  );
}
