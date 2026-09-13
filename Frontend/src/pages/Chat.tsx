import { useState, useRef, useEffect } from 'react';

type Page = 'landing' | 'login' | 'chat' | 'astronomy-today';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  botImage?: string | null;
  isClarification?: boolean;
  feedbackGiven?: 'helpful' | 'refine' | null;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timeGroup: 'Today' | 'Yesterday' | 'Older';
}

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 's1',
    title: 'Black holes & event horizons',
    timeGroup: 'Today',
    messages: [
      {
        id: 'bh-u1',
        role: 'user',
        content: 'How are black holes formed?',
      },
      {
        id: 'bh-a1',
        role: 'assistant',
        content: `A black hole is a region of spacetime where gravity is so intense that nothing—not even light—can escape from within its event horizon.\n\n**Formation:** When a massive star (>20 solar masses) exhausts its nuclear fuel, its core collapses catastrophically under gravity. If the remnant mass exceeds the Tolman-Oppenheimer-Volkoff limit (~3 solar masses), it collapses into a gravitational singularity.\n\n**Key Features:**\n- **Singularity:** Point of theoretically infinite density.\n- **Event Horizon:** The boundary of no return (Schwarzschild radius).\n- **Accretion Disk:** Superheated matter swirling inward at relativistic speeds.`,
        botImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/1200px-Black_hole_-_Messier_87_crop_max_res.jpg',
      },
    ],
  },
  {
    id: 's2',
    title: 'Mars atmospheric pressure',
    timeGroup: 'Today',
    messages: [
      {
        id: 'm-u1',
        role: 'user',
        content: 'What is the atmospheric composition of Mars?',
      },
      {
        id: 'm-a1',
        role: 'assistant',
        content: `Mars has a very thin atmosphere with an average surface pressure of only ~6.1 millibars (less than 1% of Earth's).\n\n**Atmospheric Composition:**\n- **Carbon Dioxide (CO₂):** ~95.3%\n- **Nitrogen (N₂):** ~2.6%\n- **Argon (Ar):** ~1.9%\n- **Trace Gases:** Oxygen, water vapor, and methane.\n\nBecause of the thin atmosphere and lack of a global magnetic field, solar wind continuously strips away atmospheric particles.`,
      },
    ],
  },
  {
    id: 's3',
    title: 'James Webb Telescope',
    timeGroup: 'Yesterday',
    messages: [
      {
        id: 'jw-u1',
        role: 'user',
        content: 'How far can the James Webb Space Telescope see?',
      },
      {
        id: 'jw-a1',
        role: 'assistant',
        content: `The James Webb Space Telescope (JWST) observes the cosmos primarily in infrared wavelengths, allowing it to look back over **13.5 billion years**—detecting light from the earliest galaxies formed shortly after the Big Bang.\n\n**Key Capabilities:**\n- 6.5-meter gold-plated beryllium mirror.\n- Positioned at Sun-Earth Lagrange point 2 (L2), 1.5 million km from Earth.\n- Infrared spectroscopy capable of analyzing exoplanet atmospheric compositions.`,
      },
    ],
  },
  {
    id: 's4',
    title: 'Exoplanets in habitable zone',
    timeGroup: 'Yesterday',
    messages: [
      {
        id: 'ex-u1',
        role: 'user',
        content: 'What are the closest potentially habitable exoplanets?',
      },
      {
        id: 'ex-a1',
        role: 'assistant',
        content: `Astronomers have identified several promising rocky exoplanets in the habitable ("Goldilocks") zone where liquid water could exist.\n\n**Notable Candidates:**\n- **Proxima Centauri b:** 4.24 light-years away orbiting our nearest stellar neighbor.\n- **TRAPPIST-1e, f, g:** Earth-sized worlds located ~39 light-years away in Aquarius.\n- **TRAPPIST-1 System:** Contains 7 Earth-sized planets, with 3 in the habitable zone.`,
      },
    ],
  },
  {
    id: 's5',
    title: 'Solar system planetary orbits',
    timeGroup: 'Older',
    messages: [],
  },
  {
    id: 's6',
    title: 'Neutron stars and pulsars',
    timeGroup: 'Older',
    messages: [],
  },
];

