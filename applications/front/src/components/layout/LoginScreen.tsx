import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex items-center justify-center p-6 overflow-hidden">
      {/* Subtle Texture/Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"></div>

      <div className="max-w-md w-full space-y-12 animate-in zoom-in-95 duration-1000 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-block p-1 bg-gradient-to-br from-primary/40 to-transparent rounded-sm mb-6 shadow-2xl">
            <div className="bg-surface p-4 rounded-sm">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain brightness-90 grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">Dog Magic</h1>
          <p className="text-secondary font-bold uppercase tracking-[0.4em] text-[10px] opacity-60 italic">Strategic_Assets_Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-px bg-border border border-border shadow-2xl">
            <div className="relative">
              <input 
                type="email" 
                placeholder="User_Email_Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface p-5 focus:outline-none focus:bg-black transition-all text-sm font-medium text-white placeholder:text-slate-700 uppercase tracking-widest" 
              />
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="Access_Key" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface p-5 focus:outline-none focus:bg-black transition-all text-sm font-medium text-white placeholder:text-slate-700 uppercase tracking-widest border-t border-white/5" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !email || !password}
            className="w-full bg-primary text-black font-black py-5 rounded-sm shadow-[0_0_30px_rgba(197,160,89,0.15)] hover:bg-white transition-all disabled:opacity-30 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] mt-8"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                Validating_Link...
              </>
            ) : 'Initiate_Session'}
          </button>
        </form>

        <div className="text-center">
          <button className="text-[9px] font-black text-slate-700 hover:text-primary transition-all uppercase tracking-widest underline underline-offset-8 decoration-white/5">
            Request_Vault_Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
