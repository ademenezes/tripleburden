'use client';

import { useEffect, useState, type ReactNode } from 'react';
import BrandMark from './shared/BrandMark';

const STORAGE_KEY = 'tb-unlocked';
const PASSWORD = 'TB-v2';

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '1') {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage can throw in privacy modes — fall through to locked state
    }
    setReady(true);
  }, []);

  if (!ready) {
    // Avoid a flash of unstyled locked/unlocked content on first paint.
    return <div className="min-h-screen bg-[#031518]" />;
  }

  if (unlocked) return <>{children}</>;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (attempt === PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // ignore storage errors — unlock still works for the session
      }
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,#0a5257_0%,#062b30_60%,#031518_100%)] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <BrandMark size={40} variant="inverted" />
          <div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/50 font-semibold">
              Preview access
            </div>
            <div className="text-xl font-bold">Triple Burden</div>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-6 leading-relaxed">
          This site is a preview. Enter the access password to continue.
        </p>
        <label
          htmlFor="tb-password"
          className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50 mb-2 block"
        >
          Password
        </label>
        <input
          id="tb-password"
          type="password"
          value={attempt}
          onChange={(e) => {
            setAttempt(e.target.value);
            if (error) setError(false);
          }}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent ${
            error ? 'border-red-400' : 'border-white/20'
          }`}
          placeholder="Enter password"
        />
        {error && (
          <p className="text-red-300 text-sm mt-2" role="alert">
            Incorrect password. Try again.
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-5 px-5 py-3 text-[#062b30] font-semibold rounded-lg bg-amber-300 hover:bg-amber-200 shadow-lg transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
