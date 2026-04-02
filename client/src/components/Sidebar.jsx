import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Calendar, Timer, Activity, Settings } from 'lucide-react';

export default function Sidebar({ className }) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Subjects', path: '/subjects', icon: <Book size={18} /> },
    { name: 'Plan', path: '/plan', icon: <Calendar size={18} /> },
    { name: 'Focus', path: '/focus', icon: <Timer size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <Activity size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className={`flex flex-col ${className}`}>
      <div className="p-8 pb-6 flex flex-col gap-1 tracking-tight">
        <h1 className="text-xl font-bold leading-none">
          <span className="text-text-muted font-medium">Cognitive</span><br/>
          <span className="text-primary">Sanctuary</span>
        </h1>
        <span className="text-[9px] font-bold text-text-muted tracking-[0.2em] uppercase mt-2">
          Deep Work Mode
        </span>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-2 mt-4">
        {menuItems.map(item => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-95
                ${isActive ? 'bg-primary/10 text-primary border border-primary/20'  : 'text-text-muted hover:text-text-main hover:bg-surface-hover hover:translate-x-1'}`}>
              <div className={isActive ? 'text-primary' : 'text-text-muted'}>
                {item.icon}
              </div>
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mb-4">
        <div className="bg-surface-hover p-3 rounded-2xl flex items-center gap-3 border border-surface-border">
          <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0 border border-primary/30">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Julian&backgroundColor=00d084" alt="Julian" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-text-main truncate">Julian Thorne</span>
            <span className="text-[10px] font-medium text-text-muted truncate">Premium Sanctuary</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

