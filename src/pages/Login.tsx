import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (rememberMe) {
          localStorage.setItem('token', data.token);
        } else {
          sessionStorage.setItem('token', data.token);
        }
        navigate('/dashboard');
      } else {
        setError('Log masuk tidak sah');
      }
    } catch (err) {
      setError('Ralat berlaku');
    }
  };

  return (
    <div className="min-h-screen bg-[#050403] flex items-center justify-center p-4 font-sans selection:bg-[#b69951]/30">
      <div className="max-w-md w-full bg-[#121212] rounded-[2.5rem] shadow-2xl border border-[#b69951]/10 p-10 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b69951]/5 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-10">
          <div className="relative">
            <img src="/brand-iridium.webp" alt="Iridium" className="h-12 object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <div className="hidden flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#b69951] to-[#8a733d] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(182,153,81,0.3)]">
                <Wrench className="w-7 h-7 text-black" />
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tight uppercase">
          Log Masuk
        </h1>
        <p className="text-zinc-500 text-center text-sm font-bold tracking-widest uppercase mb-10">Penasihat Servis</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">
              Nama Pengguna
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-[#050403] border border-zinc-800 rounded-2xl text-white font-medium focus:ring-2 focus:ring-[#b69951] focus:border-transparent outline-none transition-all placeholder:text-zinc-700"
              placeholder="Masukkan nama pengguna"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">
              Kata Laluan
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-[#050403] border border-zinc-800 rounded-2xl text-white font-medium focus:ring-2 focus:ring-[#b69951] focus:border-transparent outline-none transition-all placeholder:text-zinc-700"
              placeholder="Masukkan kata laluan"
              required
            />
          </div>
          
          <div className="flex items-center ml-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-5 w-5 rounded-lg border-zinc-800 bg-[#0a0a0a] text-[#b69951] focus:ring-[#b69951] focus:ring-offset-[#121212] transition-all cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm text-zinc-400 font-bold cursor-pointer hover:text-zinc-300 transition-colors">
              Kekal log masuk
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#b69951] to-[#8a733d] text-black py-4 rounded-2xl font-black text-lg uppercase tracking-tight hover:from-[#c7a95e] hover:to-[#b69951] transition-all mt-4 shadow-[0_0_20px_rgba(182,153,81,0.3)] active:scale-[0.98]"
          >
            Log Masuk
          </button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Iridium Workshop Management System v1.0</p>
        </div>
      </div>
    </div>
  );
}
