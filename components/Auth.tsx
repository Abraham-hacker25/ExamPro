
import React, { useState } from 'react';
import { User, StudentClass, ExamType } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    class: 'SS3' as StudentClass,
    targetExam: 'JAMB' as ExamType,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
        onLogin({
          id: 'admin_1',
          email: formData.email,
          name: 'Admin User',
          role: 'ADMIN',
          isPremium: true,
          progress: {},
          registeredSubjects: []
        });
      } else {
        setError('Invalid admin credentials.');
      }
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('cloud_users') || '[]');
    
    if (isLogin) {
      const user = storedUsers.find((u: User) => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password.');
      }
    } else {
      if (storedUsers.some((u: User) => u.email === formData.email)) {
        setError('Email already registered.');
        return;
      }
      const newUser: User = {
        id: 'u_' + Date.now(),
        email: formData.email,
        password: formData.password,
        name: formData.name,
        class: formData.class,
        targetExam: formData.targetExam,
        role: 'STUDENT',
        isPremium: false,
        progress: {},
        registeredSubjects: []
      };
      storedUsers.push(newUser);
      localStorage.setItem('cloud_users', JSON.stringify(storedUsers));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="bg-[#1e3a5f] p-10 text-white text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-3xl p-3 shadow-xl mb-4 flex items-center justify-center">
             <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-4xl font-black font-heading tracking-tight">
            Exam<span className="text-[#f8981d]">Pro</span>
          </h1>
          <p className="opacity-80 font-medium mt-1 text-sm">
            {isAdminMode ? 'Restricted Admin Access' : isLogin ? 'Student Portal' : 'Join the Success Team'}
          </p>
        </div>
        
        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            {!isAdminMode ? (
              <>
                <button 
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-slate-500'}`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-slate-500'}`}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex-1 py-3 text-center text-sm font-bold text-[#1e3a5f] italic tracking-wider">🔒 Admin Authentication</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold text-center animate-shake">{error}</div>}
            
            {!isLogin && !isAdminMode && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 px-5 py-4 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                  placeholder="e.g. Tunde Adeyemi"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Email</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 px-5 py-4 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Password</label>
              <input 
                type="password" required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 px-5 py-4 rounded-2xl focus:outline-none transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && !isAdminMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Class</label>
                  <select 
                    value={formData.class}
                    onChange={e => setFormData({...formData, class: e.target.value as StudentClass})}
                    className="w-full bg-slate-50 border-2 border-transparent px-5 py-4 rounded-2xl focus:outline-none"
                  >
                    <option value="SS1">SS1</option>
                    <option value="SS2">SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Exam</label>
                  <select 
                    value={formData.targetExam}
                    onChange={e => setFormData({...formData, targetExam: e.target.value as ExamType})}
                    className="w-full bg-slate-50 border-2 border-transparent px-5 py-4 rounded-2xl focus:outline-none"
                  >
                    <option value="JAMB">JAMB</option>
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-[#1e3a5f] text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-[#162a45] transform hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4"
            >
              {isAdminMode ? 'Enter Admin Panel' : isLogin ? 'Sign In' : 'Create My Account'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => { setIsAdminMode(!isAdminMode); setError(''); }}
              className="text-xs text-slate-400 hover:text-[#f8981d] font-bold underline underline-offset-4 decoration-dotted decoration-2 transition-all"
            >
              {isAdminMode ? 'Return to Student Login' : 'System Administrator Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
