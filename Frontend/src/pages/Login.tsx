import { useState } from 'react';

type Page = 'landing' | 'login' | 'chat';

interface LoginProps {
  onNavigate: (page: Page) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    // Direct transition into CosmiQ Chatbot
    onNavigate('chat');
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Back to landing */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Home
      </button>

      {/* Auth Card */}
      <div
        className="animate-fade-up w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'rgba(8,13,26,0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.06)',
        }}
      >
        {/* Logo Header */}
        <div className="text-center mb-7">
          <div className="inline-flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer"
              onClick={() => onNavigate('landing')}
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                boxShadow: '0 0 24px rgba(59,130,246,0.45)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <circle cx="12" cy="12" r="3.5" fill="white" />
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.2" strokeOpacity="0.55" fill="none" />
                <circle cx="12" cy="12" r="12" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
                <circle cx="20" cy="12" r="1.8" fill="white" fillOpacity="0.75" />
                <circle cx="12" cy="4" r="1.3" fill="white" fillOpacity="0.7" />
              </svg>
            </div>
            <div>
              <div
                className="text-white font-bold tracking-widest text-base"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.12em' }}
              >
                COSMIQ
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {mode === 'signin' ? 'Welcome back, explorer.' : 'Join the space exploration.'}
              </p>
            </div>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center animate-fade-up">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium" style={{ letterSpacing: '0.04em' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium" style={{ letterSpacing: '0.04em' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full rounded-xl px-4 py-3 pr-11 text-sm"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm password only in Sign Up mode */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1.5 animate-fade-up">
              <label className="text-xs text-slate-400 font-medium" style={{ letterSpacing: '0.04em' }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3 pr-11 text-sm"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5">
                    {showConfirmPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Remember + Forgot in Sign In mode */}
          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className="relative w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    background: remember ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.06)',
                    border: remember ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                  }}
                  onClick={() => setRemember(!remember)}
                >
                  {remember && (
                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl text-white font-semibold text-sm mt-1"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em' }}
          >
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Mode switcher toggle */}
        <div className="text-center text-slate-500 text-xs mt-5">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
