import { useState } from 'react';
import CosmicViz from '../components/CosmicViz';

type Page = 'landing' | 'login' | 'chat';

const CARDS = [
  {
    label: 'Galaxies',
    desc: 'Explore the 2 trillion galaxies spanning the observable universe.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="3" fill="#93c5fd" />
        <ellipse cx="24" cy="24" rx="18" ry="5" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.7" />
        <ellipse cx="24" cy="24" rx="18" ry="5" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.5" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="18" ry="5" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.5" transform="rotate(120 24 24)" />
        <circle cx="24" cy="24" r="5" fill="url(#g1)" />
        <defs>
          <radialGradient id="g1" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: 'Stars',
    desc: 'From red dwarfs to hypergiants — the lifecycle of stellar objects.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="10" fill="url(#g2)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={24 + 12 * Math.cos(rad)}
              y1={24 + 12 * Math.sin(rad)}
              x2={24 + 20 * Math.cos(rad)}
              y2={24 + 20 * Math.sin(rad)}
              stroke="#fde68a"
              strokeWidth={i % 2 === 0 ? 1.5 : 0.8}
              strokeLinecap="round"
              strokeOpacity={i % 2 === 0 ? 0.9 : 0.5}
            />
          );
        })}
        <defs>
          <radialGradient id="g2" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: 'Planets',
    desc: 'Eight worlds and thousands of exoplanets across the cosmos.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="10" fill="url(#g3)" />
        <ellipse cx="24" cy="24" rx="20" ry="6" stroke="#a78bfa" strokeWidth="1.4" strokeOpacity="0.7" transform="rotate(-25 24 24)" />
        <defs>
          <radialGradient id="g3" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: 'Black Holes',
    desc: 'Singularities where spacetime curves beyond escape velocity.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="18" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.3" />
        <circle cx="24" cy="24" r="13" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="24" cy="24" r="9" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="24" cy="24" r="5.5" fill="#030712" />
        <circle cx="24" cy="24" r="5.5" stroke="#93c5fd" strokeWidth="0.8" strokeOpacity="0.8" />
        <path d="M 5 22 Q 24 16 43 22" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" fill="none" strokeLinecap="round" />
        <path d="M 5 26 Q 24 32 43 26" stroke="#f59e0b" strokeWidth="0.7" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Space Missions',
    desc: "Voyager, Webb, Artemis — humanity's reach beyond Earth.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <path d="M24 6 L28 20 L38 20 L30 28 L33 42 L24 35 L15 42 L18 28 L10 20 L20 20 Z" fill="none" stroke="#60a5fa" strokeWidth="1.3" strokeLinejoin="round" strokeOpacity="0.8" />
        <path d="M24 10 L27 20 L24 18 L21 20 Z" fill="#93c5fd" fillOpacity="0.6" />
        <circle cx="24" cy="26" r="3" fill="#3b82f6" fillOpacity="0.8" />
        <path d="M21 40 Q24 46 27 40" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
        <path d="M22 43 Q24 48 26 43" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    label: 'Solar System',
    desc: 'The Sun and its family of planets, moons, and asteroids.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
        <circle cx="24" cy="24" r="6" fill="url(#g4)" />
        <circle cx="24" cy="24" r="10" stroke="#93c5fd" strokeWidth="0.7" strokeOpacity="0.4" fill="none" />
        <circle cx="34" cy="24" r="2.5" fill="#60a5fa" fillOpacity="0.8" />
        <circle cx="24" cy="24" r="15" stroke="#8b5cf6" strokeWidth="0.7" strokeOpacity="0.35" fill="none" />
        <circle cx="24" cy="9" r="3" fill="#a78bfa" fillOpacity="0.75" />
        <circle cx="24" cy="24" r="20" stroke="#60a5fa" strokeWidth="0.6" strokeOpacity="0.25" fill="none" />
        <circle cx="4" cy="24" r="2" fill="#34d399" fillOpacity="0.65" />
        <defs>
          <radialGradient id="g4" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
];

const QUESTIONS = [
  'How are black holes formed?',
  'What happens inside a neutron star?',
  'How far is the Andromeda Galaxy?',
  'Could humans live on Mars?',
];

