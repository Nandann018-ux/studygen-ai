import { BookText, Timer, CalendarClock, TrendingDown, Zap, Plus, Wand2, Lightbulb } from 'lucide-react';
export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#1a1d2d] mb-3">Welcome back, Julian</h1>
        <p className="text-[#5b617c] font-medium text-[15px]">
          Overview of your study tracking and AI insights.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<BookText size={20} className="text-[#513ed9]" />} 
          bg="bg-[#513ed9]/10" 
          title="Total Subjects" 
          value="12" 
        />
        <StatCard 
          icon={<Timer size={20} className="text-[#8b5cf6]" />} 
          bg="bg-[#8b5cf6]/10" 
          title="Study Hours Today" 
          value="4.5h" 
        />
        <StatCard 
          icon={<CalendarClock size={20} className="text-[#ec4899]" />} 
          bg="bg-[#ec4899]/10" 
          title="Deadlines" 
          value="3" 
        />
        <StatCard 
          icon={<TrendingDown size={20} className="text-[#f43f5e]" />} 
          bg="bg-[#f43f5e]/10" 
          title="Weak Subjects" 
          value="Calculus II" 
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-[#e8e9ef]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#1a1d2d]">Today's Plan</h2>
              <p className="text-sm font-medium text-[#808298] mt-1">Target: 6 hours of high-retention study</p>
            </div>
            <button className="flex items-center gap-2 bg-[#513ed9] hover:bg-[#3d2ea5] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-[#513ed9]/20 transition-all text-sm">
              <Zap size={16} fill="white" /> Start Studying
            </button>
          </div>
          <div className="space-y-7">
            <FocusRow 
              title="Advanced Neurobiology" 
              subtitle="Module 4: Synaptic Plasticity" 
              hours="2.5h" 
              progress={50} 
              active={true} 
            />
            <FocusRow 
              title="Applied Macroeconomics" 
              subtitle="Review: Monetary Policy" 
              hours="1.5h" 
              progress={20} 
            />
            <FocusRow 
              title="Quantum Mechanics" 
              subtitle="Problem Set 8: Wave Functions" 
              hours="2h" 
              progress={10} 
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e8e9ef]">
            <h3 className="font-bold text-lg text-[#1a1d2d] mb-5">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 bg-[#f4f5f8] hover:bg-[#e8e9ef] text-[#513ed9] px-4 py-3.5 rounded-2xl font-semibold transition-colors">
                <div className="bg-[#513ed9] text-white p-1 rounded-full"><Plus size={14} strokeWidth={3} /></div> Add Subject
              </button>
              <button className="w-full flex items-center gap-3 bg-[#faebf2] hover:bg-[#f3d9e6] text-[#c026d3] px-4 py-3.5 rounded-2xl font-semibold transition-colors">
                <div className="bg-[#c026d3] text-white p-1 rounded-md"><Wand2 size={14} /></div> Generate Plan
              </button>
            </div>
          </div>
          <div className="bg-[#faebf2] rounded-3xl p-7 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-[#ec4899] fill-[#ec4899]" />
              <span className="text-xs font-bold text-[#ec4899] tracking-widest uppercase">AI Insight</span>
            </div>
            <p className="text-sm font-medium text-[#1a1d2d] leading-relaxed">
              Based on your recent focus trends, you retain <span className="font-bold text-[#ec4899]">22% more information</span> when studying <span className="font-bold text-[#ec4899]">Neurobiology</span> before 10 AM.
            </p>
            <div className="absolute -right-4 -bottom-4 bg-[#ec4899]/10 w-24 h-24 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function StatCard({ icon, bg, title, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e8e9ef] flex flex-col justify-between h-40">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} mb-4`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-[#808298] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#1a1d2d] tracking-tight">{value}</p>
      </div>
    </div>
  );
}
function FocusRow({ title, subtitle, hours, progress, active = false }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h4 className="font-bold text-[#1a1d2d] text-[15px]">{title}</h4>
          <p className="text-[#808298] text-[13px] font-medium mt-0.5">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className={`font-bold text-[14px] ${active ? 'text-[#513ed9]' : 'text-[#808298]'}`}>{hours}</span>
          <p className="text-[#808298] text-[12px] font-medium uppercase tracking-wider mt-0.5">Scheduled</p>
        </div>
      </div>
      <div className="w-full bg-[#f4f5f8] h-2.5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${active ? 'bg-[#513ed9]' : 'bg-[#e2e4ec]'}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
