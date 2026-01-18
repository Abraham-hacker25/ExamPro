import React, { useState } from 'react';
import { User, StudentClass, ExamType } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';
import { cloudService } from '../services/cloudService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    class: 'SS3' as StudentClass,
    targetExam: 'JAMB' as ExamType,
    referredBy: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdminMode) {
        if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
          onLogin({
            id: 'admin_1',
            email: formData.email,
            name: 'System Admin',
            role: 'ADMIN',
            isPremium: true,
            progress: {},
            registeredSubjects: []
          });
        } else {
          setError('Invalid administrator credentials.');
        }
        return;
      }

      const cloudUser = await cloudService.getUser(formData.email);
      
      if (isLogin) {
        if (cloudUser && cloudUser.password === formData.password) {
          onLogin(cloudUser);
        } else {
          setError('Wrong email or password. Please try again.');
        }
      } else {
        if (cloudUser) {
          setError('Email is already registered with ExamPro.');
          return;
        }
        const newUser: User = {
          id: 'u_' + Date.now(),
          email: formData.email,
          password: formData.password,
          name: formData.name,
          class: formData.class,
          targetExam: formData.targetExam,
          referredBy: formData.referredBy,
          role: 'STUDENT',
          isPremium: false,
          progress: {},
          registeredSubjects: [],
          referralCount: 0,
          referralCode: formData.name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000)
        };
        await cloudService.saveUser(newUser);
        onLogin(newUser);
      }
    } catch (err) {
      setError('Connection error. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="bg-[#1e3a5f] p-10 text-white text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl mb-4 flex items-center justify-center">
             <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Exam<span className="text-[#f8981d]">Pro</span>
          </h1>
          <p className="opacity-80 font-bold mt-1 text-[10px] uppercase tracking-widest">
            {isAdminMode ? 'Restricted Admin Access' : isLogin ? 'Student Login' : 'Create Student Account'}
          </p>
        </div>
        
        <div className="p-8">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
            {!isAdminMode ? (
              <>
                <button 
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-[#1e3a5f] dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-[#1e3a5f] dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex-1 py-3 text-center text-xs font-black text-[#1e3a5f] dark:text-indigo-400 uppercase tracking-widest">Administrator Auth</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase text-center animate-shake border border-red-100 dark:border-red-900/50">{error}</div>}
            
            {!isLogin && !isAdminMode && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-blue-100 dark:focus:border-indigo-500 px-5 py-3.5 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                  placeholder="e.g. Tunde Adeyemi"
                />
              </div>
            )}

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Email</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-blue-100 dark:focus:border-indigo-500 px-5 py-3.5 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                placeholder="you@school.ng"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Password</label>
              <input 
                type="password" required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-blue-100 dark:focus:border-indigo-500 px-5 py-3.5 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && !isAdminMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Class</label>
                    <select 
                      value={formData.class}
                      onChange={e => setFormData({...formData, class: e.target.value as StudentClass})}
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent px-5 py-3.5 rounded-2xl focus:outline-none font-bold"
                    >
                      <option value="SS1">SS1</option>
                      <option value="SS2">SS2</option>
                      <option value="SS3">SS3</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Target Exam</label>
                    <select 
                      value={formData.targetExam}
                      onChange={e => setFormData({...formData, targetExam: e.target.value as ExamType})}
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent px-5 py-3.5 rounded-2xl focus:outline-none font-bold"
                    >
                      <option value="JAMB">JAMB</option>
                      <option value="WAEC">WAEC</option>
                      <option value="NECO">NECO</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Referral Code (Optional)</label>
                  <input 
                    type="text"
                    value={formData.referredBy}
                    onChange={e => setFormData({...formData, referredBy: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-blue-100 dark:focus:border-indigo-500 px-5 py-3.5 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                    placeholder="Enter Friend's Code"
                  />
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] text-white py-4.5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-[#162a45] transform active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? 'CONNECTING...' : isAdminMode ? 'Enter Dashboard' : isLogin ? 'Sign In' : 'Join ExamPro'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsAdminMode(!isAdminMode); setError(''); }}
              className="text-[10px] text-slate-400 hover:text-[#f8981d] font-black uppercase tracking-widest transition-all"
            >
              {isAdminMode ? '← Back to Student Access' : 'Switch to Admin Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;