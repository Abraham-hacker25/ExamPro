import React, { useState, useEffect } from 'react';
import { Subject, MockExam, User, PaymentProof, PaymentSettings, StudyNote, Question } from '../types';
import { cloudService } from '../services/cloudService';

interface AdminDashboardProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PAYMENTS' | 'USERS' | 'REFERRALS' | 'SETTINGS'>('ANALYTICS');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>({ bank: '', accountNumber: '', accountName: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000); // 15s real-time refresh
    return () => clearInterval(interval);
  }, []);

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    
    try {
      // Independent fetches to ensure one failure doesn't block the whole dashboard
      const [u, p, st] = await Promise.allSettled([
        cloudService.getUsers(),
        cloudService.getPayments(),
        cloudService.getSettings()
      ]);

      if (u.status === 'fulfilled') setUsers(u.value);
      if (p.status === 'fulfilled') setPayments(p.value);
      if (st.status === 'fulfilled') setSettings(st.value);

    } catch (err) {
      console.error("Admin dashboard data load error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await cloudService.updatePaymentStatus(paymentId, 'APPROVED');
      await loadData(true);
    } catch (e) {
      alert("Approval failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;
    setActionLoading(paymentId);
    try {
      await cloudService.updatePaymentStatus(paymentId, 'REJECTED');
      await loadData(true);
    } catch (e) {
      alert("Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await cloudService.updateSettings(settings);
    alert("Payment portal updated successfully!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#1e3a5f] dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-[#1e3a5f] dark:text-indigo-400 uppercase tracking-widest text-[10px]">Loading Terminal Data...</p>
      </div>
    </div>
  );

  const today = new Date().toDateString();
  const students = users.filter(u => u.role === 'STUDENT');
  const newUsersToday = students.filter(u => {
    const created = new Date(parseInt(u.id.split('_')[1] || '0'));
    return created.toDateString() === today;
  }).length;

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${user.theme === 'dark' ? 'dark' : ''}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white font-heading tracking-tight">Admin Terminal</h2>
          <div className="flex flex-wrap gap-2 mt-4 bg-white dark:bg-slate-800 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 w-fit shadow-sm">
            {['ANALYTICS', 'PAYMENTS', 'USERS', 'REFERRALS', 'SETTINGS'].map((tab) => (
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
        <div className="flex items-center space-x-3">
           {refreshing && <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>}
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {refreshing ? 'Syncing...' : 'Live Connection Active'}
           </span>
        </div>
      </header>

      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Students', value: students.length, icon: '👥', color: 'bg-blue-500' },
            { label: 'Premium Users', value: students.filter(u => u.isPremium).length, icon: '⭐', color: 'bg-amber-500' },
            { label: 'New Today', value: newUsersToday, icon: '✨', color: 'bg-purple-500' },
            { label: 'Revenue (Approved)', value: `₦${payments.filter(p => p.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: '💰', color: 'bg-emerald-500' },
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
            <h3 className="text-xl font-black text-slate-800 dark:text-white font-heading">Incoming Payment Proofs</h3>
            <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {payments.filter(p => p.status === 'PENDING').length} PENDING VERIFICATION
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Student</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Type</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="p-6">
                      <p className="font-black text-slate-800 dark:text-white text-sm">{payment.userName}</p>
                      <p className="text-[10px] text-slate-400">{payment.userEmail}</p>
                    </td>
                    <td className="p-6 font-black text-slate-800 dark:text-white text-sm">₦{payment.amount.toLocaleString()}</td>
                    <td className="p-6 text-[10px] font-black text-indigo-500 uppercase">{payment.type}</td>
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
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectPayment(payment.id)}
                            disabled={!!actionLoading}
                            className="text-red-500 text-[9px] font-black uppercase px-4 py-2"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium italic">No payment proofs uploaded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-black text-slate-800 dark:text-white font-heading">Active Students</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Student Info</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Level / Exam</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {students.map(u => (
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
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {u.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="p-6 text-[10px] text-slate-400 font-bold">
                      {new Date(parseInt(u.id.split('_')[1] || '0')).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REFERRALS' && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm p-8">
           <h3 className="text-xl font-black text-slate-800 dark:text-white font-heading mb-8">Referral Leaderboard</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {students.filter(u => (u.referralCount || 0) > 0).sort((a,b) => (b.referralCount || 0) - (a.referralCount || 0)).map((u, i) => (
               <div key={u.id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all hover:border-indigo-100">
                 <div className="flex items-center space-x-4">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">#{i+1}</span>
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{u.referralCode}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{u.referralCount}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Invites</p>
                 </div>
               </div>
             ))}
             {students.filter(u => (u.referralCount || 0) > 0).length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">No referrals recorded yet.</div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
           <h3 className="text-2xl font-black text-slate-800 dark:text-white font-heading mb-8">Payout Details</h3>
           <form onSubmit={handleUpdateSettings} className="space-y-6">
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bank Name</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold"
                  value={settings.bank}
                  onChange={e => setSettings({...settings, bank: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Account Number</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold"
                  value={settings.accountNumber}
                  onChange={e => setSettings({...settings, accountNumber: e.target.value})}
                />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Account Name</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold"
                  value={settings.accountName}
                  onChange={e => setSettings({...settings, accountName: e.target.value})}
                />
             </div>
             <button type="submit" className="w-full bg-[#1e3a5f] dark:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
               Update Payment Portal
             </button>
           </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;