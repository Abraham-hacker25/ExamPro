
import React, { useState, useEffect, useCallback } from 'react';
import { User, Subject, MockExam, StudyNote } from './types';
import { cloudService } from './services/cloudService';
import Layout from './components/Layout';
import StudentDashboard from './components/StudentDashboard';
import AIChat from './components/AIChat';
import PaymentFlow from './components/PaymentFlow';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [manualNotes, setManualNotes] = useState<StudyNote[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('exampro_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const sync = useCallback(async (isBackground = false) => {
    try {
      if (user) {
        const cloudUser = await cloudService.getUser(user.email);
        if (cloudUser) {
           // Detect change in premium status for immediate UI feedback
           if (cloudUser.isPremium !== user.isPremium && cloudUser.isPremium) {
             setShowNotification("Account Upgraded to Premium! 🚀");
           }
           
           if (JSON.stringify(cloudUser) !== JSON.stringify(user)) {
             setUser(cloudUser);
           }
        }
      }

      // Only fetch content if not already loaded or on dashboard refresh
      if (!isBackground || activeTab === 'dashboard') {
        const [s, e, n] = await Promise.all([
          cloudService.getSubjects(),
          cloudService.getExams(),
          cloudService.getNotes()
        ]);
        setSubjects(s);
        setExams(e);
        setManualNotes(n);
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    sync();
  }, [activeTab]);

  // Real-time heartbeat (Every 8 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => sync(true), 8000);
    return () => clearInterval(interval);
  }, [user, sync]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('exampro_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('exampro_session');
    }
  }, [user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    if (newUser.role === 'ADMIN') setActiveTab('ANALYTICS');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('exampro_session');
    setActiveTab('dashboard');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    await cloudService.saveUser(updatedUser);
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  const registeredSubjects = subjects.filter(s => user.registeredSubjects.includes(s.id));

  const renderContent = () => {
    if (user.role === 'ADMIN') return <AdminDashboard user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />;

    switch (activeTab) {
      case 'dashboard': return <StudentDashboard user={user} onNavigate={setActiveTab} />;
      case 'chat': return <AIChat />;
      case 'profile': return <Profile user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />;
      case 'premium': return <PaymentFlow user={user} onSuccess={() => {
        setShowNotification("Payment submitted! Verification in progress.");
        setActiveTab('dashboard');
      }} />;
      case 'mock':
        return (
          <div className="space-y-8 animate-in fade-in pb-10">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Mock Exam Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map(exam => (
                <div key={exam.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-black text-xl text-[#1e3a5f] dark:text-indigo-400">{exam.title}</h4>
                  <div className="flex gap-4 mt-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <span>🕒 {exam.durationMinutes} MIN</span>
                    <span>📝 {exam.questionCount} QUESTIONS</span>
                  </div>
                  <div className="mt-10 flex items-center justify-between border-t border-slate-50 dark:border-slate-700 pt-6">
                    <span className="text-2xl font-black text-[#f8981d]">₦{exam.fee.toLocaleString()}</span>
                    <button 
                      onClick={() => user.isPremium ? alert('Starting Exam...') : setActiveTab('premium')} 
                      className="bg-[#1e3a5f] dark:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs tracking-widest active:scale-95 transition-all"
                    >
                      {user.isPremium ? 'START NOW' : 'UNLOCK'}
                    </button>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic font-medium">No exams scheduled.</div>}
            </div>
          </div>
        );
      case 'lessons':
        return (
          <div className="space-y-8 animate-in fade-in pb-10">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Study Materials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredSubjects.map(sub => {
                const subNotes = manualNotes.filter(n => n.subjectId === sub.id && n.studentClass === user.class);
                return (
                  <div key={sub.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col group">
                    <div className="flex items-center space-x-4 mb-6">
                       <div className="text-4xl group-hover:scale-110 transition-transform">{sub.icon}</div>
                       <div>
                         <p className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{sub.name}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{subNotes.length} Topics</p>
                       </div>
                    </div>
                    <div className="flex-1 space-y-3">
                       {subNotes.length > 0 ? subNotes.map(note => (
                         <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-blue-100 cursor-pointer">
                            <p className="font-bold text-xs text-slate-700 dark:text-slate-300">{note.topic}</p>
                         </div>
                       )) : (
                         <p className="text-[10px] text-slate-300 italic text-center py-4">No content yet.</p>
                       )}
                    </div>
                    <button onClick={() => setActiveTab('chat')} className="mt-6 w-full py-3 bg-[#f8981d]/10 text-[#f8981d] rounded-2xl font-black text-[10px] uppercase tracking-widest">
                      AI Study Help
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default: return <StudentDashboard user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} onLogout={handleLogout}>
      {showNotification && (
        <div className="fixed top-8 right-4 left-4 md:left-auto md:right-8 bg-emerald-500 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl z-50 flex items-center space-x-3 animate-in slide-in-from-top-10">
          <span className="text-2xl">✅</span>
          <p className="font-black uppercase tracking-widest text-xs">{showNotification}</p>
          <button onClick={() => setShowNotification(null)} className="ml-4 opacity-70">✕</button>
        </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
