import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import {
  ShieldCheck,
  Lock,
  Download,
  Upload,
  UserCheck,
  RotateCcw,
  X,
  KeyRound,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface AuthVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthVaultModal: React.FC<AuthVaultModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    users,
    switchUser,
    lockVault,
    auditLogs,
    exportEncryptedVault,
    importEncryptedVault,
    resetToInitialData,
  } = useEventContext();

  const [importStatus, setImportStatus] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'security' | 'audit' | 'backup'>('security');

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const encryptedString = await exportEncryptedVault();
      const blob = new Blob([encryptedString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eventease_vault_${new Date().toISOString().split('T')[0]}.vault`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportStatus('Decrypting and verifying checksum...');
        const result = await importEncryptedVault(content);
        setImportStatus(result.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Security Vault & Access Control</h2>
              <p className="text-xs text-slate-400">Web Crypto AES-GCM 256-bit encryption & session integrity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Session & Access
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'backup'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Encrypted Backups
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>

        {/* TAB 1: Session & Access */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            {/* Cryptographic Posture Card */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Cryptographic Invariants</span>
                <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                <div>Cipher: <span className="text-slate-200">AES-GCM-256</span></div>
                <div>KDF: <span className="text-slate-200">PBKDF2 (100k iters)</span></div>
                <div>Integrity: <span className="text-slate-200">SHA-256 Checksum</span></div>
                <div>Storage: <span className="text-slate-200">Encrypted LocalStore</span></div>
              </div>
            </div>

            {/* Active User Switcher */}
            <div className="space-y-2">
              <label className="text-slate-300 font-medium">Switch Active Operator Identity</label>
              <div className="space-y-2">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email} · Role: {u.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-mono text-indigo-400 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                          CURRENT
                        </span>
                      ) : (
                        <button className="text-[11px] text-slate-400 hover:text-white">Switch</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lock Workspace Now */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  lockVault();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/80 rounded-xl transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Workspace Now (Requires Passphrase to Unlock)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Encrypted Backups */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">Full Database Vault Export</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Export all active events, budgets, vendor contracts, guest lists, and run-of-show cues into an AES-GCM encrypted vault backup archive.
              </p>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Encrypting...' : 'Download Encrypted Vault (.vault)'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-semibold text-white">Restore from Encrypted Vault</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload a verified `.vault` encrypted backup file to restore event state with cryptographic validation.
              </p>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors bg-slate-900/50 text-slate-300">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Select .vault File to Restore</span>
                <input
                  type="file"
                  accept=".vault,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {importStatus && (
                <p className="text-[11px] font-mono text-indigo-300 pt-1">{importStatus}</p>
              )}
            </div>

            {/* Reset to Samples */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (confirm('Reset all events and state back to default baseline samples?')) {
                    resetToInitialData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Baseline Data</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-400 text-[11px]">
              Chronological log of all system mutations and authentication events:
            </p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="text-indigo-400 font-bold">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
