import { Bell, Search, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between px-10 py-6 bg-surface-bg border-b border-surface-border transition-colors duration-300">
      <div className="flex-shrink-0">
        <span className="font-bold text-primary text-xl tracking-tight cursor-default">Study-GenAI</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search knowledge base..." 
            className="bg-surface-hover text-sm text-text-main placeholder-text-muted rounded-full py-2.5 pl-10 pr-6 border border-surface-border focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 w-[280px] transition-all hover:bg-surface-border/50"
          />
        </div>
        
        <button 
          onClick={toggleTheme}
          className="text-text-muted hover:text-text-main transition-colors relative hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="text-text-muted hover:text-text-main transition-all relative hover:scale-110 active:scale-95">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-hover border border-surface-border text-text-muted hover:text-primary transition-all hover:scale-105 active:scale-95 hover:border-primary/30">
          <User size={16} />
        </button>
      </div>
    </nav>
  );
}

