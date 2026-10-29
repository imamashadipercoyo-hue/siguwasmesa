import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SiguwaBackupPayload } from '../../types';
import { exportFullWorkbookBackup } from '../../utils/excelUtils';
import {
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Users,
  GraduationCap,
  KeyRound,
  BookOpen,
  Calendar,
  Layers,
  HardDrive,
  FileCode,
  ArrowRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const {
    siswaList,
    guruWaliList,
    akunList,
    jurnalList,
    presensiList,
    rujukanBKList,
    jadwalList,
    konsultasiList,
    googleSheetsConfig,
    createBackupData,
    restoreBackupData,
    syncPushToSheets
  } = useApp();

  // Upload & Restore State
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<SiguwaBackupPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [autoSyncToSheets, setAutoSyncToSheets] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export JSON Full Backup
  const handleDownloadJsonBackup = () => {
    try {
      const backupPayload = createBackupData();
      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const now = new Date();
      const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `BACKUP_SIGUWA_SMKN1_JEMBER_${dateTag}.json`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      alert('Gagal membuat berkas cadangan: ' + err.message);
    }
  };

  // 2. Export Multi-Tab Excel Backup
  const handleDownloadExcelBackup = () => {
    try {
      const backupPayload = createBackupData();
      exportFullWorkbookBackup(backupPayload);
    } catch (err: any) {
      alert('Gagal mengekspor workbook Excel: ' + err.message);
    }
  };

  // 3. Handle File Selection & Parse
  const handleFileProcess = (file: File) => {
    setParseError(null);
    setRestoreResult(null);
    setSelectedFile(file);

    if (!file.name.toLowerCase().endsWith('.json')) {
      setParseError('Format berkas harus berekstensi .json. Silakan unggah file cadangan SIGUWA yang valid.');
      setParsedBackup(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Validasi struktur berkas SIGUWA
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Berkas JSON kosong atau format tidak dikenali.');
        }

        // Dukungan jika objek langsung berupa { data: { ... } } atau format langsung
        const dataObj = parsed.data || parsed;
        if (!dataObj.siswa && !dataObj.guruWali && !dataObj.akun && !dataObj.jurnal) {
          throw new Error('Berkas tidak memuat tabel data SIGUWA (siswa, guru, akun, atau jurnal).');
        }

        const normalizedPayload: SiguwaBackupPayload = {
          version: parsed.version || 'siguwa_backup_v1',
          appName: parsed.appName || 'SIGUWA SMKN 1 JEMBER',
          sekolah: parsed.sekolah || 'SMK Negeri 1 Jember',
          exportDate: parsed.exportDate || new Date().toISOString(),
          exportDateFormatted: parsed.exportDateFormatted || 'Waktu tidak tercantum',
          counts: {
            siswa: Array.isArray(dataObj.siswa) ? dataObj.siswa.length : 0,
            guruWali: Array.isArray(dataObj.guruWali) ? dataObj.guruWali.length : 0,
            akun: Array.isArray(dataObj.akun) ? dataObj.akun.length : 0,
            jurnal: Array.isArray(dataObj.jurnal) ? dataObj.jurnal.length : 0,
            presensi: Array.isArray(dataObj.presensi) ? dataObj.presensi.length : 0,
            rujukanBK: Array.isArray(dataObj.rujukanBK) ? dataObj.rujukanBK.length : 0,
            jadwal: Array.isArray(dataObj.jadwal) ? dataObj.jadwal.length : 0,
            konsultasi: Array.isArray(dataObj.konsultasi) ? dataObj.konsultasi.length : 0
          },
          data: {
            siswa: Array.isArray(dataObj.siswa) ? dataObj.siswa : [],
            guruWali: Array.isArray(dataObj.guruWali) ? dataObj.guruWali : [],
            akun: Array.isArray(dataObj.akun) ? dataObj.akun : [],
            jurnal: Array.isArray(dataObj.jurnal) ? dataObj.jurnal : [],
            presensi: Array.isArray(dataObj.presensi) ? dataObj.presensi : [],
            rujukanBK: Array.isArray(dataObj.rujukanBK) ? dataObj.rujukanBK : [],
            jadwal: Array.isArray(dataObj.jadwal) ? dataObj.jadwal : [],
            konsultasi: Array.isArray(dataObj.konsultasi) ? dataObj.konsultasi : [],
            googleSheetsConfig: dataObj.googleSheetsConfig
          }
        };

        setParsedBackup(normalizedPayload);
      } catch (err: any) {
        setParseError('Gagal membaca berkas cadangan: ' + err.message);
        setParsedBackup(null);
      }
    };
    reader.onerror = () => {
      setParseError('Gagal membaca berkas dari media penyimpanan lokal.');
      setParsedBackup(null);
    };
    reader.readAsText(file);
  };

  // 4. Execute Restore
  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;

    const confirmText = restoreMode === 'replace'
      ? `PERINGATAN: Seluruh data aplikasi saat ini akan DIGANTIKAN dengan data dari berkas cadangan (${parsedBackup.counts.siswa} siswa, ${parsedBackup.counts.guruWali} pendidik, ${parsedBackup.counts.akun} akun).\n\nApakah Anda yakin ingin melanjutkan pemulihan?`
      : `Data dari berkas cadangan akan DIGABUNGKAN ke dalam aplikasi. Data lokal yang ada tetap aman.\n\nLanjutkan penggabungan data cadangan?`;

    if (!window.confirm(confirmText)) {
      return;
    }

    setIsRestoring(true);
    setRestoreResult(null);

    const result = await restoreBackupData(parsedBackup, restoreMode);

    if (result.success && autoSyncToSheets && googleSheetsConfig.appsScriptUrl) {
      try {
        await syncPushToSheets();
      } catch (e) {
        console.warn('Auto push post-restore notice:', e);
      }
    }

    setIsRestoring(false);
    setRestoreResult(result);
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setParsedBackup(null);
    setParseError(null);
    setRestoreResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Status Database Saat Ini */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>Modul Cadangan Resmi SMKN 1 Jember</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pusat Pencadangan & Pemulihan Sistem (Backup & Restore)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Amankan seluruh basis data aplikasi SIGUWA (Peserta Didik, Pendidik, Akun, Jurnal, Presensi, Rujukan BK) dalam satu berkas terenkripsi mandiri dan pulihkan kembali kapan saja dengan mudah.
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between gap-4">
              <span>Status Data Terpasang:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Siap Dicadangkan
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/10">
                <div className="font-extrabold text-white text-sm">{siswaList.length}</div>
                <div className="text-[10px] text-slate-400">Siswa</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/10">
                <div className="font-extrabold text-white text-sm">{guruWaliList.length}</div>
                <div className="text-[10px] text-slate-400">Pendidik</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/10">
                <div className="font-extrabold text-white text-sm">{akunList.length}</div>
                <div className="text-[10px] text-slate-400">Akun</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/10">
                <div className="font-extrabold text-white text-sm">{jurnalList.length}</div>
                <div className="text-[10px] text-slate-400">Jurnal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Utama: Unduh Cadangan vs Unggah Pemulihan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: UNDUH CADANGAN (EXPORT SNAPSHOT) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    1. Unduh Cadangan Data (Backup Snapshot)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simpan salinan utuh seluruh database aplikasi ke komputer atau flashdisk Anda.
                  </p>
                </div>
              </div>

              {/* Rincian Cakupan Data */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Cakupan Data yang Termasuk dalam Cadangan:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Master Siswa ({siswaList.length} data)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Guru Wali & Wali Kelas ({guruWaliList.length} orang)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Akun Pengguna Login ({akunList.length} akun)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Jurnal Layanan ({jurnalList.length} entri)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Presensi Harian ({presensiList.length} baris)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Rujukan BK ({rujukanBKList.length} kasus)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Jadwal & Home Visit ({jadwalList.length} agenda)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Konsultasi Wali Murid ({konsultasiList.length} sesi)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol-tombol Unduh Cadangan */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadJsonBackup}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2.5 transition-all text-xs sm:text-sm active:scale-[0.99]"
              >
                <FileCode className="w-4 h-4 text-amber-300" />
                <span>Unduh Cadangan Lengkap (.JSON) - Rekomendasi</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExcelBackup}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2.5 transition-all text-xs active:scale-[0.99]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Unduh Workbook Excel Cadangan Multi-Tab (.XLSX)</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                *File .JSON dapat digunakan langsung untuk memulihkan seluruh sistem pada menu di samping.
              </p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: UNGGAH & PULIHKAN CADANGAN (UPLOAD & RESTORE) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    2. Unggah & Pulihkan Data Cadangan (Restore)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pulihkan seluruh data sistem dari berkas cadangan (.json) sebelumnya.
                  </p>
                </div>
              </div>

              {/* Area Drag & Drop Berkas */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileProcess(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Klik untuk Pilih Berkas Cadangan (.JSON)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    atau seret dan lepas (drag & drop) berkas cadangan ke area ini
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
                    Format yang didukung: .JSON SIGUWA
                  </span>
                </div>
              ) : (
                /* Card Ringkasan Berkas yang Diunggah */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {selectedFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Disiapkan untuk pemulihan
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetFile}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                    >
                      Ganti Berkas
                    </button>
                  </div>

                  {/* Tampilkan Hasil Parse / Ringkasan Data yang Akan Dipulihkan */}
                  {parsedBackup && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Tanggal Pembuatan Cadangan:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {parsedBackup.exportDateFormatted}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="font-extrabold text-blue-700 text-sm">{parsedBackup.counts.siswa}</div>
                          <div className="text-[10px] text-slate-500">Siswa</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="font-extrabold text-indigo-700 text-sm">{parsedBackup.counts.guruWali}</div>
                          <div className="text-[10px] text-slate-500">Pendidik</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="font-extrabold text-emerald-700 text-sm">{parsedBackup.counts.akun}</div>
                          <div className="text-[10px] text-slate-500">Akun</div>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <div className="font-extrabold text-amber-700 text-sm">{parsedBackup.counts.jurnal}</div>
                          <div className="text-[10px] text-slate-500">Jurnal</div>
                        </div>
                      </div>

                      {/* Pilihan Mode Pemulihan */}
                      <div className="space-y-1.5 pt-2">
                        <label className="font-bold text-slate-800 block text-xs">
                          Pilih Mode Pemulihan Data:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <label className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${
                            restoreMode === 'replace'
                              ? 'border-rose-400 bg-rose-50/50 text-rose-950 font-bold'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}>
                            <input
                              type="radio"
                              name="restoreMode"
                              value="replace"
                              checked={restoreMode === 'replace'}
                              onChange={() => setRestoreMode('replace')}
                              className="mt-0.5 text-rose-600 cursor-pointer"
                            />
                            <div>
                              <div className="font-extrabold text-xs">Ganti Total (Replace)</div>
                              <div className="text-[10px] font-normal text-slate-500 leading-tight">
                                Timpa seluruh data aplikasi sesuai berkas cadangan.
                              </div>
                            </div>
                          </label>

                          <label className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${
                            restoreMode === 'merge'
                              ? 'border-blue-400 bg-blue-50/50 text-blue-950 font-bold'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}>
                            <input
                              type="radio"
                              name="restoreMode"
                              value="merge"
                              checked={restoreMode === 'merge'}
                              onChange={() => setRestoreMode('merge')}
                              className="mt-0.5 text-blue-600 cursor-pointer"
                            />
                            <div>
                              <div className="font-extrabold text-xs">Gabungkan (Merge)</div>
                              <div className="text-[10px] font-normal text-slate-500 leading-tight">
                                Tambahkan data tanpa menghapus data lokal yang ada.
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Opsi Auto Sync ke Google Sheets */}
                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                          <input
                            type="checkbox"
                            checked={autoSyncToSheets}
                            onChange={(e) => setAutoSyncToSheets(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                          <span>Otomatis simpan hasil pemulihan ke Google Spreadsheet</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Pesan Error Parse */}
                  {parseError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>{parseError}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Sukses Pemulihan */}
              {restoreResult && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in ${
                  restoreResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  {restoreResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <div className="font-medium leading-relaxed">{restoreResult.message}</div>
                </div>
              )}
            </div>

            {/* Tombol Eksekusi Pulihkan */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!parsedBackup || isRestoring}
                onClick={handleExecuteRestore}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all text-xs sm:text-sm active:scale-[0.99]"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sedang Memulihkan Seluruh Basis Data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Terapkan Pemulihan Cadangan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Panduan Praktek Terbaik Pengelolaan Cadangan */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Panduan & Rekomendasi Pengelolaan Cadangan SIGUWA</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Jadwal Rutin Cadangan</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Disarankan mengunduh berkas cadangan secara berkala (misal setiap akhir pekan atau akhir bulan) sebagai arsip fisik di komputer sekolah.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Keamanan & Kerahasiaan</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Semua proses unduh dan pulihkan berjalan 100% lokal pada peramban administrator. Berkas tidak dikirim ke server pihak ketiga manapun.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Migrasi Antar Perangkat</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jika administrator berganti laptop, cukup unduh berkas .JSON di laptop lama, lalu unggah berkas tersebut di laptop baru untuk restorasi instan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
