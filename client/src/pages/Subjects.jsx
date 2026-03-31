import { Target, Pencil, Trash2, Calendar, Target as TargetIcon } from 'lucide-react';
export default function Subjects() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <span className="text-xs font-bold text-[#513ed9] tracking-[0.15em] uppercase mb-2 block">AI Study Planner</span>
        <h1 className="text-[44px] font-bold tracking-tight text-[#1a1d2d] mb-4">Subjects</h1>
        <p className="text-[#5b617c] font-medium text-[16px] max-w-2xl leading-relaxed">
          Manage your study subjects, define your goals, and track your progress.
        </p>
      </div>
      <div className="bg-white rounded-[32px] p-10 shadow-sm border border-[#e8e9ef] mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#513ed9]/10 rounded-full p-2 text-[#513ed9]">
            <TargetIcon size={20} />
          </div>
          <h2 className="text-2xl font-bold text-[#1a1d2d]">Add New Subject</h2>
        </div>
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-xs font-bold text-[#5b617c] mb-2 uppercase tracking-wide">Subject Name</label>
              <input 
                type="text" 
                placeholder="e.g. Theoretical Astrophysics" 
                className="w-full bg-[#f4f5f8] border-none rounded-2xl px-5 py-4 text-[#1a1d2d] font-medium focus:ring-2 focus:ring-[#513ed9]/20 outline-none text-sm placeholder:text-[#808298]/60"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-[#5b617c] mb-4 uppercase tracking-wide">Difficulty (1-5)</label>
              <div className="relative pt-2">
                <input type="range" min="1" max="5" defaultValue="3" className="w-full h-2 bg-[#e2e4ec] rounded-lg appearance-none cursor-pointer accent-[#513ed9]" />
                <div className="flex justify-between text-[10px] font-bold text-[#808298] mt-2 uppercase">
                  <span>Trivial</span>
                  <span>Extreme</span>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-[#5b617c] mb-2 uppercase tracking-wide">Exam Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full bg-[#f4f5f8] border-none rounded-2xl px-5 py-4 text-[#1a1d2d] font-medium focus:ring-2 focus:ring-[#513ed9]/20 outline-none text-sm"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="col-span-1 md:col-span-3">
              <label className="block text-xs font-bold text-[#5b617c] mb-2 uppercase tracking-wide">Syllabus Remaining (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue="85"
                  className="w-full bg-[#f4f5f8] border-none rounded-2xl px-5 py-4 text-[#1a1d2d] font-medium focus:ring-2 focus:ring-[#513ed9]/20 outline-none text-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#808298] font-bold text-sm">%</span>
              </div>
            </div>
            <div className="col-span-1">
              <button className="w-full bg-[#513ed9] hover:bg-[#3d2ea5] text-white py-4 rounded-2xl font-bold text-sm shadow-md shadow-[#513ed9]/20 transition-all">
                Save Subject
              </button>
            </div>
          </div>
        </form>
      </div>
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold text-[#1a1d2d] tracking-tight">Your Subjects</h2>
          <span className="text-sm font-bold text-[#808298]">Active tracks: <span className="text-[#513ed9]">4</span></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SubjectCard 
            title="Quantum Mechanics" 
            difficulty="HARD" 
            diffColor="bg-red-100 text-red-600"
            progress={65} 
            daysLeft={12} 
            barColor="bg-[#513ed9]"
          />
          <SubjectCard 
            title="Neural Networks" 
            difficulty="MEDIUM" 
            diffColor="bg-purple-100 text-purple-600"
            progress={28} 
            daysLeft={45} 
            barColor="bg-[#513ed9]"
          />
          <SubjectCard 
            title="Philosophy 101" 
            difficulty="EASY" 
            diffColor="bg-blue-100 text-blue-600"
            progress={92} 
            daysLeft={5} 
            barColor="bg-[#513ed9]"
          />
        </div>
      </div>
    </div>
  );
}
function SubjectCard({ title, difficulty, diffColor, progress, daysLeft, barColor }) {
  return (
    <div className="bg-[#f8f9fc] border border-[#e8e9ef] p-6 rounded-3xl h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-[#1a1d2d] pr-4 leading-tight">{title}</h3>
          <div className="flex gap-2">
            <button className="text-[#808298] hover:text-[#513ed9]"><Pencil size={14} /></button>
            <button className="text-[#808298] hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${diffColor}`}>
          {difficulty}
        </span>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold text-[#808298] uppercase tracking-wider">Syllabus Progress</span>
          <span className="text-[14px] font-bold text-[#513ed9]">{progress}%</span>
        </div>
        <div className="w-full bg-[#e2e4ec] h-2 rounded-full overflow-hidden mb-6">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-[#e2e4ec]">
          <div className="flex items-center gap-2 text-[#808298]">
            <Calendar size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Deadline</span>
          </div>
          <span className="text-sm font-bold text-[#1a1d2d]">{daysLeft} Days left</span>
        </div>
      </div>
    </div>
  );
}
