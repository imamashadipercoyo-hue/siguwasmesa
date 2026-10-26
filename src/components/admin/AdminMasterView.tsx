import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Users,
  GraduationCap,
  KeyRound,
  Database,
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  Send,
  Cloud,
  CloudCheck,
  Check,
  X
} from 'lucide-react';
import {
  exportSiswaToExcel,
  exportGuruWaliToExcel,
  exportAkunToExcel,
  downloadTemplateSiswaExcel
} from '../../utils/excelUtils';
import { Siswa, GuruWali, UserAccount } from '../../types';
import { ModalImportSiswaExcel } from './ModalImportSiswaExcel';
import { ModalImportGuruWaliExcel } from './ModalImportGuruWaliExcel';
import { ModalImportAkunExcel } from './ModalImportAkunExcel';
import { PanduanAppsScriptModal } from './PanduanAppsScriptModal';
import { DEFAULT_APPS_SCRIPT_URL, testAppsScriptConnection } from '../../services/googleSheetsService';

export const AdminMasterView: React.FC = () => {
  const {
    siswaList,
    guruWaliList,
    akunList,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    importSiswaList,
    addGuruWali,
    updateGuruWali,
    deleteGuruWali,
    importGuruWaliList,
    addAkun,
    updateAkun,
    deleteAkun,
    importAkunList,
    googleSheetsConfig,
    updateGoogleSheetsConfig,
    testGoogleSheets,
    syncPullFromSheets,
    syncPushToSheets
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'siswa' | 'guru' | 'akun' | 'sheets'>('siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string>('all');

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportGuruModalOpen, setIsImportGuruModalOpen] = useState(false);
  const [isImportAkunModalOpen, setIsImportAkunModalOpen] = useState(false);
  const [isPanduanModalOpen, setIsPanduanModalOpen] = useState(false);

  // Siswa Form Modal (Add / Edit)
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [isSiswaFormOpen, setIsSiswaFormOpen] = useState(false);
  const [siswaFormData, setSiswaFormData] = useState<Partial<Siswa>>({
    nisn: '',
    nama: '',
    kelas: 'X KKBT',
    jurusan: 'Kriya Kreatif Batik dan Tekstil',
    jenisKelamin: 'L',
    tanggalLahir: '2010-01-01',
    alamat: 'Jember',
    namaOrtu: '',
    noHpOrtu: '',
    nilaiRataRata: 85,
    poinKarakter: 88,
    statusPendampingan: 'Normal',
    catatanKhusus: ''
  });

  // Guru Wali Form Modal (Add / Edit)
  const [editingGuru, setEditingGuru] = useState<GuruWali | null>(null);
  const [isGuruFormOpen, setIsGuruFormOpen] = useState(false);
  const [guruFormData, setGuruFormData] = useState<Partial<GuruWali>>({
    nip: '',
    nama: '',
    gelar: 'S.Pd',
    kelas: 'X KKBT',
    jurusan: 'Kriya Kreatif Batik dan Tekstil',
    telepon: '081234567890',
    email: '',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  });

  // Akun Form Modal (Add / Edit)
  const [editingAkun, setEditingAkun] = useState<UserAccount | null>(null);
  const [isAkunFormOpen, setIsAkunFormOpen] = useState(false);
  const [akunFormData, setAkunFormData] = useState<Partial<UserAccount>>({
    username: '',
    password: '',
    nama: '',
    email: '',
    role: 'guru_wali',
    roleLabel: 'Guru Wali',
    kelas: 'X KKBT',
    status: 'Aktif',
    telepon: ''
  });
  const [akunSearchQuery, setAkunSearchQuery] = useState('');
  const [akunKelasFilter, setAkunKelasFilter] = useState('all');

  // Google Sheets state
  const [urlInput, setUrlInput] = useState(googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Filtered Siswa
  const filteredSiswa = siswaList.filter(s => {
    if (selectedKelasFilter !== 'all' && s.kelas !== selectedKelasFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.nama.toLowerCase().includes(q);
      const matchNisn = s.nisn.includes(q);
      const matchAlamat = s.alamat.toLowerCase().includes(q);
      if (!matchName && !matchNisn && !matchAlamat) return false;
    }
    return true;
  });

  // Unique Classes list
  const uniqueClasses = Array.from(new Set(siswaList.map(s => s.kelas))).sort();

  // Handle Siswa Form Submit
  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaFormData.nama || !siswaFormData.nisn) {
      alert('Nama dan NISN wajib diisi!');
      return;
    }

    if (editingSiswa) {
      updateSiswa(editingSiswa.id, siswaFormData);
    } else {
      addSiswa(siswaFormData as Omit<Siswa, 'id'>);
    }
    setIsSiswaFormOpen(false);
    setEditingSiswa(null);
  };

  // Handle Guru Wali Form Submit
  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruFormData.nama || !guruFormData.nip) {
      alert('Nama dan NIP guru wajib diisi!');
      return;
    }

    if (editingGuru) {
      updateGuruWali(editingGuru.id, guruFormData);
    } else {
      addGuruWali(guruFormData as Omit<GuruWali, 'id'>);
    }
    setIsGuruFormOpen(false);
    setEditingGuru(null);
  };

  // Handle Akun Form Submit
  const handleSaveAkun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!akunFormData.username || !akunFormData.nama) {
      alert('Username dan Nama Pengguna wajib diisi!');
      return;
    }

    const assignedKelas = akunFormData.kelas || (
      akunFormData.role === 'admin' ? 'Semua Kelas' :
      akunFormData.role === 'guru_wali' ? 'X KKBT' :
      akunFormData.role === 'manajemen_bk' ? 'Semua Kelas X' : '-'
    );

    let linkedId = akunFormData.linkedId;
    if (akunFormData.role === 'guru_wali' && !linkedId) {
      const matchGW = guruWaliList.find(g => 
        g.kelas === assignedKelas || 
        g.nama.toLowerCase().includes((akunFormData.nama || '').toLowerCase())
      );
      if (matchGW) linkedId = matchGW.id;
    }

    const payload: Partial<UserAccount> = {
      ...akunFormData,
      kelas: assignedKelas,
      linkedId
    };

    if (editingAkun) {
      updateAkun(editingAkun.id, payload);
    } else {
      addAkun(payload as Omit<UserAccount, 'id'>);
    }
    setIsAkunFormOpen(false);
    setEditingAkun(null);
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const targetUrl = urlInput.trim() || DEFAULT_APPS_SCRIPT_URL;
    updateGoogleSheetsConfig({ appsScriptUrl: targetUrl, autoSync: true });
    const res = await testAppsScriptConnection(targetUrl);
    setTestResult(res);
    setTestingConnection(false);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner Admin */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>HAK AKSES ADMINISTRATOR SISTEM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Pusat Kendali Master Data & Database Google Sheets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Pengelolaan penuh data siswa, data guru wali/wali kelas, akun pengguna, input & export Excel, serta sinkronisasi cloud Google Sheets.
            </p>
          </div>

          {/* Cloud Sync Status Pill */}
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-xs space-y-1.5 shrink-0 min-w-56">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Status Database</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                googleSheetsConfig.syncStatus === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : googleSheetsConfig.syncStatus === 'syncing'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-500/20 text-slate-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  googleSheetsConfig.syncStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}></span>
                <span>{googleSheetsConfig.syncStatus === 'connected' ? 'Online (Google Sheets)' : 'Penyimpanan Lokal'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              {googleSheetsConfig.appsScriptUrl ? 'URL Apps Script Terpasang' : 'Belum dihubungkan ke Apps Script'}
            </p>
            <button
              onClick={() => setActiveAdminTab('sheets')}
              className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer block"
            >
              Kelola Koneksi Database &rarr;
            </button>
          </div>
        </div>

        {/* Admin Navigation Sub-tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveAdminTab('siswa')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'siswa'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Data Siswa ({siswaList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('guru')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'guru'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Master Guru Wali & Kelas ({guruWaliList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('akun')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'akun'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Master Akun Pengguna ({akunList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('sheets')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'sheets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-300" />
            <span>Database Google Sheets & Apps Script</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MASTER DATA SISWA */}
      {activeAdminTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Master Data Peserta Didik ({siswaList.length} Siswa Terdaftar)
              </h3>
              <p className="text-xs text-slate-500">
                Input, pembaruan, import massal dari Excel, dan export data resmi peserta didik SMKN 1 Jember.
              </p>
            </div>

            {/* Excel Actions for Admin */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                title="Unggah dan impor file Excel siswa"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => exportSiswaToExcel(filteredSiswa)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                title="Unduh seluruh data siswa ke file Excel"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Export Excel ({filteredSiswa.length})</span>
              </button>

              <button
                onClick={() => {
                  setEditingSiswa(null);
                  setSiswaFormData({
                    nisn: '',
                    nama: '',
                    kelas: 'X KKBT',
                    jurusan: 'Kriya Kreatif Batik dan Tekstil',
                    jenisKelamin: 'L',
                    tanggalLahir: '2010-01-01',
                    alamat: 'Jember',
                    namaOrtu: '',
                    noHpOrtu: '',
                    nilaiRataRata: 85,
                    poinKarakter: 88,
                    statusPendampingan: 'Normal',
                    catatanKhusus: ''
                  });
                  setIsSiswaFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Siswa Baru</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, NISN, atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-semibold text-slate-600">Filter Kelas:</span>
              <select
                value={selectedKelasFilter}
                onChange={(e) => setSelectedKelasFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 cursor-pointer"
              >
                <option value="all">Semua Kelas ({siswaList.length})</option>
                {uniqueClasses.map(k => (
                  <option key={k} value={k}>
                    {k} ({siswaList.filter(s => s.kelas === k).length} Siswa)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Data Siswa */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas / Jurusan</th>
                  <th className="p-3 text-center">JK</th>
                  <th className="p-3">Alamat di Jember</th>
                  <th className="p-3">Kontak Wali Murid</th>
                  <th className="p-3 text-center">Nilai / Karakter</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSiswa.map((siswa, idx) => (
                  <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{siswa.nisn}</td>
                    <td className="p-3 font-bold text-slate-900">{siswa.nama}</td>
                    <td className="p-3">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {siswa.kelas}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold">{siswa.jenisKelamin}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{siswa.alamat}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{siswa.namaOrtu}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{siswa.noHpOrtu}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-slate-800">{siswa.nilaiRataRata}</span>
                      <span className="text-[10px] text-indigo-700 block font-semibold">K: {siswa.poinKarakter}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        siswa.statusPendampingan === 'Siswa Berprestasi' ? 'bg-emerald-100 text-emerald-800' :
                        siswa.statusPendampingan === 'Perhatian Khusus' ? 'bg-amber-100 text-amber-800' :
                        siswa.statusPendampingan === 'Dalam Penanganan BK' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {siswa.statusPendampingan}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSiswa(siswa);
                            setSiswaFormData(siswa);
                            setIsSiswaFormOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data siswa ${siswa.nama}?`)) {
                              deleteSiswa(siswa.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER GURU WALI & WALI KELAS */}
      {activeAdminTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Master Data Guru Wali & Wali Kelas ({guruWaliList.length} Guru)
              </h3>
              <p className="text-xs text-slate-500">
                Manajemen akun pendidik, penugasan kelas binaan, dan export data guru wali SMKN 1 Jember.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsImportGuruModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                title="Impor daftar guru wali dan penugasan kelas dari file Excel (.xlsx / .csv)"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>Import Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => exportGuruWaliToExcel(guruWaliList)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => {
                  setEditingGuru(null);
                  setGuruFormData({
                    nip: '',
                    nama: '',
                    gelar: 'S.Pd',
                    kelas: 'X KKBT',
                    jurusan: 'Kriya Kreatif Batik dan Tekstil',
                    telepon: '081234567890',
                    email: '',
                    bio: '',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                  });
                  setIsGuruFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Guru Wali Baru</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guruWaliList.map(guru => (
              <div
                key={guru.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={guru.avatar}
                    alt={guru.nama}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-600/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Wali Kelas {guru.kelas}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGuru(guru);
                            setGuruFormData(guru);
                            setIsGuruFormOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 rounded cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data guru ${guru.nama}?`)) {
                              deleteGuruWali(guru.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1 leading-snug">
                      {guru.nama}, {guru.gelar}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NIP. {guru.nip}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p><strong>Jurusan:</strong> {guru.jurusan}</p>
                  <p><strong>No WhatsApp:</strong> {guru.telepon}</p>
                  <p><strong>Email:</strong> {guru.email}</p>
                </div>

                <p className="text-[11px] text-slate-500 italic line-clamp-2">
                  "{guru.bio}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER DATA AKUN PENGGUNA */}
      {activeAdminTab === 'akun' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Master Data Akun Pengguna ({akunList.length} Akun Terdaftar)
              </h3>
              <p className="text-xs text-slate-500">
                Kelola hak akses Admin, Guru Wali pengampu kelas, Guru BK / Kesiswaan, dan Wali Murid.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsImportAkunModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                title="Impor daftar akun pengguna dari file Excel (.xlsx / .csv)"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>Import Akun (Excel)</span>
              </button>

              <button
                onClick={() => exportAkunToExcel(akunList)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Export Akun (Excel)</span>
              </button>

              <button
                onClick={() => {
                  setEditingAkun(null);
                  setAkunFormData({
                    username: '',
                    password: 'guru123',
                    nama: '',
                    email: '',
                    role: 'guru_wali',
                    roleLabel: 'Guru Wali',
                    kelas: 'X KKBT',
                    status: 'Aktif',
                    telepon: ''
                  });
                  setIsAkunFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Akun Baru</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Akun Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari username, nama pengguna, kelas diampu, atau email..."
                value={akunSearchQuery}
                onChange={(e) => setAkunSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Kelas:</span>
              <select
                value={akunKelasFilter}
                onChange={(e) => setAkunKelasFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-blue-600"
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Username / NISN</th>
                  <th className="p-3">Kata Sandi</th>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Kelas Diampu</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Peran / Role</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Terakhir Masuk</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {akunList
                  .filter(akun => {
                    if (akunKelasFilter !== 'all' && (akun.kelas || '') !== akunKelasFilter) return false;
                    if (akunSearchQuery.trim()) {
                      const q = akunSearchQuery.toLowerCase();
                      const mUser = akun.username.toLowerCase().includes(q);
                      const mName = akun.nama.toLowerCase().includes(q);
                      const mEmail = akun.email.toLowerCase().includes(q);
                      const mKelas = (akun.kelas || '').toLowerCase().includes(q);
                      const mRole = akun.roleLabel.toLowerCase().includes(q);
                      if (!mUser && !mName && !mEmail && !mKelas && !mRole) return false;
                    }
                    return true;
                  })
                  .map((akun, idx) => (
                  <tr key={akun.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{akun.username}</td>
                    <td className="p-3 font-mono text-[11px] font-semibold text-slate-600 bg-slate-50/70 px-2.5 py-1 rounded">
                      {akun.password || (akun.role === 'admin' ? 'admin123' : akun.role === 'guru_wali' ? 'guru123' : akun.role === 'manajemen_bk' ? 'bk123' : '123456')}
                    </td>
                    <td className="p-3 font-bold text-slate-800">{akun.nama}</td>
                    <td className="p-3">
                      {akun.role === 'guru_wali' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs shadow-2xs">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                          <span>{akun.kelas || 'X KKBT'}</span>
                        </span>
                      ) : akun.role === 'wali_murid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
                          <span>{akun.kelas || '-'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold text-xs">
                          {akun.kelas || (akun.role === 'admin' ? 'Semua Kelas' : 'Semua Kelas X')}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{akun.email}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        akun.role === 'admin' ? 'bg-amber-100 text-amber-900' :
                        akun.role === 'guru_wali' ? 'bg-blue-100 text-blue-900' :
                        akun.role === 'manajemen_bk' ? 'bg-purple-100 text-purple-900' :
                        'bg-emerald-100 text-emerald-900'
                      }`}>
                        {akun.roleLabel}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        akun.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {akun.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{akun.lastLogin || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingAkun(akun);
                            setAkunFormData(akun);
                            setIsAkunFormOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-700 rounded-lg cursor-pointer"
                          title="Ubah Akun"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus akun ${akun.username}?`)) {
                              deleteAkun(akun.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE GOOGLE SHEETS & APPS SCRIPT */}
      {activeAdminTab === 'sheets' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1 border border-emerald-200">
                <Database className="w-3.5 h-3.5" />
                <span>Konfigurasi Database Cloud Real-time</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Integrasi Google Sheets & Backend Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Menghubungkan SIGUWA secara dua arah ke Google Sheets untuk penyimpanan data persisten, multi-user, dan kolaboratif.
              </p>
            </div>

            <button
              onClick={() => setIsPanduanModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all shrink-0"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Buka Panduan Instalasi (5 Menit)</span>
            </button>
          </div>

          {/* Form Input Web App URL */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <div>
              <label className="font-extrabold text-slate-800 block text-xs mb-1">
                URL Deployment Aplikasi Web (Google Apps Script Web App URL) *
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 font-mono text-xs focus:outline-blue-600 text-slate-800"
                />
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-all"
                >
                  {testingConnection ? (
                    <span>Menguji...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Test & Simpan URL</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <p className="text-[11px] text-slate-500">
                  Status: Database terhubung ke spreadsheet Google Apps Script SMKN 1 Jember.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput(DEFAULT_APPS_SCRIPT_URL);
                    updateGoogleSheetsConfig({ appsScriptUrl: DEFAULT_APPS_SCRIPT_URL, autoSync: true });
                  }}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                >
                  Gunakan URL Resmi SMKN 1 Jember
                </button>
              </div>
            </div>

            {/* Test result alert */}
            {testResult && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                  : 'bg-rose-50 border-rose-200 text-rose-800 font-semibold'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Auto sync toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSyncToggle"
                  checked={googleSheetsConfig.autoSync}
                  onChange={(e) => updateGoogleSheetsConfig({ autoSync: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="autoSyncToggle" className="font-bold text-slate-800 cursor-pointer">
                  Sinkronisasi Otomatis Real-time
                </label>
              </div>
              <span className="text-[11px] text-slate-500">
                Otomatis kirim perubahan data siswa, presensi, dan jurnal ke Google Sheets.
              </span>
            </div>
          </div>

          {/* Sync Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                <Cloud className="w-4 h-4 text-blue-700" />
                <span>Tarik Data Terbaru dari Google Sheets (Pull)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Mengunduh data siswa, presensi, dan jurnal yang mungkin telah diedit langsung oleh tim kurikulum pada lembar Google Spreadsheet.
              </p>
              <button
                onClick={async () => {
                  const res = await syncPullFromSheets();
                  alert(res.message);
                }}
                disabled={!googleSheetsConfig.appsScriptUrl}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all"
              >
                Unduh Data dari Google Sheets Sekarang
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <CloudCheck className="w-4 h-4 text-emerald-700" />
                <span>Unggah Seluruh Data ke Google Sheets (Push)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Menyimpan seluruh 72 data siswa, 4 layanan jurnal, daftar guru wali, dan akun pengguna saat ini ke dalam tab-tab Google Spreadsheet.
              </p>
              <button
                onClick={async () => {
                  const res = await syncPushToSheets();
                  alert(res.message);
                }}
                disabled={!googleSheetsConfig.appsScriptUrl}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all"
              >
                Simpan Seluruh Data ke Google Sheets
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL SISWA */}
      <ModalImportSiswaExcel
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={(rows, replace) => {
          importSiswaList(rows, replace);
          alert(`Berhasil mengimpor ${rows.length} siswa ke database.`);
        }}
      />

      {/* MODAL IMPORT EXCEL GURU WALI */}
      <ModalImportGuruWaliExcel
        isOpen={isImportGuruModalOpen}
        onClose={() => setIsImportGuruModalOpen(false)}
        onConfirmImport={(rows, replace) => {
          importGuruWaliList(rows, replace);
          alert(`Berhasil mengimpor ${rows.length} data guru wali & wali kelas.`);
        }}
      />

      {/* MODAL IMPORT EXCEL AKUN PENGGUNA */}
      <ModalImportAkunExcel
        isOpen={isImportAkunModalOpen}
        onClose={() => setIsImportAkunModalOpen(false)}
        onConfirmImport={(rows, replace) => {
          importAkunList(rows, replace);
          alert(`Berhasil mengimpor ${rows.length} akun pengguna.`);
        }}
      />

      {/* MODAL PANDUAN APPS SCRIPT */}
      <PanduanAppsScriptModal
        isOpen={isPanduanModalOpen}
        onClose={() => setIsPanduanModalOpen(false)}
      />

      {/* MODAL FORM SISWA (TAMBAH / EDIT) */}
      {isSiswaFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 overflow-hidden">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base">
                {editingSiswa ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsSiswaFormOpen(false)} className="text-white/80 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSiswa} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={siswaFormData.nisn}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, nisn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Siswa *</label>
                  <input
                    type="text"
                    required
                    value={siswaFormData.nama}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, nama: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas *</label>
                  <select
                    value={siswaFormData.kelas}
                    onChange={(e) => {
                      const k = e.target.value;
                      setSiswaFormData({
                        ...siswaFormData,
                        kelas: k,
                        jurusan: k.includes('KKBT') ? 'Kriya Kreatif Batik dan Tekstil' : 'Teknik Logistik'
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-blue-800"
                  >
                    <option value="X KKBT">X KKBT (Kriya Kreatif Batik & Tekstil)</option>
                    <option value="X TL">X TL (Teknik Logistik)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={siswaFormData.jenisKelamin}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, jenisKelamin: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Domisili di Jember</label>
                <input
                  type="text"
                  value={siswaFormData.alamat}
                  onChange={(e) => setSiswaFormData({ ...siswaFormData, alamat: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={siswaFormData.namaOrtu}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, namaOrtu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No HP / WhatsApp Ortu</label>
                  <input
                    type="text"
                    value={siswaFormData.noHpOrtu}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, noHpOrtu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nilai Rata-Rata</label>
                  <input
                    type="number"
                    step="0.1"
                    value={siswaFormData.nilaiRataRata}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, nilaiRataRata: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Poin Karakter (0-100)</label>
                  <input
                    type="number"
                    value={siswaFormData.poinKarakter}
                    onChange={(e) => setSiswaFormData({ ...siswaFormData, poinKarakter: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Pendampingan</label>
                <select
                  value={siswaFormData.statusPendampingan}
                  onChange={(e) => setSiswaFormData({ ...siswaFormData, statusPendampingan: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Siswa Berprestasi">Siswa Berprestasi</option>
                  <option value="Perhatian Khusus">Perhatian Khusus</option>
                  <option value="Dalam Penanganan BK">Dalam Penanganan BK</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSiswaFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM GURU WALI */}
      {isGuruFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-6 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base">
                {editingGuru ? 'Ubah Data Guru Wali' : 'Tambah Guru Wali Baru'}
              </h3>
              <button onClick={() => setIsGuruFormOpen(false)} className="text-white/80 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuru} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">NIP *</label>
                <input
                  type="text"
                  required
                  value={guruFormData.nip}
                  onChange={(e) => setGuruFormData({ ...guruFormData, nip: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={guruFormData.nama}
                    onChange={(e) => setGuruFormData({ ...guruFormData, nama: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gelar</label>
                  <input
                    type="text"
                    value={guruFormData.gelar}
                    onChange={(e) => setGuruFormData({ ...guruFormData, gelar: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wali Kelas *</label>
                  <input
                    type="text"
                    required
                    value={guruFormData.kelas}
                    onChange={(e) => setGuruFormData({ ...guruFormData, kelas: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={guruFormData.telepon}
                    onChange={(e) => setGuruFormData({ ...guruFormData, telepon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Program Keahlian / Jurusan</label>
                <input
                  type="text"
                  value={guruFormData.jurusan}
                  onChange={(e) => setGuruFormData({ ...guruFormData, jurusan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGuruFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Guru Wali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM AKUN */}
      {isAkunFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md my-6 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base">
                {editingAkun ? 'Ubah Akun Pengguna' : 'Tambah Akun Baru'}
              </h3>
              <button onClick={() => setIsAkunFormOpen(false)} className="text-white/80 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAkun} className="p-5 space-y-3 text-xs">
              {/* Quick Fill Guru Wali if role is guru_wali and creating new account */}
              {!editingAkun && akunFormData.role === 'guru_wali' && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <label className="font-bold text-blue-900 block text-[11px]">
                    ✨ Hubungkan dengan Guru Wali Terdaftar (Auto-Fill)
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedGuru = guruWaliList.find(g => g.id === e.target.value);
                      if (selectedGuru) {
                        setAkunFormData({
                          ...akunFormData,
                          nama: `${selectedGuru.nama}, ${selectedGuru.gelar}`,
                          email: selectedGuru.email,
                          telepon: selectedGuru.telepon,
                          kelas: selectedGuru.kelas,
                          linkedId: selectedGuru.id,
                          username: selectedGuru.email.split('@')[0] || akunFormData.username,
                          roleLabel: `Guru Wali Kelas ${selectedGuru.kelas}`
                        });
                      }
                    }}
                    defaultValue=""
                    className="w-full bg-white border border-blue-200 text-blue-900 font-semibold rounded-lg p-2 text-xs cursor-pointer focus:outline-blue-600"
                  >
                    <option value="">-- Pilih Guru Wali untuk Isi Otomatis --</option>
                    {guruWaliList.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.nama}, {g.gelar} — Wali Kelas {g.kelas}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Username / NISN *</label>
                <input
                  type="text"
                  required
                  value={akunFormData.username}
                  onChange={(e) => setAkunFormData({ ...akunFormData, username: e.target.value })}
                  placeholder="Contoh: endang.sulistiyowati atau 0094201436"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Pengguna *</label>
                <input
                  type="text"
                  required
                  value={akunFormData.nama}
                  onChange={(e) => setAkunFormData({ ...akunFormData, nama: e.target.value })}
                  placeholder="Nama Lengkap Beserta Gelar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role / Peran</label>
                  <select
                    value={akunFormData.role}
                    onChange={(e) => {
                      const r = e.target.value as any;
                      const labelMap: any = {
                        admin: 'Super Administrator',
                        guru_wali: 'Guru Wali',
                        manajemen_bk: 'BK & Kesiswaan',
                        wali_murid: 'Wali Murid'
                      };
                      const defaultK = r === 'admin' ? 'Semua Kelas' : r === 'guru_wali' ? 'X KKBT' : r === 'manajemen_bk' ? 'Semua Kelas X' : 'X KKBT';
                      setAkunFormData({
                        ...akunFormData,
                        role: r,
                        roleLabel: labelMap[r],
                        kelas: akunFormData.kelas || defaultK
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    <option value="admin">Administrator</option>
                    <option value="guru_wali">Guru Wali</option>
                    <option value="manajemen_bk">BK & Kesiswaan</option>
                    <option value="wali_murid">Wali Murid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                  <select
                    value={akunFormData.status}
                    onChange={(e) => setAkunFormData({ ...akunFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Kelas yang Diampu Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {akunFormData.role === 'guru_wali' ? 'Kelas yang Diampu *' :
                     akunFormData.role === 'wali_murid' ? 'Kelas Siswa (Binaan)' : 'Lingkup Kelas'}
                  </label>
                  {akunFormData.role === 'guru_wali' ? (
                    <select
                      value={akunFormData.kelas || 'X KKBT'}
                      onChange={(e) => {
                        const newK = e.target.value;
                        setAkunFormData({
                          ...akunFormData,
                          kelas: newK,
                          roleLabel: `Guru Wali Kelas ${newK}`
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-blue-900"
                    >
                      {uniqueClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={akunFormData.kelas || (akunFormData.role === 'admin' ? 'Semua Kelas' : 'Semua Kelas X')}
                      onChange={(e) => setAkunFormData({ ...akunFormData, kelas: e.target.value })}
                      placeholder="Contoh: X KKBT atau Semua Kelas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kontak Telepon / WA</label>
                  <input
                    type="text"
                    value={akunFormData.telepon || ''}
                    onChange={(e) => setAkunFormData({ ...akunFormData, telepon: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={akunFormData.email}
                  onChange={(e) => setAkunFormData({ ...akunFormData, email: e.target.value })}
                  placeholder="nama@smkn1jember.sch.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kata Sandi (Password) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin123, guru123, 123456"
                  value={akunFormData.password || ''}
                  onChange={(e) => setAkunFormData({ ...akunFormData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Password digunakan pengguna saat awal membuka aplikasi untuk verifikasi login.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAkunFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
