import { useState, useEffect } from 'react';

type Page = 'landing' | 'login' | 'chat' | 'astronomy-today';

export interface AstronomyUpdate {
  id: number;
  title: string;
  description: string;
  category: 'mission' | 'discovery' | 'event' | 'launch';
  image_url?: string;
  source_name: string;
  source_url: string;
  event_date?: string;
  published_date?: string;
  created_at?: string;
}

export interface GroupedUpdates {
  missions: AstronomyUpdate[];
  discoveries: AstronomyUpdate[];
  events: AstronomyUpdate[];
  launches: AstronomyUpdate[];
}

interface AstronomyTodayProps {
  onNavigate: (page: Page, prompt?: string, contextItem?: AstronomyUpdate) => void;
}

export default function AstronomyToday({ onNavigate }: AstronomyTodayProps) {
  const [updates, setUpdates] = useState<GroupedUpdates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'missions' | 'discoveries' | 'events' | 'launches'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'archive'>('today');
  const [selectedItem, setSelectedItem] = useState<AstronomyUpdate | null>(null);

  // Dynamic date calculations
  const todayDate = new Date();
  const yesterdayDate = new Date(Date.now() - 86400000);

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/astronomy/today');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setUpdates(data);
    } catch (err: any) {
      console.warn('Failed to load Astronomy Recently:', err);
      setError('Unable to load recent astronomy updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleAskCosmiQ = (item: AstronomyUpdate) => {
    setSelectedItem(null);
    const categoryVerb =
      item.category === 'mission' ? 'space mission' :
      item.category === 'discovery' ? 'astronomy discovery' :
      item.category === 'event' ? 'astronomical event' : 'space launch';

    const prompt = `Tell me more about this ${categoryVerb}: "${item.title}". What are the key astrophysical details, scientific context, and recent updates?`;
    onNavigate('chat', prompt, item);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mission': return '🚀';
      case 'discovery': return '🔭';
      case 'event': return '🌠';
      case 'launch': return '🛰️';
      default: return '✦';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mission': return 'text-cyan-400 bg-cyan-950/50 border-cyan-500/30';
      case 'discovery': return 'text-violet-400 bg-violet-950/50 border-violet-500/30';
      case 'event': return 'text-amber-400 bg-amber-950/50 border-amber-500/30';
      case 'launch': return 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30';
      default: return 'text-blue-400 bg-blue-950/50 border-blue-500/30';
    }
  };

  // Compile full pool of updates
  let allPool: AstronomyUpdate[] = [];
  if (updates) {
    if (activeCategory === 'all') {
      allPool = [
        ...(updates.missions || []),
        ...(updates.discoveries || []),
        ...(updates.events || []),
        ...(updates.launches || []),
      ];
    } else {
      allPool = updates[activeCategory] || [];
    }
  }

  // Filter updates based on selected date navigation pill (Today, Yesterday, Previous Dates)
  let displayedItems: AstronomyUpdate[] = [];
  if (dateFilter === 'today') {
    displayedItems = allPool.slice(0, 8);
  } else if (dateFilter === 'yesterday') {
    displayedItems = allPool.slice(4, 14);
  } else {
    // Older / Previous Dates
    displayedItems = allPool.slice(8);
  }

  const categoryCounts = {
    all: updates ? (updates.missions?.length || 0) + (updates.discoveries?.length || 0) + (updates.events?.length || 0) + (updates.launches?.length || 0) : 0,
    missions: updates?.missions?.length || 0,
    discoveries: updates?.discoveries?.length || 0,
    events: updates?.events?.length || 0,
    launches: updates?.launches?.length || 0,
  };

  return (
    <div className="min-h-screen pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation */}
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

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => onNavigate('chat')}
              className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to Chat</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="btn-primary text-xs sm:text-sm px-4 py-1.5 rounded-full text-white font-semibold flex items-center gap-1.5 shadow-md"
            >
              <span>CosmiQ Chatbot</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-5 lg:px-8 pt-28">
        {/* Page Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-widest text-cyan-300"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)' }}
            >
              ✦ RECENT COSMIC FEED
            </span>
          </div>

          <h1
            className="text-gradient mb-3"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            ASTRONOMY RECENTLY
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto" style={{ lineHeight: 1.65 }}>
            Discover what’s happening across the universe recently.
          </p>
        </div>

        {/* Date / Archive Filter Pills */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'archive', label: 'Previous Dates' },
          ].map((tab) => {
            const isActive = dateFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(59,130,246,0.45)] border border-blue-400'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {[
            { id: 'all', label: 'All Updates', icon: '✦', count: categoryCounts.all },
            { id: 'missions', label: 'SPACE MISSIONS', icon: '🚀', count: categoryCounts.missions },
            { id: 'discoveries', label: 'ASTRONOMY DISCOVERIES', icon: '🔭', count: categoryCounts.discoveries },
            { id: 'events', label: 'UPCOMING EVENTS', icon: '🌠', count: categoryCounts.events },
            { id: 'launches', label: 'SPACE LAUNCHES', icon: '🛰️', count: categoryCounts.launches },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/50'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-800/80 text-blue-100' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm animate-pulse font-medium">
              Loading recent cosmic updates...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto py-12 px-6 rounded-2xl glass text-center border border-rose-500/20 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950/50 text-rose-400 flex items-center justify-center mx-auto mb-3 text-xl">
              ⚠️
            </div>
            <h3 className="text-white font-semibold text-base mb-1">Unable to load recent astronomy updates</h3>
            <p className="text-slate-400 text-xs mb-4">Please check your backend connection or try again.</p>
            <button
              onClick={fetchUpdates}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedItems.length === 0 && (
          <div className="py-20 text-center glass rounded-2xl p-8 max-w-lg mx-auto">
            <div className="text-3xl mb-2">🌌</div>
            <p className="text-slate-300 text-sm font-medium">No astronomy updates are available for this period.</p>
            <p className="text-slate-500 text-xs mt-1">Check back later or explore other date filters.</p>
          </div>
        )}

        {/* Grid of Updates */}
        {!loading && !error && displayedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass card-hover rounded-2xl p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                style={{
                  background: 'rgba(8,14,30,0.75)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  {/* Category Badge & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryColor(item.category)}`}>
                      <span>{getCategoryIcon(item.category)}</span>
                      <span className="capitalize">{item.category}</span>
                    </span>
                    {item.event_date && (
                      <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
                        {item.event_date}
                      </span>
                    )}
                  </div>

                  {/* Image when available */}
                  {item.image_url && (
                    <div className="relative mb-3.5 rounded-xl overflow-hidden h-36 bg-slate-950">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080e1e] via-transparent to-transparent opacity-60" />
                    </div>
                  )}

                  {/* Title */}
                  <h3
                    className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-blue-300 transition-colors line-clamp-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {item.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Source & Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors truncate max-w-[130px]"
                    title={`Source: ${item.source_name}`}
                  >
                    <span className="text-slate-500">Source:</span>
                    <span className="underline decoration-slate-600 underline-offset-2">{item.source_name}</span>
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-2.5 h-2.5 shrink-0 opacity-70">
                      <path d="M3.5 1.5h7v7M10.5 1.5l-9 9" strokeLinecap="round" />
                    </svg>
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAskCosmiQ(item);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all shrink-0 flex items-center gap-1"
                    title="Ask CosmiQ about this update"
                  >
                    <span>Ask CosmiQ</span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 🔍 DETAIL VIEW MODAL                                       */}
      {/* ========================================================= */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(8,14,30,0.96)',
              border: '1px solid rgba(59,130,246,0.35)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(59,130,246,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Close detail view"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
              </svg>
            </button>

            {/* Category + Date Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${getCategoryColor(selectedItem.category)}`}>
                <span>{getCategoryIcon(selectedItem.category)}</span>
                <span className="capitalize">{selectedItem.category}</span>
              </span>
              {selectedItem.event_date && (
                <span className="text-slate-400 text-xs">{selectedItem.event_date}</span>
              )}
            </div>

            {/* High-res Image */}
            {selectedItem.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden max-h-60 bg-slate-950 border border-white/10">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h3
              className="text-white text-xl font-bold mb-3 leading-snug"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {selectedItem.title}
            </h3>

            {/* Full Description */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {selectedItem.description}
            </p>

            {/* Original Source Reference */}
            <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                <span>Original Source: </span>
                <span className="text-white font-medium">{selectedItem.source_name}</span>
              </div>
              <a
                href={selectedItem.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Read original</span>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                  <path d="M3.5 1.5h7v7M10.5 1.5l-9 9" strokeLinecap="round" />
                </svg>
              </a>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleAskCosmiQ(selectedItem)}
              className="btn-primary w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em' }}
            >
              <span>Ask CosmiQ about this</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
