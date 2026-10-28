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
  Check,
  X,
  Briefcase,
  ShieldCheck,
  Layers,
  Zap
} from 'lucide-react';
import {
  exportSiswaToExcel,
  exportGuruWaliToExcel,
  exportAkunToExcel,
  downloadTemplateSiswaExcel
} from '../../utils/excelUtils';
import { Siswa, GuruWali, UserAccount, UserRole } from '../../types';
import { ModalImportSiswaExcel } from './ModalImportSiswaExcel';
import { ModalImportGuruWaliExcel } from './ModalImportGuruWaliExcel';
import { ModalImportAkunExcel } from './ModalImportAkunExcel';
import { PanduanAppsScriptModal } from './PanduanAppsScriptModal';
import { DEFAULT_APPS_SCRIPT_URL, testAppsScriptConnection } from '../../services/googleSheetsService';

export const DAFTAR_JURUSAN_SMKN1 = [
  'Kriya Kreatif Batik dan Tekstil',
  'Teknik Logistik',
  'Bisnis Digital',
  'Akuntansi dan Keuangan Lembaga',
  'Manajemen Perkantoran dan Layanan Bisnis',
  'Desain Komunikasi Visual',
  'Usaha Layanan Wisata',
  'Perhotelan',
  'Kuliner',
  'Teknik Komputer dan Jaringan',
  'Rekayasa Perangkat Lunak'
];

