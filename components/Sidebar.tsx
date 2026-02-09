
import React from 'react';
import { AppTool } from '../types';
import { UserProfile } from '../App';
import { 
  Brain, 
  Image as ImageIcon, 
  Mic, 
  Wand2, 
  PenTool, 
  LayoutGrid,
  Palette,
  Film,
  Crown,
  Moon,
  Sun,
  X,
  Cloud,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTool: AppTool;
  onToolSelect: (tool: AppTool) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSubscription: () => void;
  onClose?: () => void;
  user: UserProfile | null;
  onSignIn: (profile: UserProfile) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onToolSelect, 
  isDarkMode, 
  onToggleTheme, 
  onOpenSubscription, 
  onClose,
  user,
  onSignIn
}) => {
  
  const tools = [
    { id: AppTool.Dashboard, label: 'Dashboard', icon: LayoutGrid, isPro: false },
    { id: AppTool.GenerativeBrain, label: 'Generative Brain', icon: Brain, isPro: false },
    { id: AppTool.BrandingAssistant, label: 'Branding Assistant', icon: Palette, isPro: false },
    { id: AppTool.ScriptToVideo, label: 'Script to Video', icon: Film, isPro: false },
    { id: AppTool.MediaStudio, label: 'Media Studio', icon: ImageIcon, isPro: true },
    { id: AppTool.SmartEditor, label: 'Smart Editor', icon: Wand2, isPro: true },
    { id: AppTool.VoiceOver, label: 'Voice Generator', icon: Mic, isPro: true },
    { id: AppTool.Copywriter, label: 'Pro Content Writer', icon: PenTool, isPro: true },
  ];

  const handleGoogleSignIn = () => {
    // In a real environment, this would call the GSI client
    // Mocking the behavior for immediate functionality
    onSignIn({
      name: 'Production User',
      email: 'user@gmail.com',
      picture: 'https://i.pravatar.cc/150?u=unity-ai-prod'
    });
  };

  return (
    <div className="flex flex-col h-full glass border-r border-slate-200/20 transition-colors">
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="3" />
                <circle cx="7" cy="17" r="3" />
                <circle cx="17" cy="17" r="3" />
                <path d="M12 10v4M9.5 15.5l-1.5-1M14.5 15.5l1.5-1" strokeLinecap="round" />
              </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
            <span className="text-indigo-600 dark:text-indigo-400">UNITY</span>
          </h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Creative Suite
        </div>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-300 group ${
                isActive 
                  ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/30 ring-1 ring-white/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                <span>{tool.label}</span>
              </div>
              {tool.isPro && !isActive && (
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3 shrink-0 bg-transparent border-t border-white/10">
        {user ? (
          <div className="p-3 glass-inset rounded-xl border border-white/10 mb-2">
            <div className="flex items-center gap-3 mb-2">
              <img src={user.picture} className="w-8 h-8 rounded-full border border-white/20" alt="Profile" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase">
                  <Cloud className="w-2.5 h-2.5" /> Drive Active
                </div>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full text-left text-[9px] font-bold text-slate-400 hover:text-rose-500 uppercase flex items-center gap-2 px-1 py-1 transition-colors">
              <LogOut className="w-2.5 h-2.5" /> Switch Account
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        )}

        <button 
          onClick={onToggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-lg"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button 
          onClick={onOpenSubscription}
          className="w-full text-left mt-2 px-3 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-white/10 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
        >
           <div className="flex items-center justify-between mb-1">
             <p className="text-sm text-indigo-700 dark:text-indigo-300 font-bold">UNITY Pro</p>
             <Crown className="w-4 h-4 text-indigo-500" />
           </div>
           <p className="text-[10px] text-indigo-500/60 dark:text-indigo-400/60">Unlock 4K Assets</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
