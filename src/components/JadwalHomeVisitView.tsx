import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  MapPin,
  Users,
  FileText,
  AlertCircle,
  Share2,
  Trash2,
  Check
} from 'lucide-react';
import { JadwalPertemuan } from '../types';

interface JadwalHomeVisitViewProps {
  onOpenPrintLetter?: (type: 'home_visit' | 'panggilan', jadwalData: JadwalPertemuan) => void;
}

export const JadwalHomeVisitView: React.FC<JadwalHomeVisitViewProps> = ({ onOpenPrintLetter }) => {
  const {
    currentGuruWali,
    siswaList,
    jadwalList,
    addJadwal,
    updateJadwal,
    deleteJadwal
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jenisPertemuan, setJenisPertemuan] = useState<JadwalPertemuan['jenisPertemuan']>('Home Visit');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [tempat, setTempat] = useState('');
  const [agenda, setAgenda] = useState('');

  // Complete meeting modal
  const [completingJadwal, setCompletingJadwal] = useState<JadwalPertemuan | null>(null);
  const [hasilCatatan, setHasilCatatan] = useState('');

  const kelasSiswa = siswaList.filter(s => s.kelas === currentGuruWali.kelas);

  const handleCreateJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const student = siswaList.find(s => s.id === selectedSiswaId);
    if (!student) {
      alert('Pilih siswa terkait!');
      return;
    }

    addJadwal({
      tanggal,
      jam: jam ? `${jam} WIB` : '09:00 WIB',
      jenisPertemuan,
      siswaId: student.id,
      siswaNama: student.nama,
      orangTuaNama: student.namaOrtu,
      tempat: tempat || (jenisPertemuan === 'Home Visit' ? student.alamat : 'Ruang Guru Wali SMKN 1 Jember'),
      agenda,
      status: 'Terjadwal'
    });

    setIsModalOpen(false);
    setSelectedSiswaId('');
    setTanggal('');
    setJam('');
    setTempat('');
    setAgenda('');
  };

  const handleSaveCompletion = () => {
    if (!completingJadwal) return;
    updateJadwal(completingJadwal.id, {
      status: 'Terlaksana',
      catatanHasil: hasilCatatan
    });
    setCompletingJadwal(null);
    setHasilCatatan('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full mb-1 border border-purple-200">
              <Home className="w-3.5 h-3.5" />
              <span>Jadwal Koordinasi Orang Tua & Home Visit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Agenda Pertemuan Rutin & Kunjungan Rumah
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Penjadwalan transparan kunjungan rumah (Home Visit) ke kediaman siswa di wilayah Jember serta pemanggilan orang tua ke sekolah demi transparansi pembinaan.
            </p>
          </div>

          <button
            onClick={() => {
              const now = new Date();
              setTanggal(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
              setJam('09:00');
              setIsModalOpen(true);
            }}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Pertemuan Baru</span>
          </button>
        </div>
      </div>

      {/* Grid List Jadwal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jadwalList.map(jadwal => (
          <div
            key={jadwal.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3.5 flex flex-col justify-between ${
              jadwal.status === 'Terlaksana'
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${
                  jadwal.jenisPertemuan === 'Home Visit'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : jadwal.jenisPertemuan === 'Panggilan Orang Tua'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {jadwal.jenisPertemuan}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  jadwal.status === 'Terlaksana'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {jadwal.status}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {jadwal.siswaNama}
                </h3>
                <p className="text-xs text-slate-500">
                  Orang Tua: <strong className="text-slate-700">{jadwal.orangTuaNama}</strong>
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="font-bold text-slate-800">{jadwal.tanggal} ({jadwal.jam})</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{jadwal.tempat}</span>
                </div>
              </div>

              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Agenda Pembahasan:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {jadwal.agenda}
                </p>
              </div>

              {jadwal.catatanHasil && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs space-y-0.5">
                  <span className="font-bold text-emerald-900 block">Hasil & Notulen Pertemuan:</span>
                  <p className="text-emerald-950 leading-relaxed italic">
                    "{jadwal.catatanHasil}"
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (window.confirm('Hapus jadwal pertemuan ini?')) {
                    deleteJadwal(jadwal.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                title="Hapus jadwal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                {jadwal.status === 'Terjadwal' ? (
                  <button
                    onClick={() => {
                      setCompletingJadwal(jadwal);
                      setHasilCatatan('');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Tandai Terlaksana</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Jadwalkan Pertemuan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 overflow-hidden">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Jadwalkan Temu Wali / Home Visit</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJadwal} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jenis Agenda Pertemuan *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Home Visit',
                    'Panggilan Orang Tua',
                    'Konsultasi Rutin',
                    'Konferensi Kasus BK'
                  ].map(jenis => (
                    <button
                      type="button"
                      key={jenis}
                      onClick={() => setJenisPertemuan(jenis as any)}
                      className={`p-2.5 rounded-xl border text-left font-bold cursor-pointer transition-all ${
                        jenisPertemuan === jenis
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {jenis}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Siswa *</label>
                <select
                  value={selectedSiswaId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setSelectedSiswaId(sid);
                    const stu = siswaList.find(s => s.id === sid);
                    if (stu && jenisPertemuan === 'Home Visit') {
                      setTempat(stu.alamat);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {kelasSiswa.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kelas} - Wali: {s.namaOrtu})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jam (WIB)</label>
                  <input
                    type="time"
                    value={jam}
                    onChange={(e) => setJam(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tempat / Lokasi</label>
                <input
                  type="text"
                  placeholder="Rumah siswa di Patrang/Kaliwates atau Ruang Guru Wali SMKN 1 Jember"
                  value={tempat}
                  onChange={(e) => setTempat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Agenda Pembahasan *</label>
                <textarea
                  rows={3}
                  placeholder="Uraikan tujuan dan topik utama yang akan dibahas bersama wali murid..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
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
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Berita Acara Penyelesaian */}
      {completingJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-6 overflow-hidden">
            <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Catatan Hasil & Berita Acara Pertemuan</h3>
              <button
                onClick={() => setCompletingJadwal(null)}
                className="text-white/80 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Pertemuan dengan wali murid dari <strong>{completingJadwal.siswaNama}</strong> pada tanggal {completingJadwal.tanggal}.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Hasil Kesepakatan / Notulen Pertemuan *
                </label>
                <textarea
                  rows={4}
                  value={hasilCatatan}
                  onChange={(e) => setHasilCatatan(e.target.value)}
                  placeholder="Tuliskan respon orang tua, kesepakatan bersama, atau solusi yang disetujui..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletingJadwal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompletion}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Hasil Pertemuan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
