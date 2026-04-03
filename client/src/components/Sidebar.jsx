import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Calendar, Timer, Activity, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Sidebar({ className }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Subjects', path: '/subjects', icon: <Book size={18} /> },
    { name: 'Plan', path: '/plan', icon: <Calendar size={18} /> },
    { name: 'Focus', path: '/focus', icon: <Timer size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <Activity size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
  ];

  const displayName = user.name || 'User';
  const avatar = user.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Julian';

  return (
    <aside className={`flex flex-col ${className}`}>
      {}
      <Link 
        to="/dashboard" 
        className="p-8 pb-6 flex flex-col gap-1 tracking-tight group hover:scale-[1.02] active:scale-95 transition-all"
      >
        <h1 className="text-xl font-bold leading-none">
          <span className="text-text-muted font-medium group-hover:text-primary transition-colors">StudyGenAI</span><br/>
        </h1>
        <span className="text-[9px] font-bold text-text-muted tracking-[0.2em] uppercase mt-2 group-hover:text-primary/60 transition-colors">
          AI-Powered Study Optimization
        </span>
      </Link>

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
        <button 
          onClick={() => navigate('/settings', { state: { tab: 'profile' } })}
          className="w-full bg-surface-hover p-3 rounded-2xl flex items-center gap-3 border border-surface-border transition-all hover:border-primary/30 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0 border border-primary/30 group-hover:border-primary/50 transition-colors">
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-semibold text-text-main truncate group-hover:text-primary transition-colors">{displayName}</span>
            <span className="text-[10px] font-medium text-text-muted truncate">{user.email}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

