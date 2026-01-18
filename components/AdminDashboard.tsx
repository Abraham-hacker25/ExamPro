
import React, { useState, useEffect } from 'react';
import { Subject, MockExam, User, PaymentProof, PaymentSettings, StudyNote, Question } from '../types';
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
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
    setPayments(p.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setSettings(st);
    setNotes(n);
    setQuestions(q);
    if (s.length > 0 && !qForm.subjectId) {
      setQForm(prev => ({ ...prev, subjectId: s[0].id }));
    }
    setLoading(false);
  };

  const handleApprovePayment = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await cloudService.updatePaymentStatus(paymentId, 'APPROVED');
      await loadData();
    } catch (e) {
      alert("Verification failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;
    setActionLoading(paymentId);
    try {
      await cloudService.updatePaymentStatus(paymentId, 'REJECTED');
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await cloudService.updateSettings(settings);
    alert("Payment details updated successfully!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#1e3a5f] dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-[#1e3a5f] dark:text-indigo-400 uppercase tracking-widest text-[10px]">Syncing Admin Data...</p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${user.theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Admin Terminal</h2>
          <div className="flex flex-wrap gap-2 mt-4 bg-white dark:bg-slate-800 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 w-fit shadow-sm">
            {['ANALYTICS', 'PAYMENTS', 'USERS', 'QUESTIONS', 'SETTINGS'].map((tab) => (
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
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onUpdateUser({ ...user, theme: user.theme === 'dark' ? 'light' : 'dark' })}
            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm text-xl"
          >
            {user.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Students', value: users.filter(u => u.role === 'STUDENT').length, icon: '👥', color: 'bg-blue-500' },
            { label: 'Premium Users', value: users.filter(u => u.isPremium).length, icon: '⭐', color: 'bg-amber-500' },
            { label: 'Pending Payments', value: payments.filter(p => p.status === 'PENDING').length, icon: '⏳', color: 'bg-orange-500' },
            { label: 'Total Revenue', value: `₦${payments.filter(p => p.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: '💰', color: 'bg-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
              <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg text-white`}>{stat.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stat.value}</h4>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'PAYMENTS' && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 dark:text-white font-heading">Payment Verification Queue</h3>
            <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {payments.filter(p => p.status === 'PENDING').length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-slate-800 dark:text-white text-sm">{payment.userName}</p>
                      <p className="text-[10px] text-slate-400">{payment.userEmail}</p>
                    </td>
                    <td className="p-6 font-black text-slate-800 dark:text-white text-sm">₦{payment.amount.toLocaleString()}</td>
                    <td className="p-6 text-[10px] font-black text-slate-500 uppercase">{payment.type}</td>
                    <td className="p-6 text-[10px] text-slate-400">{new Date(payment.timestamp).toLocaleDateString()}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        payment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                        payment.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-6">
                      {payment.status === 'PENDING' && (
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleApprovePayment(payment.id)}
                            disabled={!!actionLoading}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 transition-all disabled:opacity-50"
                          >
                            {actionLoading === payment.id ? '...' : 'Approve'}
                          </button>
                          <button 
                            onClick={() => handleRejectPayment(payment.id)}
                            disabled={!!actionLoading}
                            className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium italic">No payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-black text-slate-800 dark:text-white font-heading">Student Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class / Exam</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plan</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {users.filter(u => u.role === 'STUDENT').map(u => (
                  <tr key={u.id}>
                    <td className="p-6">
                      <p className="font-black text-slate-800 dark:text-white text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.class}</p>
                      <p className="text-[10px] text-indigo-500 font-black uppercase">{u.targetExam}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {u.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="p-6 text-center text-xs font-bold text-slate-500">{u.registeredSubjects?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
           <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading mb-8">Payout Details</h3>
           <form onSubmit={handleUpdateSettings} className="space-y-6">
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Bank Name</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold"
                  value={settings.bank}
                  onChange={e => setSettings({...settings, bank: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Account Number</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold"
                  value={settings.accountNumber}
                  onChange={e => setSettings({...settings, accountNumber: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Account Name</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold"
                  value={settings.accountName}
                  onChange={e => setSettings({...settings, accountName: e.target.value})}
                />
             </div>
             <button type="submit" className="w-full bg-[#1e3a5f] dark:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
               Save Payout Details
             </button>
           </form>
        </div>
      )}

      {activeTab === 'QUESTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading mb-2">Question Builder</h3>
            <div className="space-y-5 mt-8">
              <select className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent rounded-2xl font-bold">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <textarea 
                className="w-full p-5 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent rounded-[1.5rem] outline-none font-bold h-36"
                placeholder="Question Text..."
                value={qForm.text}
                onChange={e => setQForm({...qForm, text: e.target.value})}
              />
              <button className="w-full bg-[#1e3a5f] dark:bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest">
                Save to Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
