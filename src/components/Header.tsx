import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Printer,
  RotateCcw,
  Building2,
  ChevronDown,
  UserCheck,
  Shield
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenPrint: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPrint, activeTab, setActiveTab }) => {
  const {
    currentRole,
    setCurrentRole,
    currentGuruWali,
    setCurrentGuruWali,
    guruWaliList,
    selectedSiswaForPortal,
    resetToDefaultData,
    konsultasiList,
    rujukanBKList
  } = useApp();

  const pendingKonsultasi = konsultasiList.filter(k => k.status === 'Menunggu Respon').length;
  const pendingBK = rujukanBKList.filter(r => r.status === 'Menunggu Verifikasi').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner info SMKN 1 Jember */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] tracking-wider">
              SMKN 1 JEMBER
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-slate-200 truncate">
              Jl. Jambu No.17 Patrang - Jember (68118), Jawa Timur
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sistem Aktif Real-time
            </span>
            <span>•</span>
            <button
              onClick={() => {
                if (window.confirm('Reset semua data aplikasi ke kondisi awal demo SMKN 1 Jember?')) {
                  resetToDefaultData();
                }
              }}
              title="Reset data demonstrasi"
              className="hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer text-slate-400"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo & Application Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-900/20 ring-2 ring-blue-600/30">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  SIGUWA <span className="text-blue-700">SMKN 1 Jember</span>
                </h1>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  v2.6
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Sistem Informasi Terpadu Guru Wali & Pendamping Karakter Peserta Didik
              </p>
            </div>
          </div>

          {/* Role selector & Global Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Switcher tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => setCurrentRole('guru_wali')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentRole === 'guru_wali'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Guru Wali</span>
              </button>

              <button
                onClick={() => setCurrentRole('wali_murid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentRole === 'wali_murid'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Portal Wali Murid</span>
                {selectedSiswaForPortal && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>

              <button
                onClick={() => setCurrentRole('manajemen_bk')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentRole === 'manajemen_bk'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>BK & Kesiswaan</span>
                {pendingBK > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {pendingBK}
                  </span>
                )}
              </button>
            </div>

            {/* Guru Wali Switcher dropdown (when in guru_wali role) */}
            {currentRole === 'guru_wali' && (
              <div className="relative inline-block">
                <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 hover:border-blue-300 rounded-xl px-2.5 py-1.5 text-xs">
                  <img
                    src={currentGuruWali.avatar}
                    alt={currentGuruWali.nama}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-400"
                  />
                  <div className="text-left">
                    <p className="font-bold text-slate-800 leading-tight">
                      {currentGuruWali.nama}, {currentGuruWali.gelar}
                    </p>
                    <p className="text-[10px] text-blue-700 font-medium">
                      Wali Kelas {currentGuruWali.kelas}
                    </p>
                  </div>
                  <select
                    value={currentGuruWali.id}
                    onChange={(e) => {
                      const found = guruWaliList.find(g => g.id === e.target.value);
                      if (found) setCurrentGuruWali(found);
                    }}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Ganti Akun Guru Wali"
                  >
                    {guruWaliList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama}, {g.gelar} ({g.kelas} - {g.jurusan})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Print Official Report button */}
            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Cetak Laporan</span>
            </button>
          </div>

        </div>

        {/* Sub-navigation tabs for Guru Wali & Manajemen */}
        {currentRole !== 'wali_murid' && currentRole !== 'admin' && (
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-3 border-t border-slate-100 mt-3 scrollbar-none text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📊 Ringkasan Dashboard
            </button>

            <button
              onClick={() => setActiveTab('layanan')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'layanan'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📘 4 Layanan Guru Wali
            </button>

            <button
              onClick={() => setActiveTab('presensi')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'presensi'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              📅 Presensi & Kehadiran
            </button>

            <button
              onClick={() => setActiveTab('siswa')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'siswa'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              👥 Data Siswa Bimbingan
            </button>

            <button
              onClick={() => setActiveTab('rujukan_bk')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rujukan_bk'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🤝 Kolaborasi BK & Kesiswaan</span>
              {pendingBK > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingBK}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('jadwal')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'jadwal'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              🏡 Home Visit & Agenda
            </button>

            <button
              onClick={() => setActiveTab('konsultasi_masuk')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'konsultasi_masuk'
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>💬 Pesan Wali Murid</span>
              {pendingKonsultasi > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingKonsultasi}
                </span>
              )}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
