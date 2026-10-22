import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Send,
  HeartHandshake,
  ShieldAlert,
  Home,
  MessageSquare,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { LayananType } from '../types';

interface DashboardViewProps {
  onOpenModalInputJurnal: (prefillType?: LayananType, prefillSiswaId?: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenPrint: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenModalInputJurnal,
  onNavigateTab,
  onOpenPrint
}) => {
  const {
    currentGuruWali,
    siswaList,
    jurnalList,
    presensiList,
    rujukanBKList,
    jadwalList,
    konsultasiList
  } = useApp();

  const [attendanceRange, setAttendanceRange] = useState<'all' | 'class'>('class');

  // Filter siswa kelas yang diampu guru wali aktif
  const kelasSiswa = siswaList.filter(s => s.kelas === currentGuruWali.kelas);
  const targetSiswaList = attendanceRange === 'class' ? kelasSiswa : siswaList;

  // Filter data jurnal
  const classJurnal = jurnalList.filter(j => j.kelas === currentGuruWali.kelas);
  
  // Statistik 4 Layanan
  const bimbinganCount = classJurnal.filter(j => j.jenisLayanan === 'bimbingan').length;
  const pembinaanCount = classJurnal.filter(j => j.jenisLayanan === 'pembinaan').length;
  const monitoringCount = classJurnal.filter(j => j.jenisLayanan === 'monitoring').length;
  const konsultasiCount = classJurnal.filter(j => j.jenisLayanan === 'konsultasi').length;

  // Siswa status pendampingan
  const siswaPerhatianKhusus = targetSiswaList.filter(s => s.statusPendampingan === 'Perhatian Khusus' || s.statusPendampingan === 'Dalam Penanganan BK');
  const siswaBerprestasi = targetSiswaList.filter(s => s.statusPendampingan === 'Siswa Berprestasi');
  
  // Rata-rata nilai kelas
  const avgNilai = kelasSiswa.length > 0 
    ? (kelasSiswa.reduce((acc, curr) => acc + curr.nilaiRataRata, 0) / kelasSiswa.length).toFixed(1)
    : '0';

  // Rata-rata poin karakter
  const avgKarakter = kelasSiswa.length > 0
    ? Math.round(kelasSiswa.reduce((acc, curr) => acc + curr.poinKarakter, 0) / kelasSiswa.length)
    : 0;

  // Hitung statistik presensi
  const relevantPresensi = presensiList.filter(p => attendanceRange === 'class' ? p.kelas === currentGuruWali.kelas : true);
  const totalPresensiCount = relevantPresensi.length || 1;
  const countHadir = relevantPresensi.filter(p => p.status === 'H').length;
  const countSakit = relevantPresensi.filter(p => p.status === 'S').length;
  const countIzin = relevantPresensi.filter(p => p.status === 'I').length;
  const countAlpa = relevantPresensi.filter(p => p.status === 'A').length;

  const pctHadir = Math.round((countHadir / totalPresensiCount) * 100) || 0;
  const pctSakit = Math.round((countSakit / totalPresensiCount) * 100) || 0;
  const pctIzin = Math.round((countIzin / totalPresensiCount) * 100) || 0;
  const pctAlpa = Math.round((countAlpa / totalPresensiCount) * 100) || 0;

  // Grouping presensi per tanggal untuk grafik harian
  const uniqueDates = Array.from(new Set(relevantPresensi.map(p => p.tanggal))).sort().slice(-5);
  const dailyStats = uniqueDates.map(date => {
    const dayRecords = relevantPresensi.filter(p => p.tanggal === date);
    const h = dayRecords.filter(p => p.status === 'H').length;
    const s = dayRecords.filter(p => p.status === 'S').length;
    const i = dayRecords.filter(p => p.status === 'I').length;
    const a = dayRecords.filter(p => p.status === 'A').length;
    const total = dayRecords.length || 1;
    return {
      date,
      h, s, i, a, total,
      rate: Math.round((h / total) * 100)
    };
  });

  // Notifikasi penting & progress alerts
  const pendingConsultations = konsultasiList.filter(k => k.status === 'Menunggu Respon');
  const activeReferrals = rujukanBKList.filter(r => r.kelas === currentGuruWali.kelas && r.status !== 'Selesai');
  const upcomingMeetings = jadwalList.filter(j => j.status === 'Terjadwal');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner & Overview */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-full text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guru Wali SMKN 1 Jember</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Selamat Bertugas, {currentGuruWali.nama}, {currentGuruWali.gelar}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Wali Kelas <span className="font-bold text-white underline decoration-amber-400 underline-offset-4">{currentGuruWali.kelas}</span> ({currentGuruWali.jurusan}) — Mengawal pembinaan karakter, kedisiplinan, akademik, serta koordinasi proaktif dengan wali murid.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={() => onOpenModalInputJurnal()}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Jurnal Layanan</span>
            </button>
            <button
              onClick={() => onNavigateTab('presensi')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Presensi Cepat</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Siswa Bimbingan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kelasSiswa.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">Siswa</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Terdaftar di Kelas</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rerata Kehadiran</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{pctHadir}%</span>
            <span className="text-xs text-emerald-600 font-bold ml-1.5">Disiplin</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total {countHadir} presensi hadir tercatat
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Perhatian Khusus</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{siswaPerhatianKhusus.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">Siswa</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium truncate">
            {siswaPerhatianKhusus.length > 0 ? 'Perlu pendampingan intensif' : 'Semua siswa aman'}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rerata Akademik & Etika</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{avgNilai}</span>
            <span className="text-xs text-slate-400 ml-1">/ 100</span>
          </div>
          <div className="mt-2 text-xs text-indigo-700 font-medium">
            Poin Karakter: <span className="font-bold">{avgKarakter} / 100</span>
          </div>
        </div>

      </div>

      {/* 4 Layanan Guru Wali Card Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Rekapitulasi 4 Layanan Utama Guru Wali</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tercatat total {classJurnal.length} kegiatan layanan pada kelas {currentGuruWali.kelas} yang dapat diakses transparan oleh wali murid.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('layanan')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Seluruh Jurnal Layanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          
          {/* 1. Layanan Bimbingan */}
          <div
            onClick={() => onOpenModalInputJurnal('bimbingan')}
            className="group p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                Layanan 1
              </span>
              <span className="text-xl font-black text-blue-800">{bimbinganCount}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-blue-700 transition-colors">
              Layanan Bimbingan
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Akademik, minat karir, pemilihan konsentrasi keahlian, dan motivasi belajar.
            </p>
            <div className="mt-3 pt-2 border-t border-blue-100/60 flex items-center justify-between text-[11px] text-blue-700 font-semibold">
              <span>+ Input Catatan</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Layanan Pembinaan */}
          <div
            onClick={() => onOpenModalInputJurnal('pembinaan')}
            className="group p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                Layanan 2
              </span>
              <span className="text-xl font-black text-amber-800">{pembinaanCount}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-amber-800 transition-colors">
              Layanan Pembinaan
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Kedisiplinan tata tertib, etika, dan penanaman Profil Pelajar Pancasila.
            </p>
            <div className="mt-3 pt-2 border-t border-amber-100/60 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
              <span>+ Input Catatan</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Layanan Monitoring */}
          <div
            onClick={() => onOpenModalInputJurnal('monitoring')}
            className="group p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Layanan 3
              </span>
              <span className="text-xl font-black text-emerald-800">{monitoringCount}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-emerald-800 transition-colors">
              Layanan Monitoring
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Kehadiran harian, ketercapaian tugas produktif guru mapel, dan kesiapan PKL.
            </p>
            <div className="mt-3 pt-2 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
              <span>+ Input Catatan</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Layanan Konsultasi */}
          <div
            onClick={() => onOpenModalInputJurnal('konsultasi')}
            className="group p-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-white hover:border-purple-400 hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-full">
                Layanan 4
              </span>
              <span className="text-xl font-black text-purple-800">{konsultasiCount}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-purple-800 transition-colors">
              Layanan Konsultasi
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-snug">
              Temu wali murid di sekolah, Home Visit ke rumah siswa, dan mediasi masalah.
            </p>
            <div className="mt-3 pt-2 border-t border-purple-100/60 flex items-center justify-between text-[11px] text-purple-800 font-semibold">
              <span>+ Input Catatan</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Grafik Absensi Interaktif & Notifikasi Progres */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Attendance Chart & Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Grafik Rekapitulasi Presensi Siswa</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi dinamika kehadiran harian & persentase kedisiplinan
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setAttendanceRange('class')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  attendanceRange === 'class'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas {currentGuruWali.kelas}
              </button>
              <button
                onClick={() => setAttendanceRange('all')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  attendanceRange === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Siswa
              </button>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-[11px] font-bold text-emerald-800 block">Hadir (H)</span>
              <span className="text-lg font-black text-emerald-700">{countHadir}</span>
              <span className="text-[10px] text-emerald-600 block">({pctHadir}%)</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              <span className="text-[11px] font-bold text-amber-800 block">Sakit (S)</span>
              <span className="text-lg font-black text-amber-700">{countSakit}</span>
              <span className="text-[10px] text-amber-600 block">({pctSakit}%)</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
              <span className="text-[11px] font-bold text-blue-800 block">Izin (I)</span>
              <span className="text-lg font-black text-blue-700">{countIzin}</span>
              <span className="text-[10px] text-blue-600 block">({pctIzin}%)</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              <span className="text-[11px] font-bold text-rose-800 block">Alpa (A)</span>
              <span className="text-lg font-black text-rose-700">{countAlpa}</span>
              <span className="text-[10px] text-rose-600 block">({pctAlpa}%)</span>
            </div>
          </div>

          {/* Visual Daily Attendance Bar Chart */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Tren Kehadiran 5 Hari Efektif Terakhir</span>
              <span className="text-[11px] text-slate-400 font-normal">Target Kedisiplinan: 95%</span>
            </h4>

            <div className="space-y-3.5">
              {dailyStats.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.date}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-700 font-bold">{item.h} Hadir</span>
                      {item.s > 0 && <span className="text-amber-700">{item.s} Sakit</span>}
                      {item.i > 0 && <span className="text-blue-700">{item.i} Izin</span>}
                      {item.a > 0 && <span className="text-rose-700 font-bold">{item.a} Alpa</span>}
                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.rate}%
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(item.h / item.total) * 100}%` }}
                      className="bg-emerald-500 hover:bg-emerald-600 transition-all"
                      title={`Hadir: ${item.h}`}
                    ></div>
                    <div
                      style={{ width: `${(item.s / item.total) * 100}%` }}
                      className="bg-amber-400 hover:bg-amber-500 transition-all"
                      title={`Sakit: ${item.s}`}
                    ></div>
                    <div
                      style={{ width: `${(item.i / item.total) * 100}%` }}
                      className="bg-blue-400 hover:bg-blue-500 transition-all"
                      title={`Izin: ${item.i}`}
                    ></div>
                    <div
                      style={{ width: `${(item.a / item.total) * 100}%` }}
                      className="bg-rose-500 hover:bg-rose-600 transition-all"
                      title={`Alpa: ${item.a}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
            <span className="text-slate-500">
              Presensi tercatat secara harian dan transparan di portal wali murid.
            </span>
            <button
              onClick={() => onNavigateTab('presensi')}
              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Input Presensi Hari Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Notifikasi Progres & Agenda Interaktif */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Progress Notifications Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Notifikasi & Tindak Lanjut Siswa</span>
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {siswaPerhatianKhusus.length + pendingConsultations.length} Butuh Atensi
              </span>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              
              {/* Alert: Siswa dengan Alpa atau Perhatian Khusus */}
              {siswaPerhatianKhusus.map(siswa => (
                <div
                  key={siswa.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors flex items-start gap-2.5 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{siswa.nama}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900">
                        {siswa.statusPendampingan}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-2">
                      {siswa.catatanKhusus || 'Membutuhkan observasi perilaku & motivasi belajar.'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => onOpenModalInputJurnal('pembinaan', siswa.id)}
                        className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        + Bimbing Siswa
                      </button>
                      <span className="text-slate-300">•</span>
                      <a
                        href={`https://wa.me/62${siswa.noHpOrtu.replace(/^0/, '')}?text=${encodeURIComponent(`Selamat pagi Bapak/Ibu ${siswa.namaOrtu}, kami dari Guru Wali SMKN 1 Jember ingin mengonfirmasi perkembangan ananda ${siswa.nama}...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Hubungi Ortu
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Alert: Pesan Konsultasi Masuk dari Wali Murid */}
              {pendingConsultations.map(k => (
                <div
                  key={k.id}
                  className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors flex items-start gap-2.5 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">Pesan dari {k.namaOrtu}</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-900 font-semibold px-1.5 rounded">
                        Wali {k.siswaNama}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-1 italic">
                      "{k.topik}"
                    </p>
                    <button
                      onClick={() => onNavigateTab('konsultasi_masuk')}
                      className="mt-2 text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                    >
                      Buka & Balas Pesan &rarr;
                    </button>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Agenda Pertemuan & Home Visit Terdekat */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-purple-600" />
                <span>Agenda Temu Wali & Home Visit</span>
              </h3>
              <button
                onClick={() => onNavigateTab('jadwal')}
                className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingMeetings.slice(0, 2).map(j => (
                <div key={j.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{j.jenisPertemuan}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {j.tanggal} • {j.jam}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    Siswa: <span className="font-bold">{j.siswaNama}</span> ({j.orangTuaNama})
                  </p>
                  <p className="text-slate-500 text-[11px] line-clamp-1">
                    Lokasi: {j.tempat} — Agenda: {j.agenda}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Recent Jurnal Feed for Class */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Catatan Jurnal Layanan Terkini (Kelas {currentGuruWali.kelas})
            </h3>
            <p className="text-xs text-slate-500">
              Dokumentasi pendampingan terintegrasi dan terpantau secara langsung oleh wali murid
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('layanan')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {classJurnal.slice(0, 3).map(j => (
            <div key={j.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    j.jenisLayanan === 'bimbingan' ? 'bg-blue-100 text-blue-800' :
                    j.jenisLayanan === 'pembinaan' ? 'bg-amber-100 text-amber-800' :
                    j.jenisLayanan === 'monitoring' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    Layanan {j.jenisLayanan}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{j.siswaNama}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {j.tanggal} ({j.jam} WIB)
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {j.topik}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {j.uraian}
                </p>
                {j.tanggapanOrtu && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-900 flex items-start gap-1.5 mt-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Respon Orang Tua:</span> {j.tanggapanOrtu}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  j.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                  j.status === 'Dirujuk ke BK' ? 'bg-rose-100 text-rose-800' :
                  j.status === 'Perlu Home Visit' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {j.status}
                </span>
                <span className="text-[10px] text-slate-400">
                  {j.visibleToParent ? '✓ Tayang di Portal Ortu' : 'Internal'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
