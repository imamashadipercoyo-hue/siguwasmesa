import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageSquare,
  Send,
  Phone,
  ShieldCheck,
  Star,
  Sparkles,
  LogOut,
  AlertTriangle,
  Info
} from 'lucide-react';
import { LayananType } from '../types';

export const PortalWaliMuridView: React.FC = () => {
  const {
    siswaList,
    jurnalList,
    presensiList,
    guruWaliList,
    selectedSiswaForPortal,
    setSelectedSiswaForPortal,
    loginPortalByNisn,
    portalLoginError,
    addOrtuFeedbackToJurnal,
    konsultasiList,
    addKonsultasiWaliMurid,
    logout
  } = useApp();

  // Login form state
  const [nisnInput, setNisnInput] = useState('0094201436');
  const [tglLahirInput, setTglLahirInput] = useState('');

  // Parent feedback modal / inline state
  const [activeFeedbackJurnalId, setActiveFeedbackJurnalId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Konsultasi form state
  const [topikKonsul, setTopikKonsul] = useState('');
  const [pesanKonsul, setPesanKonsul] = useState('');
  const [showKonsulSuccess, setShowKonsulSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginPortalByNisn(nisnInput, tglLahirInput);
  };

  if (!selectedSiswaForPortal) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-700 to-blue-800 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-200">
            <Users className="w-8 h-8 text-amber-300" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 uppercase">
              Portal Wali Murid Real-time
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Masuk Portal Wali SMKN 1 Jember
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Akses transparan perkembangan akademik, kedisiplinan karakter, presensi harian, dan 4 layanan Guru Wali untuk putra/putri Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left text-xs">
            {portalLoginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl font-medium">
                {portalLoginError}
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <input
                type="text"
                placeholder="Masukkan 10 digit NISN siswa"
                value={nisnInput}
                onChange={(e) => setNisnInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono font-bold focus:outline-blue-600"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tanggal Lahir Siswa (Opsional untuk Verifikasi)
              </label>
              <input
                type="date"
                value={tglLahirInput}
                onChange={(e) => setTglLahirInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
            >
              Buka Pantauan Perkembangan Siswa &rarr;
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-100 text-left">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              Pilih contoh akun siswa demo untuk langsung melihat portal:
            </span>
            <div className="flex flex-wrap gap-2">
              {siswaList.slice(0, 4).map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setNisnInput(s.nisn);
                    loginPortalByNisn(s.nisn, '');
                  }}
                  className="text-[11px] bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 px-2.5 py-1.5 rounded-xl font-medium cursor-pointer transition-colors"
                >
                  {s.nama} ({s.kelas})
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 text-center">
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-rose-600 hover:text-rose-700 font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar ke Halaman Login Utama</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loaded Student Data
  const siswa = selectedSiswaForPortal;
  const guruWali = guruWaliList.find(g => g.kelas === siswa.kelas) || guruWaliList[0];

  // Jurnal for this student that are marked visibleToParent
  const studentJurnals = jurnalList.filter(j => j.siswaId === siswa.id && j.visibleToParent);

  // Presensi for this student
  const studentPresensi = presensiList.filter(p => p.siswaId === siswa.id);
  const totalPres = studentPresensi.length || 1;
  const countH = studentPresensi.filter(p => p.status === 'H').length;
  const countS = studentPresensi.filter(p => p.status === 'S').length;
  const countI = studentPresensi.filter(p => p.status === 'I').length;
  const countA = studentPresensi.filter(p => p.status === 'A').length;
  const rateHadir = Math.round((countH / totalPres) * 100);

  // Konsultasi requests by this parent
  const myConsultations = konsultasiList.filter(k => k.siswaId === siswa.id);

  const handleSendFeedback = (jurnalId: string) => {
    if (!feedbackText.trim()) return;
    addOrtuFeedbackToJurnal(jurnalId, feedbackText);
    setActiveFeedbackJurnalId(null);
    setFeedbackText('');
  };

  const handleKirimKonsultasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topikKonsul.trim() || !pesanKonsul.trim()) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addKonsultasiWaliMurid({
      tanggal: dateStr,
      jam: timeStr,
      siswaId: siswa.id,
      siswaNama: siswa.nama,
      namaOrtu: siswa.namaOrtu,
      noHp: siswa.noHpOrtu,
      topik: topikKonsul,
      pesan: pesanKonsul
    });

    setTopikKonsul('');
    setPesanKonsul('');
    setShowKonsulSuccess(true);
    setTimeout(() => setShowKonsulSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                Portal Resmi Wali Murid
              </span>
              <span className="bg-white/10 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                SMK Negeri 1 Jember
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {siswa.nama}
            </h2>
            
            <p className="text-xs sm:text-sm text-blue-200">
              NISN: <span className="font-mono font-bold text-white">{siswa.nisn}</span> • Kelas: <strong className="text-white">{siswa.kelas}</strong> ({siswa.jurusan})
            </p>

            <p className="text-xs text-slate-300">
              Nama Wali: <strong className="text-white">{siswa.namaOrtu}</strong> • Kontak: {siswa.noHpOrtu}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Quick Switch Siswa Button or Logout */}
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-xs space-y-1">
              <span className="text-[10px] text-blue-200 block">Guru Wali Kelas:</span>
              <p className="font-bold text-white">{guruWali.nama}, {guruWali.gelar}</p>
              <a
                href={`https://wa.me/62${guruWali.telepon.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 font-bold"
              >
                <Phone className="w-3 h-3" />
                <span>Chat Guru Wali ({guruWali.telepon})</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedSiswaForPortal(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Ganti Siswa Lain"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>Ganti Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-900/30 transition-colors"
                title="Keluar dari Sistem dan Kembali ke Halaman Login"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Student Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Tingkat Kehadiran</span>
          <span className={`text-2xl font-black ${rateHadir >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {rateHadir}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {countH} Hadir • {countS} Sakit • {countI} Izin • {countA} Alpa
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Poin Karakter & Etika</span>
          <span className="text-2xl font-black text-indigo-700">{siswa.poinKarakter}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Skala Profil Pelajar Pancasila
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Rerata Nilai Rapor</span>
          <span className="text-2xl font-black text-slate-800">{siswa.nilaiRataRata}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
            Tuntas Kriteria SMK
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Pendampingan</span>
          <span className="text-sm font-extrabold text-blue-700 block mt-1">
            {siswa.statusPendampingan}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Terpantau Guru Wali
          </span>
        </div>
      </div>

      {/* 4 Layanan Real-time Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sinkronisasi Real-time Aktif</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Jurnal Catatan 4 Layanan Guru Wali untuk Ananda
            </h3>
            <p className="text-xs text-slate-500">
              Setiap catatan bimbingan, pembinaan, monitoring, dan konsultasi diinput langsung oleh Guru Wali SMKN 1 Jember.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
            {studentJurnals.length} Catatan Layanan
          </span>
        </div>

        <div className="space-y-4">
          {studentJurnals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Belum ada catatan khusus. Perkembangan ananda berjalan normal di sekolah.</p>
            </div>
          ) : (
            studentJurnals.map(jurnal => (
              <div
                key={jurnal.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      jurnal.jenisLayanan === 'bimbingan' ? 'bg-blue-100 text-blue-800' :
                      jurnal.jenisLayanan === 'pembinaan' ? 'bg-amber-100 text-amber-800' :
                      jurnal.jenisLayanan === 'monitoring' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      Layanan {jurnal.jenisLayanan}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {jurnal.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {jurnal.tanggal} ({jurnal.jam} WIB)
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {jurnal.topik}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {jurnal.uraian}
                  </p>
                </div>

                {jurnal.hasilKesepakatan && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs space-y-0.5">
                    <span className="font-bold text-blue-900 block">Hasil Kesepakatan / Arahan Guru Wali:</span>
                    <p className="text-blue-950 leading-relaxed">
                      {jurnal.hasilKesepakatan}
                    </p>
                  </div>
                )}

                {/* Umpan balik yang sudah ada */}
                {jurnal.tanggapanOrtu ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Tanggapan Anda (Wali Murid):</span>
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        {jurnal.tanggalTanggapan}
                      </span>
                    </div>
                    <p className="text-emerald-950 italic">
                      "{jurnal.tanggapanOrtu}"
                    </p>
                  </div>
                ) : (
                  <div>
                    {activeFeedbackJurnalId === jurnal.id ? (
                      <div className="p-3 bg-white border border-blue-300 rounded-xl space-y-2 text-xs animate-fade-in">
                        <label className="font-bold text-slate-800 block">
                          Tulis Umpan Balik / Konfirmasi untuk Guru Wali:
                        </label>
                        <textarea
                          rows={2}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Contoh: Terima kasih atas bimbingannya Bu, kami di rumah akan mengingatkan ananda..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveFeedbackJurnalId(null)}
                            className="px-3 py-1 border border-slate-200 rounded-lg font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendFeedback(jurnal.id)}
                            className="px-3 py-1 bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                          >
                            Kirim Umpan Balik
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveFeedbackJurnalId(jurnal.id);
                          setFeedbackText('');
                        }}
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Beri Tanggapan / Konfirmasi Catatan Ini</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-2 text-[11px] text-slate-400">
                  Guru Wali: <strong className="text-slate-600">{jurnal.guruWaliNama}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Ajukan Konsultasi / Curhat ke Guru Wali */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Komunikasi Dua Arah</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            Ajukan Konsultasi / Pesan ke Guru Wali
          </h3>
          <p className="text-xs text-slate-500">
            Sampaikan kendala belajar, permohonan dispensasi, atau kebutuhan tatap muka langsung kepada Guru Wali ({guruWali.nama}, {guruWali.gelar}).
          </p>
        </div>

        {showKonsulSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pesan konsultasi Anda berhasil dikirimkan ke Guru Wali! Anda akan menerima respon langsung di sini.</span>
          </div>
        )}

        <form onSubmit={handleKirimKonsultasi} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Topik Pembahasan *
            </label>
            <input
              type="text"
              placeholder="Contoh: Konsultasi kendala laptop praktik, info izin sakit, atau permohonan tatap muka"
              value={topikKonsul}
              onChange={(e) => setTopikKonsul(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-blue-600"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Uraian Pesan / Curahan Hati *
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan secara ringkas perihal yang ingin Bapak/Ibu sampaikan kepada Guru Wali..."
              value={pesanKonsul}
              onChange={(e) => setPesanKonsul(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-blue-600 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Pesan ke Guru Wali</span>
            </button>
          </div>
        </form>

        {/* Riwayat Konsultasi Orang Tua */}
        {myConsultations.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">
              Riwayat Konsultasi yang Pernah Anda Ajukan ({myConsultations.length})
            </h4>

            <div className="space-y-2.5">
              {myConsultations.map(k => (
                <div key={k.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{k.topik}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                      k.status === 'Dijadwalkan' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {k.status}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    "{k.pesan}"
                  </p>

                  {k.responGuruWali && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-xs text-indigo-950 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Respon dari Guru Wali ({guruWali.nama}):</span>
                        <span className="text-[10px] text-indigo-700">{k.tanggalRespon}</span>
                      </div>
                      <p className="italic leading-relaxed">{k.responGuruWali}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