export const AdminMasterView: React.FC = () => {
  const {
    siswaList,
    guruWaliList,
    akunList,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    clearAllSiswa,
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
    syncPushToSheets,
    syncPushSiswaToSheets,
    syncPullSiswaFromSheets
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'siswa' | 'guru' | 'akun' | 'sheets'>('siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string>('all');
  const [isSyncingSiswa, setIsSyncingSiswa] = useState(false);
  const [siswaSyncProgress, setSiswaSyncProgress] = useState<{ percent: number; message: string } | null>(null);

  // Clear Siswa Modal State
  const [isClearSiswaModalOpen, setIsClearSiswaModalOpen] = useState(false);
  const [isClearingSiswa, setIsClearingSiswa] = useState(false);
  const [confirmClearChecked, setConfirmClearChecked] = useState(false);

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
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'guru_wali',
    roleLabel: 'Guru Wali Kelas X KKBT',
    username: '',
    password: 'guru123',
    statusAkun: 'Aktif'
  });
  const [guruSearchQuery, setGuruSearchQuery] = useState('');
  const [guruRoleFilter, setGuruRoleFilter] = useState('all');

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
    jurusan: '',
    status: 'Aktif',
    telepon: ''
  });
  const [akunSearchQuery, setAkunSearchQuery] = useState('');
  const [akunKelasFilter, setAkunKelasFilter] = useState('all');
  const [akunRoleFilter, setAkunRoleFilter] = useState('all');

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

  // Handle Kosongkan Seluruh Data Siswa (dengan Konfirmasi & Otomatis ke Google Sheets)
  const handleConfirmClearSiswa = async () => {
    setIsClearingSiswa(true);
    try {
      const res = await clearAllSiswa();
      setIsClearingSiswa(false);
      setIsClearSiswaModalOpen(false);
      setConfirmClearChecked(false);
      alert(res.message);
    } catch (err: any) {
      setIsClearingSiswa(false);
      alert('Terjadi kesalahan saat mengosongkan data: ' + err.message);
    }
  };

  // Helper to toggle classes for multi-class roles (Wali Kelas & BK) in Guru Form
  const toggleClassInGuruForm = (clsName: string) => {
    const currentList = (guruFormData.kelas || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    let updatedList: string[];
    if (currentList.includes(clsName)) {
      updatedList = currentList.filter(c => c !== clsName);
    } else {
      updatedList = [...currentList, clsName];
    }
    setGuruFormData(prev => ({
      ...prev,
      kelas: updatedList.join(', ')
    }));
  };

  // Handle Guru Wali Form Submit (Terkoneksi Master Akun Pengguna)
  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruFormData.nama || !guruFormData.nip) {
      alert('Nama dan NIP guru wajib diisi!');
      return;
    }

    const role = (guruFormData.role || 'guru_wali') as UserRole;
    let assignedKelas = guruFormData.kelas || '';
    let assignedJurusan = guruFormData.jurusan || '';
    let roleLabel = guruFormData.roleLabel || '';

    if (role === 'kkk') {
      assignedJurusan = assignedJurusan || DAFTAR_JURUSAN_SMKN1[0];
      assignedKelas = assignedJurusan;
      roleLabel = `KKK (Ketua Jurusan ${assignedJurusan})`;
    } else if (role === 'guru_wali') {
      assignedKelas = assignedKelas || uniqueClasses[0] || 'X KKBT';
      roleLabel = `Guru Wali Kelas ${assignedKelas}`;
    } else if (role === 'wali_kelas') {
      assignedKelas = assignedKelas || 'X KKBT';
      roleLabel = `Wali Kelas (${assignedKelas})`;
    } else if (role === 'manajemen_bk' || (role as string) === 'bk') {
      assignedKelas = assignedKelas || 'Semua Kelas X';
      roleLabel = `BK (${assignedKelas})`;
    }

    const cleanUsername = (guruFormData.username || (guruFormData.email ? guruFormData.email.split('@')[0] : guruFormData.nip.replace(/\s+/g, ''))).toLowerCase().trim();
    const defaultPassword = guruFormData.password || (role === 'kkk' ? 'kkk123' : role === 'manajemen_bk' ? 'bk123' : 'guru123');

    const payload: Partial<GuruWali> = {
      ...guruFormData,
      role,
      roleLabel,
      kelas: assignedKelas,
      jurusan: assignedJurusan,
      username: cleanUsername,
      password: defaultPassword,
      statusAkun: guruFormData.statusAkun || 'Aktif'
    };

    if (editingGuru) {
      updateGuruWali(editingGuru.id, payload);
    } else {
      addGuruWali(payload as Omit<GuruWali, 'id'>);
    }
    setIsGuruFormOpen(false);
    setEditingGuru(null);
  };

  // Helper to toggle classes for multi-class roles (Wali Kelas & BK)
  const toggleClassInAkunForm = (clsName: string) => {
    const currentList = (akunFormData.kelas || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    let updatedList: string[];
    if (currentList.includes(clsName)) {
      updatedList = currentList.filter(c => c !== clsName);
    } else {
      updatedList = [...currentList, clsName];
    }
    setAkunFormData(prev => ({
      ...prev,
      kelas: updatedList.join(', ')
    }));
  };

  // Handle Akun Form Submit
  const handleSaveAkun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!akunFormData.username || !akunFormData.nama) {
      alert('Username dan Nama Pengguna wajib diisi!');
      return;
    }

    const role = (akunFormData.role || 'guru_wali') as UserRole;
    let assignedKelas = akunFormData.kelas || '';
    let assignedJurusan = akunFormData.jurusan || '';
    let roleLabel = akunFormData.roleLabel || '';

    if (role === 'kkk') {
      assignedJurusan = assignedJurusan || akunFormData.kelas || DAFTAR_JURUSAN_SMKN1[0];
      assignedKelas = assignedJurusan;
      roleLabel = `KKK (Ketua Jurusan ${assignedJurusan})`;
    } else if (role === 'guru_wali') {
      assignedKelas = assignedKelas || uniqueClasses[0] || 'X KKBT';
      roleLabel = `Guru Wali Kelas ${assignedKelas}`;
    } else if (role === 'wali_kelas') {
      assignedKelas = assignedKelas || 'X KKBT';
      roleLabel = `Wali Kelas (${assignedKelas})`;
    } else if (role === 'manajemen_bk' || (role as string) === 'bk') {
      assignedKelas = assignedKelas || 'Semua Kelas X';
      roleLabel = `BK (${assignedKelas})`;
    } else if (role === 'admin') {
      assignedKelas = 'Semua Kelas';
      roleLabel = 'Super Administrator';
    } else if (role === 'wali_murid') {
      assignedKelas = assignedKelas || uniqueClasses[0] || 'X KKBT';
      roleLabel = `Wali Murid (${assignedKelas})`;
    }

    let linkedId = akunFormData.linkedId;
    if (role === 'guru_wali' && !linkedId) {
      const matchGW = guruWaliList.find(g => 
        g.kelas === assignedKelas || 
        g.nama.toLowerCase().includes((akunFormData.nama || '').toLowerCase())
      );
      if (matchGW) linkedId = matchGW.id;
    }

    const payload: Partial<UserAccount> = {
      ...akunFormData,
      role,
      roleLabel,
      kelas: assignedKelas,
      jurusan: assignedJurusan,
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
                onClick={async () => {
                  if (!googleSheetsConfig.appsScriptUrl) {
                    setActiveAdminTab('sheets');
                    return;
                  }
                  setIsSyncingSiswa(true);
                  const res = await syncPushSiswaToSheets();
                  setIsSyncingSiswa(false);
                  alert(res.message);
                }}
                disabled={isSyncingSiswa}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                title="Kirim master siswa ke Google Sheets (Mendukung 3.000 data)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                <span>{isSyncingSiswa ? 'Menyimpan...' : 'Simpan ke Google Sheets'}</span>
              </button>

              <button
                onClick={() => {
                  setConfirmClearChecked(false);
                  setIsClearSiswaModalOpen(true);
                }}
                disabled={siswaList.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 border border-rose-300 text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-colors"
                title="Kosongkan seluruh data siswa dari aplikasi dan Google Sheets"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan Data ({siswaList.length})</span>
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
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-800 text-sm">
                          {siswaList.length === 0 ? 'Data Peserta Didik Saat Ini Kosong' : 'Tidak Ada Siswa yang Sesuai Filter'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {siswaList.length === 0
                            ? 'Database siswa telah dikosongkan. Anda dapat mengimpor data baru via file Excel (.xlsx) atau mengunduh dari Google Spreadsheet.'
                            : 'Coba ubah kata kunci pencarian atau ganti filter kelas di atas.'}
                        </p>
                        {siswaList.length === 0 && (
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button
                              onClick={() => setIsImportModalOpen(true)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                            >
                              + Import Excel Siswa
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Unduh dan isi kembali data siswa dari Google Sheets?')) {
                                  await syncPullSiswaFromSheets(true);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Tarik dari Google Sheets
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((siswa, idx) => (
                  <tr key={`${siswa.id}-${siswa.nisn}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
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
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER GURU WALI & WALI KELAS (TERKONEKSI MASTER AKUN) */}
      {activeAdminTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Master Data Guru Wali & Pendidik ({guruWaliList.length} Pendidik Terdaftar)
                </h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Terkoneksi Master Akun
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manajemen data pendidik (Guru Wali 1 kelas, Wali Kelas multi-kelas, KKK 1 jurusan, BK), penugasan kelas, dan akun login yang sinkron dengan Google Sheets.
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
                    kelas: uniqueClasses[0] || 'X KKBT',
                    jurusan: 'Kriya Kreatif Batik dan Tekstil',
                    telepon: '081234567890',
                    email: '',
                    bio: '',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                    role: 'guru_wali',
                    roleLabel: `Guru Wali Kelas ${uniqueClasses[0] || 'X KKBT'}`,
                    username: '',
                    password: 'guru123',
                    statusAkun: 'Aktif'
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

          {/* Search & Role Filter Toolbar Guru Wali */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama pendidik, NIP, kelas/jurusan diampu, email, atau username akun..."
                value={guruSearchQuery}
                onChange={(e) => setGuruSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Peran / Role:</span>
              <select
                value={guruRoleFilter}
                onChange={(e) => setGuruRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-blue-600 w-full sm:w-auto"
              >
                <option value="all">Semua Peran ({guruWaliList.length})</option>
                <option value="guru_wali">Guru Wali (1 Kelas Saja)</option>
                <option value="wali_kelas">Wali Kelas (Beberapa Kelas)</option>
                <option value="kkk">KKK (1 Jurusan)</option>
                <option value="manajemen_bk">BK (Beberapa Kelas)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guruWaliList
              .filter(guru => {
                if (guruRoleFilter !== 'all') {
                  const gRole = guru.role || (guru.jurusan?.toLowerCase().includes('bk') ? 'manajemen_bk' : guru.kelas.includes(',') ? 'wali_kelas' : 'guru_wali');
                  if (guruRoleFilter === 'manajemen_bk' && gRole !== 'manajemen_bk' && (gRole as string) !== 'bk') return false;
                  else if (guruRoleFilter !== 'manajemen_bk' && gRole !== guruRoleFilter) return false;
                }
                if (guruSearchQuery.trim()) {
                  const q = guruSearchQuery.toLowerCase();
                  const mNama = guru.nama.toLowerCase().includes(q);
                  const mNip = guru.nip.toLowerCase().includes(q);
                  const mKelas = (guru.kelas || '').toLowerCase().includes(q);
                  const mEmail = (guru.email || '').toLowerCase().includes(q);
                  const mUser = (guru.username || '').toLowerCase().includes(q);
                  const mJur = (guru.jurusan || '').toLowerCase().includes(q);
                  if (!mNama && !mNip && !mKelas && !mEmail && !mUser && !mJur) return false;
                }
                return true;
              })
              .map((guru, idx) => {
                const linkedAcc = akunList.find(a => 
                  a.linkedId === guru.id ||
                  (guru.username && a.username.toLowerCase() === guru.username.toLowerCase()) ||
                  (guru.email && a.email && a.email.toLowerCase() === guru.email.toLowerCase())
                );
                const effectiveRole = guru.role || linkedAcc?.role || (guru.jurusan?.toLowerCase().includes('bk') ? 'manajemen_bk' : guru.kelas.includes(',') ? 'wali_kelas' : 'guru_wali');
                const effectiveUsername = guru.username || linkedAcc?.username || (guru.email ? guru.email.split('@')[0] : guru.nip.replace(/\s+/g, ''));
                const effectivePassword = guru.password || linkedAcc?.password || (effectiveRole === 'kkk' ? 'kkk123' : effectiveRole === 'manajemen_bk' ? 'bk123' : 'guru123');
                const isAccActive = (guru.statusAkun || linkedAcc?.status) !== 'Nonaktif';

                return (
                  <div
                    key={`${guru.id}-${guru.nip}-${idx}`}
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
                          {/* Role Badge with clean colors */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            effectiveRole === 'kkk' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            effectiveRole === 'wali_kelas' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            effectiveRole === 'manajemen_bk' || (effectiveRole as string) === 'bk' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {effectiveRole === 'kkk' && '🏢 KKK (1 Jurusan)'}
                            {effectiveRole === 'wali_kelas' && '📚 Wali Kelas (Multi)'}
                            {effectiveRole === 'guru_wali' && '🏫 Guru Wali (1 Kelas)'}
                            {(effectiveRole === 'manajemen_bk' || (effectiveRole as string) === 'bk') && '🛡️ BK & Konseling'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingGuru(guru);
                                setGuruFormData({
                                  ...guru,
                                  role: effectiveRole as UserRole,
                                  roleLabel: guru.roleLabel || linkedAcc?.roleLabel,
                                  username: effectiveUsername,
                                  password: effectivePassword,
                                  statusAkun: isAccActive ? 'Aktif' : 'Nonaktif'
                                });
                                setIsGuruFormOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                              title="Ubah Data Pendidik & Akun Terkoneksi"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus data pendidik ${guru.nama} beserta akun pengguna terkait?`)) {
                                  deleteGuruWali(guru.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                              title="Hapus Data & Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm mt-1 leading-snug">
                          {guru.nama}{guru.gelar ? `, ${guru.gelar}` : ''}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          NIP. {guru.nip}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-700">Lingkup Diampu:</span>
                        <span className="font-bold text-blue-900 text-right bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                          {effectiveRole === 'kkk' ? (guru.jurusan || guru.kelas) : guru.kelas}
                        </span>
                      </div>
                      <p><strong>Program Keahlian:</strong> {guru.jurusan || '-'}</p>
                      <p><strong>Kontak WA:</strong> {guru.telepon}</p>
                      <p><strong>Email:</strong> {guru.email}</p>
                    </div>

                    {/* Akun Pengguna Terkoneksi Card Footer */}
                    <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-blue-700" />
                          <span>Akun Login Terkoneksi</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAccActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isAccActive ? '● Akun Aktif' : '○ Nonaktif'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 pt-0.5 font-mono text-[10px]">
                        <div>User: <span className="font-bold text-slate-900">{effectiveUsername}</span></div>
                        <div>Sandi: <span className="font-bold text-slate-900">{effectivePassword}</span></div>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                        <Check className="w-3 h-3" />
                        <span>Tersinkron dengan Master Akun & Google Sheets</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic line-clamp-2">
                      "{guru.bio}"
                    </p>
                  </div>
                );
              })}
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
                placeholder="Cari username, nama pengguna, kelas/jurusan diampu, atau email..."
                value={akunSearchQuery}
                onChange={(e) => setAkunSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-600 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Peran:</span>
                <select
                  value={akunRoleFilter}
                  onChange={(e) => setAkunRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-blue-600"
                >
                  <option value="all">Semua Peran ({akunList.length})</option>
                  <option value="guru_wali">Guru Wali (1 Kelas Saja)</option>
                  <option value="wali_kelas">Wali Kelas (Beberapa Kelas)</option>
                  <option value="manajemen_bk">BK (Beberapa Kelas)</option>
                  <option value="kkk">KKK (1 Jurusan)</option>
                  <option value="admin">Administrator</option>
                  <option value="wali_murid">Wali Murid</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Kelas / Jurusan:</span>
                <select
                  value={akunKelasFilter}
                  onChange={(e) => setAkunKelasFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-blue-600"
                >
                  <option value="all">Semua Kelas / Jurusan</option>
                  <optgroup label="Daftar Kelas">
                    {uniqueClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Daftar Jurusan (KKK)">
                    {DAFTAR_JURUSAN_SMKN1.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
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
                  <th className="p-3">Kelas / Jurusan Diampu</th>
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
                    if (akunRoleFilter !== 'all') {
                      if (akunRoleFilter === 'manajemen_bk' && (akun.role !== 'manajemen_bk' && (akun.role as string) !== 'bk')) return false;
                      else if (akunRoleFilter !== 'manajemen_bk' && akun.role !== akunRoleFilter) return false;
                    }
                    if (akunKelasFilter !== 'all') {
                      const scope = `${akun.kelas || ''} ${akun.jurusan || ''}`.toLowerCase();
                      if (!scope.includes(akunKelasFilter.toLowerCase())) return false;
                    }
                    if (akunSearchQuery.trim()) {
                      const q = akunSearchQuery.toLowerCase();
                      const mUser = akun.username.toLowerCase().includes(q);
                      const mName = akun.nama.toLowerCase().includes(q);
                      const mEmail = akun.email.toLowerCase().includes(q);
                      const mKelas = (akun.kelas || '').toLowerCase().includes(q);
                      const mJurusan = (akun.jurusan || '').toLowerCase().includes(q);
                      const mRole = (akun.roleLabel || akun.role).toLowerCase().includes(q);
                      if (!mUser && !mName && !mEmail && !mKelas && !mJurusan && !mRole) return false;
                    }
                    return true;
                  })
                  .map((akun, idx) => (
                  <tr key={`${akun.id}-${akun.username}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{akun.username}</td>
                    <td className="p-3 font-mono text-[11px] font-semibold text-slate-600 bg-slate-50/70 px-2.5 py-1 rounded">
                      {akun.password || (
                        akun.role === 'admin' ? 'admin123' :
                        akun.role === 'kkk' ? 'kkk123' :
                        akun.role === 'guru_wali' || akun.role === 'wali_kelas' ? 'guru123' :
                        akun.role === 'manajemen_bk' || (akun.role as string) === 'bk' ? 'bk123' : '123456'
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-800">{akun.nama}</td>
                    <td className="p-3">
                      {akun.role === 'kkk' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 font-extrabold text-xs shadow-2xs">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>1 Jurusan: {akun.jurusan || akun.kelas || 'KKBT'}</span>
                        </span>
                      ) : akun.role === 'guru_wali' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs shadow-2xs">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span>1 Kelas: {akun.kelas || 'X KKBT'}</span>
                        </span>
                      ) : akun.role === 'wali_kelas' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs shadow-2xs">
                          <Users className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Beberapa Kelas: {akun.kelas || 'X KKBT, XI KKBT'}</span>
                        </span>
                      ) : akun.role === 'manajemen_bk' || (akun.role as string) === 'bk' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>Beberapa Kelas: {akun.kelas || 'X KKBT, X TL'}</span>
                        </span>
                      ) : akun.role === 'admin' ? (
                        <span className="text-slate-600 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          Semua Kelas & Jurusan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs">
                          <span>Kelas: {akun.kelas || '-'}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{akun.email}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        akun.role === 'admin' ? 'bg-slate-100 text-slate-800 border-slate-300' :
                        akun.role === 'kkk' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        akun.role === 'wali_kelas' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        akun.role === 'guru_wali' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                        akun.role === 'manajemen_bk' || (akun.role as string) === 'bk' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                        'bg-teal-100 text-teal-900 border-teal-300'
                      }`}>
                        {akun.role === 'kkk' ? 'KKK (Ketua Jurusan)' :
                         akun.role === 'wali_kelas' ? 'Wali Kelas' :
                         akun.role === 'guru_wali' ? 'Guru Wali' :
                         akun.role === 'manajemen_bk' || (akun.role as string) === 'bk' ? 'BK' :
                         akun.role === 'admin' ? 'Administrator' : 'Wali Murid'}
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

          {/* HIGH-PERFORMANCE 3000 SISWA CHUNKED SYNC SECTION */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300 bg-linear-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 space-y-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-2xs">
                  <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
                  <span>Teknologi Batching Chunked (Kapasitas 3.000 - 10.000 Data Siswa)</span>
                </div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  Sinkronisasi Khusus Master Data Siswa Skala Besar
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dirancang khusus agar pengunggahan 3.000+ data peserta didik tidak mengalami timeout atau koneksi terputus. Data dipecah otomatis per 750 record dan ditata rapi ke tab <strong>Siswa</strong> di Google Spreadsheet.
                </p>
              </div>

              <div className="flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 shadow-2xs shrink-0">
                <Users className="w-5 h-5 text-amber-700" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Total Siswa Aktif:</span>
                  <span className="font-black text-amber-950 text-sm">{siswaList.length} Siswa</span>
                </div>
              </div>
            </div>

            {/* Real-time Progress Bar */}
            {siswaSyncProgress && (
              <div className="p-3.5 bg-white rounded-xl border border-amber-300 space-y-2 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>{siswaSyncProgress.message}</span>
                  </span>
                  <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[11px]">
                    {siswaSyncProgress.percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${siswaSyncProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <button
                type="button"
                disabled={isSyncingSiswa || !googleSheetsConfig.appsScriptUrl}
                onClick={async () => {
                  setIsSyncingSiswa(true);
                  setSiswaSyncProgress({ percent: 5, message: 'Menyiapkan batching 3.000 data siswa...' });
                  const res = await syncPushSiswaToSheets((p) => {
                    setSiswaSyncProgress({ percent: p.percent, message: p.message });
                  });
                  setIsSyncingSiswa(false);
                  setTimeout(() => setSiswaSyncProgress(null), 3500);
                  alert(res.message);
                }}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>{isSyncingSiswa ? 'Sedang Mengunggah Batch...' : `Unggah Seluruh ${siswaList.length} Siswa ke Google Sheets`}</span>
              </button>

              <button
                type="button"
                disabled={isSyncingSiswa || !googleSheetsConfig.appsScriptUrl}
                onClick={async () => {
                  setIsSyncingSiswa(true);
                  const res = await syncPullSiswaFromSheets();
                  setIsSyncingSiswa(false);
                  alert(res.message);
                }}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Cloud className="w-4 h-4 text-blue-200" />
                <span>Unduh Cepat Data Siswa Saja dari Sheets (1-Call)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Pembersihan Database:
              </span>
              <button
                type="button"
                disabled={isClearingSiswa || siswaList.length === 0}
                onClick={() => {
                  setConfirmClearChecked(false);
                  setIsClearSiswaModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 disabled:opacity-40 font-bold rounded-lg shadow-2xs cursor-pointer transition-all text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan Tab Siswa di Google Sheets & Aplikasi ({siswaList.length})</span>
              </button>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
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

      {/* MODAL KONFIRMASI KOSONGKAN DATA SISWA */}
      {isClearSiswaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-lg my-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Konfirmasi Pengosongan Data Siswa
                  </h3>
                  <p className="text-xs text-rose-200">
                    Tindakan ini permanen dan otomatis sinkron ke Google Spreadsheet
                  </p>
                </div>
              </div>
              <button
                disabled={isClearingSiswa}
                onClick={() => setIsClearSiswaModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950 text-sm">
                    Jumlah Siswa yang Akan Dihapus:
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-700 text-white font-mono font-black text-xs">
                    {siswaList.length} Siswa
                  </span>
                </div>
                <p className="text-rose-900 text-xs">
                  Seluruh data master peserta didik di memori dan penyimpanan aplikasi akan dikosongkan secara total.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-950 font-bold">
                  <Database className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Otomatis Mengosongkan Tab "Siswa" di Google Sheets</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {googleSheetsConfig.appsScriptUrl ? (
                    <>
                      Tersambung ke Google Spreadsheet: baris data peserta didik di tab <strong>Siswa</strong> akan otomatis dihapus dan dikosongkan secara langsung. Format dan header resmi tabel tetap rapi dipertahankan.
                    </>
                  ) : (
                    <>
                      URL Google Sheets belum disetel. Data hanya akan dikosongkan pada database lokal aplikasi.
                    </>
                  )}
                </p>
              </div>

              {/* Safety Checkbox */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={confirmClearChecked}
                    onChange={(e) => setConfirmClearChecked(e.target.checked)}
                    disabled={isClearingSiswa}
                    className="w-4 h-4 text-rose-600 rounded mt-0.5 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 text-xs select-none">
                    Saya mengerti dan menyetujui untuk mengosongkan seluruh {siswaList.length} data siswa secara permanen dari aplikasi dan Google Sheets.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isClearingSiswa}
                  onClick={() => setIsClearSiswaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50 text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!confirmClearChecked || isClearingSiswa}
                  onClick={handleConfirmClearSiswa}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isClearingSiswa ? 'Sedang Mengosongkan Data...' : 'Ya, Kosongkan Data Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* MODAL FORM GURU WALI (TERKONEKSI AKUN PENGGUNA) */}
      {isGuruFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-6 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingGuru ? 'Ubah Data Pendidik & Akun Terkoneksi' : 'Tambah Pendidik & Akun Baru'}
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Tersambung langsung ke Master Akun Pengguna & Google Sheets
                </span>
              </div>
              <button onClick={() => setIsGuruFormOpen(false)} className="text-white/80 hover:text-white cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuru} className="p-5 space-y-3.5 text-xs">
              {/* Peran / Role Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran / Role Pendidik *</label>
                <select
                  value={guruFormData.role || 'guru_wali'}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    let defaultK = guruFormData.kelas || '';
                    let defaultJ = guruFormData.jurusan || '';
                    let defaultPwd = guruFormData.password || '';
                    let label = '';

                    if (r === 'kkk') {
                      defaultJ = defaultJ || DAFTAR_JURUSAN_SMKN1[0];
                      defaultK = defaultJ;
                      label = `KKK (Ketua Jurusan ${defaultJ})`;
                      if (!defaultPwd) defaultPwd = 'kkk123';
                    } else if (r === 'guru_wali') {
                      defaultK = uniqueClasses[0] || 'X KKBT';
                      label = `Guru Wali Kelas ${defaultK}`;
                      if (!defaultPwd) defaultPwd = 'guru123';
                    } else if (r === 'wali_kelas') {
                      defaultK = defaultK && defaultK.includes(',') ? defaultK : 'X KKBT, XI KKBT';
                      label = 'Wali Kelas';
                      if (!defaultPwd) defaultPwd = 'guru123';
                    } else if (r === 'manajemen_bk') {
                      defaultK = defaultK && defaultK.includes(',') ? defaultK : 'X KKBT, X TL';
                      label = 'Bimbingan Konseling (BK)';
                      if (!defaultPwd) defaultPwd = 'bk123';
                    }

                    setGuruFormData({
                      ...guruFormData,
                      role: r,
                      roleLabel: label,
                      kelas: defaultK,
                      jurusan: defaultJ,
                      password: defaultPwd
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer focus:outline-blue-600"
                >
                  <option value="guru_wali">Guru Wali (Hanya 1 Kelas Saja)</option>
                  <option value="wali_kelas">Wali Kelas (Mengampu Beberapa Kelas)</option>
                  <option value="kkk">KKK - Ketua Konsentrasi Keahlian (1 Jurusan)</option>
                  <option value="manajemen_bk">BK - Bimbingan Konseling (Beberapa Kelas)</option>
                </select>
              </div>

              {/* Dynamic Scope Diampu based on role */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] block">
                    {guruFormData.role === 'kkk' && '🏢 Jurusan yang Diampu (1 Jurusan) *'}
                    {guruFormData.role === 'guru_wali' && '🏫 Kelas yang Diampu (Hanya 1 Kelas Saja) *'}
                    {guruFormData.role === 'wali_kelas' && '📚 Kelas yang Diampu (Bisa Beberapa Kelas) *'}
                    {guruFormData.role === 'manajemen_bk' && '🛡️ Kelas Binaan BK (Bisa Beberapa Kelas) *'}
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {guruFormData.role === 'kkk' ? '1 Jurusan Penuh' :
                     guruFormData.role === 'guru_wali' ? 'Single Kelas' : 'Multi-Kelas'}
                  </span>
                </div>

                {/* ROLE KKK: Single Jurusan Dropdown */}
                {guruFormData.role === 'kkk' && (
                  <div>
                    <select
                      value={guruFormData.jurusan || guruFormData.kelas || DAFTAR_JURUSAN_SMKN1[0]}
                      onChange={(e) => {
                        const j = e.target.value;
                        setGuruFormData({
                          ...guruFormData,
                          jurusan: j,
                          kelas: j,
                          roleLabel: `KKK (Ketua Jurusan ${j})`
                        });
                      }}
                      className="w-full bg-white border border-blue-200 text-blue-900 font-bold rounded-lg p-2 text-xs cursor-pointer focus:outline-blue-600"
                    >
                      {DAFTAR_JURUSAN_SMKN1.map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      KKK mengampu 1 jurusan penuh secara spesifik sesuai kompetensi keahlian.
                    </p>
                  </div>
                )}

                {/* ROLE GURU WALI: Single Kelas Dropdown */}
                {guruFormData.role === 'guru_wali' && (
                  <div>
                    <select
                      value={guruFormData.kelas || uniqueClasses[0] || 'X KKBT'}
                      onChange={(e) => {
                        const newK = e.target.value;
                        setGuruFormData({
                          ...guruFormData,
                          kelas: newK,
                          roleLabel: `Guru Wali Kelas ${newK}`
                        });
                      }}
                      className="w-full bg-white border border-blue-200 text-blue-900 font-bold rounded-lg p-2 text-xs cursor-pointer focus:outline-blue-600"
                    >
                      {uniqueClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Guru Wali hanya diizinkan mengampu tepat 1 kelas binaan karakter saja.
                    </p>
                  </div>
                )}

                {/* ROLE WALI KELAS & BK: Multi-Kelas Input with Chips */}
                {(guruFormData.role === 'wali_kelas' || guruFormData.role === 'manajemen_bk') && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={guruFormData.kelas || ''}
                      onChange={(e) => setGuruFormData({ ...guruFormData, kelas: e.target.value })}
                      placeholder="Contoh: X KKBT, XI KKBT, XII KKBT"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Klik pilihan kelas di bawah untuk tambah/hapus cepat:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {uniqueClasses.map(c => {
                          const isSelected = (guruFormData.kelas || '')
                            .split(',')
                            .map(x => x.trim())
                            .includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleClassInGuruForm(c)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? `✓ ${c}` : `+ ${c}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NIP *</label>
                <input
                  type="text"
                  required
                  value={guruFormData.nip}
                  onChange={(e) => setGuruFormData({ ...guruFormData, nip: e.target.value })}
                  placeholder="Contoh: 19740512 199903 2 004"
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
                    placeholder="Nama Lengkap"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gelar</label>
                  <input
                    type="text"
                    value={guruFormData.gelar}
                    onChange={(e) => setGuruFormData({ ...guruFormData, gelar: e.target.value })}
                    placeholder="M.Pd / S.Pd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={guruFormData.telepon || ''}
                    onChange={(e) => setGuruFormData({ ...guruFormData, telepon: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={guruFormData.email || ''}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setGuruFormData({
                        ...guruFormData,
                        email: newEmail,
                        username: guruFormData.username || (newEmail.includes('@') ? newEmail.split('@')[0] : guruFormData.username)
                      });
                    }}
                    placeholder="nama@smkn1jember.sch.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              {/* SECTION: Akun Pengguna Terkoneksi Otomatis */}
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                  <span>Akun Pengguna Terkoneksi (Sinkronisasi Otomatis)</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">Username Login *</label>
                    <input
                      type="text"
                      required
                      value={guruFormData.username || ''}
                      onChange={(e) => setGuruFormData({ ...guruFormData, username: e.target.value })}
                      placeholder="Username login"
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 font-mono font-bold text-blue-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">Kata Sandi *</label>
                    <input
                      type="text"
                      required
                      value={guruFormData.password || ''}
                      onChange={(e) => setGuruFormData({ ...guruFormData, password: e.target.value })}
                      placeholder="Sandi login"
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">Status Akun</label>
                    <select
                      value={guruFormData.statusAkun || 'Aktif'}
                      onChange={(e) => setGuruFormData({ ...guruFormData, statusAkun: e.target.value as any })}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 font-bold text-xs cursor-pointer"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-blue-700 leading-tight">
                  💡 Menyimpan pendidik ini otomatis membuat atau memperbarui akun login pada Master Akun dan Google Sheets.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / Bio Singkat</label>
                <textarea
                  rows={2}
                  value={guruFormData.bio || ''}
                  onChange={(e) => setGuruFormData({ ...guruFormData, bio: e.target.value })}
                  placeholder="Catatan penugasan pendidik di SMKN 1 Jember..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
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
                  Simpan Pendidik & Akun
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
                  <label className="font-bold text-slate-700 block mb-1">Role / Peran *</label>
                  <select
                    value={akunFormData.role}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      let defaultK = akunFormData.kelas || '';
                      let defaultJ = akunFormData.jurusan || '';
                      let defaultPwd = akunFormData.password || '';
                      let label = '';

                      if (r === 'kkk') {
                        defaultJ = defaultJ || DAFTAR_JURUSAN_SMKN1[0];
                        defaultK = defaultJ;
                        label = `KKK (Ketua Jurusan ${defaultJ})`;
                        if (!defaultPwd) defaultPwd = 'kkk123';
                      } else if (r === 'guru_wali') {
                        defaultK = uniqueClasses[0] || 'X KKBT';
                        label = `Guru Wali Kelas ${defaultK}`;
                        if (!defaultPwd) defaultPwd = 'guru123';
                      } else if (r === 'wali_kelas') {
                        defaultK = defaultK && defaultK.includes(',') ? defaultK : 'X KKBT, XI KKBT';
                        label = 'Wali Kelas';
                        if (!defaultPwd) defaultPwd = 'guru123';
                      } else if (r === 'manajemen_bk') {
                        defaultK = defaultK && defaultK.includes(',') ? defaultK : 'X KKBT, X TL';
                        label = 'Bimbingan Konseling (BK)';
                        if (!defaultPwd) defaultPwd = 'bk123';
                      } else if (r === 'admin') {
                        defaultK = 'Semua Kelas';
                        label = 'Super Administrator';
                        if (!defaultPwd) defaultPwd = 'admin123';
                      } else if (r === 'wali_murid') {
                        defaultK = uniqueClasses[0] || 'X KKBT';
                        label = 'Wali Murid';
                        if (!defaultPwd) defaultPwd = 'ortu123';
                      }

                      setAkunFormData({
                        ...akunFormData,
                        role: r,
                        roleLabel: label,
                        kelas: defaultK,
                        jurusan: defaultJ,
                        password: defaultPwd
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="guru_wali">Guru Wali (1 Kelas Saja)</option>
                    <option value="wali_kelas">Wali Kelas (Beberapa Kelas)</option>
                    <option value="manajemen_bk">BK (Beberapa Kelas)</option>
                    <option value="kkk">KKK (1 Jurusan)</option>
                    <option value="admin">Administrator (Semua Kelas)</option>
                    <option value="wali_murid">Wali Murid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                  <select
                    value={akunFormData.status}
                    onChange={(e) => setAkunFormData({ ...akunFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Scope Diampu based on role */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] block">
                    {akunFormData.role === 'kkk' && '🏢 Jurusan yang Diampu (1 Jurusan Saja) *'}
                    {akunFormData.role === 'guru_wali' && '🏫 Kelas yang Diampu (Hanya 1 Kelas Saja) *'}
                    {akunFormData.role === 'wali_kelas' && '📚 Kelas yang Diampu (Beberapa Kelas) *'}
                    {akunFormData.role === 'manajemen_bk' && '🛡️ Kelas Binaan BK (Beberapa Kelas) *'}
                    {akunFormData.role === 'admin' && '👑 Lingkup Administrator'}
                    {akunFormData.role === 'wali_murid' && '👨‍👧 Kelas Siswa Binaan'}
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {akunFormData.role === 'kkk' ? '1 Jurusan Penuh' :
                     akunFormData.role === 'guru_wali' ? 'Single Kelas' :
                     akunFormData.role === 'wali_kelas' ? 'Multi-Kelas' :
                     akunFormData.role === 'manajemen_bk' ? 'Multi-Kelas' : 'Akses Penuh'}
                  </span>
                </div>

                {/* ROLE KKK: Single Jurusan Dropdown */}
                {akunFormData.role === 'kkk' && (
                  <div>
                    <select
                      value={akunFormData.jurusan || akunFormData.kelas || DAFTAR_JURUSAN_SMKN1[0]}
                      onChange={(e) => {
                        const j = e.target.value;
                        setAkunFormData({
                          ...akunFormData,
                          jurusan: j,
                          kelas: j,
                          roleLabel: `KKK (Ketua Jurusan ${j})`
                        });
                      }}
                      className="w-full bg-white border border-blue-200 text-blue-900 font-bold rounded-lg p-2 text-xs cursor-pointer focus:outline-blue-600"
                    >
                      {DAFTAR_JURUSAN_SMKN1.map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      KKK mengampu 1 jurusan penuh secara spesifik sesuai kompetensi keahlian.
                    </p>
                  </div>
                )}

                {/* ROLE GURU WALI: Single Kelas Dropdown */}
                {akunFormData.role === 'guru_wali' && (
                  <div>
                    <select
                      value={akunFormData.kelas || uniqueClasses[0] || 'X KKBT'}
                      onChange={(e) => {
                        const newK = e.target.value;
                        setAkunFormData({
                          ...akunFormData,
                          kelas: newK,
                          roleLabel: `Guru Wali Kelas ${newK}`
                        });
                      }}
                      className="w-full bg-white border border-blue-200 text-blue-900 font-bold rounded-lg p-2 text-xs cursor-pointer focus:outline-blue-600"
                    >
                      {uniqueClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Guru Wali hanya diizinkan mengampu tepat 1 kelas binaan karakter saja.
                    </p>
                  </div>
                )}

                {/* ROLE WALI KELAS & BK: Multi-Kelas Input with Chips */}
                {(akunFormData.role === 'wali_kelas' || akunFormData.role === 'manajemen_bk') && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={akunFormData.kelas || ''}
                      onChange={(e) => setAkunFormData({ ...akunFormData, kelas: e.target.value })}
                      placeholder="Contoh: X KKBT, XI KKBT, XII KKBT"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Klik pilihan kelas di bawah untuk tambah/hapus cepat:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {uniqueClasses.map(c => {
                          const isSelected = (akunFormData.kelas || '')
                            .split(',')
                            .map(x => x.trim())
                            .includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleClassInAkunForm(c)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? `✓ ${c}` : `+ ${c}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ROLE ADMIN */}
                {akunFormData.role === 'admin' && (
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-700 text-xs font-semibold">
                    Semua Kelas & Seluruh Jurusan (Super Administrator SMKN 1 Jember)
                  </div>
                )}

                {/* ROLE WALI MURID */}
                {akunFormData.role === 'wali_murid' && (
                  <select
                    value={akunFormData.kelas || uniqueClasses[0] || 'X KKBT'}
                    onChange={(e) => setAkunFormData({ ...akunFormData, kelas: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold"
                  >
                    {uniqueClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={akunFormData.email || ''}
                    onChange={(e) => setAkunFormData({ ...akunFormData, email: e.target.value })}
                    placeholder="nama@smkn1jember.sch.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
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
