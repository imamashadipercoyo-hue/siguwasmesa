import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Database,
  School,
  Sparkles,
  Shield,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    // Instant verification for maximum speed and responsiveness
    const result = login(username, password);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.message || 'Login gagal. Periksa kembali username dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex flex-col justify-between text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      {/* Top Banner Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
              <img src="https://iili.io/nkO9grN.md.png" alt="SMKN 1 Jember" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide text-white">SMK NEGERI 1 JEMBER</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Jl. Jambu No.17 Patrang - Jember (68118), Jawa Timur
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px]">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Google Sheets Live Sync</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & Overview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Masuk Sistem Informasi Terpadu</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                SIGUWA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">SMKN 1 Jember</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                Sistem Informasi Terpadu Guru Wali & Pendampingan Karakter Murid Berbasis Web Based Online.
              </p>
            </div>

            {/* School Profile Pill Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Akses Multi-Peran Terlindungi</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Mendukung Administrator, Guru Wali Kelas, Koordinator BK, serta Portal Terpadu Orang Tua Siswa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
              
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Masuk ke Akun
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Masukkan Username / NISN dan Password terdaftar Anda
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>

              {/* Error Message Banner */}
              {errorMessage && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                
                {/* Username / NISN */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nama Pengguna (Username) atau NISN Siswa <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: admin.siguwa atau 0094201436"
                      className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Kata Sandi (Password) <span className="text-rose-400">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                      title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Options */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Ingat sesi masuk saya</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Sistem Otentikasi SMKN 1
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke SIGUWA SMKN 1 Jember</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </main>

      {/* Footer SMKN 1 Jember */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-slate-400" />
            <span>SMK Negeri 1 Jember - Bidang Keahlian Bisnis Manajemen & Teknologi Kreatif</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Telp: (0331) 487535</span>
            <span>•</span>
            <span>Email: info@smkn1jember.sch.id</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} SIGUWA SMKN 1 Jember</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
