import { Zap, AlertTriangle, Clock, TrendingUp, Filter, Lightbulb } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Filler
);
export default function Analytics() {
  const barData = {
    labels: ['Neurobiology', 'Philosophy', 'Calc II', 'Ethics in AI'],
    datasets: [
      {
        label: 'Study Hours',
        data: [24.5, 18.2, 12.0, 8.5],
        backgroundColor: '#513ed9',
        borderRadius: 8,
        barThickness: 30,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#808298' }, border: { display: false } },
      y: { grid: { color: '#e8e9ef', borderDash: [5, 5] }, ticks: { font: { size: 10, weight: 'bold' }, color: '#808298' }, border: { display: false } }
    }
  };
  const doughnutData = {
    labels: ['Core Theory', 'Practical Apps', 'Review/Recall'],
    datasets: [
      {
        data: [40, 30, 30],
        backgroundColor: ['#513ed9', '#8b5cf6', '#ec4899'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    cutout: '80%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-[44px] font-bold tracking-tight text-[#1a1d2d] mb-4">Analytics</h1>
        <p className="text-[#5b617c] font-medium text-[16px] leading-relaxed max-w-2xl">
          Track your progress, view study distributions, and get AI insights on your learning patterns.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef] flex flex-col justify-between h-56">
          <div className="w-10 h-10 rounded-xl bg-[#e8e9ef] flex items-center justify-center text-[#513ed9]">
            <Zap size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#808298] tracking-widest uppercase mb-1 block">Consistency Score</span>
            <span className="text-[40px] font-bold tracking-tighter text-[#1a1d2d] leading-none">94%</span>
            <div className="w-full bg-[#f4f5f8] h-1.5 rounded-full overflow-hidden mt-4 mb-3">
              <div className="bg-[#513ed9] h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
            <div className="flex items-center gap-1 text-[#10b981] font-bold text-[11px]">
              <TrendingUp size={12} /> 8% higher than last week
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef] flex flex-col justify-between h-56">
          <div className="w-10 h-10 rounded-xl bg-[#faebf2] flex items-center justify-center text-[#f43f5e]">
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#808298] tracking-widest uppercase mb-1 block">Weakest Subject</span>
            <span className="text-2xl font-bold tracking-tight text-[#1a1d2d] truncate block mb-2">Advanced Calculus</span>
            <span className="bg-[#faebf2] text-[#f43f5e] px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase mb-3 inline-block">Requires Focus</span>
            <p className="text-[11px] font-bold text-[#808298] italic bg-[#f4f5f8] max-w-max px-2 py-1 rounded">Last study: 2 days ago</p>
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef] flex flex-col justify-between h-56">
          <div className="w-10 h-10 rounded-xl bg-[#513ed9]/10 flex items-center justify-center text-[#513ed9]">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#808298] tracking-widest uppercase mb-1 block">High Investment</span>
            <span className="text-2xl font-bold tracking-tight text-[#1a1d2d] truncate block mb-4">Neurobiology</span>
            <p className="text-[14px] font-medium text-[#513ed9]">
              <span className="text-2xl font-bold tracking-tighter">24.5</span> Hours this month
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1a1d2d] text-lg">Study Hours Per Subject</h3>
            <div className="flex bg-[#f4f5f8] rounded-lg p-1">
              <button className="px-4 py-1 text-[11px] font-bold text-[#808298] uppercase">7D</button>
              <button className="px-4 py-1 bg-[#513ed9] text-white rounded-md text-[11px] font-bold uppercase shadow-sm">30D</button>
            </div>
          </div>
          <div className="h-48 w-full mt-10">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#e8e9ef] flex flex-col items-center relative">
          <h3 className="font-bold text-[#1a1d2d] text-lg self-start mb-6">Time Distribution</h3>
          <div className="relative w-40 h-40 mb-6 flex-shrink-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tracking-tighter text-[#1a1d2d] leading-none">112h</span>
              <span className="text-[9px] font-bold text-[#808298] tracking-widest uppercase mt-1">Total Study</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <LegendRow color="bg-[#513ed9]" label="Core Theory" val="40%" />
            <LegendRow color="bg-[#8b5cf6]" label="Practical Apps" val="30%" />
            <LegendRow color="bg-[#ec4899]" label="Review/Recall" val="30%" />
          </div>
        </div>
      </div>
      <div className="bg-[#f4f5f8] rounded-[32px] p-10 relative overflow-hidden">
        <span className="bg-[#ec4899] text-white px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase mb-4 inline-block shadow-sm">AI Optimization Tip</span>
        <h2 className="text-2xl font-bold text-[#1a1d2d] mb-4 relative z-10">You're hitting a "Flow Gap"</h2>
        <p className="text-[15px] font-medium text-[#5b617c] leading-relaxed max-w-3xl relative z-10">
          Our data shows your retention peaks in the first 45 minutes of <span className="text-[#513ed9] font-bold">Neurobiology</span> sessions. We recommend splitting your 3-hour block into two 90-minute segments with a 20-minute cognitive recharge between them.
        </p>
        <button className="mt-6 font-bold text-[#513ed9] flex items-center gap-2 hover:gap-3 transition-all relative z-10 text-sm">
          Apply schedule adjustment <span className="text-[18px]">→</span>
        </button>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[#e8e9ef] opacity-50 select-none pointer-events-none">
          <Lightbulb size={160} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}
function LegendRow({ color, label, val }) {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
        <span className="text-xs font-bold text-[#1a1d2d]">{label}</span>
      </div>
      <span className="text-xs font-bold text-[#1a1d2d]">{val}</span>
    </div>
  );
}
