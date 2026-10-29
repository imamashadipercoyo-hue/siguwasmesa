import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Printer,
  FileText,
  Calendar,
  CheckCircle2,
  Building2,
  Users
} from 'lucide-react';

interface CetakLaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CetakLaporanModal: React.FC<CetakLaporanModalProps> = ({ isOpen, onClose }) => {
  const {
    currentGuruWali,
    siswaList,
    jurnalList,
    presensiList,
    jadwalList,
    schoolProfile
  } = useApp();

  const [jenisLaporan, setJenisLaporan] = useState<'jurnal' | 'presensi' | 'karakter' | 'panggilan'>('jurnal');
  const [periodeBulan, setPeriodeBulan] = useState('Oktober 2026');

  if (!isOpen) return null;

  const kelasSiswa = siswaList.filter(s => s.kelas === currentGuruWali.kelas);
  const classJurnal = jurnalList.filter(j => j.kelas === currentGuruWali.kelas);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-4 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Cetak Dokumen Resmi Guru Wali</h3>
              <p className="text-[11px] text-slate-400">SMKN 1 Jember • Jl. Jambu No.17 Patrang - Jember</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={jenisLaporan}
              onChange={(e) => setJenisLaporan(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <option value="jurnal">1. Laporan Jurnal 4 Layanan</option>
              <option value="presensi">2. Rekapitulasi Presensi Kehadiran</option>
              <option value="karakter">3. Rapor Perkembangan Karakter</option>
              <option value="panggilan">4. Surat Panggilan & Home Visit</option>
            </select>

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 style) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 text-xs font-serif leading-relaxed">
          
          {/* Official Kop Surat SMKN 1 Jember */}
          <div className="border-b-4 border-double border-slate-900 pb-3 text-center mb-6">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Logo Resmi Provinsi Jawa Timur */}
              <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center">
                <img
                  src="https://iili.io/nkNmwes.png"
                  alt="Logo Provinsi Jawa Timur"
                  className="w-14 h-18 sm:w-16 sm:h-20 object-contain"
                />
              </div>

              <div className="flex-1 px-1 sm:px-3 text-center">
                <h4 className="text-xs sm:text-sm uppercase tracking-widest font-sans font-bold text-slate-800">
                  PEMERINTAH PROVINSI JAWA TIMUR
                </h4>
                <h4 className="text-xs sm:text-sm uppercase tracking-widest font-sans font-bold text-slate-800">
                  DINAS PENDIDIKAN
                </h4>
                <h5 className="text-[10px] sm:text-xs uppercase tracking-wider font-sans font-bold text-slate-700">
                  CABANG DINAS PENDIDIKAN WILAYAH JEMBER
                </h5>
                <h2 className="text-base sm:text-xl font-sans font-black tracking-tight text-slate-950 uppercase mt-0.5">
                  {schoolProfile.namaSekolah}
                </h2>
                <p className="text-[10px] sm:text-[11px] font-sans text-slate-600">
                  {schoolProfile.alamatSekolah} Telp. {schoolProfile.teleponSekolah}
                </p>
                <p className="text-[9px] sm:text-[10px] font-sans text-slate-500">
                  Website: {schoolProfile.websiteSekolah} • Email: {schoolProfile.emailSekolah}
                </p>
              </div>

              {/* Logo Resmi SMKN 1 Jember */}
              <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center">
                <img
                  src={schoolProfile.logoSekolah || "https://iili.io/n8W0HZu.md.png"}
                  alt="Logo SMKN 1 Jember"
                  className="w-14 h-18 sm:w-16 sm:h-20 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Document Content based on Type */}

