import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CalendarHeart, TrendingUp, Settings, Sparkles } from 'lucide-react';
export default function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Subjects', path: '/subjects', icon: <BookOpen size={18} /> },
    { name: 'Study Plan', path: '/plan', icon: <CalendarHeart size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <TrendingUp size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
  ];
  return (
    <aside className="w-64 flex-shrink-0 bg-[#f4f5f8] border-r border-[#e8e9ef] flex flex-col h-full hidden lg:flex">
      <div className="p-8 pt-4 flex items-center gap-3">
        <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-center flex-shrink-0">
           <Sparkles size={18} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-primary tracking-tight text-sm">AI Study</span>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Planner</span>
        </div>
      </div>
      <div className="flex-1 px-4 flex flex-col gap-2 mt-4">
        {menuItems.map(item => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
                ${isActive 
                  ? 'bg-white text-primary shadow-sm shadow-[#e8e9ef]' 
                  : 'text-[#808298] hover:bg-[#e8e9ef]/50 hover:text-text-main'
                }
              `}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
