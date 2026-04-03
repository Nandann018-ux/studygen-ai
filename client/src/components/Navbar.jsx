import { User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();

  const avatar = user.avatar;

  return (
    <nav className="flex items-center justify-between px-10 py-6 bg-surface-bg border-b border-surface-border transition-colors duration-300">
      <div className="flex-shrink-0">
        <span className="font-bold text-primary text-xl tracking-tighter cursor-default uppercase opacity-80">Neural Laboratory</span>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="text-text-muted hover:text-text-main transition-colors relative hover:scale-110 active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-surface-hover"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => navigate('/settings', { state: { tab: 'profile' } })}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-border overflow-hidden transition-all hover:scale-105 active:scale-95 hover:border-primary/30 bg-surface-hover shadow-sm"
          title="Profile & Identity"
        >
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={18} className="text-text-muted" />
          )}
        </button>
      </div>
    </nav>
  );
}
