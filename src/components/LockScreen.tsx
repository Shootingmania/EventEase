import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export const LockScreen: React.FC = () => {
  const { unlockVault, currentUser } = useEventContext();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setIsVerifying(true);
    setError(false);

    const success = await unlockVault(passphrase);
    setIsVerifying(false);

    if (!success) {
      setError(true);
    }
  };

  const handleQuickUnlock = async () => {
    setPassphrase('eventease2026');
    setIsVerifying(true);
    await unlockVault('eventease2026');
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Lock className="w-7 h-7 text-white" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white">EventEase Vault Locked</h1>
          <p className="text-xs text-slate-400">
            Encrypted session locked for <span className="text-indigo-400 font-medium">{currentUser.name}</span>
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3 text-left">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Vault Master Passphrase</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoFocus
                placeholder="Enter passphrase..."
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setError(false);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Invalid passphrase. Try master default or 6+ chars.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 disabled:opacity-50"
          >
            <span>{isVerifying ? 'Authenticating...' : 'Unlock Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            One-Click Master Demo Unlock (eventease2026)
          </button>
        </div>
      </div>
    </div>
  );
};
