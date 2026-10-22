import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  GraduationCap
} from 'lucide-react';
import { parseGuruWaliExcel, downloadTemplateGuruWaliExcel } from '../../utils/excelUtils';
import { GuruWali } from '../../types';

interface ModalImportGuruWaliExcelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (guruList: GuruWali[], replaceExisting: boolean) => void;
}

export const ModalImportGuruWaliExcel: React.FC<ModalImportGuruWaliExcelProps> = ({
  isOpen,
  onClose,
  onConfirmImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Partial<GuruWali>[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const processFile = async (f: File) => {
    setFile(f);
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await parseGuruWaliExcel(f);
      if (rows.length === 0) {
        setErrorMsg('Tidak ditemukan data baris guru wali yang valid dalam file Excel tersebut.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setErrorMsg(`Gagal membaca file Excel: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (parsedRows.length === 0) return;
    const formatted: GuruWali[] = parsedRows.map((r, i) => ({
      id: r.id || `gw-imp-${Date.now()}-${i}`,
      nip: r.nip || `19850101${Date.now() + i}`,
      nama: r.nama || 'Guru Wali',
      gelar: r.gelar || 'S.Pd',
      kelas: r.kelas || 'X KKBT',
      jurusan: r.jurusan || 'Kriya Kreatif Batik dan Tekstil',
      telepon: r.telepon || '081234567890',
      email: r.email || `guru.${i}@smkn1jember.sch.id`,
      bio: r.bio || `Guru Wali Kelas ${r.kelas || 'X'} SMKN 1 Jember.`,
      avatar: r.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }));

    onConfirmImport(formatted, replaceExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Import Data Guru Wali & Wali Kelas (.xlsx / .csv)
              </h3>
              <p className="text-xs text-blue-200">
                Fitur Eksklusif Admin • Terhubung dengan Database Google Sheets
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Template Download Notification */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-900">
              <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Format kolom: NIP, Nama Lengkap, Gelar, Wali Kelas, Program Keahlian, No Telepon / WA, Email Resmi, Profil Singkat</span>
            </div>
            <button
              onClick={downloadTemplateGuruWaliExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {file ? file.name : 'Pilih file Excel (.xlsx) Guru Wali atau Tarik ke sini'}
            </p>
            <p className="text-[11px] text-slate-500">
              Mendukung file Excel spreadsheet dan CSV
            </p>
          </div>

          {loading && (
            <div className="text-center py-4 text-blue-700 font-semibold flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Sedang membaca data Guru Wali dari Excel...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ditemukan {parsedRows.length} Guru Wali Siap Diimpor:</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Pratinjau data
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-48">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">NIP</th>
                      <th className="p-2">Nama Lengkap</th>
                      <th className="p-2">Gelar</th>
                      <th className="p-2">Wali Kelas</th>
                      <th className="p-2">Program Keahlian</th>
                      <th className="p-2">Telepon / WA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-slate-800">{row.nip}</td>
                        <td className="p-2 font-bold text-slate-900">{row.nama}</td>
                        <td className="p-2">{row.gelar}</td>
                        <td className="p-2 text-blue-700 font-bold">{row.kelas}</td>
                        <td className="p-2 text-slate-600">{row.jurusan}</td>
                        <td className="p-2 font-mono">{row.telepon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mode Replace vs Merge */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="replaceGuruOption"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="replaceGuruOption" className="text-slate-700 cursor-pointer font-medium">
                  <strong>Ganti seluruh daftar guru wali</strong> dengan file Excel ini (Bila tidak dicentang, hanya akan menambahkan guru baru yang NIP-nya belum terdaftar).
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              parsedRows.length > 0
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Impor {parsedRows.length} Guru Wali Sekarang</span>
          </button>
        </div>

      </div>
    </div>
  );
};
