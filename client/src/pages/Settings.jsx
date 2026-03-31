import { Pencil, Clock, Sun, Moon, LogOut } from 'lucide-react';
export default function Settings() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-[44px] font-bold tracking-tight text-[#1a1d2d] mb-4">Settings</h1>
        <p className="text-[#5b617c] font-medium text-[16px] leading-relaxed">
          Personalize your AI study environment.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-[#e8e9ef]">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-[28px] overflow-hidden border-4 border-[#12423e] bg-[#225752]">
                <img src="https:
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#513ed9] text-white rounded-full flex items-center justify-center border-4 border-white hover:bg-[#3d2ea5] transition-colors relative z-10 shadow-sm">
                <Pencil size={18} fill="white" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#1a1d2d] mb-1">Julian Marcovici</h2>
              <p className="text-[#5b617c] font-medium text-[15px] mb-4">julian.m@intelligence.io</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase">Premium Planner</span>
                <span className="bg-[#faebf2] text-[#ec4899] px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase">Top 1% Focus</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-[#808298] mb-2 uppercase tracking-widest">Display Name</label>
              <input 
                type="text" 
                defaultValue="Julian Marcovici"
                className="w-full bg-[#f4f5f8] border-none rounded-2xl px-5 py-4 text-[#1a1d2d] font-bold focus:ring-2 focus:ring-[#513ed9]/20 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#808298] mb-2 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                defaultValue="julian.m@intelligence.io"
                className="w-full bg-[#f4f5f8] border-none rounded-2xl px-5 py-4 text-[#1a1d2d] font-bold focus:ring-2 focus:ring-[#513ed9]/20 outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#513ed9] rounded-[32px] p-8 shadow-xl shadow-[#513ed9]/30 text-white relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8 relative z-10">
              <Clock size={20} className="text-white fill-white" />
              <h3 className="font-semibold text-[17px] tracking-wide">Daily Intensity</h3>
            </div>
            <div className="flex justify-between items-end mb-6 relative z-10">
              <span className="text-5xl font-bold tracking-tighter">6.5</span>
              <span className="text-xs font-medium text-white/70 uppercase tracking-widest">Hours / Day</span>
            </div>
            <div className="relative pt-2 mb-2 z-10">
              <div className="w-full h-1.5 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full relative" style={{ width: '60%' }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-white/50 tracking-widest uppercase z-10 relative">
              <span>Casual</span>
              <span>Deep Work</span>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl rounded-full"></div>
          </div>
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef]">
            <h3 className="text-[11px] font-bold text-[#808298] tracking-widest uppercase mb-6">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 bg-[#f8f9fc] border-2 border-[#513ed9] rounded-2xl py-6 transition-all shadow-sm">
                <Sun size={24} className="text-[#513ed9] fill-[#513ed9]" />
                <span className="text-xs font-bold text-[#1a1d2d]">Light</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 bg-[#e8e9ef] border-2 border-transparent hover:border-[#e2e4ec] rounded-2xl py-6 transition-all text-[#808298]">
                <Moon size={24} className="text-[#808298] fill-[#808298]" />
                <span className="text-xs font-bold">Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between mt-12 bg-transparent">
        <div className="flex items-center gap-6">
          <button className="bg-[#513ed9] hover:bg-[#3d2ea5] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#513ed9]/30 transition-all active:scale-95">
            Save Changes
          </button>
          <button className="font-bold text-[#5b617c] hover:text-[#1a1d2d] transition-colors text-sm">
            Cancel
          </button>
        </div>
        <button className="flex items-center gap-2 font-bold text-[#f43f5e] hover:text-red-700 transition-colors text-sm mt-6 md:mt-0">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
