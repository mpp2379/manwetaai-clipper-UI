import React from 'react';
import {
  Sparkles,
  Layers,
  Film,
  Zap,
  CreditCard,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Accessibility,
  PlusCircle,
  Terminal,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavigationProps {
  currentTab: 'dashboard' | 'wizard' | 'reels' | 'pricing';
  setCurrentTab: (tab: 'dashboard' | 'wizard' | 'reels' | 'pricing') => void;
  user: UserAccount;
  isOfflineSimulated: boolean;
  setIsOfflineSimulated: (offline: boolean) => void;
  pendingSyncCount: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenA11y: () => void;
  onOpenBackendInspector: () => void;
  onOpenCheckout: () => void;
  onOpenAuth: () => void;
  onStartNewClip: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  user,
  isOfflineSimulated,
  setIsOfflineSimulated,
  pendingSyncCount,
  theme,
  toggleTheme,
  onOpenA11y,
  onOpenBackendInspector,
  onOpenCheckout,
  onOpenAuth,
  onStartNewClip,
}) => {
  return (
    <>
      {/* Top Desktop & Tablet Navigation */}
      <header
        id="main-app-header"
        className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors border-b ${
          theme === 'dark'
            ? 'bg-[#0A0A0A]/90 border-[#222222] text-[#EDEDED]'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#262626] p-1 shadow-sm group-hover:border-[#444444] transition-all flex items-center justify-center">
                <Film className="w-4 h-4 text-[#00FF85] group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white">
                    Manweta AI
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#141414] text-[#00FF85] border border-[#222222]">
                    v1.2
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] leading-tight hidden sm:block">
                  Long Video → Viral Short Reel
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111111] p-1 rounded-full border border-[#222222]">
            <button
              id="nav-tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#888888] hover:text-[#EDEDED] hover:bg-[#1A1A1A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              id="nav-tab-wizard"
              onClick={() => {
                onStartNewClip();
                setCurrentTab('wizard');
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                currentTab === 'wizard'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#888888] hover:text-[#EDEDED] hover:bg-[#1A1A1A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00FF85]" />
              Clip Studio
            </button>

            <button
              id="nav-tab-pricing"
              onClick={() => setCurrentTab('pricing')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                currentTab === 'pricing'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#888888] hover:text-[#EDEDED] hover:bg-[#1A1A1A]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pricing
            </button>

            <button
              id="nav-tab-backend-logs"
              onClick={onOpenBackendInspector}
              className="px-3.5 py-1.5 text-xs font-medium text-[#888888] hover:text-[#EDEDED] hover:bg-[#1A1A1A] rounded-full transition-all flex items-center gap-1.5"
              title="Inspect backend architecture & pipeline"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00FF85]" />
              <span className="hidden lg:inline">Backend</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline Simulation Toggle */}
            <button
              id="offline-simulator-btn"
              onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
                isOfflineSimulated
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                  : 'bg-[#141414] text-[#00FF85] border-[#222222] hover:border-[#333333]'
              }`}
              title={
                isOfflineSimulated
                  ? 'Offline Simulation Active - Edits cached in IndexedDB'
                  : 'Connected to Cloud Queue - Click to simulate Offline Mode'
              }
              aria-label="Toggle network simulation"
            >
              {isOfflineSimulated ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#00FF85]" />
                  <span className="hidden sm:inline">Sync Online</span>
                </>
              )}
            </button>

            {/* Pending Sync Badge */}
            {pendingSyncCount > 0 && (
              <span
                id="pending-sync-badge"
                className="px-2 py-1 rounded-full text-[11px] font-mono bg-[#1A1A1A] text-amber-300 border border-amber-500/30 flex items-center gap-1"
                title={`${pendingSyncCount} action(s) waiting to sync`}
              >
                <RotateCcw className="w-3 h-3 animate-spin" />
                {pendingSyncCount}
              </span>
            )}

            {/* Credits Counter Pill */}
            <button
              id="user-credits-pill-btn"
              onClick={onOpenCheckout}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                theme === 'dark'
                  ? 'bg-[#111111] border-[#222222] text-[#EDEDED] hover:border-[#444444]'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:border-neutral-400'
              }`}
              title="Click to upgrade credits"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold">{user.creditsRemaining}</span>
              <span className="text-[#666666] text-[11px] hidden sm:inline">min</span>
            </button>

            {/* Accessibility Settings Trigger */}
            <button
              id="a11y-settings-btn"
              onClick={onOpenA11y}
              className="p-2 rounded-xl text-[#888888] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border border-transparent hover:border-[#222222] transition-all"
              title="Accessibility Settings (A11y)"
              aria-label="Accessibility options"
            >
              <Accessibility className="w-4 h-4" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#888888] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border border-transparent hover:border-[#222222] transition-all"
              title="Toggle theme"
              aria-label="Toggle dark and light mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {/* Upgrade / Account CTA */}
            <button
              id="header-upgrade-btn"
              onClick={onOpenCheckout}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade</span>
            </button>

            {/* User Avatar / Auth */}
            <button
              id="user-profile-avatar-btn"
              onClick={onOpenAuth}
              className="w-8 h-8 rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#444444] transition-all flex items-center justify-center bg-[#141414]"
              title={user.email}
              aria-label="User profile"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4 h-4 text-[#888888]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div
        id="mobile-bottom-nav"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-1.5 flex items-center justify-around ${
          theme === 'dark'
            ? 'bg-[#0A0A0A]/95 border-[#222222] text-[#888888]'
            : 'bg-white/95 border-neutral-200 text-neutral-800 shadow-lg'
        }`}
      >
        <button
          id="mobile-nav-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-white font-bold' : 'text-[#888888]'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          Dashboard
        </button>

        <button
          id="mobile-nav-create"
          onClick={() => {
            onStartNewClip();
            setCurrentTab('wizard');
          }}
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="w-11 h-11 rounded-full bg-white text-black p-0.5 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6 text-black" />
          </div>
          <span className="text-[10px] font-bold text-white mt-0.5">Clip</span>
        </button>

        <button
          id="mobile-nav-pricing"
          onClick={() => setCurrentTab('pricing')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'pricing' ? 'text-white font-bold' : 'text-[#888888]'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          Pricing
        </button>

        <button
          id="mobile-nav-logs"
          onClick={onOpenBackendInspector}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium text-[#888888]"
        >
          <Terminal className="w-5 h-5 mb-0.5 text-[#00FF85]" />
          Backend
        </button>
      </div>
    </>
  );
};
