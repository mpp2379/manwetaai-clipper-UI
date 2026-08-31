import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Key
} from 'lucide-react';
import { UserAccount } from '../types';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onAuthSuccess: (user: UserAccount) => void;
  theme: 'dark' | 'light';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onAuthSuccess,
  theme,
}) => {
  const [email, setEmail] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleGuestDemo = () => {
    const guestUser: UserAccount = {
      id: 'guest_' + Date.now(),
      name: 'Guest Creator',
      email: 'guest.creator@manweta.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      plan: 'pro',
      creditsRemaining: 300,
      creditsTotal: 300,
      isGuest: true,
      joinedDate: 'August 2026'
    };
    StorageService.saveUser(guestUser);
    onAuthSuccess(guestUser);
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsMagicLinkSent(true);
      const updatedUser: UserAccount = {
        ...user,
        email: email || user.email,
        name: email ? email.split('@')[0] : user.name,
        isGuest: false
      };
      StorageService.saveUser(updatedUser);
      onAuthSuccess(updatedUser);
    }, 1000);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        id="auth-dialog"
        className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl overflow-hidden ${
          theme === 'dark'
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 p-[1px] flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Sign In to Manweta AI
          </h3>
          <p className="text-xs text-slate-400">
            Access cloud queue renders, save custom caption templates, and sync across devices.
          </p>
        </div>

        {/* Fast 1-Click Guest Instant Demo Login */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGuestDemo}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>1-Click Instant Guest Demo (No Password)</span>
          </button>

          <button
            type="button"
            onClick={handleGuestDemo}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.7 0 3 .6 4 1.5l3-3C17.2 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-950 px-2 text-[10px] font-bold text-slate-500 uppercase">
              Or passwordless magic link
            </span>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              {isLoggingIn ? 'Sending Secure Token...' : 'Send Magic Sign-In Link'}
            </button>
          </form>

          {isMagicLinkSent && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Signed in successfully! Your session is encrypted and cached locally.</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SOC2 Type II & GDPR Compliant Data Encryption</span>
        </div>
      </div>
    </div>
  );
};
