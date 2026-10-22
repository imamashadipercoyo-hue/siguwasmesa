import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FileCode,
  ExternalLink,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../data/appsScriptCode';

interface PanduanAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyUrl?: (url: string) => void;
}

export const PanduanAppsScriptModal: React.FC<PanduanAppsScriptModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'langkah' | 'kode'>('langkah');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Panduan Integrasi Google Sheets & Apps Script
              </h3>
              <p className="text-xs text-emerald-200">
                Setup database cloud gratis, aman, dan tersinkronisasi real-time untuk SMKN 1 Jember
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('langkah')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
              activeTab === 'langkah'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Langkah Instalasi Mudah (5 Menit)
          </button>
          <button
            onClick={() => setActiveTab('kode')}
            className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'kode'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Lihat & Salin Kode Backend (Code.gs)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          
          {activeTab === 'langkah' ? (
            <div className="space-y-4">
              
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-emerald-900 text-sm">
                    Keuntungan Backend Google Sheets untuk SMKN 1 Jember:
                  </h4>
                  <p className="text-emerald-800 mt-1">
                    Gratis selamanya, tanpa biaya server bulanan, data tersimpan langsung di Google Drive akun sekolah, dan otomatis membuat tabel <strong>Siswa, GuruWali, Akun, Jurnal, Presensi, RujukanBK, Jadwal</strong> secara otomatis!
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">
                    Buat Spreadsheet Baru di Google Drive
                  </h5>
                  <p className="text-slate-600">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> pada peramban Anda. Beri nama file spreadsheet, misalnya: <strong>DB_SIGUWA_SMKN1_JEMBER</strong>. Anda tidak perlu membuat tabel manual, skrip akan membuatnya otomatis.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">
                    Buka Editor Google Apps Script
                  </h5>
                  <p className="text-slate-600">
                    Pada menu atas Spreadsheet, klik menu <strong>Ekstensi (Extensions)</strong> &rarr; pilih <strong>Apps Script</strong>. Jendela editor kode Google Apps Script akan terbuka.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-2 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">
                    Salin & Tempel Kode Backend (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">Code.gs</code>)
                  </h5>
                  <p className="text-slate-600">
                    Hapus kode default yang ada di dalam file <code className="font-mono">Code.gs</code>, lalu klik tombol di bawah ini dan tempelkan (Paste) seluruh isinya ke editor. Jangan lupa klik tombol <strong>Simpan (ikon disket)</strong>.
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Seluruh Kode Code.gs'}</span>
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">
                    Terapkan sebagai Aplikasi Web (Deploy as Web App)
                  </h5>
                  <p className="text-slate-600">
                    Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &rarr; pilih <strong>Deployment baru (New deployment)</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-1">
                    <li>Pilih jenis deployment: <strong>Aplikasi web (Web app)</strong></li>
                    <li>Jalankan sebagai (Execute as): <strong>Saya (Me)</strong></li>
                    <li>Siapa yang memiliki akses (Who has access): <strong>Siapa saja (Anyone)</strong> <em>(Penting agar web app SIGUWA dapat bertukar data tanpa blokir login)</em></li>
                  </ul>
                  <p className="text-slate-500 text-[11px] pt-1">
                    Klik <strong>Terapkan (Deploy)</strong>. Jika muncul pop-up izin Google, klik <em>Beri Akses (Authorize access)</em> &rarr; pilih akun Google Anda &rarr; <em>Lanjutan (Advanced)</em> &rarr; <em>Buka (tidak aman)</em>.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0">
                  5
                </div>
                <div className="space-y-1 flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">
                    Salin URL Aplikasi Web & Masukkan ke SIGUWA
                  </h5>
                  <p className="text-slate-600">
                    Salin <strong>URL Aplikasi Web (Web app URL)</strong> yang diawali <code className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">https://script.google.com/macros/s/.../exec</code>. Tempelkan URL tersebut pada kolom input di tab <strong>Google Sheets</strong> dan klik <strong>Test & Sinkronisasi</strong>.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Isi Lengkap File <code className="font-mono text-emerald-800">Code.gs</code>:
                </span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kode Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[50vh] leading-relaxed border border-slate-800">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dibutuhkan hanya 1 kali setup untuk seluruh guru wali & wali murid SMKN 1 Jember.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
