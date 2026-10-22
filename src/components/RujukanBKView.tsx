import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  ArrowRight,
  FileText,
  MessageSquare,
  Building2,
  Calendar
} from 'lucide-react';
import { RujukanBK } from '../types';

export const RujukanBKView: React.FC = () => {
  const {
    currentGuruWali,
    siswaList,
    rujukanBKList,
    addRujukanBK,
    updateRujukanBK
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [alasanRujukan, setAlasanRujukan] = useState('');
  const [indikasiMasalah, setIndikasiMasalah] = useState('');
  const [upayaGuruWali, setUpayaGuruWali] = useState('');

  // Editing response by BK
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [bkResponseNotes, setBkResponseNotes] = useState('');
  const [bkNewStatus, setBkNewStatus] = useState<RujukanBK['status']>('Proses Konseling');

  const kelasSiswa = siswaList.filter(s => s.kelas === currentGuruWali.kelas);

  const handleSubmitRujukan = (e: React.FormEvent) => {
    e.preventDefault();
    const student = siswaList.find(s => s.id === selectedSiswaId);
    if (!student) {
      alert('Pilih siswa yang dirujuk!');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    addRujukanBK({
      tanggal: dateStr,
      siswaId: student.id,
      siswaNama: student.nama,
      kelas: student.kelas,
      guruWaliId: currentGuruWali.id,
      guruWaliNama: `${currentGuruWali.nama}, ${currentGuruWali.gelar}`,
      alasanRujukan,
      indikasiMasalah,
      upayaGuruWali
    });

    setIsModalOpen(false);
    setSelectedSiswaId('');
    setAlasanRujukan('');
    setIndikasiMasalah('');
    setUpayaGuruWali('');
  };

  const handleSaveBkResponse = (rujukanId: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    updateRujukanBK(rujukanId, {
      status: bkNewStatus,
      catatanGuruBK: bkResponseNotes,
      tanggalTindakLanjut: dateStr
    });

    setRespondingId(null);
    setBkResponseNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full mb-1 border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Kolaborasi Penanganan Kasus Siswa</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rujukan Bimbingan Konseling (BK) & Waka Kesiswaan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Protokol rujukan resmi bagi siswa yang membutuhkan penanganan khusus lanjutan terkait pelanggaran tata tertib berat, penurunan drastis prestasi belajar, atau masalah psikososial di SMKN 1 Jember.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Disposisi Rujukan BK</span>
          </button>
        </div>
      </div>

      {/* Rujukan List */}
      <div className="space-y-4">
        {rujukanBKList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Tidak ada kasus rujukan aktif</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Seluruh siswa berada dalam pembinaan wajar tingkat kelas oleh Guru Wali.
            </p>
          </div>
        ) : (
          rujukanBKList.map(rujukan => {
            const isResponding = respondingId === rujukan.id;

            return (
              <div
                key={rujukan.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                      Rujukan Resmi BK
                    </span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      Kelas {rujukan.kelas}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {rujukan.tanggal}
                    </span>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    rujukan.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                    rujukan.status === 'Proses Konseling' ? 'bg-blue-100 text-blue-800' :
                    rujukan.status === 'Diterima Guru BK' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {rujukan.status}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{rujukan.siswaNama}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      Alasan Rujukan: <span className="text-rose-700">{rujukan.alasanRujukan}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Indikasi Masalah Teramati:</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {rujukan.indikasiMasalah}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Upaya Awal oleh Guru Wali:</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {rujukan.upayaGuruWali}
                      </p>
                    </div>
                  </div>

                  {/* Respon BK */}
                  {rujukan.catatanGuruBK && (
                    <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-indigo-700" />
                          <span>Tindak Lanjut & Evaluasi Guru BK SMKN 1 Jember:</span>
                        </span>
                        {rujukan.tanggalTindakLanjut && (
                          <span className="text-[10px] text-indigo-700">
                            Diperbarui: {rujukan.tanggalTindakLanjut}
                          </span>
                        )}
                      </div>
                      <p className="text-indigo-900 leading-relaxed">
                        {rujukan.catatanGuruBK}
                      </p>
                    </div>
                  )}

                  {/* Inline Form to Update Response */}
                  {isResponding && (
                    <div className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-3 text-xs animate-fade-in">
                      <h4 className="font-bold text-indigo-950">Update Disposisi Guru BK</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Status Penanganan</label>
                          <select
                            value={bkNewStatus}
                            onChange={(e) => setBkNewStatus(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                          >
                            <option value="Diterima Guru BK">Diterima Guru BK</option>
                            <option value="Proses Konseling">Proses Konseling</option>
                            <option value="Selesai">Selesai (Kasus Teratasi)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Catatan Konseling / Rekomendasi BK</label>
                        <textarea
                          rows={2}
                          value={bkResponseNotes}
                          onChange={(e) => setBkResponseNotes(e.target.value)}
                          placeholder="Masukkan hasil sesi konseling atau arahan bagi Guru Wali..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRespondingId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSaveBkResponse(rujukan.id)}
                          className="px-4 py-1.5 bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Simpan Catatan BK
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Diajukan oleh: <strong className="text-slate-600">{rujukan.guruWaliNama}</strong>
                  </span>

                  {!isResponding && (
                    <button
                      onClick={() => {
                        setRespondingId(rujukan.id);
                        setBkResponseNotes(rujukan.catatanGuruBK || '');
                        setBkNewStatus(rujukan.status);
                      }}
                      className="text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Update Catatan Guru BK &rarr;
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal Input Disposisi Rujukan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 overflow-hidden">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Disposisi Rujukan ke Guru BK</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRujukan} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pilih Siswa yang Dirujuk *
                </label>
                <select
                  value={selectedSiswaId}
                  onChange={(e) => setSelectedSiswaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {kelasSiswa.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nisn} - {s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan Pokok Rujukan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Penurunan drastis nilai akademik, dugaan adiksi gadget, atau konflik antarteman"
                  value={alasanRujukan}
                  onChange={(e) => setAlasanRujukan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Indikasi Masalah yang Teramati *
                </label>
                <textarea
                  rows={3}
                  placeholder="Uraikan fakta kejadian, perubahan sikap, atau keluhan dari guru mata pelajaran..."
                  value={indikasiMasalah}
                  onChange={(e) => setIndikasiMasalah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Upaya Awal yang Telah Dilakukan Guru Wali *
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Konseling tatap muka tingkat kelas, teguran lisan, dan menghubungi wali murid..."
                  value={upayaGuruWali}
                  onChange={(e) => setUpayaGuruWali(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Kirim Disposisi ke BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
