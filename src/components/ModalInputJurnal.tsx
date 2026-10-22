import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { LayananType, StatusLayanan, JurnalLayanan } from '../types';

interface ModalInputJurnalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillType?: LayananType;
  prefillSiswaId?: string;
  editData?: JurnalLayanan;
}

export const ModalInputJurnal: React.FC<ModalInputJurnalProps> = ({
  isOpen,
  onClose,
  prefillType,
  prefillSiswaId,
  editData
}) => {
  const {
    currentGuruWali,
    siswaList,
    addJurnal,
    updateJurnal
  } = useApp();

  const kelasSiswa = siswaList.filter(s => s.kelas === currentGuruWali.kelas);

  const [siswaId, setSiswaId] = useState<string>('');
  const [jenisLayanan, setJenisLayanan] = useState<LayananType>('bimbingan');
  const [tanggal, setTanggal] = useState<string>('');
  const [jam, setJam] = useState<string>('');
  const [topik, setTopik] = useState<string>('');
  const [uraian, setUraian] = useState<string>('');
  const [hasilKesepakatan, setHasilKesepakatan] = useState<string>('');
  const [tindakLanjut, setTindakLanjut] = useState<string>('');
  const [status, setStatus] = useState<StatusLayanan>('Dalam Proses');
  const [visibleToParent, setVisibleToParent] = useState<boolean>(true);

  // Initialize or reset when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setSiswaId(editData.siswaId);
        setJenisLayanan(editData.jenisLayanan);
        setTanggal(editData.tanggal);
        setJam(editData.jam);
        setTopik(editData.topik);
        setUraian(editData.uraian);
        setHasilKesepakatan(editData.hasilKesepakatan);
        setTindakLanjut(editData.tindakLanjut);
        setStatus(editData.status);
        setVisibleToParent(editData.visibleToParent);
      } else {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');

        setTanggal(`${yyyy}-${mm}-${dd}`);
        setJam(`${hh}:${min}`);
        setJenisLayanan(prefillType || 'bimbingan');
        setSiswaId(prefillSiswaId || (kelasSiswa[0]?.id ?? ''));
        setTopik('');
        setUraian('');
        setHasilKesepakatan('');
        setTindakLanjut('');
        setStatus('Dalam Proses');
        setVisibleToParent(true);
      }
    }
  }, [isOpen, editData, prefillType, prefillSiswaId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedStudent = siswaList.find(s => s.id === siswaId);
    if (!selectedStudent) {
      alert('Silakan pilih siswa yang dibimbing!');
      return;
    }

    if (!topik.trim()) {
      alert('Topik bimbingan wajib diisi!');
      return;
    }

    if (editData) {
      updateJurnal(editData.id, {
        siswaId: selectedStudent.id,
        siswaNama: selectedStudent.nama,
        kelas: selectedStudent.kelas,
        jenisLayanan,
        tanggal,
        jam,
        topik,
        uraian,
        hasilKesepakatan,
        tindakLanjut,
        status,
        visibleToParent
      });
    } else {
      addJurnal({
        tanggal,
        jam,
        siswaId: selectedStudent.id,
        siswaNama: selectedStudent.nama,
        kelas: selectedStudent.kelas,
        jenisLayanan,
        topik,
        uraian,
        hasilKesepakatan,
        tindakLanjut,
        status,
        guruWaliId: currentGuruWali.id,
        guruWaliNama: `${currentGuruWali.nama}, ${currentGuruWali.gelar}`,
        visibleToParent
      });
    }

    onClose();
  };

  // Preset suggestions per service
  const presetSuggestions = {
    bimbingan: [
      'Bimbingan Minat Karir & Portofolio Kejuruan',
      'Pendampingan Kesulitan Belajar Modul Produktif',
      'Motivasi Belajar dan Pengelolaan Waktu Siswa',
      'Konsultasi Pemilihan Tempat PKL Industri'
    ],
    pembinaan: [
      'Pembinaan Kedisiplinan Kerapian Seragam & Tata Tertib',
      'Penanaman Nilai Etika Sopan Santun Profil Pelajar Pancasila',
      'Pembinaan Mengatasi Kebiasaan Keterlambatan Masuk Kelas',
      'Pembinaan Anti-Perundungan (Bullying) & Mediasi Antarsiswa'
    ],
    monitoring: [
      'Monitoring Presensi & Evaluasi Tingkat Kehadiran Harian',
      'Monitoring Ketuntasan Tugas Produktif Guru Mata Pelajaran',
      'Monitoring Kesiapan Berkas Administrasi Praktik Kerja Lapangan',
      'Monitoring Keaktifan Siswa dalam Pembelajaran Praktik di Lab'
    ],
    konsultasi: [
      'Konsultasi Tatap Muka Bersama Orang Tua di Ruang Guru Wali',
      'Home Visit (Kunjungan Rumah) Meninjau Kondisi Lingkungan Siswa',
      'Mediasi Orang Tua dan Siswa Terkait Kesiapan Biaya Pendidikan',
      'Konsultasi Psikologis Awal Siswa Sebelum Rujukan ke BK'
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {editData ? 'Ubah Catatan Jurnal Layanan' : 'Form Input Jurnal Guru Wali'}
              </h3>
              <p className="text-xs text-blue-100">
                SMK Negeri 1 Jember • Kelas {currentGuruWali.kelas}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Service Selector (4 Layanan) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Pilih Jenis Layanan (4 Layanan Pokok Guru Wali)</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'bimbingan', label: '1. Bimbingan', sub: 'Akademik/Karir' },
                { type: 'pembinaan', label: '2. Pembinaan', sub: 'Karakter/Etika' },
                { type: 'monitoring', label: '3. Monitoring', sub: 'Presensi/Tugas' },
                { type: 'konsultasi', label: '4. Konsultasi', sub: 'Wali/Home Visit' }
              ].map(item => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setJenisLayanan(item.type as LayananType)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    jenisLayanan === item.type
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20 text-blue-900 font-bold'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-extrabold">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Student Selector & Date/Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Siswa Terkait</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={siswaId}
                onChange={(e) => setSiswaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-600"
                required
              >
                <optgroup label={`Kelas Anda (${currentGuruWali.kelas})`}>
                  {kelasSiswa.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Siswa Kelas Lain">
                  {siswaList.filter(s => s.kelas !== currentGuruWali.kelas).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} - {s.kelas}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Waktu (WIB)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-600"
                required
              />
            </div>
          </div>

          {/* Topic & Preset Suggestions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Topik Bimbingan / Kasus</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-blue-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Pilih saran topik:</span>
              </span>
            </div>

            <input
              type="text"
              placeholder="Contoh: Bimbingan Portofolio Coding atau Pembinaan Kedisiplinan Jam Belajar"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-600"
              required
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presetSuggestions[jenisLayanan].map((suggest, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTopik(suggest)}
                  className="text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + {suggest}
                </button>
              ))}
            </div>
          </div>

          {/* Uraian Masalah / Kegiatan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Uraian Kegiatan / Latar Belakang Masalah
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan kondisi siswa, pengamatan guru wali, atau kronologi permasalahan..."
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-blue-600 leading-relaxed"
              required
            />
          </div>

          {/* Hasil Kesepakatan Solusi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Hasil Pertemuan & Kesepakatan Solusi
            </label>
            <textarea
              rows={2}
              placeholder="Komitmen yang dibuat siswa, nasihat guru wali, atau kesepakatan orang tua..."
              value={hasilKesepakatan}
              onChange={(e) => setHasilKesepakatan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-blue-600 leading-relaxed"
            />
          </div>

          {/* Rencana Tindak Lanjut */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Rencana Tindak Lanjut (Follow-Up)
            </label>
            <input
              type="text"
              placeholder="Contoh: Evaluasi perkembangan berkala minggu depan atau koordinasi dengan Guru BK"
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-blue-600"
            />
          </div>

          {/* Status Layanan & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Status Penyelesaian Layanan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusLayanan)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600 cursor-pointer"
              >
                <option value="Dalam Proses">Dalam Proses (Masih Dipantau)</option>
                <option value="Selesai">Selesai (Kasus Tuntas)</option>
                <option value="Dirujuk ke BK">Dirujuk ke Guru BK (Perlu Penanganan Khusus)</option>
                <option value="Perlu Home Visit">Perlu Home Visit (Kunjungan Rumah)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="visibleToParent"
                checked={visibleToParent}
                onChange={(e) => setVisibleToParent(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="visibleToParent" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Tampilkan di Portal Orang Tua secara Real-time
              </label>
            </div>
          </div>

          {status === 'Dirujuk ke BK' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Perhatian Sistem:</span> Memilih status "Dirujuk ke BK" akan secara otomatis memasukkan kasus ini ke daftar disposisi kerja sama Guru BK SMKN 1 Jember.
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editData ? 'Simpan Perubahan' : 'Simpan Jurnal Layanan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