          {/* 1. Laporan Jurnal 4 Layanan */}
          {jenisLaporan === 'jurnal' && (
            <div className="space-y-4">
              <div className="text-center font-sans">
                <h3 className="text-sm font-bold uppercase underline">
                  LAPORAN REKAPITULASI JURNAL LAYANAN GURU WALI
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Kelas: {currentGuruWali.kelas} ({currentGuruWali.jurusan}) • Periode: {periodeBulan}
                </p>
              </div>

              <div className="font-sans text-[11px] grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <p>Guru Wali: <strong>{currentGuruWali.nama}, {currentGuruWali.gelar}</strong></p>
                  <p>NIP: {currentGuruWali.nip}</p>
                </div>
                <div className="text-right">
                  <p>Total Siswa: <strong>{kelasSiswa.length} Siswa</strong></p>
                  <p>Total Catatan Layanan: <strong>{classJurnal.length} Kegiatan</strong></p>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-[11px] font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left w-24">Tanggal/Jam</th>
                    <th className="border border-slate-300 p-2 text-left w-28">Nama Siswa</th>
                    <th className="border border-slate-300 p-2 text-left w-24">Jenis Layanan</th>
                    <th className="border border-slate-300 p-2 text-left">Topik & Uraian Masalah</th>
                    <th className="border border-slate-300 p-2 text-left">Kesepakatan & Tindak Lanjut</th>
                    <th className="border border-slate-300 p-2 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classJurnal.map((j, idx) => (
                    <tr key={j.id} className="align-top">
                      <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2">
                        {j.tanggal}
                        <br />
                        <span className="text-slate-500 text-[10px]">{j.jam} WIB</span>
                      </td>
                      <td className="border border-slate-300 p-2 font-bold">{j.siswaNama}</td>
                      <td className="border border-slate-300 p-2 uppercase text-[10px] font-semibold">
                        Layanan {j.jenisLayanan}
                      </td>
                      <td className="border border-slate-300 p-2">
                        <strong className="block text-slate-900">{j.topik}</strong>
                        <span className="text-slate-600 text-[10px] line-clamp-3">{j.uraian}</span>
                      </td>
                      <td className="border border-slate-300 p-2">
                        <span className="block text-slate-800">{j.hasilKesepakatan || '-'}</span>
                        <span className="text-[10px] text-slate-500 block mt-1">TL: {j.tindakLanjut || '-'}</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-[10px]">
                        {j.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Laporan Rekap Presensi */}
          {jenisLaporan === 'presensi' && (
            <div className="space-y-4 font-sans">
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase underline">
                  LEMBAR REKAPITULASI PRESENSI & KEDISIPLINAN SISWA
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Kelas: {currentGuruWali.kelas} • SMK Negeri 1 Jember
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Nama Siswa</th>
                    <th className="border border-slate-300 p-2 text-center w-24">NISN</th>
                    <th className="border border-slate-300 p-2 text-center w-12">Hadir</th>
                    <th className="border border-slate-300 p-2 text-center w-12">Sakit</th>
                    <th className="border border-slate-300 p-2 text-center w-12">Izin</th>
                    <th className="border border-slate-300 p-2 text-center w-12">Alpa</th>
                    <th className="border border-slate-300 p-2 text-center w-20">% Hadir</th>
                    <th className="border border-slate-300 p-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasSiswa.map((s, idx) => {
                    const records = presensiList.filter(p => p.siswaId === s.id);
                    const total = records.length || 1;
                    const h = records.filter(p => p.status === 'H').length;
                    const sc = records.filter(p => p.status === 'S').length;
                    const iz = records.filter(p => p.status === 'I').length;
                    const al = records.filter(p => p.status === 'A').length;
                    const rate = Math.round((h / total) * 100);

                    return (
                      <tr key={s.id}>
                        <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold">{s.nama}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{s.nisn}</td>
                        <td className="border border-slate-300 p-2 text-center">{h}</td>
                        <td className="border border-slate-300 p-2 text-center">{sc}</td>
                        <td className="border border-slate-300 p-2 text-center">{iz}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-rose-700">{al}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{rate}%</td>
                        <td className="border border-slate-300 p-2 text-[10px] text-slate-600">
                          {al >= 2 ? 'Peringatan ketidakhadiran' : 'Disiplin baik'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Rapor Perkembangan Karakter */}
          {jenisLaporan === 'karakter' && (
            <div className="space-y-4 font-sans">
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase underline">
                  RAPOR EVALUASI PERKEMBANGAN KARAKTER & AKADEMIK SISWA
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Penerapan Profil Pelajar Pancasila • Kelas {currentGuruWali.kelas} SMKN 1 Jember
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Nama Siswa</th>
                    <th className="border border-slate-300 p-2 text-center w-20">Nilai Rerata</th>
                    <th className="border border-slate-300 p-2 text-center w-24">Poin Karakter</th>
                    <th className="border border-slate-300 p-2 text-left">Status Pendampingan</th>
                    <th className="border border-slate-300 p-2 text-left">Catatan Observasi Guru Wali</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasSiswa.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{s.nama}</td>
                      <td className="border border-slate-300 p-2 text-center">{s.nilaiRataRata}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{s.poinKarakter} / 100</td>
                      <td className="border border-slate-300 p-2 font-semibold">{s.statusPendampingan}</td>
                      <td className="border border-slate-300 p-2 text-[10px] text-slate-600">
                        {s.catatanKhusus || 'Menunjukkan perkembangan positif dan kepatuhan terhadap norma sekolah.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Surat Undangan Panggilan Ortu / Home Visit */}
          {jenisLaporan === 'panggilan' && (
            <div className="space-y-4 font-sans text-xs max-w-2xl mx-auto">
              <div className="flex justify-between">
                <div>
                  <p>Nomor : 421.5 / 108 / 101.6.24 / 2026</p>
                  <p>Lamp. : -</p>
                  <p>Hal : <strong>Undangan Koordinasi Perkembangan Siswa</strong></p>
                </div>
                <div className="text-right">
                  <p>Jember, 22 Oktober 2026</p>
                  <p>Kepada Yth.</p>
                  <p>Bapak/Ibu Orang Tua / Wali Siswa</p>
                  <p>di Tempat</p>
                </div>
              </div>

              <div className="pt-4 space-y-3 leading-relaxed">
                <p>Dengan hormat,</p>
                <p>
                  Dalam rangka mewujudkan sinergi pendidikan dan pendampingan karakter peserta didik di SMK Negeri 1 Jember, kami mengundang Bapak/Ibu Wali Murid untuk hadir pada:
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <p>Hari / Tanggal : <strong>Sabtu, 24 Oktober 2026</strong></p>
                  <p>Waktu : <strong>Pukul 09.00 WIB s/d selesai</strong></p>
                  <p>Tempat : <strong>Ruang Guru Wali SMKN 1 Jember (Jl. Jambu No.17 Patrang)</strong></p>
                  <p>Acara : Koordinasi Evaluasi Belajar dan Pemantauan Kedisiplinan Siswa</p>
                </div>

                <p>
                  Mengingat pentingnya agenda tersebut demi masa depan ananda, kehadiran Bapak/Ibu sangat kami harapkan. Atas perhatian dan kerja sama yang baik, kami sampaikan terima kasih.
                </p>
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 font-sans text-xs">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala {schoolProfile.namaSekolah}</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-950">{schoolProfile.namaKepalaSekolah}</p>
              <p className="text-[10px] text-slate-600">NIP. {schoolProfile.nipKepalaSekolah}</p>
            </div>

            <div className="text-center">
              <p>{schoolProfile.kotaTandaTangan}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900">Guru Wali Kelas {currentGuruWali.kelas}</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-950">{currentGuruWali.nama}, {currentGuruWali.gelar}</p>
              <p className="text-[10px] text-slate-600">NIP. {currentGuruWali.nip}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
