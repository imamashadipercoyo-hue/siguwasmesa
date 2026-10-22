import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  UserCheck,
  Star,
  AlertTriangle,
  ShieldAlert,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRight,
  Plus,
  HeartHandshake,
  CheckCircle2,
  X
} from 'lucide-react';
import { Siswa, StatusPendampingan, LayananType } from '../types';

interface SiswaListViewProps {
  onOpenModalInput: (prefillType?: LayananType, prefillSiswaId?: string) => void;
  onOpenJadwalModal?: (siswaId: string) => void;
}

export const SiswaListView: React.FC<SiswaListViewProps> = ({
  onOpenModalInput,
  onOpenJadwalModal
}) => {
  const {
    currentGuruWali,
    siswaList,
    jurnalList,
    presensiList,
    updateSiswa
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<StatusPendampingan | 'all'>('all');
  const [filterClass, setFilterClass] = useState<'class' | 'all'>('class');
  
  // Selected student for detail modal
  const [viewingSiswa, setViewingSiswa] = useState<Siswa | null>(null);

  const filteredStudents = siswaList.filter(s => {
    if (filterClass === 'class' && s.kelas !== currentGuruWali.kelas) return false;
    if (selectedFilterStatus !== 'all' && s.statusPendampingan !== selectedFilterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.nama.toLowerCase().includes(q);
      const matchNisn = s.nisn.includes(q);
      const matchAlamat = s.alamat.toLowerCase().includes(q);
      if (!matchName && !matchNisn && !matchAlamat) return false;
    }
    return true;
  });

  const getStatusBadge = (status: StatusPendampingan) => {
    switch (status) {
      case 'Siswa Berprestasi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Perhatian Khusus':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Dalam Penanganan BK':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    }
  };

  const getStudentStats = (siswaId: string) => {
    const studentJurnal = jurnalList.filter(j => j.siswaId === siswaId);
    const records = presensiList.filter(p => p.siswaId === siswaId);
    const totalPresensi = records.length || 1;
    const hadir = records.filter(p => p.status === 'H').length;
    const rate = Math.round((hadir / totalPresensi) * 100);

    return {
      jurnalCount: studentJurnal.length,
      attendanceRate: rate,
      jurnals: studentJurnal
    };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-1 border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              <span>Database Peserta Didik Bimbingan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Data Siswa Bimbingan Guru Wali
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Informasi terintegrasi biodata, profil perkembangan karakter, rekap nilai akademik, status pendampingan, dan kontak darurat wali murid.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
              Total {filteredStudents.length} Siswa Terpilih
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, atau alamat di Jember..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600 font-medium"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterClass('class')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center cursor-pointer transition-all ${
                filterClass === 'class'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelas {currentGuruWali.kelas}
            </button>
            <button
              onClick={() => setFilterClass('all')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center cursor-pointer transition-all ${
                filterClass === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kelas SMKN 1
            </button>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedFilterStatus}
              onChange={(e) => setSelectedFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">Semua Status Pendampingan</option>
              <option value="Siswa Berprestasi">Siswa Berprestasi</option>
              <option value="Normal">Normal</option>
              <option value="Perhatian Khusus">Perhatian Khusus</option>
              <option value="Dalam Penanganan BK">Dalam Penanganan BK</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid Kartu Siswa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(siswa => {
          const stats = getStudentStats(siswa.id);

          return (
            <div
              key={siswa.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Siswa */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      {siswa.kelas} • {siswa.jurusan}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1 leading-snug">
                      {siswa.nama}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      NISN: {siswa.nisn} • {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusBadge(siswa.statusPendampingan)}`}>
                    {siswa.statusPendampingan}
                  </span>
                </div>

                {/* Score & Character Badge */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Nilai Rerata</span>
                    <span className="font-black text-slate-900">{siswa.nilaiRataRata}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Karakter</span>
                    <span className="font-black text-indigo-700">{siswa.poinKarakter} / 100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Kehadiran</span>
                    <span className={`font-black ${stats.attendanceRate >= 90 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {stats.attendanceRate}%
                    </span>
                  </div>
                </div>

                {/* Address & Parent Info */}
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{siswa.alamat}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Wali: <strong className="text-slate-800">{siswa.namaOrtu}</strong></span>
                  </div>
                </div>

                {/* Catatan khusus jika ada */}
                {siswa.catatanKhusus && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/50 border border-amber-100 p-2 rounded-lg line-clamp-2">
                    "{siswa.catatanKhusus}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setViewingSiswa(siswa)}
                  className="text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Detail Profil</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenModalInput('bimbingan', siswa.id)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg cursor-pointer font-bold text-[11px]"
                    title="Input Jurnal Layanan untuk siswa ini"
                  >
                    + Jurnal
                  </button>

                  <a
                    href={`https://wa.me/62${siswa.noHpOrtu.replace(/^0/, '')}?text=${encodeURIComponent(`Selamat pagi Bapak/Ibu ${siswa.namaOrtu}, kami dari Guru Wali SMKN 1 Jember ingin mengonfirmasi perkembangan ananda ${siswa.nama}...`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                    title="Hubungi Orang Tua via WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Detail Profil Lengkap Siswa */}
      {viewingSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 overflow-hidden">
            
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-300">
                  Profil Peserta Didik SMKN 1 Jember
                </span>
                <h3 className="text-lg font-bold">{viewingSiswa.nama}</h3>
                <p className="text-xs text-blue-100">
                  NISN: {viewingSiswa.nisn} • Kelas: {viewingSiswa.kelas} ({viewingSiswa.jurusan})
                </p>
              </div>
              <button
                onClick={() => setViewingSiswa(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Data Biodata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Tanggal Lahir</span>
                  <span className="font-bold text-slate-800">{viewingSiswa.tanggalLahir}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Nilai Rata-rata</span>
                  <span className="font-bold text-slate-800">{viewingSiswa.nilaiRataRata}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Poin Karakter</span>
                  <span className="font-bold text-indigo-700">{viewingSiswa.poinKarakter} / 100</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Status</span>
                  <span className="font-bold text-slate-800">{viewingSiswa.statusPendampingan}</span>
                </div>
              </div>

              {/* Status Update Quick Selector */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-blue-900 block">Status Pendampingan Karakter:</span>
                  <span className="text-blue-700 text-[11px]">Perbarui kategori pembinaan untuk siswa ini</span>
                </div>
                <select
                  value={viewingSiswa.statusPendampingan}
                  onChange={(e) => {
                    const newStatus = e.target.value as StatusPendampingan;
                    updateSiswa(viewingSiswa.id, { statusPendampingan: newStatus });
                    setViewingSiswa(prev => prev ? { ...prev, statusPendampingan: newStatus } : null);
                  }}
                  className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Normal">Normal</option>
                  <option value="Siswa Berprestasi">Siswa Berprestasi</option>
                  <option value="Perhatian Khusus">Perhatian Khusus</option>
                  <option value="Dalam Penanganan BK">Dalam Penanganan BK</option>
                </select>
              </div>

              {/* Biodata Kontak */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Informasi Domisili & Orang Tua</h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Alamat: <strong>{viewingSiswa.alamat}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Nama Orang Tua/Wali: <strong>{viewingSiswa.namaOrtu}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>No. WhatsApp: <strong>{viewingSiswa.noHpOrtu}</strong></span>
                  </div>
                </div>
              </div>

              {/* Riwayat 4 Layanan Siswa Ini */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Riwayat Jurnal Pendampingan ({getStudentStats(viewingSiswa.id).jurnalCount})
                  </h4>
                  <button
                    onClick={() => {
                      const id = viewingSiswa.id;
                      setViewingSiswa(null);
                      onOpenModalInput('bimbingan', id);
                    }}
                    className="text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    + Tambah Jurnal Siswa Ini
                  </button>
                </div>

                <div className="space-y-2">
                  {getStudentStats(viewingSiswa.id).jurnals.length === 0 ? (
                    <p className="text-slate-400 italic">Belum ada riwayat bimbingan khusus untuk siswa ini.</p>
                  ) : (
                    getStudentStats(viewingSiswa.id).jurnals.map(j => (
                      <div key={j.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-800 uppercase text-[10px] bg-blue-50 px-2 py-0.5 rounded">
                            Layanan {j.jenisLayanan}
                          </span>
                          <span className="text-slate-400 text-[10px]">{j.tanggal} • {j.jam} WIB</span>
                        </div>
                        <p className="font-bold text-slate-900">{j.topik}</p>
                        <p className="text-slate-600 line-clamp-2">{j.uraian}</p>
                        <p className="text-slate-700 font-medium text-[11px]">
                          Hasil: {j.hasilKesepakatan || '-'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingSiswa(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
