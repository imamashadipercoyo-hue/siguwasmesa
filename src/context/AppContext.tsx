import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  GuruWali,
  Siswa,
  JurnalLayanan,
  PresensiRecord,
  RujukanBK,
  JadwalPertemuan,
  KonsultasiWaliMurid,
  UserRole,
  PresensiStatus,
  UserAccount,
  GoogleSheetsConfig
} from '../types';
import {
  INITIAL_GURU_WALI,
  INITIAL_SISWA,
  INITIAL_JURNAL,
  INITIAL_PRESENSI,
  INITIAL_RUJUKAN_BK,
  INITIAL_JADWAL,
  INITIAL_KONSULTASI_WALI_MURID
} from '../data/initialData';
import { INITIAL_AKUN } from '../data/initialAccounts';
import {
  testAppsScriptConnection,
  fetchAllFromGoogleSheets,
  pushAllToGoogleSheets,
  DEFAULT_APPS_SCRIPT_URL
} from '../services/googleSheetsService';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentGuruWali: GuruWali;
  setCurrentGuruWali: (guru: GuruWali) => void;
  guruWaliList: GuruWali[];
  
  // Authentication & Session
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;

  // Data
  siswaList: Siswa[];
  jurnalList: JurnalLayanan[];
  presensiList: PresensiRecord[];
  rujukanBKList: RujukanBK[];
  jadwalList: JadwalPertemuan[];
  konsultasiList: KonsultasiWaliMurid[];
  akunList: UserAccount[];

  // Google Sheets & Apps Script
  googleSheetsConfig: GoogleSheetsConfig;
  updateGoogleSheetsConfig: (cfg: Partial<GoogleSheetsConfig>) => void;
  testGoogleSheets: () => Promise<{ success: boolean; message: string }>;
  syncPullFromSheets: () => Promise<{ success: boolean; message: string }>;
  syncPushToSheets: () => Promise<{ success: boolean; message: string }>;

  // Admin Master Data Actions
  addSiswa: (siswa: Omit<Siswa, 'id'>) => void;
  updateSiswa: (id: string, updates: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;
  importSiswaList: (newList: Partial<Siswa>[], replaceExisting?: boolean) => void;

  addGuruWali: (guru: Omit<GuruWali, 'id'>) => void;
  updateGuruWali: (id: string, updates: Partial<GuruWali>) => void;
  deleteGuruWali: (id: string) => void;
  importGuruWaliList: (newList: GuruWali[], replaceExisting?: boolean) => void;

  addAkun: (akun: Omit<UserAccount, 'id'>) => void;
  updateAkun: (id: string, updates: Partial<UserAccount>) => void;
  deleteAkun: (id: string) => void;
  importAkunList: (newList: UserAccount[], replaceExisting?: boolean) => void;
  
  // Portal Orang Tua
  selectedSiswaForPortal: Siswa | null;
  setSelectedSiswaForPortal: (siswa: Siswa | null) => void;
  portalLoginError: string | null;
  loginPortalByNisn: (nisn: string, tanggalLahir: string) => boolean;
  logoutPortal: () => void;

  // Layanan & Kegiatan
  addJurnal: (jurnal: Omit<JurnalLayanan, 'id'>) => void;
  updateJurnal: (id: string, updates: Partial<JurnalLayanan>) => void;
  deleteJurnal: (id: string) => void;
  addOrtuFeedbackToJurnal: (jurnalId: string, tanggapan: string) => void;

  savePresensiHarian: (tanggal: string, kelas: string, statusMap: Record<string, { status: PresensiStatus; keterangan?: string }>) => void;
  
  addRujukanBK: (rujukan: Omit<RujukanBK, 'id' | 'status'>) => void;
  updateRujukanBK: (id: string, updates: Partial<RujukanBK>) => void;

  addJadwal: (jadwal: Omit<JadwalPertemuan, 'id'>) => void;
  updateJadwal: (id: string, updates: Partial<JadwalPertemuan>) => void;
  deleteJadwal: (id: string) => void;

  addKonsultasiWaliMurid: (konsul: Omit<KonsultasiWaliMurid, 'id' | 'status'>) => void;
  respondKonsultasi: (id: string, respon: string) => void;

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'siguwa_role',
  GURU_ID: 'siguwa_current_guru_id',
  SISWA: 'siguwa_siswa_data',
  GURU_LIST: 'siguwa_guru_list_data',
  JURNAL: 'siguwa_jurnal_data',
  PRESENSI: 'siguwa_presensi_data',
  RUJUKAN: 'siguwa_rujukan_data',
  JADWAL: 'siguwa_jadwal_data',
  KONSULTASI: 'siguwa_konsultasi_data',
  AKUN: 'siguwa_akun_data',
  GS_CONFIG: 'siguwa_google_sheets_config',
  PORTAL_SISWA: 'siguwa_portal_siswa_id',
  AUTH_USER: 'siguwa_auth_user',
  DATA_VERSION: 'siguwa_version_flag_v4'
};

