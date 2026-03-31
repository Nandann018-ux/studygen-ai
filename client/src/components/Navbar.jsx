import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
export default function Navbar() {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Plan', path: '/plan' },
    { name: 'Analytics', path: '/analytics' }
  ];
  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-[#f4f5f8] border-b border-white/50">
      <div className="w-64 flex-shrink-0">
        <span className="font-semibold text-primary text-xl tracking-tight">AI Study Planner</span>
      </div>
      <div className="flex items-center gap-8 text-sm font-medium">
        {links.map(link => {
          const isActive = location.pathname.includes(link.path);
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`relative py-1 transition-colors ${isActive ? 'text-primary' : 'text-[#808298] hover:text-text-main'}`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-[-10px] left-0 right-0 h-[2px] bg-primary rounded-full"></span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-6 justify-end w-64">
        <button className="text-[#808298] hover:text-text-main transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f4f5f8]"></span>
        </button>
        <button className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">
          <img src="https:
        </button>
      </div>
    </nav>
  );
}
