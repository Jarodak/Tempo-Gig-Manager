import React, { useState } from 'react';
import { AppView } from '../types';

interface TwoFactorSetupProps {
  navigate: (view: AppView) => void;
  onSetupComplete: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ navigate, onSetupComplete }) => {
  const [method, setMethod] = useState<'sms' | 'authenticator'>('sms');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; code?: string }>({});

  const validatePhone = () => {
    const e: any = {};
    if (method === 'sms' && !phoneNumber.trim()) {
      e.phone = "Phone number is required";
    } else if (method === 'sms' && !/^\+?[\d\s\-\(\)]{10,}$/.test(phoneNumber.replace(/\s/g, ''))) {
      e.phone = "Invalid phone number format";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateCode = () => {
    const e: any = {};
    if (!verificationCode.trim()) {
      e.code = "Verification code is required";
    } else if (verificationCode.length !== 6) {
      e.code = "Code must be 6 digits";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendCode = async () => {
    if (!validatePhone()) return;
    
    // TODO: Implement actual SMS sending
    setIsSent(true);
  };

  const handleVerify = async () => {
    if (!validateCode()) return;
    
    setIsVerifying(true);
    // TODO: Implement actual verification
    setTimeout(() => {
      setIsVerifying(false);
      onSetupComplete();
      navigate(AppView.PROFILE_COMPLETION);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 overflow-hidden text-white">
      <header className="pt-10 flex items-center justify-between">
        <button onClick={() => navigate(AppView.LANDING)} className="size-11 rounded-2xl bg-surface-dark flex items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-white text-lg font-black flex-1 text-center tracking-tight">Two-Factor Setup</h1>
        <div className="w-11"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-8 space-y-8 hide-scrollbar">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl text-primary">security</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Secure Your Account</h2>
            <p className="text-slate-400 text-sm mt-2">Add two-factor authentication to protect your account</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Verification Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('sms')}
                className={`h-14 rounded-2xl border font-medium transition-all ${
                  method === 'sms'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-lg mr-2">sms</span>
                SMS
              </button>
              <button
                onClick={() => setMethod('authenticator')}
                className={`h-14 rounded-2xl border font-medium transition-all ${
                  method === 'authenticator'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-lg mr-2">phone_android</span>
                Authenticator App
              </button>
            </div>
          </div>

          {method === 'sms' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Phone Number</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white placeholder:text-slate-600"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.phone}</p>}
              </div>

              <button
                onClick={handleSendCode}
                disabled={isSent}
                className={`w-full h-14 rounded-2xl font-black text-base transition-all ${
                  isSent
                    ? 'bg-slate-800 text-slate-600'
                    : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'
                }`}
              >
                {isSent ? 'Code Sent' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {method === 'authenticator' && (
            <div className="space-y-4">
              <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 text-center">
                <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <div className="text-4xl font-black">QR</div>
                </div>
                <p className="text-slate-400 text-sm">Scan this QR code with your authenticator app</p>
              </div>
            </div>
          )}

          {(isSent || method === 'authenticator') && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Verification Code</label>
                <input
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, ''));
                    if (errors.code) setErrors({ ...errors, code: undefined });
                  }}
                  className="w-full rounded-2xl border-none bg-surface-dark h-16 px-5 focus:ring-2 focus:ring-primary/50 appearance-none text-base font-black shadow-lg text-white placeholder:text-slate-600 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.code && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-1">{errors.code}</p>}
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || verificationCode.length !== 6}
                className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
                  isVerifying
                    ? 'bg-slate-800 text-slate-600'
                    : 'bg-primary text-white shadow-primary/40 active:scale-[0.97]'
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Enable 2FA'}
                {!isVerifying && <span className="material-symbols-outlined text-2xl">check_circle</span>}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TwoFactorSetup;
