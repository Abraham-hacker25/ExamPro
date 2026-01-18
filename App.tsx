
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

  // Memoized sync function to prevent unnecessary re-renders
  const sync = useCallback(async (isBackground = false) => {
    try {
      const [s, e, n] = await Promise.all([
        cloudService.getSubjects(),
        cloudService.getExams(),
        cloudService.getNotes()
      ]);
      
      setSubjects(s);
      setExams(e);
      setManualNotes(n);
      
      if (user) {
        const cloudUser = await cloudService.getUser(user.email);
        if (cloudUser) {
           // Only update state if data has actually changed to prevent UI loops
           if (JSON.stringify(cloudUser) !== JSON.stringify(user)) {
             setUser(cloudUser);
           }
        }
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      if (!isBackground) setInitialLoading(false);
    }
  }, [user]);

  // Initial load and navigation-based sync
  useEffect(() => {
    sync();
  }, [activeTab, sync]);

  // REAL-TIME POLLING: Sync with Back4App every 15 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      sync(true); // Run in background mode
    }, 15000);

    return () => clearInterval(interval);
  }, [user, sync]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('exampro_session', JSON.stringify(user));
      // Ensure local state changes are pushed to cloud
      cloudService.saveUser(user);
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
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
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
        setShowNotification("Payment proof submitted! Verification usually takes 1-2 hours.");
        setActiveTab('dashboard');
        setTimeout(() => setShowNotification(null), 6000);
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
                    <button onClick={() => setActiveTab('premium')} className="bg-[#1e3a5f] dark:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs tracking-widest active:scale-95 transition-all">UNLOCK & START</button>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic font-medium">No mock exams currently scheduled by Admin.</div>}
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
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{subNotes.length} Topics Available</p>
                       </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                       {subNotes.length > 0 ? subNotes.map(note => (
                         <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-indigo-800 cursor-pointer transition-all">
                            <p className="font-bold text-xs text-slate-700 dark:text-slate-300">{note.topic}</p>
                            <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">Ready to Study</p>
                         </div>
                       )) : (
                         <div className="py-4 text-center">
                            <p className="text-[10px] text-slate-300 font-bold italic">No manual notes for this class yet.</p>
                         </div>
                       )}
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="mt-6 w-full py-3 bg-[#f8981d]/10 text-[#f8981d] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#f8981d] hover:text-white transition-all"
                    >
                      Instant AI Notes
                    </button>
                  </div>
                );
              })}
              {registeredSubjects.length === 0 && (
                <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-700 text-center text-slate-400">
                  <p className="font-bold">Register for courses in Profile to access simplified notes.</p>
                  <button onClick={() => setActiveTab('profile')} className="mt-4 bg-[#1e3a5f] dark:bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Go to Profile</button>
                </div>
              )}
            </div>
          </div>
        );
      default: return <StudentDashboard user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} onLogout={handleLogout}>
      {showNotification && (
        <div className="fixed top-8 right-4 left-4 md:left-auto md:right-8 bg-emerald-500 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl z-50 flex items-center space-x-3 border-b-4 border-emerald-600 animate-in slide-in-from-top-10">
          <span className="text-2xl animate-bounce">✅</span>
          <p className="font-black uppercase tracking-widest text-xs">{showNotification}</p>
        </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
