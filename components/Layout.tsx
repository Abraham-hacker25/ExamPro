
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('exampro_session');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, [activeTab]);

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'lessons', label: 'Lessons', icon: '📖' },
    { id: 'practice', label: 'Practice', icon: '📝' },
    { id: 'mock', label: 'Mock Exams', icon: '🏆' },
    { id: 'chat', label: 'AI Tutor', icon: '🤖' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const adminNav = [
    { id: 'admin-overview', label: 'Overview', icon: '📊' },
    { id: 'admin-payments', label: 'Payments', icon: '💰' },
    { id: 'admin-exams', label: 'Manage Exams', icon: '⚙️' },
    { id: 'admin-courses', label: 'Manage Courses', icon: '📁' },
  ];

  const currentNav = role === 'STUDENT' ? studentNav : adminNav;
  const isDark = currentUser?.theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'} pb-20 md:pb-0 md:pl-64 transition-colors duration-300`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 h-screen border-r border-slate-200 dark:border-slate-700 fixed left-0 top-0 overflow-y-auto z-20 transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-1">
             <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white font-black overflow-hidden shadow-lg">
                <img src="https://raw.githubusercontent.com/google/material-design-icons/master/png/social/school/materialicons/48dp/2x/baseline_school_white_48dp.png" alt="Logo" className="w-6 h-6 object-contain" />
             </div>
            <h1 className="text-2xl font-black text-[#1e3a5f] dark:text-white font-heading">
              Exam<span className="text-[#f8981d]">Pro</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            {role === 'ADMIN' ? 'Admin Portal' : 'Nigerian Prep Platform'}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {currentNav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                (activeTab === item.id || (item.id === 'admin-overview' && activeTab === 'ANALYTICS') || (item.id === 'admin-payments' && activeTab === 'PAYMENTS'))
                ? 'bg-[#1e3a5f] dark:bg-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-indigo-900/40' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          {role === 'STUDENT' && currentUser && (
             <div className="flex items-center space-x-3 mb-4 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                   {currentUser.avatarUrl ? (
                     <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <span className="text-xs">👤</span>
                   )}
                </div>
                <div className="overflow-hidden">
                   <p className="text-xs font-black text-slate-800 dark:text-white truncate">{currentUser.name}</p>
                   <p className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{currentUser.isPremium ? 'Premium' : 'Free'}</p>
                </div>
             </div>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 text-red-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-red-50 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm active:scale-95"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Top Mobile Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-20">
        <div className="flex items-center space-x-2">
           <h1 className="text-xl font-black text-[#1e3a5f] dark:text-white font-heading">Exam<span className="text-[#f8981d]">Pro</span></h1>
        </div>
        <div className="flex items-center space-x-2">
           {currentUser?.avatarUrl && role === 'STUDENT' ? (
             <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full object-cover border-2 border-[#1e3a5f]/10" alt="" />
           ) : (
             <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded uppercase">
               {isDark ? '🌙' : '☀️'}
             </span>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
        {children}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around p-2 z-20">
        {currentNav.slice(0, 5).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              (activeTab === item.id || (item.id === 'admin-overview' && activeTab === 'ANALYTICS')) 
              ? 'text-[#1e3a5f] dark:text-indigo-400' 
              : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
