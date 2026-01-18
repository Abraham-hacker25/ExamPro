
import React from 'react';
import { User } from '../types';
import { SUBJECTS } from '../constants';

interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
}

const StudentDashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const registeredSubjects = SUBJECTS.filter(s => user.registeredSubjects.includes(s.id));
  const isDark = user.theme === 'dark';

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isDark ? 'dark' : ''}`}>
      {/* Header Profile Section */}
      <div className="bg-[#1e3a5f] dark:bg-indigo-900 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-100 dark:shadow-none transition-colors">
        <div className="relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center text-4xl border border-white/30 shadow-inner">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-3xl" alt="" />
              ) : (
                '🇳🇬'
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black font-heading tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h2>
              <p className="opacity-90 font-bold text-sm mt-1 uppercase tracking-widest">{user.class} Student • {user.targetExam} Prep</p>
            </div>
          </div>
          
          <div className="mt-10 flex flex-wrap gap-4">
            {!user.isPremium && (
              <button 
                onClick={() => onNavigate('premium')}
                className="bg-[#f8981d] hover:bg-orange-500 text-white font-black px-8 py-3 rounded-2xl transition-all shadow-xl shadow-orange-900/20 text-xs uppercase tracking-widest active:scale-95"
              >
                🚀 Get Premium Access
              </button>
            )}
            <button 
              onClick={() => onNavigate('profile')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-8 py-3 rounded-2xl transition-all text-xs border border-white/20 active:scale-95"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-400/20 rounded-full blur-[60px]"></div>
      </div>

      {/* Progress Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Course Progress</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Your academic journey tracker</p>
          </div>
          <button onClick={() => onNavigate('profile')} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">Change Subjects</button>
        </div>
        
        {registeredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredSubjects.map(sub => (
              <div key={sub.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${sub.color} shadow-sm text-2xl`}>
                    {sub.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800 dark:text-white">{user.progress[sub.id] || 0}%</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Completed</p>
                  </div>
                </div>
                <p className="font-black text-slate-800 dark:text-white text-lg tracking-tight mb-4">{sub.name}</p>
                <div className="w-full bg-slate-50 dark:bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div 
                    className="bg-[#1e3a5f] dark:bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${user.progress[sub.id] || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center transition-colors shadow-inner">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">📖</div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No subjects registered yet.</p>
             <p className="text-slate-400 text-sm mt-1 mb-8">Select the courses you are sitting for in your {user.targetExam} exam.</p>
             <button 
               onClick={() => onNavigate('profile')}
               className="bg-[#1e3a5f] dark:bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
             >
               Add Subjects Now
             </button>
          </div>
        )}
      </section>

      {/* Focus Areas */}
      {registeredSubjects.length > 0 && (
        <section className="pb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-[#f8981d] rounded-full"></div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Focus Areas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm flex items-start space-x-6 transition-all hover:border-indigo-100 group">
               <div className="w-16 h-16 bg-blue-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">📉</div>
               <div>
                 <p className="font-black text-slate-800 dark:text-white text-xl tracking-tight">{registeredSubjects[0].name} Priority</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">Strengthen your foundation in {registeredSubjects[0].name} before attempting mock exams.</p>
                 <button 
                  onClick={() => onNavigate('lessons')}
                  className="mt-6 text-[#1e3a5f] dark:text-indigo-400 font-black text-xs uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform"
                 >
                  Start Reviewing Topics <span className="ml-2 text-lg">→</span>
                 </button>
               </div>
             </div>
             
             <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm flex items-start space-x-6 transition-all hover:border-orange-100 group">
               <div className="w-16 h-16 bg-orange-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">🔥</div>
               <div>
                 <p className="font-black text-slate-800 dark:text-white text-xl tracking-tight">Practice Strategy</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">Consistent daily practice of past questions is the most effective way to guarantee {user.targetExam} success.</p>
                 <button 
                  onClick={() => onNavigate('mock')}
                  className="mt-6 text-[#f8981d] font-black text-xs uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform"
                 >
                  Go to Library <span className="ml-2 text-lg">→</span>
                 </button>
               </div>
             </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
