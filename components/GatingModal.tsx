import React from 'react';

export type GatingType = 
  | 'two_factor' 
  | 'face_verification' 
  | 'profile_completion' 
  | 'email_verification'
  | 'band_verification';

interface GatingModalProps {
  type: GatingType;
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

interface GatingConfig {
  icon: string;
  title: string;
  description: string;
  actionText: string;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonShadow: string;
}

const gatingConfig: Record<GatingType, GatingConfig> = {
  two_factor: {
    icon: 'security',
    title: 'Two-Factor Authentication Required',
    description: 'To access this feature, you need to set up two-factor authentication for your account security.',
    actionText: 'Set Up 2FA',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    buttonBg: 'bg-primary',
    buttonShadow: 'shadow-primary/30',
  },
  face_verification: {
    icon: 'face',
    title: 'Face Verification Required',
    description: 'This action requires face verification to confirm your identity. This helps keep our community safe.',
    actionText: 'Verify Identity',
    iconBg: 'bg-accent-cyan/20',
    iconColor: 'text-accent-cyan',
    buttonBg: 'bg-accent-cyan',
    buttonShadow: 'shadow-accent-cyan/30',
  },
  profile_completion: {
    icon: 'person',
    title: 'Complete Your Profile',
    description: 'Please complete your profile before accessing this feature. A complete profile helps venues and artists connect.',
    actionText: 'Complete Profile',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    buttonBg: 'bg-primary',
    buttonShadow: 'shadow-primary/30',
  },
  email_verification: {
    icon: 'mail',
    title: 'Email Verification Required',
    description: 'Please verify your email address to continue. Check your inbox for a verification link.',
    actionText: 'Resend Email',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-500',
    buttonBg: 'bg-yellow-500',
    buttonShadow: 'shadow-yellow-500/30',
  },
  band_verification: {
    icon: 'group',
    title: 'Band Membership Required',
    description: 'You need to be a verified member of a band to access this feature. Create or join a band first.',
    actionText: 'Manage Bands',
    iconBg: 'bg-accent-cyan/20',
    iconColor: 'text-accent-cyan',
    buttonBg: 'bg-accent-cyan',
    buttonShadow: 'shadow-accent-cyan/30',
  },
};

const GatingModal: React.FC<GatingModalProps> = ({ type, isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  const config = gatingConfig[type];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
      <div className="bg-surface-dark w-full max-w-sm rounded-[2rem] p-6 space-y-6 animate-in zoom-in-95 fade-in">
        <div className="text-center space-y-4">
          <div className={`size-20 rounded-[1.5rem] ${config.iconBg} flex items-center justify-center mx-auto`}>
            <span className={`material-symbols-outlined text-4xl ${config.iconColor}`}>{config.icon}</span>
          </div>
          <h3 className="text-xl font-black text-white">{config.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{config.description}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onAction}
            className={`w-full h-14 rounded-2xl ${config.buttonBg} text-white font-black flex items-center justify-center gap-2 shadow-lg ${config.buttonShadow} active:scale-[0.97] transition-transform`}
          >
            {config.actionText}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-white/5 text-slate-400 font-bold"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default GatingModal;