interface LandingProps {
  onNavigate: (page: Page, prompt?: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 12px rgba(59,130,246,0.4)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <circle cx="12" cy="12" r="3" fill="white" />
                <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1" strokeOpacity="0.5" fill="none" />
                <circle cx="19" cy="12" r="1.5" fill="white" fillOpacity="0.8" />
                <circle cx="12" cy="5" r="1" fill="white" fillOpacity="0.7" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em' }} className="text-white">
              COSMIQ
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate('landing')}
              className="text-sm text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Explore
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm px-4 py-1.5 rounded-full border border-blue-500/40 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 transition-all font-medium"
            >
              Login
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              {mobileMenuOpen ? (
                <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-strong animate-slide-down border-t border-white/5 px-5 py-4 flex flex-col gap-3">
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('landing'); }}
              className="text-sm text-slate-300 text-left py-1.5"
            >
              Home
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
              className="text-sm text-slate-300 text-left py-1.5"
            >
              Explore
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
              className="text-sm text-blue-300 text-left py-1.5 border-t border-white/5 pt-3 font-medium"
            >
              Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center min-h-[calc(100vh-4rem)]">
            {/* Left — text */}
            <div className="flex flex-col justify-center">
              <div className="animate-fade-up inline-flex items-center gap-2 mb-6 w-fit">
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#93c5fd',
                    letterSpacing: '0.06em',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  ✦ ASTRONOMY AI CHATBOT
                </span>
              </div>

              <h1
                className="animate-fade-up-1 text-gradient mb-5"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(3.2rem, 8vw, 5.5rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.02em',
                }}
              >
                COSMIQ
              </h1>

              <p
                className="animate-fade-up-2 text-slate-100 mb-4"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 400,
                  fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
                  lineHeight: 1.4,
                }}
              >
                Your AI guide to the universe.
              </p>

              <p className="animate-fade-up-3 text-slate-400 mb-10 max-w-md" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                Ask questions about planets, stars, galaxies, black holes, cosmology, space missions, and everything beyond Earth.
              </p>

              <div className="animate-fade-up-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('login')}
                  className="btn-primary px-7 py-3.5 rounded-full text-white font-semibold text-sm"
                  style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em' }}
                >
                  Explore the Universe
                </button>
              </div>
            </div>

            {/* Right — cosmic visualization */}
            <div className="animate-fade-up-2 relative h-[420px] lg:h-[580px] flex items-center justify-center">
              <CosmicViz />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 🌌 DISCOVERY CATEGORY CARDS                                */}
      {/* ========================================================= */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="text-gradient"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                marginBottom: '0.75rem',
              }}
            >
              What will you discover?
            </h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm" style={{ lineHeight: 1.7 }}>
              From the birth of stars to the edge of the observable universe — ask CosmiQ anything.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CARDS.map((card) => (
              <button
                key={card.label}
                onClick={() => onNavigate('login')}
                className="glass card-hover rounded-2xl p-6 text-left group"
              >
                <div className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)] w-fit">
                  {card.icon}
                </div>
                <h3
                  className="text-white font-semibold mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem' }}
                >
                  {card.label}
                </h3>
                <p className="text-slate-400 text-sm" style={{ lineHeight: 1.65 }}>
                  {card.desc}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore topic</span>
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ❓ EXAMPLE QUESTIONS                                       */}
      {/* ========================================================= */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              marginBottom: '1rem',
            }}
          >
            Ask anything about the universe.
          </h2>
          <p className="text-slate-400 mb-12 text-sm" style={{ lineHeight: 1.7 }}>
            CosmiQ is trained exclusively on astronomy, astrophysics, and space science.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            {QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => onNavigate('login')}
                className="group flex items-center gap-2.5 px-5 py-3 rounded-full text-sm text-slate-300 hover:text-white transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-blue-400 shrink-0" stroke="currentColor" strokeWidth="2">
                  <path d="M8 1v6M8 9v6M1 8h6M9 8h6" strokeLinecap="round" />
                </svg>
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-10 text-center text-slate-500 text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="3" fill="white" />
                <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.07em', color: '#64748b' }}>
              COSMIQ
            </span>
          </div>
          <span>© 2026 CosmiQ · Your AI guide to the universe</span>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <button key={item} className="hover:text-slate-400 transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