const SUGGESTED = [
  'How are black holes formed?',
  'What happens inside a neutron star?',
  'How far is the Andromeda Galaxy?',
  'Could humans live on Mars?',
];

export function cleanControlSequences(text: string): string {
  if (!text) return '';
  // 1. Remove ANSI escape sequences (ESC[...m, ESC[...H, ESC[...D, ESC[...K, etc.)
  let cleaned = text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
  // 2. Remove bracketed cursor/erase control artifacts that lost ESC (e.g. [1D][K], [5D][K], [2K], [1A])
  cleaned = cleaned.replace(/\[\d+[A-Za-z]\]/g, '');
  cleaned = cleaned.replace(/\[[A-Za-z]\]/g, '');
  // 3. Remove any remaining control escape sequences
  cleaned = cleaned.replace(/\[\?[0-9;]*[a-zA-Z]/g, '');
  return cleaned;
}

function formatBotMarkdown(text: string) {
  if (!text) return null;

  const sanitized = cleanControlSequences(text);
  const lines = sanitized.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      return (
        <p key={i} className="font-semibold text-white mt-3 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {trimmed.slice(2, -2)}
        </p>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const content = trimmed.replace(/^[-•*]\s+/, '');
      return (
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="text-blue-400 mt-1 shrink-0 text-xs">◆</span>
          <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
        </div>
      );
    }
    if (trimmed.match(/^\d+\.\s/)) {
      const m = trimmed.match(/^(\d+)\.\s(.+)/);
      if (m) {
        return (
          <div key={i} className="flex gap-2.5 items-start my-0.5">
            <span className="text-blue-400 font-mono text-xs shrink-0 mt-0.5 w-4">{m[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: m[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
          </div>
        );
      }
    }
    if (trimmed === '') return <div key={i} className="h-1.5" />;
    return (
      <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
    );
  });
}

import { AstronomyUpdate } from './AstronomyToday';

interface ChatProps {
  onNavigate: (page: Page, prompt?: string, contextItem?: AstronomyUpdate) => void;
  initialPrompt?: string;
  initialContextItem?: AstronomyUpdate | null;
}

export default function Chat({ onNavigate, initialPrompt, initialContextItem }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialPrompt || '');
  const [contextItem, setContextItem] = useState<AstronomyUpdate | null>(initialContextItem || null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [refiningMsgId, setRefiningMsgId] = useState<string | null>(null);
  const [refineInput, setRefineInput] = useState('');

  // Voice Input (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      setTimeout(autoResize, 50);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (initialContextItem) {
      setContextItem(initialContextItem);
    }
  }, [initialContextItem]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      const initialText = input;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const recognizedText = (final || interim).trim();
        if (recognizedText) {
          const prefix = initialText ? initialText.trim() + ' ' : '';
          setInput(prefix + recognizedText);
          setTimeout(autoResize, 10);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('Microphone access is required for voice input.');
        } else if (event.error === 'no-speech') {
          // No speech detected, silently exit
        } else {
          setSpeechError('Speech recognition error. Please type normally.');
        }
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition initialization error:', err);
      setIsListening(false);
      setSpeechError('Microphone access is required for voice input.');
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const sendQueryToBackend = async (
    userQuery: string,
    imgData: string | null = null,
    feedbackMode: boolean = false,
    isClarification: boolean = false
  ) => {
    // If voice recognition is active, stop it
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: userQuery,
      image: imgData ?? undefined,
      isClarification,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          feedback_mode: feedbackMode,
          context_item: contextItem || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);

      const rawContent = data.error ? `⚠️ ${data.error}` : (data.response || 'No response returned from model.');
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanControlSequences(rawContent),
        botImage: data.image || null,
      };

      setMessages((prev) => {
        const updated = [...prev, botReply];
        return updated;
      });

      setSessions((sList) => {
        if (activeSessionId) {
          return sList.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, botReply] } : s));
        }
        const newId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        setActiveSessionId(newId);
        const title = userQuery.slice(0, 32) + (userQuery.length > 32 ? '...' : '');
        return [
          {
            id: newId,
            title,
            messages: [userMsg, botReply],
            timeGroup: 'Today' as const,
          },
          ...sList,
        ];
      });
    } catch (err: any) {
      console.warn('Backend /chat fetch error:', err);
      setIsTyping(false);

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Could not connect to CosmiQ backend.**\n\nPlease ensure \`python app.py\` is running on port 5001.\n\n*Error details: ${err.message || 'Network error'}*`,
      };

      setMessages((prev) => [...prev, botReply]);
    }
  };

  const handleSendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content && !attachedImage) return;

    const query = content || (attachedImage ? 'What is this astronomical object?' : '');
    const img = attachedImage;

    setInput('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    sendQueryToBackend(query, img, false, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (msgId: string, isPositive: boolean) => {
    if (isPositive) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, feedbackGiven: 'helpful' } : m))
      );
      setRefiningMsgId(null);
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, feedbackGiven: 'refine' } : m))
      );
      setRefiningMsgId(msgId);
      setRefineInput('');
    }
  };

  const submitRefinement = (msgId: string) => {
    const text = refineInput.trim();
    if (!text) return;
    setRefiningMsgId(null);
    setRefineInput('');
    sendQueryToBackend(text, null, true, true);
  };

  const startNewChat = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setMessages([]);
    setInput('');
    setAttachedImage(null);
    setIsTyping(false);
    setActiveSessionId(null);
    setSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setInput('');
    setAttachedImage(null);
    setIsTyping(false);
    setSidebarOpen(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  // Right-side panel content
  const RightPanel = () => {
    const groups: Array<'Today' | 'Yesterday' | 'Older'> = ['Today', 'Yesterday', 'Older'];

    return (
      <div className="flex flex-col h-full select-none">
        {/* New Chat */}
        <div className="p-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(99,102,241,0.2))',
              border: '1px solid rgba(59,130,246,0.35)',
              color: '#93c5fd',
              boxShadow: '0 0 14px rgba(59,130,246,0.12)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(37,99,235,0.35), rgba(99,102,241,0.35))';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.55)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(99,102,241,0.2))';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.35)';
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
            + New Chat
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2" style={{ letterSpacing: '0.12em' }}>
            Chat History
          </p>

          {groups.map((groupName) => {
            const groupSessions = sessions.filter((s) => s.timeGroup === groupName);
            if (groupSessions.length === 0) return null;

            return (
              <div key={groupName} className="space-y-1">
                <p className="text-slate-600 text-[11px] font-medium px-2 py-0.5">{groupName}</p>
                {groupSessions.map((item) => {
                  const isActive = activeSessionId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => loadSession(item)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-all group"
                      style={{
                        color: isActive ? '#93c5fd' : '#94a3b8',
                        background: isActive ? 'rgba(59,130,246,0.14)' : 'transparent',
                        border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                          (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                        }
                      }}
                    >
                      <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`w-3 h-3 shrink-0 ${isActive ? 'text-blue-400 opacity-100' : 'opacity-40 group-hover:opacity-80'}`}
                      >
                        <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zM7 4v3.5L9 9" strokeLinecap="round" />
                      </svg>
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Share */}
        <div className="p-3 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {shareToast && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap animate-fade-up shadow-xl"
              style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.4)' }}
            >
              ✨ Conversation link copied!
            </div>
          )}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-all hover:bg-white/5"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
              <circle cx="12" cy="3" r="1.5" />
              <circle cx="12" cy="13" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <path d="M4.5 7.1L10.5 4M4.5 8.9l6 3.1" strokeLinecap="round" />
            </svg>
            Share Conversation
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Main chat column ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 h-14 glass shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Return to Home"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 12px rgba(59,130,246,0.35)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                  <circle cx="12" cy="12" r="3" fill="white" />
                  <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
                </svg>
              </div>
              <span
                className="text-white font-bold tracking-wider text-sm"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em' }}
              >
                COSMIQ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Astronomy Recently Compact Top Button */}
            <button
              onClick={() => onNavigate('astronomy-today')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-sm"
              title="Open Astronomy Recently"
            >
              <span>🌌</span>
              <span className="font-semibold tracking-wide">Astronomy Recently</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Astronomy RAG Active</span>
            </div>

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
              title="Toggle History"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <rect x="2" y="4" width="7" height="12" rx="1" />
                <path d="M13 6h5M13 10h5M13 14h5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div
              className="fixed right-0 top-0 bottom-0 z-40 w-64 lg:hidden flex flex-col animate-slide-down shadow-2xl"
              style={{
                background: 'rgba(6,10,22,0.98)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="h-14 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-semibold text-slate-300">CosmiQ Assistant</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <RightPanel />
            </div>
          </>
        )}

        {/* Messages / Empty State */}
        <main className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                  boxShadow: '0 0 36px rgba(59,130,246,0.45)',
                  animation: 'pulse-glow 3.5s ease-in-out infinite',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
                  <circle cx="12" cy="12" r="3.5" fill="white" />
                  <circle cx="12" cy="12" r="7.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" fill="none" />
                  <circle cx="12" cy="12" r="11.5" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
                  <circle cx="19.5" cy="12" r="1.7" fill="white" fillOpacity="0.75" />
                  <circle cx="12" cy="4.5" r="1.3" fill="white" fillOpacity="0.65" />
                </svg>
              </div>

              <h1
                className="text-white mb-2"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}
              >
                What are you curious about?
              </h1>

              <p className="text-slate-400 mb-8 max-w-sm text-sm" style={{ lineHeight: 1.65 }}>
                Ask about any topic related to astronomy and space.
              </p>

              <div className="flex flex-col gap-2.5 w-full max-w-md">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white text-left transition-all"
                    style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.09)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.35)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-blue-400 shrink-0">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 5.5v3M8 10.5v.5" strokeLinecap="round" />
                    </svg>
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 lg:px-6 py-6">
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="animate-message">
                    {msg.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%]">
                          {msg.image && (
                            <div className="mb-2 flex justify-end">
                              <img
                                src={msg.image}
                                alt="User uploaded context"
                                className="rounded-xl max-w-[240px] max-h-[240px] object-cover shadow-lg"
                                style={{ border: '1px solid rgba(255,255,255,0.18)' }}
                              />
                            </div>
                          )}
                          <div
                            className="px-4 py-3 rounded-2xl rounded-tr-md text-sm text-white leading-relaxed"
                            style={{
                              background: 'linear-gradient(135deg, rgba(37,99,235,0.9), rgba(59,130,246,0.75))',
                              border: '1px solid rgba(59,130,246,0.35)',
                              boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
                            }}
                          >
                            {msg.isClarification && (
                              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1">
                                ↺ Clarification
                              </span>
                            )}
                            <div>{msg.content}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 items-start">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                            boxShadow: '0 0 12px rgba(59,130,246,0.35)',
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                            <circle cx="12" cy="12" r="3" fill="white" />
                            <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
                          </svg>
                        </div>

                        <div
                          className="flex-1 px-4 py-3.5 rounded-2xl rounded-tl-md text-sm text-slate-300 leading-relaxed flex flex-col gap-2"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(12px)',
                          }}
                        >
                          <div className="space-y-1">{formatBotMarkdown(msg.content)}</div>

                          {/* Space Image Preview if returned */}
                          {msg.botImage && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-blue-500/20 bg-slate-950/60 p-2">
                              <div className="relative rounded-lg overflow-hidden max-h-[300px]">
                                <img
                                  src={msg.botImage}
                                  alt="Deep Space Visual"
                                  className="w-full h-auto object-cover rounded-lg"
                                  loading="lazy"
                                />
                                <div
                                  className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white tracking-wide"
                                  style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
                                >
                                  Deep Space Visual
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Feedback / Refine Toolbar */}
                          <div className="mt-2 pt-2 flex flex-wrap items-center gap-2 border-t border-white/5 text-xs">
                            {msg.feedbackGiven === 'helpful' ? (
                              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                <span>✨</span> Thanks for your feedback!
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleFeedback(msg.id, true)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 transition-all border border-transparent hover:border-emerald-500/20"
                                  title="Helpful explanation"
                                >
                                  <span>👍</span> Helpful
                                </button>
                                <button
                                  onClick={() => handleFeedback(msg.id, false)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/30 transition-all border border-transparent hover:border-amber-500/20"
                                  title="Request clarification or refinement"
                                >
                                  <span>👎</span> Refine
                                </button>
                              </>
                            )}
                          </div>

                          {/* Refine Input Box */}
                          {refiningMsgId === msg.id && (
                            <div className="mt-2 flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 animate-fade-up">
                              <input
                                type="text"
                                value={refineInput}
                                onChange={(e) => setRefineInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') submitRefinement(msg.id);
                                }}
                                placeholder="Explain what to refine or clarify..."
                                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => submitRefinement(msg.id)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="animate-message flex gap-3 items-start">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                        <circle cx="12" cy="12" r="3" fill="white" />
                        <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
                      </svg>
                    </div>
                    <div
                      className="px-4 py-4 rounded-2xl rounded-tl-md"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-blue-400"
                            style={{ animation: `typing-dot 1.4s ${delay}s ease-in-out infinite` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </main>

        {/* Fixed Composer */}
        <div
          className="px-4 lg:px-6 pb-5 pt-2 shrink-0"
          style={{ background: 'linear-gradient(to top, #04060f 80%, transparent)' }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Active Astronomy Context Badge */}
            {contextItem && (
              <div className="mb-2.5 flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs shadow-lg animate-fade-up">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">🌌</span>
                  <div className="min-w-0">
                    <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px]">Context Active: </span>
                    <span className="text-white font-medium truncate inline-block max-w-[280px] sm:max-w-[400px] align-bottom">
                      {contextItem.title}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setContextItem(null)}
                  className="text-slate-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors shrink-0 text-[11px] font-medium"
                  title="Clear topic context"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {/* Listening Indicator Badge */}
            {isListening && (
              <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs w-fit animate-pulse shadow-lg">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-medium">Listening to speech... Speak your space question.</span>
              </div>
            )}

            {/* Non-intrusive Speech Error message */}
            {speechError && (
              <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs animate-fade-up">
                ⚠️ {speechError}
              </div>
            )}

            {attachedImage && (
              <div className="mb-2 flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={attachedImage}
                    alt="Selected attachment"
                    className="w-14 h-14 rounded-xl object-cover shadow-md"
                    style={{ border: '1px solid rgba(59,130,246,0.5)' }}
                  />
                  <button
                    onClick={() => {
                      setAttachedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors shadow"
                    style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                    title="Remove image"
                  >
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-white">
                      <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-blue-300 font-medium">Image attached</span>
              </div>
            )}

            <div
              className={`flex items-end gap-2.5 rounded-2xl p-3 transition-all ${
                isListening
                  ? 'border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.25)]'
                  : 'border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.35)]'
              }`}
              style={{
                background: 'rgba(10,16,32,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderWidth: '1px',
              }}
            >
              {/* 🎙 Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-[0_0_14px_rgba(244,63,94,0.6)] animate-pulse'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
                title={isListening ? 'Stop listening' : 'Voice Input (Speech-to-Text)'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* 📷 Image Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                title="Upload astronomy image"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                  <rect x="2" y="4" width="16" height="12" rx="2" />
                  <circle cx="7.5" cy="8.5" r="1.5" />
                  <path d="M2 13l4.5-4 3.5 3.5 2.5-2.5L18 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? 'Listening... Speak now...'
                    : hasMessages
                    ? 'Ask a follow-up space question...'
                    : 'Ask about any space topic...'
                }
                rows={1}
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm resize-none leading-relaxed py-1.5 outline-none"
                style={{ maxHeight: '160px', fontFamily: "'Inter', sans-serif" }}
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() && !attachedImage}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background:
                    input.trim() || attachedImage
                      ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                      : 'rgba(255,255,255,0.06)',
                  boxShadow: input.trim() || attachedImage ? '0 0 16px rgba(59,130,246,0.45)' : 'none',
                  cursor: input.trim() || attachedImage ? 'pointer' : 'not-allowed',
                }}
                title="Send message"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <path d="M3 10L17 3l-5 14-2-5-5-2z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <p className="text-center text-slate-600 text-xs mt-2">
              CosmiQ answers questions about astronomy, astrophysics, and space science.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right sidebar (desktop compact) ── */}
      <aside
        className="hidden lg:flex flex-col w-52 xl:w-56 shrink-0"
        style={{
          background: 'rgba(5,8,18,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <RightPanel />
      </aside>
    </div>
  );
}
