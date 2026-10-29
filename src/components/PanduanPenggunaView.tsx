import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Search,
  Calendar,
  Phone,
  Printer,
  Database,
  Archive,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  FileSpreadsheet,
  Award,
  Layers,
  ChevronRight,
  Calculator,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PanduanPenggunaViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const PanduanPenggunaView: React.FC<PanduanPenggunaViewProps> = ({ onNavigateTab }) => {
  const { currentRole, currentGuruWali } = useApp();

  const [activeSection, setActiveSection] = useState<'siklus' | 'normal' | 'tutorial' | 'kalkulator' | 'faq'>('siklus');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Simulator State for Status Normal Calculation
  const [simHadir, setSimHadir] = useState<number>(95);
  const [simKarakter, setSimKarakter] = useState<number>(85);
  const [simNilai, setSimNilai] = useState<number>(80);
  const [simKasusBK, setSimKasusBK] = useState<boolean>(false);

  // Compute Simulated Status
  const getSimulatedStatus = () => {
    if (simKasusBK) {
      return {
        status: 'Dalam Penanganan BK',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        ringColor: 'ring-rose-500',
        desc: 'Siswa memiliki kasus aktif yang memerlukan pendampingan konseling intensif dari Guru BK.',
        recommendation: 'Lakukan tindak lanjut kolaboratif dengan Guru BK dan wali murid.'
      };
    }
    if (simKarakter >= 90 && simHadir >= 95 && simNilai >= 85) {
      return {
        status: 'Siswa Berprestasi',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        ringColor: 'ring-emerald-500',
        desc: 'Siswa menunjukkan kedisiplinan prima, karakter teladan, dan capaian akademik unggul.',
        recommendation: 'Berikan apresiasi sertifikat dan pertahankan motivasi belajar siswa.'
      };
    }
    if (simHadir < 85 || simKarakter < 75 || simNilai < 70) {
      return {
        status: 'Perhatian Khusus',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        ringColor: 'ring-amber-500',
        desc: 'Siswa mengalami penurunan kedisiplinan, absensi bermasalah, atau penurunan poin karakter.',
        recommendation: 'Guru Wali perlu melakukan layanan bimbingan individual atau pemanggilan orang tua.'
      };
    }
    return {
      status: 'Normal',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      ringColor: 'ring-blue-500',
      desc: 'Siswa berada dalam batas standar baku vokasi SMKN 1 Jember (disiplin, tugas tuntas, etika baik).',
      recommendation: 'Lakukan monitoring rutin dan pantau presensi harian secara konsisten.'
    };
  };

  const simResult = getSimulatedStatus();

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pusat Edukasi & Dokumentasi SIGUWA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Panduan Lengkap Pengguna & Metrik Karakter Siswa
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Pelajari alur operasional sistem, siklus pembentukan karakter vokasi, cara mengukur status <strong>Normal</strong>, serta simulasi interaktif status pendampingan di SMKN 1 Jember.
            </p>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <span>← Kembali ke Aplikasi</span>
            </button>
          )}
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10 mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection('siklus')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'siklus'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔄 Siklus Karakter
            </button>
            <button
              onClick={() => setActiveSection('normal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'normal'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🎯 Status Normal & Rumus
            </button>
            <button
              onClick={() => setActiveSection('kalkulator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'kalkulator'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🧮 Simulator Status Interaktif
            </button>
            <button
              onClick={() => setActiveSection('tutorial')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'tutorial'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📘 Tutorial Alur Aplikasi
            </button>
            <button
              onClick={() => setActiveSection('faq')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'faq'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              💡 Tanya Jawab (FAQ)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: SIKLUS NILAI & POIN KARAKTER */}
      {activeSection === 'siklus' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-1 border border-indigo-200">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Konsep Fondasi Karakter Vokasi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Siklus Nilai & Poin Karakter Peserta Didik
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                Pembinaan di SMK Negeri 1 Jember menitikberatkan pada kesiapan mental kerja industri (budaya 5R/5S, kedisiplinan, integritas, dan kerja tim). Poin karakter diukur pada rentang <strong>0 hingga 100</strong>.
              </p>
            </div>

            {/* 4 Pilar Siklus Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 relative">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                  1
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Titik Masuk (Baseline)</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Setiap siswa memulai dengan <strong>100 Poin Penuh</strong> pada awal semester sebagai bentuk kepercayaan sekolah terhadap potensi positif siswa.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 relative">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                  2
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Observasi & Catatan Harian</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Guru Wali memantau kehadiran harian, ketertiban di bengkel, penyelesaian projek, dan interaksi sosial antarteman.
                </p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 relative">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                  3
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Dinamika & Intervensi</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Pelanggaran atau alpa mengurangi poin (status jadi <em>Perhatian Khusus</em>). Guru Wali mengintervensi melalui 4 jenis layanan pendampingan.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                  4
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Restorasi & Apresiasi</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Kepatuhan pada komitmen dan perubahan positif mengembalikan poin karakter kembali ke rentang <strong>Normal</strong> atau <strong>Berprestasi</strong>.
                </p>
              </div>
            </div>

            {/* Matriks Perhitungan Tambah & Kurang Poin */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>Pedoman Penyesuaian Poin Karakter Siswa</span>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Kategori Perilaku</th>
                      <th className="p-3">Deskripsi Indikator</th>
                      <th className="p-3 text-center">Dampak Poin</th>
                      <th className="p-3">Aksi Sistem & Guru Wali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Kedisiplinan Presensi</td>
                      <td className="p-3">Ketidakhadiran tanpa keterangan (Alpa) berturut-turut.</td>
                      <td className="p-3 text-center font-black text-rose-600">-5 s.d -10 Poin</td>
                      <td className="p-3">Otomatis masuk notifikasi "Butuh Atensi" di Dashboard.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Kepatuhan Tata Tertib</td>
                      <td className="p-3">Pelanggaran atribut seragam/wearpack praktik kejuruan.</td>
                      <td className="p-3 text-center font-black text-rose-600">-5 Poin</td>
                      <td className="p-3">Input Jurnal Layanan Pembinaan oleh Guru Wali.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Komitmen Perbaikan</td>
                      <td className="p-3">Mematuhi hasil kesepakatan bimbingan dan tidak mengulang alpa.</td>
                      <td className="p-3 text-center font-black text-emerald-600">+10 Poin</td>
                      <td className="p-3">Guru Wali mengembalikan status siswa ke <strong>Normal</strong>.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">Prestasi & Keaktifan</td>
                      <td className="p-3">Juara lomba LKS, kepengurusan OSIS/Ekskul, atau keaktifan kelas.</td>
                      <td className="p-3 text-center font-black text-emerald-600">+10 s.d +15 Poin</td>
                      <td className="p-3">Status diperbarui menjadi <strong>Siswa Berprestasi</strong>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STATUS NORMAL & RUMUS PERHITUNGAN */}
      {activeSection === 'normal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-1 border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standar Baku Sekolah</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Memahami Status "Normal" & Cara Menghitungnya
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                Status <strong>Normal</strong> adalah tolak ukur bahwa siswa sedang berkembang dengan baik, teratur, aman, dan tidak memiliki kendala kedisiplinan atau psikososial yang mendesak.
              </p>
            </div>

            {/* Kriteria Utama Status Normal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1. Tingkat Presensi</span>
                <span className="text-2xl font-black text-blue-700 block">≥ 85% – 90%</span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Toleransi Alpa maksimal 2 hari. Sakit atau izin wajib disertai surat resmi.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2. Poin Karakter</span>
                <span className="text-2xl font-black text-indigo-700 block">75 – 89 Poin</span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Berada di ambang kondusif tanpa akumulasi pelanggaran tata tertib sekolah.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">3. Nilai Rata-Rata</span>
                <span className="text-2xl font-black text-slate-800 block">≥ 75.0 (KKM)</span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Capaian pembelajaran akademik dan praktik tuntas sesuai standar kurikulum.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">4. Kasus Rujukan BK</span>
                <span className="text-2xl font-black text-emerald-700 block">Nihil / Tuntas</span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Tidak memiliki kasus aktif yang sedang ditangani ruang Bimbingan Konseling.
                </p>
              </div>
            </div>

            {/* Rumus Matematika Sederhana */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-700" />
                <span>Rumus Perhitungan Persentase Kehadiran Siswa</span>
              </h3>
              <div className="bg-white p-3.5 rounded-xl border border-blue-200 text-xs font-mono text-slate-800 max-w-xl">
                Persentase Kehadiran (%) = (Total Hari Hadir [H] ÷ Total Hari Presensi Efektif) × 100%
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Contoh Kasus:</strong> Jika dalam 20 hari efektif sekolah, siswa hadir 19 hari dan sakit 1 hari (Alpa = 0), maka perhitungannya adalah <strong>(19 / 20) × 100% = 95%</strong>. Karena 95% ≥ 85%, maka indikator kehadiran siswa memenuhi syarat <strong>Status Normal</strong>.
              </p>
            </div>

            {/* 4 Kategori Status Perbandingan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Siswa Berprestasi
                  </span>
                  <Award className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Poin Karakter ≥ 90, Kehadiran ≥ 95%, dan Nilai rata-rata ≥ 85.0. Siswa menjadi teladan kelas dan aktif dalam kegiatan positif.
                </p>
              </div>

              <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                    Normal
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Poin Karakter 75–89, Kehadiran 85–94%, dan Nilai rata-rata ≥ 75.0. Kondisi aman dan mengikuti pembelajaran dengan tertib.
                </p>
              </div>

              <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Perhatian Khusus
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Poin Karakter &lt; 75 atau Kehadiran &lt; 85%. Mengalami kendala absensi (Alpa) atau motivasi belajar. Wajib dibimbing Guru Wali.
                </p>
              </div>

              <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                    Dalam Penanganan BK
                  </span>
                  <ShieldCheck className="w-4 h-4 text-rose-700" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kasus kompleks yang telah dirujuk secara formal ke Guru BK untuk konseling psikologis, konferensi kasus, atau panggilan orang tua resmi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SIMULATOR KALKULATOR INTERAKTIF */}
      {activeSection === 'kalkulator' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full mb-1 border border-amber-200">
              <Sliders className="w-3.5 h-3.5" />
              <span>Laboratorium Simulasi Interaktif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Simulator Penentuan Status Siswa Secara Real-Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Geser nilai indikator di bawah untuk melihat bagaimana sistem SIGUWA secara cerdas menentukan status pendampingan siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Sliders */}
            <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-5 text-xs">
              {/* Slider 1: Kehadiran */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-700">Tingkat Kehadiran Siswa (%):</span>
                  <span className="text-sm font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                    {simHadir}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={simHadir}
                  onChange={(e) => setSimHadir(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50% (Sangat Kurang)</span>
                  <span>85% (Ambang Normal)</span>
                  <span>100% (Sempurna)</span>
                </div>
              </div>

              {/* Slider 2: Poin Karakter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-700">Poin Karakter (Skala 0 - 100):</span>
                  <span className="text-sm font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-lg">
                    {simKarakter} Poin
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={simKarakter}
                  onChange={(e) => setSimKarakter(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>40 Poin</span>
                  <span>75 Poin (Normal Min.)</span>
                  <span>100 Poin</span>
                </div>
              </div>

              {/* Slider 3: Nilai Rata-Rata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-700">Nilai Rata-rata Akademik & Praktik:</span>
                  <span className="text-sm font-black text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded-lg">
                    {simNilai}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={simNilai}
                  onChange={(e) => setSimNilai(Number(e.target.value))}
                  className="w-full accent-slate-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50 (Di Bawah KKM)</span>
                  <span>75 (KKM)</span>
                  <span>100</span>
                </div>
              </div>

              {/* Toggle 4: Kasus Aktif BK */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Ada Kasus Aktif di Ruang BK?</span>
                  <span className="text-[11px] text-slate-500">Centang jika siswa sedang menjalani rujukan kasus</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simKasusBK}
                    onChange={(e) => setSimKasusBK(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSimHadir(95);
                    setSimKarakter(85);
                    setSimNilai(80);
                    setSimKasusBK(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Kembalikan ke Nilai Standar Normal</span>
                </button>
              </div>
            </div>

            {/* Real-time Calculation Result Box */}
            <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-slate-200 p-6 space-y-4 shadow-md">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Hasil Kalkulasi Sistem
              </span>

              <div className="space-y-2">
                <span className={`inline-block text-base sm:text-lg font-black px-4 py-1.5 rounded-xl border ${simResult.badgeColor}`}>
                  {simResult.status}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {simResult.desc}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-800 block">Rekomendasi Tindakan:</span>
                <p className="text-slate-600 leading-relaxed">
                  {simResult.recommendation}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                *Catatan: Guru Wali dapat langsung mengubah status pendampingan melalui menu Data Siswa &gt; Detail Profil Siswa.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: TUTORIAL APLIKASI STEP-BY-STEP */}
      {activeSection === 'tutorial' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1 border border-emerald-200">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Panduan Operasional Lengkap</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Tutorial Penggunaan Aplikasi SIGUWA SMKN 1 Jember
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                Langkah-langkah praktis menjalankan alur kerja pendampingan karakter siswa sehari-hari.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  1
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm">Masuk & Pantau Dashboard Utama</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Setiap hari, periksa grafik kehadiran kelas dan notifikasi pada kartu <strong>"Siswa Butuh Atensi"</strong>. Jika ada siswa yang memiliki Alpa atau penurunan karakter, segera ambil tindakan bimbingan.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  2
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm">Lakukan Presensi Cepat Harian</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Buka menu <strong>Presensi & Kehadiran</strong>. Pilih tanggal hari ini, klik status kehadiran setiap siswa (H = Hadir, S = Sakit, I = Izin, A = Alpa), lalu tekan <strong>Simpan Presensi</strong>. Data langsung terhubung ke portal wali murid.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  3
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm">Input Jurnal Layanan Pendampingan</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Klik tombol <strong>+ Input Jurnal Layanan</strong>. Pilih jenis layanan (Bimbingan, Pembinaan, Monitoring, atau Konsultasi). Tuliskan topik, uraian permasalahan, dan hasil kesepakatan tindak lanjut.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  4
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm">Kolaborasi dengan Guru BK & Wali Murid</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Jika masalah memerlukan penanganan khusus, buat <strong>Rujukan Kasus BK</strong>. Rencanakan kunjungan ke rumah melalui tab <strong>Home Visit</strong>, atau balas pertanyaan orang tua lewat tab <strong>Pesan Wali Murid</strong>.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                  5
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm">Cetak Laporan & Cadangkan Data</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Gunakan tombol <strong>Cetak Laporan</strong> ber-kop resmi SMKN 1 Jember & Jawa Timur untuk dokumen fisik. Admin dapat melakukan <strong>Backup & Restore</strong> cadangan database kapan saja lewat Master Data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: FAQ & PERTANYAAN UMUM */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full mb-1 border border-slate-200">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  1. Bagaimana jika siswa yang berstatus "Perhatian Khusus" sudah memperbaiki perilakunya?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Guru Wali dapat membuka <strong>Data Siswa Bimbingan</strong>, klik <strong>Detail Profil</strong> siswa tersebut, lalu ganti dropdown status pendampingan kembali menjadi <strong>Normal</strong>. Tambahkan catatan pemulihan pada jurnal pembinaan.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  2. Apakah orang tua bisa melihat semua catatan jurnal yang dibuat guru?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Hanya jurnal yang dicentang <em>"Tampilkan di Portal Orang Tua"</em> yang dapat dibaca oleh wali murid. Catatan pembinaan internal yang bersifat rahasia tetap hanya terlihat oleh Guru Wali, Wali Kelas, dan Guru BK.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  3. Bagaimana cara wali murid masuk ke Portal Siswa?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Wali murid tidak perlu mengingat password yang rumit. Cukup memasukkan <strong>NISN</strong> (Nomor Induk Siswa Nasional) dan <strong>Tanggal Lahir</strong> siswa (format YYYY-MM-DD atau DD/MM/YYYY) pada halaman login portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
