import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Car, CheckCircle2, Circle, Clock, Wrench, Moon, Sun, Globe } from 'lucide-react';
import { STATUS_LIVE_PHRASES, STATUS_SUBTITLES, UI_TRANSLATIONS, STATUS_NAMES } from '../constants/statusPhrases';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

interface Job {
  id: string;
  plate_number: string;
  car_model: string;
  service_type: string;
  estimated_completion: string;
  status: number;
  created_at: string;
  updated_at: string;
}

const playPremiumNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playNote(523.25, 0, 0.5);    // C5
    playNote(659.25, 0.1, 0.5);  // E5
    playNote(783.99, 0.2, 0.5);  // G5
    playNote(1046.50, 0.3, 1.0); // C6
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

const sendPushNotification = (plateNumber: string, language: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const title = language === 'ms' ? 'Kereta Anda Sudah Siap!' : 'Your Car is Ready!';
    const body = language === 'ms' 
      ? `Kenderaan anda (${plateNumber}) sedia untuk diambil. Terima kasih.`
      : `Your vehicle (${plateNumber}) is ready for pickup. Thank you.`;
    
    new Notification(title, {
      body,
      icon: '/favicon.ico'
    });
  }
};

export default function Track() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const prevStatusRef = useRef<number | null>(null);

  // Setup state
  const [isSetupComplete, setIsSetupComplete] = useState(() => localStorage.getItem('track_setup_complete') === 'true');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('track_theme') as 'light' | 'dark') || 'dark');
  const [language, setLanguage] = useState<'ms' | 'en'>(() => (localStorage.getItem('track_lang') as 'ms' | 'en') || 'ms');

  const t = UI_TRANSLATIONS[language];

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % 30);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/track/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
          setError(false);
          
          if (prevStatusRef.current !== null && prevStatusRef.current !== data.status) {
            if (data.status === 6) { // STATUSES.length - 1
              playPremiumNotificationSound();
              sendPushNotification(data.plate_number, language);
            }
          }
          prevStatusRef.current = data.status;
        } else if (res.status === 404) {
          setError(true);
        }
      } catch (err) {
        console.warn('Penjejakan: Ralat rangkaian, cuba lagi...', err);
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 3000);
    return () => clearInterval(interval);
  }, [id, language]);

  const handleCompleteSetup = () => {
    localStorage.setItem('track_setup_complete', 'true');
    localStorage.setItem('track_theme', theme);
    localStorage.setItem('track_lang', language);
    setIsSetupComplete(true);
  };

  if (!isSetupComplete) {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center p-4 transition-colors duration-500",
        theme === 'dark' ? "bg-[#050403] text-[#f4f7fa]" : "bg-[#f4f7fa] text-[#050403]"
      )}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "max-w-md w-full rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border",
            theme === 'dark' ? "bg-[#121212] border-[#b69951]/10" : "bg-white border-[#b69951]/10"
          )}
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#b69951] rounded-3xl flex items-center justify-center shadow-lg shadow-[#b69951]/20">
              <Wrench className="w-10 h-10 text-black" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-center mb-2 tracking-tight italic">IRIDIUM</h1>
          <p className={clsx(
            "text-center text-sm font-medium mb-10",
            theme === 'dark' ? "text-zinc-400" : "text-zinc-500"
          )}>
            {t.setupExperience}
          </p>

          <div className="space-y-8">
            {/* Theme Selection */}
            <div>
              <label className={clsx(
                "block text-[10px] font-black uppercase tracking-[0.2em] mb-4",
                theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
              )}>
                {t.chooseTheme}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={clsx(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                    theme === 'light' 
                      ? "border-[#b69951] bg-[#b69951]/5 text-[#b69951]" 
                      : theme === 'dark' ? "border-[#b69951]/20 bg-[#050403] text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-400"
                  )}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">{t.light}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={clsx(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                    theme === 'dark' 
                      ? "border-[#b69951] bg-[#b69951]/5 text-[#b69951]" 
                      : "border-zinc-200 bg-zinc-50 text-zinc-400"
                  )}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">{t.dark}</span>
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className={clsx(
                "block text-[10px] font-black uppercase tracking-[0.2em] mb-4",
                theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
              )}>
                {t.chooseLanguage}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={clsx(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                    language === 'en' 
                      ? "border-[#b69951] bg-[#b69951]/5 text-[#b69951]" 
                      : theme === 'dark' ? "border-[#b69951]/20 bg-[#050403] text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-400"
                  )}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">{t.english}</span>
                </button>
                <button
                  onClick={() => setLanguage('ms')}
                  className={clsx(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                    language === 'ms' 
                      ? "border-[#b69951] bg-[#b69951]/5 text-[#b69951]" 
                      : theme === 'dark' ? "border-[#b69951]/20 bg-[#050403] text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-400"
                  )}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">{t.malay}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleCompleteSetup}
              className="w-full py-5 bg-[#b69951] text-black rounded-2xl font-black text-lg shadow-xl shadow-[#b69951]/20 hover:bg-[#c7a95e] transition-all active:scale-[0.98]"
            >
              {t.continue}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center p-4",
        theme === 'dark' ? "bg-[#050403]" : "bg-[#f4f7fa]"
      )}>
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-red-500" />
          </div>
          <h1 className={clsx(
            "text-3xl font-bold mb-3 tracking-tight",
            theme === 'dark' ? "text-white" : "text-zinc-900"
          )}>{t.jobNotFound}</h1>
          <p className="text-zinc-400">{t.invalidLink}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center p-4",
        theme === 'dark' ? "bg-[#050403]" : "bg-[#f4f7fa]"
      )}>
        <div className="animate-pulse flex flex-col items-center">
          <div className={clsx(
            "w-20 h-20 rounded-3xl mb-6",
            theme === 'dark' ? "bg-[#121212]" : "bg-zinc-200"
          )}></div>
          <div className={clsx(
            "h-5 w-40 rounded-full mb-3",
            theme === 'dark' ? "bg-[#121212]" : "bg-zinc-200"
          )}></div>
          <div className={clsx(
            "h-4 w-28 rounded-full",
            theme === 'dark' ? "bg-[#121212]" : "bg-zinc-200"
          )}></div>
        </div>
      </div>
    );
  }

  const statusNames = STATUS_NAMES[language];
  const progressPercentage = (job.status / (statusNames.length - 1)) * 100;
  const isReady = job.status === statusNames.length - 1;

  return (
    <div className={clsx(
      "min-h-screen font-sans pb-12 transition-colors duration-500",
      theme === 'dark' ? "bg-[#050403] text-[#f4f7fa]" : "bg-[#f4f7fa] text-[#050403]"
    )}>
      {/* Header */}
      <header className={clsx(
        "py-5 sticky top-0 z-10 shadow-md border-b transition-colors duration-500",
        theme === 'dark' ? "bg-[#050403] border-[#b69951]/20" : "bg-white border-[#b69951]/20"
      )}>
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="Iridium" className="h-7 object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <div className="hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#b69951] to-[#8a733d] rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-black" />
              </div>
              <h1 className={clsx(
                "text-xl font-bold tracking-tight italic",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>IRIDIUM</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const nextLang = language === 'ms' ? 'en' : 'ms';
                setLanguage(nextLang);
                localStorage.setItem('track_lang', nextLang);
              }}
              className={clsx(
                "p-2 rounded-xl border transition-colors",
                theme === 'dark' ? "bg-[#121212] border-[#b69951]/20 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
              )}
            >
              <Globe className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                localStorage.setItem('track_theme', nextTheme);
              }}
              className={clsx(
                "p-2 rounded-xl border transition-colors",
                theme === 'dark' ? "bg-[#121212] border-[#b69951]/20 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
              )}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-8">
        {/* Car Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "rounded-3xl shadow-xl border p-6 mb-8 relative transition-all duration-500",
            theme === 'dark' ? "bg-[#121212]" : "bg-white",
            isReady 
              ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
              : theme === 'dark' ? "border-[#b69951]/10" : "border-[#b69951]/10"
          )}
        >
          {isReady && (
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-1 rounded-full font-black text-[10px] tracking-[0.3em] uppercase z-20 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              {t.done}
            </div>
          )}
          <div className={clsx(
            "absolute top-0 right-0 w-32 h-32 rounded-bl-full rounded-tr-3xl -z-10",
            theme === 'dark' ? "bg-zinc-800/20" : "bg-zinc-100/50"
          )}></div>
          
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  {!isReady && (
                    <span className={clsx(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      "bg-emerald-400"
                    )}></span>
                  )}
                  <span className={clsx(
                    "relative inline-flex rounded-full h-2 w-2",
                    "bg-emerald-500"
                  )}></span>
                </span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{t.liveStatus}</span>
              </div>
              <h2 className={clsx(
                "text-4xl font-black tracking-tight mb-2 font-mono",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>{job.plate_number}</h2>
              <p className="text-[#b69951] font-bold">{job.car_model}</p>
            </div>
            <div className={clsx(
              "w-14 h-14 border rounded-2xl flex items-center justify-center shadow-inner transition-colors",
              theme === 'dark' ? "bg-[#050403] border-zinc-800" : "bg-zinc-50 border-zinc-200",
              isReady && "border-emerald-500/50"
            )}>
              <Car className={clsx("w-7 h-7", isReady ? "text-emerald-500" : "text-[#b69951]")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={clsx(
              "rounded-2xl p-4 border transition-colors",
              theme === 'dark' ? "bg-[#050403]/50 border-zinc-800/50" : "bg-zinc-50 border-zinc-200"
            )}>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">{t.service}</p>
              <p className={clsx(
                "text-sm font-bold",
                theme === 'dark' ? "text-zinc-200" : "text-zinc-700"
              )}>{job.service_type}</p>
            </div>
            <div className={clsx(
              "rounded-2xl p-4 border transition-all",
              isReady 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : theme === 'dark' ? "bg-black/50 border-zinc-800/50" : "bg-zinc-50 border-zinc-200"
            )}>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">{t.estimatedCompletion}</p>
              <div className={clsx(
                "flex items-center gap-2 text-sm font-bold",
                theme === 'dark' ? "text-zinc-200" : "text-zinc-700"
              )}>
                {isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Clock className="w-4 h-4 text-[#b69951]" />
                )}
                {isReady ? t.done : job.estimated_completion}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Alert */}
        {isReady && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-lg"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold text-lg mb-1">{t.readyForPickup}</h3>
              <p className="text-emerald-500/80 text-sm font-medium leading-relaxed">{t.vehicleReady}</p>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            {!isReady && <span className="text-zinc-400 font-bold tracking-widest uppercase text-xs">{t.progress}</span>}
            <span className={clsx(
              "text-5xl font-black tracking-tighter transition-all duration-500",
              isReady ? "text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "text-[#b69951] drop-shadow-[0_0_15px_rgba(182,153,81,0.4)]"
            )}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className={clsx(
            "h-6 border rounded-full overflow-hidden relative shadow-inner p-1 transition-colors",
            theme === 'dark' ? "bg-[#050403] border-zinc-800/80" : "bg-zinc-200 border-zinc-300",
            isReady && "border-emerald-500/30"
          )}>
            {/* Animated Gradient Background */}
            <motion.div 
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                isReady 
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  : "bg-gradient-to-r from-[#b69951] via-[#c7a95e] to-[#b69951] bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] shadow-[0_0_15px_rgba(182,153,81,0.5)]"
              )}
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className={clsx(
          "rounded-3xl shadow-xl border p-6 transition-colors duration-500",
          theme === 'dark' ? "bg-[#121212] border-[#b69951]/10" : "bg-white border-[#b69951]/10"
        )}>
          <h3 className={clsx(
            "text-xl font-bold mb-8 tracking-tight",
            theme === 'dark' ? "text-white" : "text-zinc-900"
          )}>{t.timeline}</h3>
          <div className="space-y-8 relative">
            {/* Vertical Line */}
            <div className={clsx(
              "absolute left-[15px] top-3 bottom-3 w-0.5 -z-10",
              theme === 'dark' ? "bg-zinc-800" : "bg-zinc-100"
            )}></div>
            
            {statusNames.map((status, idx) => {
              const isCompleted = job.status > idx;
              const isCurrent = job.status === idx;
              const isPending = job.status < idx;

              return (
                <motion.div 
                  key={idx} 
                  className={clsx(
                    "flex items-start gap-5 transition-all duration-500",
                    isPending ? "opacity-30" : "opacity-100"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className={clsx(
                    "relative z-10 pt-1",
                    theme === 'dark' ? "bg-[#111111]" : "bg-white"
                  )}>
                    {isCompleted ? (
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isReady ? "bg-emerald-500/10" : "bg-[#b69951]/10"
                      )}>
                        <CheckCircle2 className={clsx("w-6 h-6", isReady ? "text-emerald-500" : "text-[#b69951]")} />
                      </div>
                    ) : isCurrent ? (
                      <div className={clsx(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        theme === 'dark' ? "bg-[#121212]" : "bg-white",
                        isReady 
                          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                          : "border-[#b69951] shadow-[0_0_15px_rgba(182,153,81,0.3)]"
                      )}>
                        <div className={clsx(
                          "w-3 h-3 rounded-full",
                          isReady ? "bg-emerald-500" : "bg-[#b69951] animate-pulse"
                        )}></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <Circle className={clsx(
                          "w-6 h-6",
                          theme === 'dark' ? "text-zinc-600" : "text-zinc-300"
                        )} />
                      </div>
                    )}
                  </div>
                    <div className="pt-1.5 flex-1">
                      <p className={clsx(
                        "font-bold transition-all",
                        isCurrent 
                          ? theme === 'dark' ? "text-white text-lg" : "text-zinc-900 text-lg"
                          : "text-zinc-400 text-base"
                      )}>
                        {status}
                      </p>
                      {isCurrent && (
                        <div className="mt-1">
                          {isReady ? (
                            <p className="text-sm font-medium text-emerald-500">
                              {STATUS_SUBTITLES[language][idx]}
                            </p>
                          ) : (
                            <AnimatePresence mode="wait">
                              <motion.p 
                                key={`${idx}-${phraseIndex}`}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3 }}
                                className="text-sm font-medium text-[#b69951]"
                              >
                                {STATUS_LIVE_PHRASES[language][idx] 
                                  ? STATUS_LIVE_PHRASES[language][idx][phraseIndex % STATUS_LIVE_PHRASES[language][idx].length]
                                  : STATUS_SUBTITLES[language][idx]}
                              </motion.p>
                            </AnimatePresence>
                          )}
                        </div>
                      )}
                    </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

