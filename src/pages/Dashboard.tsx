import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

import { Plus, LogOut, QrCode, Trash2, CheckCircle2, Clock, Car, Wrench, Search, Moon, Sun, Globe } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';
import { STATUS_LIVE_PHRASES, STATUS_SUBTITLES, STATUS_NAMES, UI_TRANSLATIONS } from '../constants/statusPhrases';
import clsx from 'clsx';

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

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

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJob, setShowNewJob] = useState(false);
  const [selectedJobForQR, setSelectedJobForQR] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const plateInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [editingJobETA, setEditingJobETA] = useState<string | null>(null);
  const [newETA, setNewETA] = useState('');

  const updateETA = async (id: string, estimated_completion: string) => {
    const token = getToken();
    try {
      const dateObj = new Date(estimated_completion);
      const formattedDate = format(dateObj, 'dd MMM yyyy, h:mm a');
      await fetch(`/api/jobs/${id}/eta`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estimated_completion: formattedDate })
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  // Theme and Language state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('dashboard_theme') as 'light' | 'dark') || 'dark');
  const [language, setLanguage] = useState<'ms' | 'en'>(() => (localStorage.getItem('dashboard_lang') as 'ms' | 'en') || 'ms');

  const t = UI_TRANSLATIONS[language] as any;
  const statusNames = STATUS_NAMES[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % 30);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const getDefaultETA = () => {
    const now = new Date();
    const eta = addHours(now, 2);
    const offset = eta.getTimezoneOffset() * 60000;
    return new Date(eta.getTime() - offset).toISOString().slice(0, 16);
  };

  const [newJob, setNewJob] = useState({
    plate_number: '',
    car_model: '',
    service_type: t.serviceOptions[0],
    estimated_completion: getDefaultETA()
  });

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewJob(false);
        setSelectedJobForQR(null);
        setJobToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showNewJob) {
      setTimeout(() => plateInputRef.current?.focus(), 100);
      setNewJob({ 
        plate_number: '', 
        car_model: '', 
        service_type: t.serviceOptions[0], 
        estimated_completion: getDefaultETA() 
      });
    }
  }, [showNewJob]);

  const fetchJobs = async () => {
    const token = getToken();
    if (!token) return navigate('/login');

    try {
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setJobs(await res.json());
      } else if (res.status === 401) {
        navigate('/login');
      }
    } catch (err) {
      console.warn('Dashboard: Ralat rangkaian, cuba lagi...', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const token = getToken();
    try {
      const dateObj = new Date(newJob.estimated_completion);
      const formattedDate = format(dateObj, 'dd MMM yyyy, h:mm a');

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...newJob, 
          car_model: toTitleCase(newJob.car_model),
          estimated_completion: formattedDate 
        })
      });
      if (res.ok) {
        const createdJob = await res.json();
        setShowNewJob(false);
        setNewJob({ plate_number: '', car_model: '', service_type: '', estimated_completion: getDefaultETA() });
        fetchJobs();
        // Automatically show QR for the new job
        setSelectedJobForQR(createdJob);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: number) => {
    if (status >= statusNames.length) return;
    const token = getToken();
    try {
      await fetch(`/api/jobs/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;
    const token = getToken();
    try {
      await fetch(`/api/jobs/${jobToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobToDelete(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllJobs = async () => {
    const token = getToken();
    try {
      await fetch('/api/jobs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDeleteAllConfirm(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={clsx(
      "min-h-screen font-sans transition-colors duration-500",
      theme === 'dark' ? "bg-[#050403] text-[#f4f7fa]" : "bg-[#f4f7fa] text-[#050403]"
    )}>
      <header className={clsx(
        "border-b sticky top-0 z-10 transition-colors duration-500",
        theme === 'dark' ? "bg-[#050403] border-[#b69951]/20" : "bg-white border-[#b69951]/20"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="h-8" />
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
          <div className="flex items-center gap-4">
            <div className="flex gap-2 mr-2">
              <button 
                onClick={() => {
                  const nextLang = language === 'ms' ? 'en' : 'ms';
                  setLanguage(nextLang);
                  localStorage.setItem('dashboard_lang', nextLang);
                }}
                className={clsx(
                  "p-2 rounded-xl border transition-colors",
                  theme === 'dark' ? "bg-[#121212] border-[#b69951]/20 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
                )}
                title={t.chooseLanguage}
              >
                <Globe className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(nextTheme);
                  localStorage.setItem('dashboard_theme', nextTheme);
                }}
                className={clsx(
                  "p-2 rounded-xl border transition-colors",
                  theme === 'dark' ? "bg-[#121212] border-[#b69951]/20 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
                )}
                title={t.chooseTheme}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-[#b69951] flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className={clsx(
              "text-3xl font-black tracking-tight mb-2",
              theme === 'dark' ? "text-white" : "text-zinc-900"
            )}>{t.activeJobs}</h2>
            <p className="text-zinc-500 text-sm font-medium">{t.manageJobs}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  "w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#b69951] outline-none transition-all",
                  theme === 'dark' ? "bg-[#121212] border-[#b69951]/20 text-white" : "bg-white border-zinc-200 text-zinc-900"
                )}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                {t.deleteAll}
              </button>
              
              <button
                onClick={() => setShowNewJob(true)}
                className="bg-gradient-to-r from-[#b69951] to-[#8a733d] text-black px-5 py-2.5 rounded-xl font-bold hover:from-[#c7a95e] hover:to-[#b69951] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(182,153,81,0.3)]"
              >
                <Plus className="w-5 h-5" />
                {t.newJob}
              </button>
            </div>
          </div>
        </div>

        {showNewJob && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div className={clsx(
              "border border-[#b69951]/20 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 max-h-[90vh] overflow-y-auto",
              theme === 'dark' ? "bg-[#121212]" : "bg-white"
            )}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={clsx(
                  "text-3xl font-black tracking-tight",
                  theme === 'dark' ? "text-white" : "text-zinc-900"
                )}>{t.newEntry}</h3>
                <button onClick={() => setShowNewJob(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleCreateJob} className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{t.plateNumber}</label>
                    <input
                      ref={plateInputRef}
                      type="text"
                      required
                      value={newJob.plate_number}
                      onChange={e => setNewJob({ ...newJob, plate_number: e.target.value.toUpperCase() })}
                      className={clsx(
                        "w-full px-6 py-4 border rounded-2xl font-mono text-2xl font-black focus:ring-4 focus:ring-[#b69951]/20 focus:border-[#b69951] outline-none uppercase transition-all",
                        theme === 'dark' ? "bg-[#050403] border-zinc-800 text-white placeholder:text-zinc-800" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-300"
                      )}
                      placeholder="ABC 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{t.carModel}</label>
                    <input
                      type="text"
                      required
                      value={newJob.car_model}
                      onChange={e => setNewJob({ ...newJob, car_model: e.target.value })}
                      onBlur={e => setNewJob({ ...newJob, car_model: toTitleCase(e.target.value) })}
                      className={clsx(
                        "w-full px-6 py-4 border rounded-2xl font-bold focus:ring-4 focus:ring-[#b69951]/20 focus:border-[#b69951] outline-none transition-all mb-4",
                        theme === 'dark' ? "bg-[#050403] border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                      placeholder="Cth: Toyota Vios"
                    />
                    <div className="flex flex-wrap gap-2">
                      {(t.carBrands as string[]).map(brand => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setNewJob({ ...newJob, car_model: brand + ' ' })}
                          className={clsx(
                            "px-4 py-2 border rounded-xl text-xs font-bold transition-all",
                            theme === 'dark' ? "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-[#b69951] hover:border-[#b69951]/50" : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-[#b69951] hover:border-[#b69951]/50"
                          )}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{t.serviceType}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(t.serviceOptions as string[]).map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setNewJob({ ...newJob, service_type: option })}
                          className={`px-4 py-3 rounded-xl text-xs font-black transition-all border ${
                            newJob.service_type === option
                              ? 'bg-[#b69951] border-[#b69951] text-black shadow-[0_0_15px_rgba(182,153,81,0.3)]'
                              : theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:border-zinc-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">{t.estimatedCompletionLabel}</label>
                    <div className="space-y-4">
                      <input
                        type="datetime-local"
                        required
                        value={newJob.estimated_completion}
                        onChange={e => setNewJob({ ...newJob, estimated_completion: e.target.value })}
                        className={clsx(
                          "w-full px-6 py-4 border rounded-2xl font-bold focus:ring-4 focus:ring-[#b69951]/20 focus:border-[#b69951] outline-none transition-all",
                          theme === 'dark' ? "bg-[#050403] border-zinc-800 text-white [color-scheme:dark]" : "bg-zinc-50 border-zinc-200 text-zinc-900 [color-scheme:light]"
                        )}
                      />
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: '+1 Jam', value: 1 },
                          { label: '+3 Jam', value: 3 },
                          { label: '+5 Jam', value: 5 },
                          { label: 'Esok', value: 24 },
                          { label: '+3 Hari', value: 72 },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              const now = new Date();
                              now.setHours(now.getHours() + opt.value);
                              const offset = now.getTimezoneOffset() * 60000;
                              const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
                              setNewJob({ ...newJob, estimated_completion: localISOTime });
                            }}
                            className={clsx(
                              "px-4 py-2 border rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                              theme === 'dark' ? "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-[#b69951] hover:border-[#b69951]/50" : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-[#b69951] hover:border-[#b69951]/50"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-[#b69951] to-[#8a733d] text-black rounded-2xl font-black text-lg hover:from-[#c7a95e] hover:to-[#b69951] transition-all shadow-[0_0_30px_rgba(182,153,81,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t.processing : t.createJob}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {jobToDelete && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className={clsx(
              "border border-zinc-800/80 rounded-3xl shadow-2xl max-sm w-full p-8 text-center",
              theme === 'dark' ? "bg-[#121212]" : "bg-white"
            )}>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={clsx(
                "text-2xl font-black mb-3 tracking-tight",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>{t.deleteJobTitle}</h3>
              <p className="text-zinc-400 mb-8 font-medium">{t.deleteJobConfirm}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setJobToDelete(null)}
                  className={clsx(
                    "flex-1 px-4 py-3 border rounded-xl font-bold transition-colors",
                    theme === 'dark' ? "border-zinc-800 text-zinc-400 hover:bg-zinc-900" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={deleteJob}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className={clsx(
              "border border-zinc-800/80 rounded-3xl shadow-2xl max-sm w-full p-8 text-center",
              theme === 'dark' ? "bg-[#121212]" : "bg-white"
            )}>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={clsx(
                "text-2xl font-black mb-3 tracking-tight",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>{t.deleteAll}</h3>
              <p className="text-zinc-400 mb-8 font-medium">{t.deleteAllConfirm}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className={clsx(
                    "flex-1 px-4 py-3 border rounded-xl font-bold transition-colors",
                    theme === 'dark' ? "border-zinc-800 text-zinc-400 hover:bg-zinc-900" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={deleteAllJobs}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedJobForQR && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setSelectedJobForQR(null)}>
            <div className={clsx(
              "border border-[#b69951]/20 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center",
              theme === 'dark' ? "bg-[#121212]" : "bg-white"
            )} onClick={e => e.stopPropagation()}>
              <h3 className={clsx(
                "text-2xl font-black mb-3 tracking-tight",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>{t.qrTracking}</h3>
              <p className="text-zinc-400 text-sm mb-8 font-medium">{t.scanToTrack} <span className="text-[#b69951] font-mono font-bold">{selectedJobForQR.plate_number}</span></p>
              
              <div className="flex justify-center mb-8 p-4 bg-white rounded-2xl shadow-lg inline-block">
                <QRCodeSVG
                  value={`${window.location.origin}/track/${selectedJobForQR.id}`}
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`/track/${selectedJobForQR.id}`, '_blank')}
                  className={clsx(
                    "flex-1 px-4 py-3 border rounded-xl font-bold transition-colors",
                    theme === 'dark' ? "border-zinc-800 text-zinc-400 hover:bg-zinc-900" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  {t.openLink}
                </button>
                <button
                  onClick={() => setSelectedJobForQR(null)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#b69951] to-[#8a733d] text-black rounded-xl font-bold hover:from-[#c7a95e] hover:to-[#b69951] transition-all shadow-[0_0_15px_rgba(182,153,81,0.3)]"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs
            .filter(job => 
              job.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
              job.car_model.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(job => {
              const isDone = job.status === statusNames.length - 1;
              
              return (
                <div 
                  key={job.id} 
                  className={clsx(
                    "rounded-3xl shadow-xl border flex flex-col transition-all duration-500 relative",
                    theme === 'dark' ? "bg-[#121212]" : "bg-white",
                    isDone 
                      ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                      : theme === 'dark' ? 'border-[#b69951]/10 hover:border-[#b69951]/30' : 'border-zinc-100 hover:border-[#b69951]/30'
                  )}
                >
                  {isDone && (
                    <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-1 rounded-full font-black text-[10px] tracking-[0.3em] uppercase z-20 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      {t.done}
                    </div>
                  )}
                  <div className={clsx(
                    "p-6 border-b flex justify-between items-start rounded-t-3xl",
                    isDone 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : theme === 'dark' ? 'bg-[#050403]/40 border-zinc-800/80' : 'bg-zinc-50/50 border-zinc-100'
                  )}>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Car className={`w-5 h-5 ${isDone ? 'text-emerald-500' : 'text-[#b69951]'}`} />
                        <span className={clsx(
                          "font-mono font-black text-2xl tracking-tight",
                          theme === 'dark' ? "text-white" : "text-zinc-900"
                        )}>{job.plate_number}</span>
                      </div>
                      <p className="text-zinc-400 font-semibold">{job.car_model}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedJobForQR(job)}
                        className={clsx(
                          "p-2.5 rounded-xl transition-colors",
                          isDone 
                            ? 'text-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/10' 
                            : 'text-zinc-500 hover:text-[#b69951] hover:bg-[#b69951]/10'
                        )}
                        title={t.qrTracking}
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setJobToDelete(job.id)}
                        className="p-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        title={t.deleteJobTitle}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1">
                    <div className="mb-5">
                      <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">{t.serviceType}</p>
                      <p className={clsx(
                        "font-bold",
                        theme === 'dark' ? "text-zinc-200" : "text-zinc-700"
                      )}>{job.service_type}</p>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">{t.estimatedCompletionLabel}</p>
                        {!isDone && (
                          <button 
                            onClick={() => {
                              setEditingJobETA(job.id);
                              setNewETA('');
                            }}
                            className="text-[10px] font-black text-[#b69951] hover:text-[#c7a95e]"
                          >
                            {t.edit}
                          </button>
                        )}
                      </div>
                      {editingJobETA === job.id ? (
                        <div className="flex gap-2">
                          <input
                            type="datetime-local"
                            value={newETA}
                            onChange={(e) => setNewETA(e.target.value)}
                            className={clsx(
                              "w-full px-2 py-1 border rounded-lg font-bold text-sm",
                              theme === 'dark' ? "bg-[#050403] border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                            )}
                          />
                          <button
                            onClick={() => {
                              updateETA(job.id, newETA);
                              setEditingJobETA(null);
                            }}
                            className="bg-[#b69951] text-black px-3 py-1 rounded-lg font-bold text-xs"
                          >
                            {t.save}
                          </button>
                        </div>
                      ) : (
                        <div className={clsx(
                          "flex items-center gap-2 font-bold",
                          theme === 'dark' ? "text-zinc-200" : "text-zinc-700"
                        )}>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#b69951]" />
                          )}
                          {job.estimated_completion}
                        </div>
                      )}
                    </div>

                    <div>
                      {!isDone && (
                        <>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">{t.liveStatus}</p>
                            <button
                              onClick={() => updateStatus(job.id, job.status + 1)}
                              className="text-[10px] font-black text-[#b69951] hover:text-[#c7a95e] flex items-center gap-1 bg-[#b69951]/10 px-2 py-1 rounded-lg transition-all"
                            >
                              {t.nextStep}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                          <div className="h-4 mb-3 overflow-hidden">
                            <AnimatePresence mode="wait">
                              <motion.p 
                                key={phraseIndex}
                                initial={{ opacity: 0, x: 5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -5 }}
                                transition={{ duration: 0.3 }}
                                className="text-[10px] font-bold text-[#b69951]/60 italic truncate"
                              >
                                {STATUS_LIVE_PHRASES[language][job.status] 
                                  ? STATUS_LIVE_PHRASES[language][job.status][phraseIndex % STATUS_LIVE_PHRASES[language][job.status].length]
                                  : 'Sedang diproses...'}
                              </motion.p>
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                      {isDone && (
                        <div className="mb-4">
                          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Status</p>
                          <p className="text-[10px] font-bold text-emerald-500 italic">
                            {STATUS_SUBTITLES[language][6]}
                          </p>
                        </div>
                      )}
                      <div className="space-y-2.5">
                        {statusNames.map((status, idx) => {
                          const isCurrent = job.status === idx;
                          const isCompleted = job.status > idx;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => updateStatus(job.id, idx)}
                              disabled={isCurrent}
                              className={clsx(
                                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                                isCurrent
                                  ? isDone 
                                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                    : 'bg-gradient-to-r from-[#b69951] to-[#8a733d] text-black shadow-[0_0_15px_rgba(182,153,81,0.2)]'
                                  : isCompleted
                                  ? isDone ? 'bg-emerald-500/10 text-emerald-500/40' : 'bg-zinc-800/30 text-zinc-500 hover:bg-zinc-800/50'
                                  : theme === 'dark' ? 'bg-[#0a0a0a] border border-zinc-800/80 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300' : 'bg-zinc-50 border border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600'
                              )}
                            >
                              {status}
                              {job.status >= idx && (
                                <CheckCircle2 className={`w-4 h-4 ${
                                  isCurrent ? 'text-black' : isDone ? 'text-emerald-500' : 'text-[#b69951]'
                                }`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={clsx(
                    "p-4 border-t text-[11px] text-center font-bold tracking-wider uppercase rounded-b-3xl",
                    isDone 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500/40' 
                      : theme === 'dark' ? 'bg-[#050403]/60 border-zinc-800/80 text-zinc-600' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400'
                  )}>
                    {t.created}: {format(new Date(job.created_at), 'MMM d, h:mm a')}
                  </div>
                </div>
              );
            })}
          
          {jobs.length === 0 && (
            <div className={clsx(
              "col-span-full py-32 text-center border-2 border-dashed rounded-3xl transition-colors",
              theme === 'dark' ? "border-zinc-800 bg-[#121212]/50" : "border-zinc-200 bg-white"
            )}>
              <div className={clsx(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border transition-colors",
                theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-100"
              )}>
                <Car className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className={clsx(
                "text-2xl font-black mb-3 tracking-tight",
                theme === 'dark' ? "text-white" : "text-zinc-900"
              )}>{t.noActiveJobs}</h3>
              <p className="text-zinc-500 mb-8 font-medium">{t.createFirstJob}</p>
              <button
                onClick={() => setShowNewJob(true)}
                className="bg-gradient-to-r from-[#b69951] to-[#8a733d] text-black px-6 py-3.5 rounded-xl font-bold hover:from-[#c7a95e] hover:to-[#b69951] transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(182,153,81,0.3)]"
              >
                <Plus className="w-5 h-5" />
                {t.newJob}
              </button>
            </div>
          )}
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
