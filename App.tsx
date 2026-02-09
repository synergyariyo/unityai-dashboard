
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import SubscriptionModal from './components/SubscriptionModal';
import { AppTool } from './types';
import { Menu, Search, Bell, Settings } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<AppTool>(AppTool.Dashboard);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToolSelect = (tool: AppTool) => {
    setActiveTool(tool);
    setIsMobileMenuOpen(false);
  };

  const handleSignIn = (profile: UserProfile) => {
    setUser(profile);
  };

  const triggerNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className={`flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors overflow-hidden`}>
      
      {/* Search Header - Desktop Top Bar */}
      <div className="hidden md:flex fixed top-0 right-0 left-64 h-16 glass z-30 px-8 items-center justify-between">
         <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tools, assets, or help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white placeholder:text-slate-500 transition-all"
            />
         </div>
         <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors relative group">
               <Bell className="w-5 h-5 group-active:scale-90 transition-transform" />
               {showNotification && (
                 <>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping"></span>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                 </>
               )}
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
               <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
               <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold">JD</span>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center px-4 justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="3" />
                <circle cx="7" cy="17" r="3" />
                <circle cx="17" cy="17" r="3" />
                <path d="M12 10v4M9.5 15.5l-1.5-1M14.5 15.5l1.5-1" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black text-slate-800 dark:text-white tracking-tighter text-lg">UNITY</span>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2 text-slate-600 dark:text-slate-300 relative mr-2">
              <Bell className="w-6 h-6" />
              {showNotification && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
               )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
         </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full glass relative" onClick={e => e.stopPropagation()}>
             <Sidebar 
               activeTool={activeTool} 
               onToolSelect={handleToolSelect} 
               isDarkMode={isDarkMode}
               onToggleTheme={() => setIsDarkMode(!isDarkMode)}
               onOpenSubscription={() => setIsSubModalOpen(true)}
               onClose={() => setIsMobileMenuOpen(false)}
               user={user}
               onSignIn={handleSignIn}
             />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 fixed inset-y-0 z-40">
        <Sidebar 
          activeTool={activeTool} 
          onToolSelect={handleToolSelect} 
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenSubscription={() => setIsSubModalOpen(true)}
          user={user}
          onSignIn={handleSignIn}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full pt-16 md:pt-16 md:pl-64 overflow-hidden">
        <Workspace 
          activeTool={activeTool} 
          onToolSelect={handleToolSelect} 
          user={user} 
          onNotify={triggerNotification}
        />
      </div>

      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
    </div>
  );
};

export default App;
