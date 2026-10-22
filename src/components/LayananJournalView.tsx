import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  Home,
  CheckCircle2,
  Trash2,
  Edit3,
  Share2,
  Eye,
  MessageCircle,
  HeartHandshake
} from 'lucide-react';
import { LayananType, StatusLayanan, JurnalLayanan } from '../types';

interface LayananJournalViewProps {
  onOpenModalInput: (prefillType?: LayananType, prefillSiswaId?: string, editData?: JurnalLayanan) => void;
  onOpenRujukanBKModal?: (siswaId: string, topik: string, uraian: string) => void;
}

export const LayananJournalView: React.FC<LayananJournalViewProps> = ({
  onOpenModalInput,
  onOpenRujukanBKModal
}) => {
  const {
    currentGuruWali,
    jurnalList,
    deleteJurnal,
    updateJurnal,
    siswaList
  } = useApp();

  const [selectedLayanan, setSelectedLayanan] = useState<LayananType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusLayanan | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<'class' | 'all'>('class');

  // Filter journals based on options
  const filteredJurnals = jurnalList.filter(item => {
    if (filterClass === 'class' && item.kelas !== currentGuruWali.kelas) return false;
    if (selectedLayanan !== 'all' && item.jenisLayanan !== selectedLayanan) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.siswaNama.toLowerCase().includes(q);
      const matchTopic = item.topik.toLowerCase().includes(q);
      const matchUraian = item.uraian.toLowerCase().includes(q);
      if (!matchName && !matchTopic && !matchUraian) return false;
    }
    return true;
  });

  const getLayananBadge = (type: LayananType) => {
    switch (type) {
      case 'bimbingan':
        return {
          label: '1. Layanan Bimbingan',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          desc: 'Akademik & Karir'
        };
      case 'pembinaan':
        return {
          label: '2. Layanan Pembinaan',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          desc: 'Karakter & Disiplin'
        };
      case 'monitoring':
        return {
          label: '3. Layanan Monitoring',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          desc: 'Kehadiran & PKL'
        };
      case 'konsultasi':
        return {
          label: '4. Layanan Konsultasi',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          desc: 'Wali Murid & Home Visit'
        };
    }
  };

  const getStatusBadge = (status: StatusLayanan) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Dalam Proses':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Dirujuk ke BK':
        return 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';
      case 'Perlu Home Visit':
        return 'bg-purple-50 text-purple-700 border border-purple-200 font-bold';
    }
  };

  const handleSendWA = (jurnal: JurnalLayanan) => {
    const student = siswaList.find(s => s.id === jurnal.siswaId);
    if (!student || !student.noHpOrtu) {
      alert('Nomor HP Orang Tua belum tercatat.');
      return;
    }
    const cleanPhone = student.noHpOrtu.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const message = `Yth. Bapak/Ibu ${student.namaOrtu} (Wali dari ${student.nama} - Kelas ${student.kelas} SMKN 1 Jember).\n\nBerikut kami sampaikan catatan pendampingan Guru Wali:\n• Layanan: ${jurnal.jenisLayanan.toUpperCase()}\n• Topik: ${jurnal.topik}\n• Hasil/Kesepakatan: ${jurnal.hasilKesepakatan}\n• Status: ${jurnal.status}\n\nCatatan lengkap dapat dipantau secara real-time pada Portal Wali Murid SIGUWA SMKN 1 Jember. Terima kasih atas kerja sama Bapak/Ibu.\n\nSalam hormat,\n${jurnal.guruWaliNama}\nGuru Wali SMKN 1 Jember`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-1 border border-blue-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Jurnal Administrasi & Pendampingan Karakter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Jurnal 4 Layanan Pokok Guru Wali
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Pencatatan terpadu Layanan Bimbingan, Pembinaan Karakter/Pancasila, Monitoring Kehadiran/Tugas, dan Konsultasi/Home Visit yang terhubung langsung dengan wali murid secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenModalInput(selectedLayanan === 'all' ? undefined : selectedLayanan)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Jurnal Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Service Quick Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setSelectedLayanan('all')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              selectedLayanan === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Semua Layanan</span>
            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
              ({jurnalList.length} Catatan)
            </span>
          </button>

          <button
            onClick={() => setSelectedLayanan('bimbingan')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              selectedLayanan === 'bimbingan'
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-blue-50/60 text-blue-800 border-blue-200 hover:bg-blue-100/70'
            }`}
          >
            <span>1. Bimbingan</span>
            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
              Akademik & Karir
            </span>
          </button>

          <button
            onClick={() => setSelectedLayanan('pembinaan')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              selectedLayanan === 'pembinaan'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/60 text-amber-800 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <span>2. Pembinaan</span>
            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
              Karakter & Etika
            </span>
          </button>

          <button
            onClick={() => setSelectedLayanan('monitoring')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              selectedLayanan === 'monitoring'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
            }`}
          >
            <span>3. Monitoring</span>
            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
              Presensi & PKL
            </span>
          </button>

          <button
            onClick={() => setSelectedLayanan('konsultasi')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              selectedLayanan === 'konsultasi'
                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-purple-50/60 text-purple-800 border-purple-200 hover:bg-purple-100/70'
            }`}
          >
            <span>4. Konsultasi</span>
            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
              Temu Wali / Home Visit
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa, topik bimbingan, atau uraian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600 text-slate-800 font-medium"
          />
        </div>

        {/* Status filter and Class toggle */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterClass('class')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                filterClass === 'class'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelas {currentGuruWali.kelas}
            </button>
            <button
              onClick={() => setFilterClass('all')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                filterClass === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kelas
            </button>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-blue-600 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Selesai">Status: Selesai</option>
            <option value="Dalam Proses">Status: Dalam Proses</option>
            <option value="Dirujuk ke BK">Status: Dirujuk ke BK</option>
            <option value="Perlu Home Visit">Status: Perlu Home Visit</option>
          </select>

        </div>
      </div>

      {/* List of Journal Entries */}
      <div className="space-y-4">
        {filteredJurnals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Tidak ada catatan jurnal</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ditemukan catatan bimbingan dengan filter ini. Mulai tambahkan jurnal pendampingan siswa bimbingan Anda.
            </p>
            <button
              onClick={() => onOpenModalInput(selectedLayanan === 'all' ? undefined : selectedLayanan)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              + Buat Catatan Pertama
            </button>
          </div>
        ) : (
          filteredJurnals.map((jurnal) => {
            const badge = getLayananBadge(jurnal.jenisLayanan);
            const student = siswaList.find(s => s.id === jurnal.siswaId);

            return (
              <div
                key={jurnal.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 shadow-xs transition-all space-y-4"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      Kelas {jurnal.kelas}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${getStatusBadge(jurnal.status)}`}>
                      {jurnal.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {jurnal.tanggal}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {jurnal.jam} WIB
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-0.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{jurnal.siswaNama} {student && `(NISN: ${student.nisn})`}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {jurnal.topik}
                    </h3>
                  </div>

                  {/* Uraian dan Hasil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Uraian Masalah / Kegiatan:</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {jurnal.uraian}
                      </p>
                    </div>

                    <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1">
                      <span className="font-bold text-blue-900 block">Hasil & Kesepakatan Solusi:</span>
                      <p className="text-blue-950 leading-relaxed whitespace-pre-line">
                        {jurnal.hasilKesepakatan || 'Belum ada catatan kesepakatan tertulis.'}
                      </p>
                    </div>
                  </div>

                  {/* Tindak Lanjut */}
                  {jurnal.tindakLanjut && (
                    <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl text-xs space-y-0.5">
                      <span className="font-bold text-amber-900">Rencana Tindak Lanjut Guru Wali:</span>
                      <p className="text-amber-950">
                        {jurnal.tindakLanjut}
                      </p>
                    </div>
                  )}

                  {/* Tanggapan Orang Tua (Jika ada umpan balik) */}
                  {jurnal.tanggapanOrtu ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <HeartHandshake className="w-4 h-4 text-emerald-700" />
                          <span>Tanggapan / Konfirmasi Wali Murid:</span>
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
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {jurnal.visibleToParent 
                          ? 'Tersinkronisasi ke Portal Wali Murid (Menunggu respon wali)' 
                          : 'Catatan internal (Tidak ditampilkan di portal)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Dicatat oleh: <span className="font-semibold text-slate-700">{jurnal.guruWaliNama}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Send WA to Parent */}
                    <button
                      onClick={() => handleSendWA(jurnal)}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold flex items-center gap-1 cursor-pointer"
                      title="Kirim notifikasi ringkasan bimbingan via WhatsApp ke Orang Tua"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Ortu</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onOpenModalInput(jurnal.jenisLayanan, jurnal.siswaId, jurnal)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Ubah catatan jurnal ini"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus catatan jurnal "${jurnal.topik}"?`)) {
                          deleteJurnal(jurnal.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
