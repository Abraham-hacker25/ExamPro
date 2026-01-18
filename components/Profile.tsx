
import React, { useState, useEffect, useRef } from 'react';
import { User, Subject } from '../types';
import { cloudService } from '../services/cloudService';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cloudService.getSubjects().then(setAllSubjects);
  }, []);
  
  const toggleSubject = (subjectId: string) => {
    let newSubjects = [...user.registeredSubjects];
    if (newSubjects.includes(subjectId)) {
      newSubjects = newSubjects.filter(id => id !== subjectId);
    } else {
      newSubjects.push(subjectId);
    }
    onUpdateUser({ ...user, registeredSubjects: newSubjects });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    onUpdateUser({ ...user, theme: newTheme });
  };

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20 ${user.theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your academic profile and preferences</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={handleToggleTheme}
            className="flex-1 md:flex-none p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:scale-105 transition-all text-xl flex items-center justify-center active:scale-95"
            title="Toggle Theme"
          >
            {user.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onLogout}
            className="flex-[2] md:flex-none px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center relative overflow-hidden transition-colors">
            <div 
              className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 cursor-pointer hover:opacity-90 transition-all border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden group relative"
              onClick={handleAvatarClick}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span>👤</span>
              )}
              <div className="absolute inset-0 bg-black/40 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[9px] font-black uppercase tracking-widest">Change</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{user.name}</h3>
            <p className="text-slate-400 text-sm mb-8 font-bold">{user.email}</p>
            
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl text-left border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">{user.class} Student</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl text-left border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">{user.targetExam} Candidate</p>
              </div>
              <div className={`p-4 rounded-3xl text-left border-2 ${user.isPremium ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-500/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-700'}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest ${user.isPremium ? 'text-indigo-400' : 'text-slate-400'}`}>Tier</p>
                <p className={`font-black ${user.isPremium ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-500'}`}>
                  {user.isPremium ? '★ PREMIUM ACCESS' : 'FREE ACCOUNT'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <h3 className="text-2xl font-black mb-2 font-heading text-slate-800 dark:text-white tracking-tight">Course Selection</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 font-medium">Select your {user.targetExam} subjects to personalize your study path.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allSubjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group ${
                    user.registeredSubjects.includes(sub.id) 
                    ? 'border-[#1e3a5f] dark:border-indigo-500 bg-[#1e3a5f]/5 dark:bg-indigo-500/10' 
                    : 'border-slate-50 dark:border-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{sub.icon}</span>
                    <span className={`font-black tracking-tight ${user.registeredSubjects.includes(sub.id) ? 'text-[#1e3a5f] dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {sub.name}
                    </span>
                  </div>
                  {user.registeredSubjects.includes(sub.id) ? (
                    <div className="w-8 h-8 bg-[#1e3a5f] dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xs shadow-lg">✓</div>
                  ) : (
                    <div className="w-8 h-8 rounded-2xl border-2 border-slate-100 dark:border-slate-800"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
