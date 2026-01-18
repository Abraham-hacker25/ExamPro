
import React, { useState, useEffect } from 'react';
import { PREMIUM_PLANS } from '../constants';
import { cloudService } from '../services/cloudService';
import { PaymentSettings, User } from '../types';

interface PaymentFlowProps {
  user: User;
  onSuccess: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ user, onSuccess }) => {
  const [step, setStep] = useState<'PLANS' | 'DETAILS' | 'PROOF'>('PLANS');
  const [selectedPlan, setSelectedPlan] = useState<typeof PREMIUM_PLANS[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    cloudService.getSettings().then(setSettings);
  }, []);

  const handlePlanSelect = (plan: typeof PREMIUM_PLANS[0]) => {
    setSelectedPlan(plan);
    setStep('DETAILS');
  };

  const handleProofSubmit = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    
    await cloudService.submitPayment({
      id: 'p_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: selectedPlan.price,
      type: 'PREMIUM',
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      planId: selectedPlan.id
    });

    setIsSubmitting(false);
    onSuccess();
  };

  if (!settings) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {step === 'PLANS' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 font-heading">Level Up Your Preparation</h2>
            <p className="text-slate-500 mt-2">Unlock the full power of ExamPro AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PREMIUM_PLANS.map(plan => (
              <div 
                key={plan.id}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col ${
                  selectedPlan?.id === plan.id ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <h4 className="font-black text-lg mb-1 group-hover:text-[#1e3a5f] transition-colors">{plan.name}</h4>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-black text-[#1e3a5f]">₦{plan.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-[10px] font-black uppercase ml-1">/{plan.duration}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Full AI Tutoring', 'Unlimited Past Qs', 'Real Mock Exams', 'Weak Topic Analysis'].map(f => (
                    <li key={f} className="text-[10px] flex items-center text-slate-500 font-black uppercase tracking-wider">
                      <span className="text-emerald-500 mr-2 text-sm">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-[#1e3a5f] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                  GET {plan.id}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'DETAILS' && (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
          <button onClick={() => setStep('PLANS')} className="text-[#1e3a5f] font-black text-xs uppercase flex items-center tracking-widest">
            ← Change Plan
          </button>
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl">
            <h3 className="text-2xl font-black mb-8 font-heading text-[#1e3a5f]">Direct Bank Transfer</h3>
            <div className="bg-slate-50 p-8 rounded-3xl space-y-6 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Institution</p>
                <p className="text-xl font-black text-slate-800">{settings.bank}</p>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-black text-[#1e3a5f] tracking-[0.2em]">{settings.accountNumber}</p>
                  <button className="text-[#1e3a5f] text-[10px] font-black uppercase bg-white border border-slate-100 px-4 py-2 rounded-xl active:scale-90 transition-all">Copy</button>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Account Holder</p>
                <p className="text-xl font-black text-slate-800 uppercase">{settings.accountName}</p>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6L11.5 1z" /></svg>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[1.5rem] flex items-start space-x-4 mb-8">
              <span className="text-2xl">⚡</span>
              <p className="text-[11px] text-amber-900 font-bold leading-relaxed uppercase tracking-wide">
                Transfer exactly <span className="font-black underline">₦{selectedPlan?.price.toLocaleString()}</span>. Your account will be upgraded immediately after manual verification (within 2 hours).
              </p>
            </div>
            <button 
              onClick={() => setStep('PROOF')}
              className="w-full bg-[#1e3a5f] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-[#162a45] transition-all"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      )}

      {step === 'PROOF' && (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl text-center">
            <h3 className="text-2xl font-black mb-2 font-heading text-[#1e3a5f]">Payment Submission</h3>
            <p className="text-slate-400 font-medium mb-10 text-sm italic">Click below to submit your payment for admin approval.</p>
            
            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 mb-10 bg-slate-50 transition-all hover:bg-slate-100 cursor-pointer group">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-sm group-hover:scale-110 transition-transform">📄</div>
                <p className="font-black text-slate-600 uppercase tracking-widest text-xs">Verify Transaction</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Receipt Upload Pending</p>
              </div>
            </div>

            <button 
              onClick={handleProofSubmit}
              disabled={isSubmitting}
              className={`w-full bg-[#1e3a5f] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all ${
                isSubmitting ? 'opacity-70 scale-95' : 'hover:bg-[#162a45]'
              }`}
            >
              {isSubmitting ? 'PROCESSING...' : 'SUBMIT PROOF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;
