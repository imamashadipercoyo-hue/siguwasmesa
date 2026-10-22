import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  KeyRound
} from 'lucide-react';
import { parseAkunExcel, downloadTemplateAkunExcel } from '../../utils/excelUtils';
import { UserAccount } from '../../types';

interface ModalImportAkunExcelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (akunList: UserAccount[], replaceExisting: boolean) => void;
}

export const ModalImportAkunExcel: React.FC<ModalImportAkunExcelProps> = ({
  isOpen,
  onClose,
  onConfirmImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Partial<UserAccount>[]>([]);
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
      const rows = await parseAkunExcel(f);
      if (rows.length === 0) {
        setErrorMsg('Tidak ditemukan data baris akun yang valid dalam file Excel tersebut.');
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
    const formatted: UserAccount[] = parsedRows.map((r, i) => ({
      id: r.id || `usr-imp-${Date.now()}-${i}`,
      username: r.username || `user${i}`,
      nama: r.nama || 'Pengguna Baru',
      email: r.email || `${r.username || i}@smkn1jember.sch.id`,
      role: r.role || 'guru_wali',
      roleLabel: r.roleLabel || 'Guru Wali',
      status: r.status || 'Aktif',
      telepon: r.telepon || '',
      lastLogin: r.lastLogin || '-'
    }));

    onConfirmImport(formatted, replaceExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Import Data Akun Pengguna (.xlsx / .csv)
              </h3>
              <p className="text-xs text-purple-200">
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
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-900">
              <KeyRound className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Format kolom: Username, Nama Pengguna, Email, Kode Role, Role Akses, Status Akun, Kontak Telepon</span>
            </div>
            <button
              onClick={downloadTemplateAkunExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
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
            className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-purple-50/30 space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {file ? file.name : 'Pilih file Excel (.xlsx) Akun Pengguna atau Tarik ke sini'}
            </p>
            <p className="text-[11px] text-slate-500">
              Mendukung file Excel dan CSV akun Admin, Guru Wali, Guru BK, dan Wali Murid
            </p>
          </div>

          {loading && (
            <div className="text-center py-4 text-purple-700 font-semibold flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Sedang membaca data akun dari Excel...</span>
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
                  <span>Ditemukan {parsedRows.length} Akun Siap Diimpor:</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Pratinjau data
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-48">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Username</th>
                      <th className="p-2">Nama Pengguna</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Peran Akses</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Telepon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-800">{row.username}</td>
                        <td className="p-2 font-bold text-slate-900">{row.nama}</td>
                        <td className="p-2 text-slate-600">{row.email}</td>
                        <td className="p-2">
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {row.roleLabel || row.role}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-emerald-700">{row.status}</td>
                        <td className="p-2 font-mono">{row.telepon || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mode Replace vs Merge */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="replaceAkunOption"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="replaceAkunOption" className="text-slate-700 cursor-pointer font-medium">
                  <strong>Ganti seluruh master akun</strong> dengan file Excel ini (Bila tidak dicentang, hanya akan menambahkan akun baru yang username-nya belum ada).
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
                ? 'bg-purple-700 hover:bg-purple-800'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Impor {parsedRows.length} Akun Sekarang</span>
          </button>
        </div>

      </div>
    </div>
  );
};
