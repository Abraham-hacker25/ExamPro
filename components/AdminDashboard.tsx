
import React, { useState, useEffect } from 'react';
import { Subject, MockExam, User, PaymentProof, PaymentSettings, StudyNote, NoteChunk, StudentClass, Question } from '../types';
import { cloudService } from '../services/cloudService';

interface AdminDashboardProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PAYMENTS' | 'USERS' | 'COURSES' | 'NOTES' | 'QUESTIONS' | 'SETTINGS'>('ANALYTICS');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<MockExam[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>({ bank: '', accountNumber: '', accountName: '' });
  const [loading, setLoading] = useState(true);

  // Question Form
  const [qForm, setQForm] = useState<Omit<Question, 'id'>>({
    subjectId: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [s, e, u, p, st, n, q] = await Promise.all([
      cloudService.getSubjects(),
      cloudService.getExams(),
      cloudService.getUsers(),
      cloudService.getPayments(),
      cloudService.getSettings(),
      cloudService.getNotes(),
      cloudService.getQuestions()
    ]);
    setSubjects(s);
    setExams(e);
    setUsers(u);
    setPayments(p);
    setSettings(st);
    setNotes(n);
    setQuestions(q);
    if (s.length > 0 && !qForm.subjectId) {
      setQForm(prev => ({ ...prev, subjectId: s[0].id }));
    }
    setLoading(false);
  };

  const handleToggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    onUpdateUser({ ...user, theme: newTheme });
  };

  const handleAddQuestion = async () => {
    if (!qForm.text || !qForm.subjectId || qForm.options.some(o => !o)) {
      alert("Please fill all fields before saving.");
      return;
    }
    
    const subjectQuestions = questions.filter(q => q.subjectId === qForm.subjectId);
    if (subjectQuestions.length >= 70) {
      alert("Maximum limit of 70 questions reached for this subject.");
      return;
    }

    const newQ: Question = {
      id: 'q_' + Date.now(),
      ...qForm
    };
    await cloudService.saveQuestion(newQ);
    setQForm({ ...qForm, text: '', options: ['', '', '', ''], explanation: '' });
    loadData();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#1e3a5f] dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-[#1e3a5f] dark:text-indigo-400 uppercase tracking-widest text-[10px]">Cloud Syncing...</p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${user.theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Admin Terminal</h2>
          <div className="flex flex-wrap gap-2 mt-4 bg-white dark:bg-slate-800 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 w-fit shadow-sm">
            {['ANALYTICS', 'PAYMENTS', 'USERS', 'COURSES', 'NOTES', 'QUESTIONS', 'SETTINGS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all active:scale-95 ${
                  activeTab === tab 
                  ? 'bg-[#1e3a5f] dark:bg-indigo-600 text-white shadow-xl shadow-blue-100' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <button 
            onClick={handleToggleTheme}
            className="flex-1 md:flex-none p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:scale-105 transition-all text-xl flex items-center justify-center active:scale-95"
            title="Toggle Dark Mode"
          >
            {user.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onLogout}
            className="flex-[2] md:flex-none px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl shadow-red-100 dark:shadow-none transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </header>

      {activeTab === 'QUESTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Question Editor */}
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading mb-2 tracking-tight">Question Builder</h3>
            <p className="text-xs text-slate-400 mb-8 font-bold uppercase tracking-widest">Target: 40-70 Objective questions per subject</p>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Course</label>
                <select 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-100 dark:text-white rounded-2xl outline-none font-bold appearance-none transition-all"
                  value={qForm.subjectId}
                  onChange={e => setQForm({...qForm, subjectId: e.target.value})}
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Question Body</label>
                <textarea 
                  className="w-full p-5 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-blue-100 rounded-[1.5rem] outline-none font-bold h-36 transition-all"
                  placeholder="Type the exam question here..."
                  value={qForm.text}
                  onChange={e => setQForm({...qForm, text: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {qForm.options.map((opt, idx) => (
                  <div key={idx}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Option {String.fromCharCode(65 + idx)}</label>
                    <input 
                      type="text"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-blue-100 rounded-2xl outline-none text-sm font-bold transition-all"
                      value={opt}
                      placeholder={`Choice ${String.fromCharCode(65+idx)}`}
                      onChange={e => {
                        const newOpt = [...qForm.options];
                        newOpt[idx] = e.target.value;
                        setQForm({...qForm, options: newOpt});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Correct Key</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-blue-100 rounded-2xl outline-none font-black transition-all"
                    value={qForm.correctAnswerIndex}
                    onChange={e => setQForm({...qForm, correctAnswerIndex: parseInt(e.target.value)})}
                  >
                    {qForm.options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Solution Explanation</label>
                <textarea 
                  className="w-full p-5 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-blue-100 rounded-[1.5rem] outline-none text-sm h-24 transition-all"
                  placeholder="Step-by-step reasoning..."
                  value={qForm.explanation}
                  onChange={e => setQForm({...qForm, explanation: e.target.value})}
                />
              </div>

              <button 
                onClick={handleAddQuestion} 
                className="w-full bg-[#1e3a5f] dark:bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 dark:shadow-none hover:bg-[#162a45] active:scale-[0.98]"
              >
                Save Question
              </button>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-fit">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading mb-6 tracking-tight">Content Readiness</h3>
            <div className="space-y-6">
              {subjects.map(s => {
                const count = questions.filter(q => q.subjectId === s.id).length;
                const isReady = count >= 40 && count <= 70;
                return (
                  <div key={s.id} className={`p-6 border-2 rounded-[2rem] transition-all ${isReady ? 'border-emerald-50 dark:border-emerald-900/20 bg-emerald-50/20' : 'border-slate-50 dark:border-slate-900'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{s.icon}</span>
                        <span className="font-black text-slate-700 dark:text-slate-200 tracking-tight">{s.name}</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isReady ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                        {count < 40 ? 'Updating' : 'Ready'}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mb-2">
                       <span className="text-3xl font-black text-[#1e3a5f] dark:text-indigo-400">{count} <span className="text-sm text-slate-400 font-bold">/ 70</span></span>
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{Math.round((count/70)*100)}%</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${isReady ? 'bg-emerald-400' : 'bg-red-400'}`} 
                        style={{ width: `${Math.min(100, (count / 70) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