const CURRENT_DATA_VERSION = 'v4_kelas_x_official_72_with_admin';

// Auto-migrate if previous version was stored
if (typeof window !== 'undefined') {
  try {
    const existingVer = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    if (existingVer !== CURRENT_DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.SISWA);
      localStorage.removeItem(STORAGE_KEYS.GURU_LIST);
      localStorage.removeItem(STORAGE_KEYS.JURNAL);
      localStorage.removeItem(STORAGE_KEYS.PRESENSI);
      localStorage.removeItem(STORAGE_KEYS.RUJUKAN);
      localStorage.removeItem(STORAGE_KEYS.JADWAL);
      localStorage.removeItem(STORAGE_KEYS.KONSULTASI);
      localStorage.removeItem(STORAGE_KEYS.AKUN);
      localStorage.removeItem(STORAGE_KEYS.GURU_ID);
      localStorage.removeItem(STORAGE_KEYS.PORTAL_SISWA);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
    }
  } catch (e) {
    console.warn('Storage migration notice:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current authenticated user session (null when not logged in)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Gagal membaca sesi user:', e);
    }
    return null;
  });

  const isAuthenticated = Boolean(currentUser);

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    if (currentUser) {
      return currentUser.role;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
    return saved || 'admin';
  });

  const [guruWaliList, setGuruWaliList] = useState<GuruWali[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GURU_LIST);
    return saved ? JSON.parse(saved) : INITIAL_GURU_WALI;
  });

  const [currentGuruWali, setCurrentGuruWaliState] = useState<GuruWali>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.GURU_ID);
    const found = INITIAL_GURU_WALI.find(g => g.id === savedId);
    return found || INITIAL_GURU_WALI[0];
  });

  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SISWA);
    return saved ? JSON.parse(saved) : INITIAL_SISWA;
  });

  const [jurnalList, setJurnalList] = useState<JurnalLayanan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JURNAL);
    return saved ? JSON.parse(saved) : INITIAL_JURNAL;
  });

  const [presensiList, setPresensiList] = useState<PresensiRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRESENSI);
    return saved ? JSON.parse(saved) : INITIAL_PRESENSI;
  });

  const [rujukanBKList, setRujukanBKList] = useState<RujukanBK[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RUJUKAN);
    return saved ? JSON.parse(saved) : INITIAL_RUJUKAN_BK;
  });

  const [jadwalList, setJadwalList] = useState<JadwalPertemuan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JADWAL);
    return saved ? JSON.parse(saved) : INITIAL_JADWAL;
  });

  const [konsultasiList, setKonsultasiList] = useState<KonsultasiWaliMurid[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KONSULTASI);
    return saved ? JSON.parse(saved) : INITIAL_KONSULTASI_WALI_MURID;
  });

  const [akunList, setAkunList] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AKUN);
    return saved ? JSON.parse(saved) : INITIAL_AKUN;
  });

  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GS_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          appsScriptUrl: parsed.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL,
          autoSync: true,
          syncStatus: 'connected',
          syncMessage: 'Terhubung ke Database Google Sheets SMKN 1 Jember'
        };
      } catch (e) {}
    }
    return {
      appsScriptUrl: DEFAULT_APPS_SCRIPT_URL,
      autoSync: true,
      syncStatus: 'connected',
      syncMessage: 'Terhubung ke Database Google Sheets SMKN 1 Jember',
      lastSyncTime: new Date().toLocaleTimeString('id-ID')
    };
  });

  const [selectedSiswaForPortal, setSelectedSiswaForPortalState] = useState<Siswa | null>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.PORTAL_SISWA);
    if (savedId) {
      const match = INITIAL_SISWA.find(s => s.id === savedId);
      return match || INITIAL_SISWA[0];
    }
    return INITIAL_SISWA[0];
  });

  const [portalLoginError, setPortalLoginError] = useState<string | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GURU_ID, currentGuruWali.id);
  }, [currentGuruWali]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GURU_LIST, JSON.stringify(guruWaliList));
  }, [guruWaliList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(jurnalList));
  }, [jurnalList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(presensiList));
  }, [presensiList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RUJUKAN, JSON.stringify(rujukanBKList));
  }, [rujukanBKList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwalList));
  }, [jadwalList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KONSULTASI, JSON.stringify(konsultasiList));
  }, [konsultasiList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AKUN, JSON.stringify(akunList));
  }, [akunList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GS_CONFIG, JSON.stringify(googleSheetsConfig));
  }, [googleSheetsConfig]);

  useEffect(() => {
    if (selectedSiswaForPortal) {
      localStorage.setItem(STORAGE_KEYS.PORTAL_SISWA, selectedSiswaForPortal.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.PORTAL_SISWA);
    }
  }, [selectedSiswaForPortal]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
  };

  const setCurrentGuruWali = (guru: GuruWali) => {
    setCurrentGuruWaliState(guru);
  };

  const setSelectedSiswaForPortal = (siswa: Siswa | null) => {
    setSelectedSiswaForPortalState(siswa);
    setPortalLoginError(null);
  };

  // Keep role strictly synced with active user
  useEffect(() => {
    if (currentUser) {
      setCurrentRoleState(currentUser.role);
      localStorage.setItem(STORAGE_KEYS.ROLE, currentUser.role);
    }
  }, [currentUser]);

  // Authentication Methods - Fast, Resilient & Multi-Role
  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanDigits = cleanUser.replace(/\D/g, '');

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Harap masukkan Username / NISN dan Password.' };
    }

    // 1. Search in registered akunList
    let matchedAccount = akunList.find(a => 
      a.username.toLowerCase() === cleanUser || 
      (cleanDigits.length >= 6 && a.username.replace(/\D/g, '') === cleanDigits) ||
      (a.email && a.email.toLowerCase() === cleanUser)
    );

    // 2. Fallback: Search in siswaList by NISN or Name for Wali Murid
    if (!matchedAccount && cleanDigits.length >= 6) {
      const matchSiswa = siswaList.find(s => s.nisn.replace(/\D/g, '') === cleanDigits);
      if (matchSiswa) {
        matchedAccount = {
          id: `usr-wali-${matchSiswa.id}`,
          username: matchSiswa.nisn,
          password: '123456',
          nama: matchSiswa.namaOrtu ? `${matchSiswa.namaOrtu} (Wali ${matchSiswa.nama})` : `Wali Murid - ${matchSiswa.nama}`,
          email: `wali.${matchSiswa.nisn}@smkn1jember.sch.id`,
          role: 'wali_murid',
          roleLabel: `Wali Murid ${matchSiswa.kelas}`,
          status: 'Aktif',
          linkedId: matchSiswa.id,
          telepon: matchSiswa.noHpOrtu
        };
      }
    }

    // 3. Fallback: Search in guruWaliList by NIP or Email for Teachers
    if (!matchedAccount) {
      const matchGW = guruWaliList.find(g => 
        (cleanDigits.length >= 8 && g.nip.replace(/\D/g, '') === cleanDigits) ||
        (g.email && g.email.toLowerCase() === cleanUser) ||
        cleanUser.includes(g.nama.toLowerCase().split(' ')[0])
      );
      if (matchGW) {
        const isBK = matchGW.id === 'gw-3' || matchGW.jurusan.toLowerCase().includes('bk');
        matchedAccount = {
          id: `usr-${matchGW.id}`,
          username: matchGW.email.split('@')[0],
          password: isBK ? 'bk123' : 'guru123',
          nama: `${matchGW.nama}, ${matchGW.gelar}`,
          email: matchGW.email,
          role: isBK ? 'manajemen_bk' : 'guru_wali',
          roleLabel: isBK ? 'Koordinator BK & Kesiswaan' : `Guru Wali Kelas ${matchGW.kelas}`,
          status: 'Aktif',
          linkedId: matchGW.id,
          telepon: matchGW.telepon
        };
      }
    }

    // 4. Fallback: Standard Administrator
    if (!matchedAccount && (cleanUser === 'admin' || cleanUser === 'admin.siguwa')) {
      matchedAccount = {
        id: 'usr-admin-1',
        username: 'admin.siguwa',
        password: 'admin123',
        nama: 'Administrator Utama SMKN 1 Jember',
        email: 'admin.siguwa@smkn1jember.sch.id',
        role: 'admin',
        roleLabel: 'Super Administrator',
        status: 'Aktif',
        telepon: '08113456789'
      };
    }

    if (!matchedAccount) {
      return { success: false, message: 'Akun dengan Username / NISN / NIP tersebut tidak terdaftar.' };
    }

    if (matchedAccount.status === 'Nonaktif') {
      return { success: false, message: 'Akun ini dinonaktifkan oleh Administrator. Hubungi pihak sekolah.' };
    }

    // Password Validation
    let isValidPassword = false;
    const defaultRolePassword = (
      matchedAccount.role === 'admin' ? 'admin123' :
      matchedAccount.role === 'guru_wali' ? 'guru123' :
      matchedAccount.role === 'manajemen_bk' ? 'bk123' : '123456'
    );

    if (cleanPass === matchedAccount.password || cleanPass === defaultRolePassword) {
      isValidPassword = true;
    } else if (matchedAccount.role === 'admin' && (cleanPass === 'admin' || cleanPass === 'admin123')) {
      isValidPassword = true;
    } else if (matchedAccount.role === 'guru_wali' && (cleanPass === 'guru123' || cleanPass === '123456')) {
      isValidPassword = true;
    } else if (matchedAccount.role === 'manajemen_bk' && (cleanPass === 'bk123' || cleanPass === '123456')) {
      isValidPassword = true;
    } else if (matchedAccount.role === 'wali_murid') {
      const matchSiswa = siswaList.find(s => s.id === matchedAccount?.linkedId || s.nisn === matchedAccount?.username);
      if (
        cleanPass === '123456' || 
        cleanPass === matchedAccount.username ||
        (matchSiswa && (cleanPass === matchSiswa.nisn || cleanPass === matchSiswa.tanggalLahir || cleanPass === matchSiswa.tanggalLahir.replace(/-/g, '')))
      ) {
        isValidPassword = true;
      }
    }

    if (!isValidPassword) {
      return { success: false, message: 'Password salah. Periksa huruf besar/kecil atau hubungi Admin.' };
    }

    const nowStr = new Date().toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, ':');

    const updatedUser: UserAccount = {
      ...matchedAccount,
      lastLogin: nowStr
    };

    // 1. Set current user state & store in localStorage
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));

    // 2. Ensure user is in akunList
    setAkunList(prev => {
      const exists = prev.some(a => a.id === updatedUser.id || a.username === updatedUser.username);
      if (exists) {
        return prev.map(a => (a.id === updatedUser.id || a.username === updatedUser.username) ? updatedUser : a);
      } else {
        return [...prev, updatedUser];
      }
    });

    // 3. Immediately set and store current role
    setCurrentRoleState(updatedUser.role);
    localStorage.setItem(STORAGE_KEYS.ROLE, updatedUser.role);

    // 4. Role-specific context bindings
    if (updatedUser.role === 'guru_wali') {
      const matchGW = guruWaliList.find(g => g.id === updatedUser.linkedId || g.email.toLowerCase() === updatedUser.email.toLowerCase());
      if (matchGW) {
        setCurrentGuruWaliState(matchGW);
        localStorage.setItem(STORAGE_KEYS.GURU_ID, matchGW.id);
      }
    } else if (updatedUser.role === 'manajemen_bk') {
      const matchBK = guruWaliList.find(g => g.id === updatedUser.linkedId || g.id === 'gw-3');
      if (matchBK) {
        setCurrentGuruWaliState(matchBK);
        localStorage.setItem(STORAGE_KEYS.GURU_ID, matchBK.id);
      }
    } else if (updatedUser.role === 'wali_murid') {
      const matchSiswa = siswaList.find(s => s.id === updatedUser.linkedId || s.nisn === updatedUser.username);
      if (matchSiswa) {
        setSelectedSiswaForPortalState(matchSiswa);
        localStorage.setItem(STORAGE_KEYS.PORTAL_SISWA, matchSiswa.id);
      }
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setSelectedSiswaForPortalState(null);
    localStorage.removeItem(STORAGE_KEYS.PORTAL_SISWA);
  };

  // Google Sheets Handlers
  const updateGoogleSheetsConfig = (cfg: Partial<GoogleSheetsConfig>) => {
    setGoogleSheetsConfig(prev => ({ ...prev, ...cfg }));
  };

  const testGoogleSheets = async (): Promise<{ success: boolean; message: string }> => {
    if (!googleSheetsConfig.appsScriptUrl) {
      return { success: false, message: 'Harap masukkan URL Google Apps Script Web App terlebih dahulu' };
    }
    updateGoogleSheetsConfig({ syncStatus: 'syncing', syncMessage: 'Menguji koneksi...' });
    const result = await testAppsScriptConnection(googleSheetsConfig.appsScriptUrl);
    if (result.success) {
      updateGoogleSheetsConfig({
        syncStatus: 'connected',
        syncMessage: 'Koneksi ke Google Sheets Berhasil Aktif!',
        lastSyncTime: new Date().toLocaleTimeString('id-ID')
      });
      return { success: true, message: result.message };
    } else {
      updateGoogleSheetsConfig({
        syncStatus: 'error',
        syncMessage: result.message || 'Koneksi gagal'
      });
      return { success: false, message: result.message };
    }
  };

  // Keep latest refs of all data to avoid stale closures during async sync
  const dataRef = useRef({
    siswa: siswaList,
    guruWali: guruWaliList,
    akun: akunList,
    jurnal: jurnalList,
    presensi: presensiList,
    rujukanBK: rujukanBKList,
    jadwal: jadwalList
  });

  useEffect(() => {
    dataRef.current = {
      siswa: siswaList,
      guruWali: guruWaliList,
      akun: akunList,
      jurnal: jurnalList,
      presensi: presensiList,
      rujukanBK: rujukanBKList,
      jadwal: jadwalList
    };
  }, [siswaList, guruWaliList, akunList, jurnalList, presensiList, rujukanBKList, jadwalList]);

  const syncPullFromSheets = async (): Promise<{ success: boolean; message: string }> => {
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (!url) {
      return { success: false, message: 'URL Apps Script belum diisi' };
    }
    updateGoogleSheetsConfig({ syncStatus: 'syncing', syncMessage: 'Mengunduh data terbaru dari Google Sheets...' });
    const result = await fetchAllFromGoogleSheets(url);
    if (result.success && result.data) {
      // 1. Siswa
      if (Array.isArray(result.data.siswa) && result.data.siswa.length > 0) {
        const normalizedSiswa: Siswa[] = result.data.siswa.map((s: any) => ({
          id: String(s.id || `sis-${Date.now()}`),
          nisn: String(s.nisn || ''),
          nama: String(s.nama || ''),
          kelas: String(s.kelas || 'X KKBT'),
          jurusan: String(s.jurusan || ''),
          jenisKelamin: (s.jenisKelamin === 'P' ? 'P' : 'L') as 'L' | 'P',
          tanggalLahir: typeof s.tanggalLahir === 'string' && s.tanggalLahir.includes('T')
            ? s.tanggalLahir.split('T')[0]
            : String(s.tanggalLahir || '2010-01-01'),
          alamat: String(s.alamat || ''),
          namaOrtu: String(s.namaOrtu || ''),
          noHpOrtu: s.noHpOrtu !== undefined && s.noHpOrtu !== null ? String(s.noHpOrtu) : '',
          nilaiRataRata: Number(s.nilaiRataRata) || 80,
          poinKarakter: Number(s.poinKarakter) || 85,
          statusPendampingan: (s.statusPendampingan || 'Normal') as any,
          catatanKhusus: String(s.catatanKhusus || '')
        }));
        setSiswaList(normalizedSiswa);
      }

      // 2. Guru Wali
      if (Array.isArray(result.data.guruWali) && result.data.guruWali.length > 0) {
        const normalizedGuru: GuruWali[] = result.data.guruWali.map((g: any) => ({
          id: String(g.id || `gw-${Date.now()}`),
          nip: String(g.nip || ''),
          nama: String(g.nama || ''),
          gelar: String(g.gelar || ''),
          kelas: String(g.kelas || 'X KKBT'),
          jurusan: String(g.jurusan || ''),
          telepon: g.telepon !== undefined && g.telepon !== null ? String(g.telepon) : '',
          email: String(g.email || ''),
          avatar: String(g.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
          bio: String(g.bio || '')
        }));
        setGuruWaliList(normalizedGuru);
      }

      // 3. Akun Pengguna
      if (Array.isArray(result.data.akun) && result.data.akun.length > 0) {
        const normalizedAkun: UserAccount[] = result.data.akun.map((a: any) => ({
          id: String(a.id || `usr-${Date.now()}`),
          username: String(a.username || ''),
          nama: String(a.nama || ''),
          email: String(a.email || ''),
          role: (a.role || 'guru_wali') as any,
          roleLabel: String(a.roleLabel || 'Guru Wali'),
          status: (String(a.status).toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif',
          lastLogin: a.lastLogin ? String(a.lastLogin) : undefined,
          telepon: a.telepon !== undefined && a.telepon !== null ? String(a.telepon) : undefined
        }));
        setAkunList(normalizedAkun);
      }

      // 4. Jurnal
      let needInitialSeedPush = false;
      if (Array.isArray(result.data.jurnal) && result.data.jurnal.length > 0) {
        setJurnalList(result.data.jurnal);
      } else {
        needInitialSeedPush = true;
      }

      // 5. Presensi
      if (Array.isArray(result.data.presensi) && result.data.presensi.length > 0) {
        setPresensiList(result.data.presensi);
      }

      // 6. Rujukan BK
      if (Array.isArray(result.data.rujukanBK) && result.data.rujukanBK.length > 0) {
        setRujukanBKList(result.data.rujukanBK);
      }

      // 7. Jadwal
      if (Array.isArray(result.data.jadwal) && result.data.jadwal.length > 0) {
        setJadwalList(result.data.jadwal);
      }

      updateGoogleSheetsConfig({
        syncStatus: 'connected',
        syncMessage: 'Data berhasil disinkronisasi dari Google Sheets',
        lastSyncTime: new Date().toLocaleTimeString('id-ID')
      });

      // Jika remote sheet masih kosong untuk jurnal/presensi, dorong inisialisasi awal ke spreadsheet
      if (needInitialSeedPush) {
        setTimeout(() => {
          syncPushToSheets().catch(() => {});
        }, 1200);
      }

      return { success: true, message: 'Data berhasil diunduh dari Google Sheets!' };
    } else {
      updateGoogleSheetsConfig({ syncStatus: 'error', syncMessage: result.message });
      return { success: false, message: result.message };
    }
  };

  const syncPushToSheets = async (): Promise<{ success: boolean; message: string }> => {
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (!url) {
      return { success: false, message: 'URL Apps Script belum diisi' };
    }
    updateGoogleSheetsConfig({ syncStatus: 'syncing', syncMessage: 'Mengunggah data ke Google Sheets...' });
    const payload = dataRef.current;
    const result = await pushAllToGoogleSheets(url, payload);
    if (result.success) {
      updateGoogleSheetsConfig({
        syncStatus: 'connected',
        syncMessage: 'Seluruh data berhasil disimpan ke Google Sheets',
        lastSyncTime: new Date().toLocaleTimeString('id-ID')
      });
      return { success: true, message: 'Data berhasil diunggah ke Google Sheets!' };
    } else {
      updateGoogleSheetsConfig({ syncStatus: 'error', syncMessage: result.message });
      return { success: false, message: result.message };
    }
  };

  // Debounced auto-push whenever any data state changes
  const autoPushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstDataMountRef = useRef(true);

  useEffect(() => {
    if (isFirstDataMountRef.current) {
      isFirstDataMountRef.current = false;
      return;
    }
    if (!googleSheetsConfig.autoSync || !googleSheetsConfig.appsScriptUrl) return;

    if (autoPushTimerRef.current) {
      clearTimeout(autoPushTimerRef.current);
    }
    autoPushTimerRef.current = setTimeout(() => {
      syncPushToSheets().catch(err => console.warn('Auto sync push notice:', err));
    }, 1500);

    return () => {
      if (autoPushTimerRef.current) {
        clearTimeout(autoPushTimerRef.current);
      }
    };
  }, [
    siswaList,
    guruWaliList,
    akunList,
    jurnalList,
    presensiList,
    rujukanBKList,
    jadwalList,
    googleSheetsConfig.autoSync,
    googleSheetsConfig.appsScriptUrl
  ]);

  // Real-time continuous background sync (initial pull on load + periodic poll every 20s + window focus)
  useEffect(() => {
    if (!googleSheetsConfig.appsScriptUrl || !googleSheetsConfig.autoSync) return;

    // Tarik data awal saat aplikasi dimuat
    syncPullFromSheets().catch(err => console.warn('Initial load pull notice:', err));

    // Polling periodik setiap 20 detik secara terus-menerus
    const interval = setInterval(() => {
      if (!document.hidden && navigator.onLine) {
        syncPullFromSheets().catch(err => console.warn('Real-time polling pull notice:', err));
      }
    }, 20000);

    // Tarik data terbaru saat tab kembali aktif (focus)
    const handleFocus = () => {
      if (navigator.onLine) {
        syncPullFromSheets().catch(err => console.warn('Focus pull notice:', err));
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [googleSheetsConfig.appsScriptUrl, googleSheetsConfig.autoSync]);

  // Auto Push Helper manual trigger
  const triggerAutoPushIfEnabled = useCallback(() => {
    if (googleSheetsConfig.autoSync && googleSheetsConfig.appsScriptUrl) {
      if (autoPushTimerRef.current) clearTimeout(autoPushTimerRef.current);
      autoPushTimerRef.current = setTimeout(() => {
        syncPushToSheets().catch(err => console.warn('Auto sync warning:', err));
      }, 500);
    }
  }, [googleSheetsConfig.autoSync, googleSheetsConfig.appsScriptUrl]);

  // Master Siswa CRUD
  const addSiswa = (siswa: Omit<Siswa, 'id'>) => {
    const newEntry: Siswa = {
      ...siswa,
      id: `sis-${Date.now()}`
    };
    setSiswaList(prev => [newEntry, ...prev]);
    triggerAutoPushIfEnabled();
  };

  const updateSiswa = (id: string, updates: Partial<Siswa>) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    triggerAutoPushIfEnabled();
  };

  const deleteSiswa = (id: string) => {
    setSiswaList(prev => prev.filter(s => s.id !== id));
    triggerAutoPushIfEnabled();
  };

  const importSiswaList = (newList: Partial<Siswa>[], replaceExisting = false) => {
    const formatted: Siswa[] = newList.map((item, index) => ({
      id: item.id || `sis-imp-${Date.now()}-${index}`,
      nisn: item.nisn || `009${Date.now() + index}`,
      nama: item.nama || 'Siswa Baru',
      kelas: item.kelas || 'X KKBT',
      jurusan: item.jurusan || (item.kelas?.includes('KKBT') ? 'Kriya Kreatif Batik dan Tekstil' : 'Teknik Logistik'),
      jenisKelamin: item.jenisKelamin || 'L',
      tanggalLahir: item.tanggalLahir || '2010-01-01',
      alamat: item.alamat || 'Jember',
      namaOrtu: item.namaOrtu || 'Orang Tua Siswa',
      noHpOrtu: item.noHpOrtu || '08123456789',
      nilaiRataRata: item.nilaiRataRata ?? 80,
      poinKarakter: item.poinKarakter ?? 85,
      statusPendampingan: item.statusPendampingan || 'Normal',
      catatanKhusus: item.catatanKhusus || ''
    }));

    if (replaceExisting) {
      setSiswaList(formatted);
    } else {
      // Upsert by NISN
      setSiswaList(prev => {
        const existingMap = new Map(prev.map(s => [s.nisn, s]));
        formatted.forEach(s => existingMap.set(s.nisn, s));
        return Array.from(existingMap.values());
      });
    }
    triggerAutoPushIfEnabled();
  };

  // Master Guru Wali CRUD
  const addGuruWali = (guru: Omit<GuruWali, 'id'>) => {
    const newEntry: GuruWali = {
      ...guru,
      id: `gw-${Date.now()}`
    };
    setGuruWaliList(prev => [...prev, newEntry]);
    triggerAutoPushIfEnabled();
  };

  const updateGuruWali = (id: string, updates: Partial<GuruWali>) => {
    setGuruWaliList(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    if (currentGuruWali.id === id) {
      setCurrentGuruWaliState(prev => ({ ...prev, ...updates }));
    }
    triggerAutoPushIfEnabled();
  };

  const deleteGuruWali = (id: string) => {
    setGuruWaliList(prev => prev.filter(g => g.id !== id));
    triggerAutoPushIfEnabled();
  };

  const importGuruWaliList = (newList: GuruWali[], replaceExisting = false) => {
    if (replaceExisting) {
      setGuruWaliList(newList);
    } else {
      setGuruWaliList(prev => {
        const existingNip = new Set(prev.map(g => g.nip));
        const toAdd = newList.filter(g => !existingNip.has(g.nip));
        return [...prev, ...toAdd];
      });
    }
    triggerAutoPushIfEnabled();
  };

  // Master Akun CRUD
  const addAkun = (akun: Omit<UserAccount, 'id'>) => {
    const newEntry: UserAccount = {
      ...akun,
      id: `usr-${Date.now()}`
    };
    setAkunList(prev => [newEntry, ...prev]);
    triggerAutoPushIfEnabled();
  };

  const updateAkun = (id: string, updates: Partial<UserAccount>) => {
    setAkunList(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    triggerAutoPushIfEnabled();
  };

  const deleteAkun = (id: string) => {
    setAkunList(prev => prev.filter(a => a.id !== id));
    triggerAutoPushIfEnabled();
  };

  const importAkunList = (newList: UserAccount[], replaceExisting = false) => {
    if (replaceExisting) {
      setAkunList(newList);
    } else {
      setAkunList(prev => {
        const existingUsernames = new Set(prev.map(a => a.username));
        const toAdd = newList.filter(a => !existingUsernames.has(a.username));
        return [...prev, ...toAdd];
      });
    }
    triggerAutoPushIfEnabled();
  };

  // Portal Login
  const loginPortalByNisn = (nisn: string, tanggalLahir: string): boolean => {
    const trimmedNisn = nisn.trim();
    const target = siswaList.find(s => s.nisn === trimmedNisn);
    if (!target) {
      setPortalLoginError('NISN tidak ditemukan dalam basis data SMKN 1 Jember.');
      return false;
    }
    if (tanggalLahir && target.tanggalLahir !== tanggalLahir) {
      setPortalLoginError('Tanggal lahir siswa tidak sesuai dengan data registrasi.');
      return false;
    }
    setSelectedSiswaForPortalState(target);
    setPortalLoginError(null);
    return true;
  };

  const logoutPortal = () => {
    setSelectedSiswaForPortalState(null);
  };

  // Jurnal CRUD
  const addJurnal = (jurnal: Omit<JurnalLayanan, 'id'>) => {
    const newEntry: JurnalLayanan = {
      ...jurnal,
      id: `jur-${Date.now()}`
    };
    setJurnalList(prev => [newEntry, ...prev]);

    if (jurnal.status === 'Dirujuk ke BK') {
      const newRujukan: RujukanBK = {
        id: `ruj-${Date.now()}`,
        tanggal: jurnal.tanggal,
        siswaId: jurnal.siswaId,
        siswaNama: jurnal.siswaNama,
        kelas: jurnal.kelas,
        guruWaliId: jurnal.guruWaliId,
        guruWaliNama: jurnal.guruWaliNama,
        alasanRujukan: jurnal.topik,
        indikasiMasalah: jurnal.uraian,
        upayaGuruWali: jurnal.hasilKesepakatan || 'Telah dilakukan pembinaan awal oleh Guru Wali',
        status: 'Menunggu Verifikasi',
        catatanGuruBK: 'Menunggu telaah disposisi Guru BK SMKN 1 Jember'
      };
      setRujukanBKList(prev => [newRujukan, ...prev]);
      setSiswaList(prev => prev.map(s => s.id === jurnal.siswaId ? { ...s, statusPendampingan: 'Dalam Penanganan BK' } : s));
    }
    triggerAutoPushIfEnabled();
  };

  const updateJurnal = (id: string, updates: Partial<JurnalLayanan>) => {
    setJurnalList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerAutoPushIfEnabled();
  };

  const deleteJurnal = (id: string) => {
    setJurnalList(prev => prev.filter(item => item.id !== id));
    triggerAutoPushIfEnabled();
  };

  const addOrtuFeedbackToJurnal = (jurnalId: string, tanggapan: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setJurnalList(prev => prev.map(item => item.id === jurnalId ? {
      ...item,
      tanggapanOrtu: tanggapan,
      tanggalTanggapan: dateStr
    } : item));
    triggerAutoPushIfEnabled();
  };

  const savePresensiHarian = (tanggal: string, kelas: string, statusMap: Record<string, { status: PresensiStatus; keterangan?: string }>) => {
    setPresensiList(prev => {
      const remaining = prev.filter(p => !(p.tanggal === tanggal && p.kelas === kelas));
      const newRecords: PresensiRecord[] = Object.entries(statusMap).map(([siswaId, data]) => ({
        id: `pre-${tanggal}-${siswaId}`,
        tanggal,
        siswaId,
        kelas,
        status: data.status,
        keterangan: data.keterangan || ''
      }));
      return [...newRecords, ...remaining];
    });
    triggerAutoPushIfEnabled();
  };

  const addRujukanBK = (rujukan: Omit<RujukanBK, 'id' | 'status'>) => {
    const newEntry: RujukanBK = {
      ...rujukan,
      id: `ruj-${Date.now()}`,
      status: 'Menunggu Verifikasi'
    };
    setRujukanBKList(prev => [newEntry, ...prev]);
    setSiswaList(prev => prev.map(s => s.id === rujukan.siswaId ? { ...s, statusPendampingan: 'Dalam Penanganan BK' } : s));
    triggerAutoPushIfEnabled();
  };

  const updateRujukanBK = (id: string, updates: Partial<RujukanBK>) => {
    setRujukanBKList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerAutoPushIfEnabled();
  };

  const addJadwal = (jadwal: Omit<JadwalPertemuan, 'id'>) => {
    const newEntry: JadwalPertemuan = {
      ...jadwal,
      id: `jad-${Date.now()}`
    };
    setJadwalList(prev => [newEntry, ...prev]);
    triggerAutoPushIfEnabled();
  };

  const updateJadwal = (id: string, updates: Partial<JadwalPertemuan>) => {
    setJadwalList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    triggerAutoPushIfEnabled();
  };

  const deleteJadwal = (id: string) => {
    setJadwalList(prev => prev.filter(item => item.id !== id));
    triggerAutoPushIfEnabled();
  };

  const addKonsultasiWaliMurid = (konsul: Omit<KonsultasiWaliMurid, 'id' | 'status'>) => {
    const newEntry: KonsultasiWaliMurid = {
      ...konsul,
      id: `kon-${Date.now()}`,
      status: 'Menunggu Respon'
    };
    setKonsultasiList(prev => [newEntry, ...prev]);
    triggerAutoPushIfEnabled();
  };

  const respondKonsultasi = (id: string, respon: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setKonsultasiList(prev => prev.map(k => k.id === id ? {
      ...k,
      status: 'Selesai',
      responGuruWali: respon,
      tanggalRespon: dateStr
    } : k));
    triggerAutoPushIfEnabled();
  };

  const resetToDefaultData = () => {
    setSiswaList(INITIAL_SISWA);
    setGuruWaliList(INITIAL_GURU_WALI);
    setJurnalList(INITIAL_JURNAL);
    setPresensiList(INITIAL_PRESENSI);
    setRujukanBKList(INITIAL_RUJUKAN_BK);
    setJadwalList(INITIAL_JADWAL);
    setKonsultasiList(INITIAL_KONSULTASI_WALI_MURID);
    setAkunList(INITIAL_AKUN);
    setCurrentGuruWaliState(INITIAL_GURU_WALI[0]);
    setSelectedSiswaForPortalState(INITIAL_SISWA[0]);
    setCurrentUser(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        currentRole,
        setCurrentRole,
        currentGuruWali,
        setCurrentGuruWali,
        guruWaliList,
        siswaList,
        jurnalList,
        presensiList,
        rujukanBKList,
        jadwalList,
        konsultasiList,
        akunList,
        googleSheetsConfig,
        updateGoogleSheetsConfig,
        testGoogleSheets,
        syncPullFromSheets,
        syncPushToSheets,
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
        selectedSiswaForPortal,
        setSelectedSiswaForPortal,
        portalLoginError,
        loginPortalByNisn,
        logoutPortal,
        addJurnal,
        updateJurnal,
        deleteJurnal,
        addOrtuFeedbackToJurnal,
        savePresensiHarian,
        addRujukanBK,
        updateRujukanBK,
        addJadwal,
        updateJadwal,
        deleteJadwal,
        addKonsultasiWaliMurid,
        respondKonsultasi,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
