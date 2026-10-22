import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  MessageCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { PresensiStatus, Siswa } from '../types';

export const PresensiView: React.FC = () => {
  const {
    currentGuruWali,
    siswaList,
    presensiList,
    savePresensiHarian
  } = useApp();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [selectedTanggal, setSelectedTanggal] = useState<string>(todayStr);
  const [selectedKelas, setSelectedKelas] = useState<string>(currentGuruWali.kelas);
  const [isSaved, setIsSaved] = useState(false);

  // Filter students for the selected class
  const classStudents = siswaList.filter(s => s.kelas === selectedKelas);

  // Status map for each student on selectedTanggal
  const [statusMap, setStatusMap] = useState<Record<string, { status: PresensiStatus; keterangan: string }>>({});

  // Sync state whenever tanggal or kelas changes
  useEffect(() => {
    const newMap: Record<string, { status: PresensiStatus; keterangan: string }> = {};
    classStudents.forEach(s => {
      const existing = presensiList.find(p => p.tanggal === selectedTanggal && p.siswaId === s.id);
      if (existing) {
        newMap[s.id] = { status: existing.status, keterangan: existing.keterangan || '' };
      } else {
        // Default to 'H'
        newMap[s.id] = { status: 'H', keterangan: '' };
      }
    });
    setStatusMap(newMap);
    setIsSaved(false);
  }, [selectedTanggal, selectedKelas, siswaList, presensiList]);

  const handleStatusChange = (siswaId: string, status: PresensiStatus) => {
    setStatusMap(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], status }
    }));
    setIsSaved(false);
  };

  const handleKeteranganChange = (siswaId: string, keterangan: string) => {
    setStatusMap(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], keterangan }
    }));
    setIsSaved(false);
  };

  const markAllHadir = () => {
    const updated: Record<string, { status: PresensiStatus; keterangan: string }> = {};
    classStudents.forEach(s => {
      updated[s.id] = { status: 'H', keterangan: '' };
    });
    setStatusMap(updated);
    setIsSaved(false);
  };

  const handleSave = () => {
    savePresensiHarian(selectedTanggal, selectedKelas, statusMap);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Hitung summary hari terpilih
  const currentSummary = {
    h: Object.values(statusMap).filter(v => v.status === 'H').length,
    s: Object.values(statusMap).filter(v => v.status === 'S').length,
    i: Object.values(statusMap).filter(v => v.status === 'I').length,
    a: Object.values(statusMap).filter(v => v.status === 'A').length,
  };

  // Rekapitulasi per siswa dalam semua riwayat presensi
  const studentRecap = classStudents.map(student => {
    const records = presensiList.filter(p => p.siswaId === student.id);
    const total = records.length || 1;
    const h = records.filter(p => p.status === 'H').length;
    const s = records.filter(p => p.status === 'S').length;
    const i = records.filter(p => p.status === 'I').length;
    const a = records.filter(p => p.status === 'A').length;
    const rate = Math.round((h / total) * 100);

    return {
      student,
      total,
      h, s, i, a,
      rate
    };
  });

  const handleSendWAWarning = (student: Siswa, reason: string) => {
    if (!student.noHpOrtu) {
      alert('Nomor HP Orang Tua belum terdaftar.');
      return;
    }
    const cleanPhone = student.noHpOrtu.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const message = `Yth. Bapak/Ibu ${student.namaOrtu} (Wali dari ananda ${student.nama} - Kelas ${student.kelas} SMKN 1 Jember).\n\nKami menginformasikan presensi ananda pada tanggal ${selectedTanggal} tercatat: ${reason}.\nMohon konfirmasi atau bila ada kendala kesehatan/keluarga dapat segera menghubungi kami.\n\nTerima kasih,\n${currentGuruWali.nama}, ${currentGuruWali.gelar}\nGuru Wali SMKN 1 Jember\nJl. Jambu No. 17 Patrang - Jember`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1 border border-emerald-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Manajemen Presensi Harian Digital</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Presensi & Pemantauan Kehadiran Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Pencatatan presensi terhubung real-time ke portal orang tua. Siswa alpa atau sakit dapat segera dikoordinasikan demi keselamatan dan kedisiplinan.
            </p>
          </div>

          {/* Quick Date and Class Picker */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {Array.from(new Set(siswaList.map(s => s.kelas))).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tanggal Presensi</label>
              <input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              />
            </div>

            <div className="pt-3.5">
              <button
                onClick={markAllHadir}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                title="Tandai semua siswa hadir"
              >
                Set Semua Hadir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        {/* Day Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-slate-800">
              Presensi Tanggal <span className="text-blue-700">{selectedTanggal}</span> ({classStudents.length} Siswa)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold">
              {currentSummary.h} Hadir
            </span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg font-bold">
              {currentSummary.s} Sakit
            </span>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg font-bold">
              {currentSummary.i} Izin
            </span>
            <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-lg font-bold">
              {currentSummary.a} Alpa
            </span>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Nama Siswa & NISN</th>
                <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                <th className="py-2.5 px-3">Keterangan / Alasan</th>
                <th className="py-2.5 px-3 text-right">Kontak Ortu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {classStudents.map((siswa, idx) => {
                const currentRecord = statusMap[siswa.id] || { status: 'H', keterangan: '' };

                return (
                  <tr key={siswa.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                    
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{siswa.nama}</p>
                      <p className="text-[10px] text-slate-500 font-mono">NISN: {siswa.nisn}</p>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(siswa.id, 'H')}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            currentRecord.status === 'H'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                          title="Hadir"
                        >
                          H
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(siswa.id, 'S')}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            currentRecord.status === 'S'
                              ? 'bg-amber-500 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-800'
                          }`}
                          title="Sakit"
                        >
                          S
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(siswa.id, 'I')}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            currentRecord.status === 'I'
                              ? 'bg-blue-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-800'
                          }`}
                          title="Izin"
                        >
                          I
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(siswa.id, 'A')}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            currentRecord.status === 'A'
                              ? 'bg-rose-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-800'
                          }`}
                          title="Alpa / Tanpa Keterangan"
                        >
                          A
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder={
                          currentRecord.status === 'S' ? 'Contoh: Sakit demam ada surat dokter' :
                          currentRecord.status === 'I' ? 'Contoh: Izin acara keluarga' :
                          currentRecord.status === 'A' ? 'Alpa / Tidak ada kabar dari orang tua' :
                          'Keterangan (opsional)'
                        }
                        value={currentRecord.keterangan}
                        onChange={(e) => handleKeteranganChange(siswa.id, e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          currentRecord.status === 'A' ? 'border-rose-300 bg-rose-50/50' :
                          currentRecord.status === 'S' ? 'border-amber-300 bg-amber-50/50' :
                          currentRecord.status === 'I' ? 'border-blue-300 bg-blue-50/50' :
                          'border-slate-200 bg-slate-50'
                        } focus:outline-blue-600`}
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      {currentRecord.status !== 'H' ? (
                        <button
                          onClick={() => handleSendWAWarning(siswa, currentRecord.status === 'A' ? 'Alpa (Tanpa Keterangan)' : currentRecord.status === 'S' ? 'Sakit' : 'Izin')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-lg cursor-pointer"
                          title="Kirim pesan konfirmasi kehadiran ke WhatsApp Orang Tua"
                        >
                          <Send className="w-3 h-3 text-emerald-600" />
                          <span>WA Ortu</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {siswa.noHpOrtu}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Save Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Hasil presensi langsung terlihat di akun wali murid pada portal SIGUWA.</span>
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Presensi berhasil disimpan!</span>
              </span>
            )}

            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Presensi Hari Ini</span>
            </button>
          </div>
        </div>

      </div>

      {/* Rekapitulasi Kehadiran Akumulatif per Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Rekapitulasi Akumulasi Kehadiran Siswa ({selectedKelas})
          </h3>
          <p className="text-xs text-slate-500">
            Pemantauan tingkat kedisiplinan dan deteksi dini siswa dengan alpa berturut-turut
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {studentRecap.map(item => {
            const isWarning = item.rate < 85 || item.a >= 2;

            return (
              <div
                key={item.student.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                  isWarning
                    ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">
                      {item.student.nama}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      NISN: {item.student.nisn}
                    </p>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    item.rate >= 95 ? 'bg-emerald-100 text-emerald-800' :
                    item.rate >= 85 ? 'bg-blue-100 text-blue-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {item.rate}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <span className="text-emerald-700 font-semibold">{item.h} H</span>
                  <span className="text-amber-700 font-semibold">{item.s} S</span>
                  <span className="text-blue-700 font-semibold">{item.i} I</span>
                  <span className="text-rose-700 font-bold">{item.a} A</span>
                </div>

                {isWarning && (
                  <div className="text-[10px] font-bold text-rose-700 bg-rose-100/70 p-1.5 rounded flex items-center justify-between">
                    <span>⚠️ Perlu Pemanggilan Ortu</span>
                    <button
                      onClick={() => handleSendWAWarning(item.student, `Akumulasi alpa telah mencapai ${item.a} kali`)}
                      className="text-rose-900 underline font-extrabold cursor-pointer"
                    >
                      Kirim WA
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
