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

  const copyReferral = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      alert("Referral code copied!");
    }
  };

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20 ${user.theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your academic identity</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={handleToggleTheme}
            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm text-xl"
          >
            {user.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onLogout}
            className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl active:scale-95 transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center relative overflow-hidden">
            <div 
              className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 cursor-pointer hover:opacity-90 transition-all border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden group relative"
              onClick={handleAvatarClick}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{user.name}</h3>
            <p className="text-slate-400 text-sm mb-8 font-bold">{user.email}</p>
            
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Referral Code</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">{user.referralCode || 'EXAMPRO'}</p>
                  <button onClick={copyReferral} className="text-xs bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm">📋</button>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest">
                  {user.referralCount || 0} Successful Referrals
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl text-left border border-slate-100 dark:border-slate-800 flex justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Exam</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{user.targetExam}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Class</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-right">{user.class}</p>
                </div>
              </div>

              <div className={`p-4 rounded-3xl text-center border-2 ${user.isPremium ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-500/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-700'}`}>
                <p className={`font-black uppercase tracking-widest text-[10px] ${user.isPremium ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                  {user.isPremium ? '★ PREMIUM MEMBER' : 'FREE ACCOUNT'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-2xl font-black mb-2 font-heading text-slate-800 dark:text-white tracking-tight">Course Selection</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 font-medium">Select your {user.targetExam} subjects to personalize study materials.</p>
            
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
                  {user.registeredSubjects.includes(sub.id) && (
                    <div className="w-8 h-8 bg-[#1e3a5f] dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xs shadow-lg">✓</div>
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