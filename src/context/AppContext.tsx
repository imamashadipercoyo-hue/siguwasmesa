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
  pushSiswaToGoogleSheets,
  fetchSiswaFromGoogleSheets,
  clearSiswaFromGoogleSheets,
  DEFAULT_APPS_SCRIPT_URL
} from '../services/googleSheetsService';
import { deduplicateAccounts } from '../utils/accountUtils';

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
  syncPullFromSheets: (forcePull?: boolean) => Promise<{ success: boolean; message: string }>;
  syncPushToSheets: () => Promise<{ success: boolean; message: string }>;
  syncPushSiswaToSheets: (onProgress?: (info: { chunkIndex: number; totalChunks: number; percent: number; message: string }) => void) => Promise<{ success: boolean; message: string; totalSynced?: number }>;
  syncPullSiswaFromSheets: (forcePull?: boolean) => Promise<{ success: boolean; message: string; totalSynced?: number }>;

  // Admin Master Data Actions
  addSiswa: (siswa: Omit<Siswa, 'id'>) => void;
  updateSiswa: (id: string, updates: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;
  clearAllSiswa: () => Promise<{ success: boolean; message: string }>;
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
  DATA_VERSION: 'siguwa_version_flag_v4',
  DELETED_SISWA_IDS: 'siguwa_deleted_siswa_ids',
  SISWA_CLEARED_FLAG: 'siguwa_siswa_cleared_flag'
};

// Tombstone helpers to permanently track deleted siswa IDs/NISNs
const getDeletedSiswaIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_SISWA_IDS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {}
  return new Set();
};

const saveDeletedSiswaIds = (set: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DELETED_SISWA_IDS, JSON.stringify(Array.from(set)));
  } catch (e) {}
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
    try {
      // 1. Cek penanda eksplisit jika data siswa pernah dikosongkan
      const isCleared = localStorage.getItem(STORAGE_KEYS.SISWA_CLEARED_FLAG);
      if (isCleared === 'true') {
        return [];
      }

      // 2. Cek data yang tersimpan di localStorage
      const saved = localStorage.getItem(STORAGE_KEYS.SISWA);
      if (saved !== null) {
        // Jika tersimpan sebagai string kosong atau '[]', itu adalah data kosong yang sah ([]), JANGAN kembalikan INITIAL_SISWA!
        if (saved === '' || saved === '[]' || saved === 'null') {
          return [];
        }
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Jika parsed adalah array kosong [], kembalikan [], JANGAN fallback ke INITIAL_SISWA!
          if (parsed.length === 0) {
            return [];
          }
          const deleted = getDeletedSiswaIds();
          return parsed.filter((s: Siswa) => !deleted.has(s.id) && !deleted.has(s.nisn));
        }
      }

      // 3. Jika sistem sudah pernah dibuka sebelumnya (DATA_VERSION ada) tetapi data siswa null/kosong,
      // artinya data memang sengaja dikosongkan ([]), JANGAN muat INITIAL_SISWA!
      const hasInit = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
      if (hasInit) {
        return [];
      }

      // Hanya untuk instalasi baru pertama kali (first run)
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
      return INITIAL_SISWA;
    } catch (e) {
      console.warn('Gagal membaca siswa:', e);
      return [];
    }
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

  const [akunList, setAkunListState] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AKUN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateAccounts(parsed);
        }
      }
    } catch (e) {
      console.warn('Gagal membaca akun:', e);
    }
    return deduplicateAccounts(INITIAL_AKUN);
  });

  const setAkunList = useCallback((action: React.SetStateAction<UserAccount[]>) => {
    setAkunListState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      return deduplicateAccounts(next);
    });
  }, []);

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
    try {
      const isCleared = localStorage.getItem(STORAGE_KEYS.SISWA_CLEARED_FLAG) === 'true';
      if (isCleared) return null;
      const saved = localStorage.getItem(STORAGE_KEYS.SISWA);
      if (!saved || saved === '[]' || saved === 'null') return null;
      const list: Siswa[] = JSON.parse(saved);
      if (Array.isArray(list) && list.length > 0) {
        const savedId = localStorage.getItem(STORAGE_KEYS.PORTAL_SISWA);
        if (savedId) {
          const match = list.find(s => s.id === savedId);
          if (match) return match;
        }
        return list[0];
      }
    } catch (e) {}
    return null;
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
    if (siswaList.length === 0) {
      localStorage.setItem(STORAGE_KEYS.SISWA_CLEARED_FLAG, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.SISWA_CLEARED_FLAG);
    }
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
      matchedAccount.role === 'kkk' ? 'kkk123' :
      matchedAccount.role === 'guru_wali' || matchedAccount.role === 'wali_kelas' ? 'guru123' :
      matchedAccount.role === 'manajemen_bk' || matchedAccount.role === 'bk' ? 'bk123' : '123456'
    );

    if (cleanPass === matchedAccount.password || cleanPass === defaultRolePassword) {
      isValidPassword = true;
    } else if (matchedAccount.role === 'admin' && (cleanPass === 'admin' || cleanPass === 'admin123')) {
      isValidPassword = true;
    } else if (matchedAccount.role === 'kkk' && (cleanPass === 'kkk123' || cleanPass === 'guru123' || cleanPass === '123456')) {
      isValidPassword = true;
    } else if ((matchedAccount.role === 'guru_wali' || matchedAccount.role === 'wali_kelas') && (cleanPass === 'guru123' || cleanPass === '123456')) {
      isValidPassword = true;
    } else if ((matchedAccount.role === 'manajemen_bk' || matchedAccount.role === 'bk') && (cleanPass === 'bk123' || cleanPass === '123456')) {
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
      const matchGW = guruWaliList.find(g => 
        g.id === updatedUser.linkedId || 
        g.email.toLowerCase() === updatedUser.email.toLowerCase() ||
        (updatedUser.kelas && g.kelas.toLowerCase() === updatedUser.kelas.toLowerCase())
      );
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

  const syncPullFromSheets = async (forcePull = false): Promise<{ success: boolean; message: string }> => {
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (!url) {
      return { success: false, message: 'URL Apps Script belum diisi' };
    }
    updateGoogleSheetsConfig({ syncStatus: 'syncing', syncMessage: 'Mengunduh data terbaru dari Google Sheets...' });
    const result = await fetchAllFromGoogleSheets(url);
    if (result.success && result.data) {
      // 1. Siswa
      // PERLINDUNGAN AUTO SYNC: Jika tabel siswa dalam kondisi kosong ([]),
      // JANGAN lakukan penarikan atau pemulihan data siswa dari Google Sheets!
      const isSiswaCleared = localStorage.getItem(STORAGE_KEYS.SISWA_CLEARED_FLAG) === 'true';
      const isSiswaLocallyEmpty = isSiswaCleared ||
                                  dataRef.current.siswa.length === 0 ||
                                  localStorage.getItem(STORAGE_KEYS.SISWA) === '[]';

      if (isSiswaLocallyEmpty && !forcePull) {
        // Pertahankan tabel siswa tetap kosong ([]), jangan timpa dengan baris lama Google Sheets
        setSiswaList([]);
      } else if (Array.isArray(result.data.siswa)) {
        if (result.data.siswa.length === 0) {
          setSiswaList([]);
        } else {
          const deleted = forcePull ? new Set<string>() : getDeletedSiswaIds();
          const normalizedSiswa: Siswa[] = result.data.siswa
            .filter((s: any) => {
              const id = String(s.id || '').trim();
              const nisn = String(s.nisn || '').replace(/^'/, '').trim();
              if (id && deleted.has(id)) return false;
              if (nisn && deleted.has(nisn)) return false;
              return true;
            })
            .map((s: any, idx: number) => ({
              id: String(s.id && String(s.id).trim() ? s.id : `sis-${Date.now()}-${idx}`),
              nisn: String(s.nisn || '').replace(/^'/, ''),
              nama: String(s.nama || ''),
              kelas: String(s.kelas || 'X KKBT'),
              jurusan: String(s.jurusan || ''),
              jenisKelamin: (s.jenisKelamin === 'P' ? 'P' : 'L') as 'L' | 'P',
              tanggalLahir: typeof s.tanggalLahir === 'string' && s.tanggalLahir.includes('T')
                ? s.tanggalLahir.split('T')[0]
                : String(s.tanggalLahir || '2010-01-01'),
              alamat: String(s.alamat || ''),
              namaOrtu: String(s.namaOrtu || ''),
              noHpOrtu: s.noHpOrtu !== undefined && s.noHpOrtu !== null ? String(s.noHpOrtu).replace(/^'/, '') : '',
              nilaiRataRata: Number(s.nilaiRataRata) || 80,
              poinKarakter: Number(s.poinKarakter) || 85,
              statusPendampingan: (s.statusPendampingan || 'Normal') as any,
              catatanKhusus: String(s.catatanKhusus || '')
            }));
          setSiswaList(normalizedSiswa);
        }
      }

      // 2. Guru Wali
      if (Array.isArray(result.data.guruWali) && result.data.guruWali.length > 0) {
        const normalizedGuru: GuruWali[] = result.data.guruWali.map((g: any, idx: number) => {
          const rawRole = String(g.role || g['Peran / Role'] || 'guru_wali').toLowerCase();
          let r: UserRole = 'guru_wali';
          if (rawRole.includes('kkk') || rawRole.includes('jurusan')) r = 'kkk';
          else if (rawRole.includes('wali_kelas') || rawRole.includes('walikelas') || (g.kelas && String(g.kelas).includes(','))) r = 'wali_kelas';
          else if (rawRole.includes('bk') || rawRole.includes('konseling') || rawRole.includes('kesiswaan')) r = 'manajemen_bk';

          return {
            id: String(g.id && String(g.id).trim() ? g.id : `gw-${Date.now()}-${idx}`),
            nip: String(g.nip || '').replace(/^'/, ''),
            nama: String(g.nama || ''),
            gelar: String(g.gelar || ''),
            kelas: String(g.kelas || 'X KKBT'),
            jurusan: String(g.jurusan || ''),
            telepon: g.telepon !== undefined && g.telepon !== null ? String(g.telepon).replace(/^'/, '') : '',
            email: String(g.email || ''),
            avatar: String(g.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
            bio: String(g.bio || ''),
            role: r,
            roleLabel: String(g.roleLabel || (r === 'kkk' ? 'KKK (Ketua Jurusan)' : r === 'wali_kelas' ? 'Wali Kelas' : r === 'manajemen_bk' ? 'BK' : 'Guru Wali')),
            username: g.username ? String(g.username).replace(/^'/, '') : undefined,
            password: g.password ? String(g.password) : undefined,
            statusAkun: (String(g.statusAkun || g.status || '').toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif'
          };
        });
        setGuruWaliList(normalizedGuru);
      }

      // 3. Akun Pengguna
      if (Array.isArray(result.data.akun) && result.data.akun.length > 0) {
        const normalizedAkun: UserAccount[] = result.data.akun.map((a: any, idx: number) => ({
          id: String(a.id && String(a.id).trim() ? a.id : `usr-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`),
          username: String(a.username || `user-${idx}`).replace(/^'/, '').trim(),
          password: a.password ? String(a.password) : undefined,
          nama: String(a.nama || ''),
          kelas: a.kelas ? String(a.kelas) : undefined,
          jurusan: a.jurusan ? String(a.jurusan) : (a.role === 'kkk' && a.kelas ? String(a.kelas) : undefined),
          email: String(a.email || ''),
          role: (a.role || 'guru_wali') as any,
          roleLabel: String(a.roleLabel || 'Guru Wali'),
          status: (String(a.status).toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif',
          lastLogin: a.lastLogin ? String(a.lastLogin) : undefined,
          telepon: a.telepon !== undefined && a.telepon !== null ? String(a.telepon).replace(/^'/, '') : undefined,
          linkedId: a.linkedId ? String(a.linkedId) : undefined
        }));
        setAkunList(deduplicateAccounts(normalizedAkun));
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

  const syncPushSiswaToSheets = async (
    onProgress?: (info: { chunkIndex: number; totalChunks: number; percent: number; message: string }) => void
  ): Promise<{ success: boolean; message: string; totalSynced?: number }> => {
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (!url) {
      return { success: false, message: 'URL Apps Script belum diisi' };
    }
    updateGoogleSheetsConfig({
      syncStatus: 'syncing',
      syncMessage: `Memulai pengunggahan ${siswaList.length} data siswa ke Google Sheets...`
    });

    const result = await pushSiswaToGoogleSheets(url, siswaList, (p) => {
      updateGoogleSheetsConfig({ syncStatus: 'syncing', syncMessage: p.message });
      if (onProgress) onProgress(p);
    });

    if (result.success) {
      updateGoogleSheetsConfig({
        syncStatus: 'connected',
        syncMessage: `Master Siswa (${result.totalSynced || siswaList.length} data) tersimpan rapi di Google Sheets`,
        lastSyncTime: new Date().toLocaleTimeString('id-ID')
      });
      return { success: true, message: result.message, totalSynced: result.totalSynced };
    } else {
      updateGoogleSheetsConfig({ syncStatus: 'error', syncMessage: result.message });
      return { success: false, message: result.message };
    }
  };

  const syncPullSiswaFromSheets = async (forcePull = false): Promise<{ success: boolean; message: string; totalSynced?: number }> => {
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (!url) {
      return { success: false, message: 'URL Apps Script belum diisi' };
    }
    updateGoogleSheetsConfig({
      syncStatus: 'syncing',
      syncMessage: 'Mengunduh data master siswa dari Google Sheets...'
    });
    const result = await fetchSiswaFromGoogleSheets(url);
    if (result.success && Array.isArray(result.data)) {
      const isCleared = localStorage.getItem(STORAGE_KEYS.SISWA_CLEARED_FLAG) === 'true';
      const isSiswaTableEmpty = isCleared ||
                                dataRef.current.siswa.length === 0 ||
                                localStorage.getItem(STORAGE_KEYS.SISWA) === '[]';

      // Jika tabel siswa dikosongkan dan bukan penarikan manual paksa (forcePull = false),
      // JANGAN timpa tabel kosong dengan baris lama dari Google Sheets!
      if (isSiswaTableEmpty && !forcePull) {
        setSiswaList([]);
        updateGoogleSheetsConfig({
          syncStatus: 'connected',
          syncMessage: `Tabel siswa dalam kondisi bersih/kosong (0 data)`,
          lastSyncTime: new Date().toLocaleTimeString('id-ID')
        });
        return {
          success: true,
          message: 'Tabel siswa tetap kosong ([]). Penarikan data dilewati karena tabel siswa dalam kondisi kosong/dikosongkan.',
          totalSynced: 0
        };
      }

      if (forcePull) {
        try {
          localStorage.removeItem(STORAGE_KEYS.SISWA_CLEARED_FLAG);
        } catch (e) {}
      }

      const deleted = forcePull ? new Set<string>() : getDeletedSiswaIds();
      const normalizedSiswa: Siswa[] = (result.data.length === 0)
        ? []
        : result.data
            .filter((s: any) => {
              const id = String(s.id || '').trim();
              const nisn = String(s.nisn || '').replace(/^'/, '').trim();
              if (id && deleted.has(id)) return false;
              if (nisn && deleted.has(nisn)) return false;
              return true;
            })
            .map((s: any, idx: number) => ({
              id: String(s.id && String(s.id).trim() ? s.id : `sis-${Date.now()}-${idx}`),
              nisn: String(s.nisn || '').replace(/^'/, ''),
              nama: String(s.nama || ''),
              kelas: String(s.kelas || 'X KKBT'),
              jurusan: String(s.jurusan || ''),
              jenisKelamin: (s.jenisKelamin === 'P' ? 'P' : 'L') as 'L' | 'P',
              tanggalLahir: typeof s.tanggalLahir === 'string' && s.tanggalLahir.includes('T')
                ? s.tanggalLahir.split('T')[0]
                : String(s.tanggalLahir || '2010-01-01'),
              alamat: String(s.alamat || ''),
              namaOrtu: String(s.namaOrtu || ''),
              noHpOrtu: s.noHpOrtu !== undefined && s.noHpOrtu !== null ? String(s.noHpOrtu).replace(/^'/, '') : '',
              nilaiRataRata: Number(s.nilaiRataRata) || 80,
              poinKarakter: Number(s.poinKarakter) || 85,
              statusPendampingan: (s.statusPendampingan || 'Normal') as any,
              catatanKhusus: String(s.catatanKhusus || '')
            }));

      setSiswaList(normalizedSiswa);
      updateGoogleSheetsConfig({
        syncStatus: 'connected',
        syncMessage: `Berhasil sinkron ${normalizedSiswa.length} data siswa dari Google Sheets`,
        lastSyncTime: new Date().toLocaleTimeString('id-ID')
      });
      return {
        success: true,
        message: `Berhasil memuat ${normalizedSiswa.length} data siswa dari Google Sheets!`,
        totalSynced: normalizedSiswa.length
      };
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
    const currentData = dataRef.current;

    // Jika data siswa berkapasitas besar (> 500, misal 3000 siswa), gunakan chunked push agar anti-timeout
    if (currentData.siswa && currentData.siswa.length > 500) {
      const siswaRes = await pushSiswaToGoogleSheets(url, currentData.siswa, (p) => {
        updateGoogleSheetsConfig({ syncStatus: 'syncing', syncMessage: p.message });
      });

      if (!siswaRes.success) {
        updateGoogleSheetsConfig({ syncStatus: 'error', syncMessage: siswaRes.message });
        return { success: false, message: siswaRes.message };
      }

      // Kirim entitas lain tanpa siswa (karena sudah tersimpan dengan chunking)
      const nonSiswaData = {
        guruWali: currentData.guruWali,
        akun: currentData.akun,
        jurnal: currentData.jurnal,
        presensi: currentData.presensi,
        rujukanBK: currentData.rujukanBK,
        jadwal: currentData.jadwal
      };
      const otherRes = await pushAllToGoogleSheets(url, nonSiswaData);
      if (otherRes.success) {
        updateGoogleSheetsConfig({
          syncStatus: 'connected',
          syncMessage: `Seluruh data (${currentData.siswa.length} siswa, pendidik, akun, jurnal) tersimpan aman ke Google Sheets`,
          lastSyncTime: new Date().toLocaleTimeString('id-ID')
        });
        return { success: true, message: `Seluruh data termasuk ${currentData.siswa.length} data siswa berhasil disimpan ke Google Sheets!` };
      } else {
        updateGoogleSheetsConfig({ syncStatus: 'error', syncMessage: otherRes.message });
        return { success: false, message: otherRes.message };
      }
    } else {
      const result = await pushAllToGoogleSheets(url, currentData);
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

  // Real-time continuous background sync (initial pull on load + periodic poll every 20s)
  useEffect(() => {
    if (!googleSheetsConfig.appsScriptUrl || !googleSheetsConfig.autoSync) return;

    // Tarik data awal saat aplikasi dimuat
    syncPullFromSheets().catch(err => console.warn('Initial load pull notice:', err));

    // Polling periodik setiap 20 detik secara tenang (tanpa window focus listener yang agresif)
    const interval = setInterval(() => {
      if (!document.hidden && navigator.onLine) {
        syncPullFromSheets().catch(err => console.warn('Real-time polling pull notice:', err));
      }
    }, 20000);

    return () => {
      clearInterval(interval);
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
    try {
      localStorage.removeItem(STORAGE_KEYS.SISWA_CLEARED_FLAG);
    } catch (e) {}

    const deletedSet = getDeletedSiswaIds();
    if (siswa.nisn && deletedSet.has(siswa.nisn)) {
      deletedSet.delete(siswa.nisn);
      saveDeletedSiswaIds(deletedSet);
    }

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
    // 1. Identifikasi siswa yang dihapus untuk dicatat ke daftar pemblokiran permanen (tombstone)
    const target = siswaList.find(s => s.id === id);
    const targetNisn = target ? target.nisn : '';

    const deletedSet = getDeletedSiswaIds();
    deletedSet.add(id);
    if (targetNisn) {
      deletedSet.add(targetNisn);
    }
    saveDeletedSiswaIds(deletedSet);

    // 2. Filter seketika dari state dan localStorage agar tidak ada jeda
    const nextList = siswaList.filter(s => s.id !== id && (targetNisn ? s.nisn !== targetNisn : true));
    setSiswaList(nextList);
    try {
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(nextList));
    } catch (e) {}

    // Perbarui dataRef seketika agar payload sinkronisasi tidak membawa data usang
    dataRef.current.siswa = nextList;

    // Jika siswa yang dihapus sedang aktif di portal wali, reset portal
    if (selectedSiswaForPortal?.id === id || (targetNisn && selectedSiswaForPortal?.nisn === targetNisn)) {
      setSelectedSiswaForPortalState(null);
      localStorage.removeItem(STORAGE_KEYS.PORTAL_SISWA);
    }

    // 3. Kirim pembaruan ke Google Sheets seketika
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (url && googleSheetsConfig.autoSync) {
      pushSiswaToGoogleSheets(url, nextList).catch(err => {
        console.warn('Gagal sinkronisasi penghapusan siswa ke Google Sheets:', err);
      });
    }
  };

  const clearAllSiswa = async (): Promise<{ success: boolean; message: string }> => {
    // 1. Catat seluruh ID & NISN siswa saat ini ke daftar pemblokiran (tombstone)
    const deletedSet = getDeletedSiswaIds();
    siswaList.forEach(s => {
      if (s.id) deletedSet.add(s.id);
      if (s.nisn) deletedSet.add(s.nisn);
    });
    saveDeletedSiswaIds(deletedSet);

    // 2. Berikan penanda permanen bahwa tabel siswa telah dikosongkan
    try {
      localStorage.setItem(STORAGE_KEYS.SISWA_CLEARED_FLAG, 'true');
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify([]));
    } catch (e) {}

    // 3. Kosongkan state lokal & memori sesi
    setSiswaList([]);
    dataRef.current.siswa = [];
    setSelectedSiswaForPortalState(null);
    localStorage.removeItem(STORAGE_KEYS.PORTAL_SISWA);

    // 4. Kosongkan otomatis di Google Spreadsheet (Tab Siswa)
    const url = googleSheetsConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
    if (url) {
      updateGoogleSheetsConfig({
        syncStatus: 'syncing',
        syncMessage: 'Mengosongkan data peserta didik pada Google Spreadsheet...'
      });

      const result = await clearSiswaFromGoogleSheets(url);
      if (result.success) {
        updateGoogleSheetsConfig({
          syncStatus: 'connected',
          syncMessage: 'Data peserta didik pada Google Spreadsheet berhasil dikosongkan',
          lastSyncTime: new Date().toLocaleTimeString('id-ID')
        });
        return {
          success: true,
          message: 'Seluruh data peserta didik di aplikasi dan Google Spreadsheet berhasil dikosongkan secara permanen!'
        };
      } else {
        updateGoogleSheetsConfig({
          syncStatus: 'error',
          syncMessage: result.message || 'Gagal mengosongkan di Google Sheets'
        });
        return {
          success: false,
          message: 'Data di aplikasi telah dikosongkan, namun respon dari Google Sheets: ' + result.message
        };
      }
    }

    return {
      success: true,
      message: 'Seluruh data peserta didik berhasil dikosongkan.'
    };
  };

  const importSiswaList = (newList: Partial<Siswa>[], replaceExisting = false) => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SISWA_CLEARED_FLAG);
    } catch (e) {}

    const deletedSet = getDeletedSiswaIds();
    newList.forEach(item => {
      if (item.id && deletedSet.has(item.id)) deletedSet.delete(item.id);
      if (item.nisn && deletedSet.has(item.nisn)) deletedSet.delete(item.nisn);
    });
    saveDeletedSiswaIds(deletedSet);

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

  // Master Guru Wali CRUD (Terkoneksi Otomatis dengan Master Akun Pengguna)
  const addGuruWali = (guru: Omit<GuruWali, 'id'>) => {
    const newId = `gw-${Date.now()}`;
    const newEntry: GuruWali = {
      ...guru,
      id: newId
    };

    // 1. Simpan ke guruWaliList
    setGuruWaliList(prev => [...prev, newEntry]);

    // 2. Buat atau Sinkronkan Akun Pengguna terkait secara otomatis
    const rawRole = newEntry.role || 'guru_wali';
    const role: UserRole = rawRole === ('bk' as any) ? 'manajemen_bk' : rawRole;
    const cleanUsername = (newEntry.username || (newEntry.email ? newEntry.email.split('@')[0] : newEntry.nip.replace(/\s+/g, ''))).toLowerCase().trim() || `guru.${newId}`;
    const password = newEntry.password || (role === 'kkk' ? 'kkk123' : role === 'manajemen_bk' ? 'bk123' : 'guru123');

    let defaultLabel = newEntry.roleLabel;
    if (!defaultLabel) {
      if (role === 'kkk') defaultLabel = `Ketua Konsentrasi Keahlian (KKK) ${newEntry.jurusan || newEntry.kelas}`;
      else if (role === 'wali_kelas') defaultLabel = `Wali Kelas ${newEntry.kelas}`;
      else if (role === 'manajemen_bk') defaultLabel = `Guru BK & Konselor`;
      else defaultLabel = `Guru Wali Kelas ${newEntry.kelas}`;
    }

    const newAkun: UserAccount = {
      id: `usr-${newId}`,
      username: cleanUsername,
      password,
      nama: `${newEntry.nama}${newEntry.gelar ? ', ' + newEntry.gelar : ''}`.trim(),
      email: newEntry.email || `${cleanUsername}@smkn1jember.sch.id`,
      role,
      roleLabel: defaultLabel,
      kelas: newEntry.kelas,
      jurusan: role === 'kkk' ? (newEntry.jurusan || newEntry.kelas) : newEntry.jurusan,
      status: (newEntry.statusAkun || 'Aktif') as 'Aktif' | 'Nonaktif',
      linkedId: newId,
      telepon: newEntry.telepon
    };

    setAkunList(prev => {
      const matchIdx = prev.findIndex(a =>
        a.linkedId === newId ||
        a.username.toLowerCase() === cleanUsername.toLowerCase() ||
        (newEntry.email && a.email && a.email.toLowerCase() === newEntry.email.toLowerCase())
      );
      if (matchIdx >= 0) {
        const copy = [...prev];
        copy[matchIdx] = { ...copy[matchIdx], ...newAkun };
        return copy;
      }
      return [newAkun, ...prev];
    });

    triggerAutoPushIfEnabled();
  };

  const updateGuruWali = (id: string, updates: Partial<GuruWali>) => {
    setGuruWaliList(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    if (currentGuruWali.id === id) {
      setCurrentGuruWaliState(prev => ({ ...prev, ...updates }));
    }

    // Sinkronisasi otomatis ke Akun Pengguna terkait
    setAkunList(prev => {
      const matchIdx = prev.findIndex(a =>
        a.linkedId === id ||
        (updates.email && a.email && a.email.toLowerCase() === updates.email.toLowerCase()) ||
        (updates.username && a.username && a.username.toLowerCase() === updates.username.toLowerCase())
      );

      const rawRole = updates.role || (matchIdx >= 0 ? prev[matchIdx].role : 'guru_wali');
      const role: UserRole = rawRole === ('bk' as any) ? 'manajemen_bk' : rawRole;
      const namaLengkap = updates.nama
        ? `${updates.nama}${updates.gelar ? ', ' + updates.gelar : ''}`.trim()
        : (matchIdx >= 0 ? prev[matchIdx].nama : '');

      if (matchIdx >= 0) {
        const copy = [...prev];
        const existing = copy[matchIdx];
        copy[matchIdx] = {
          ...existing,
          ...(namaLengkap ? { nama: namaLengkap } : {}),
          ...(updates.email ? { email: updates.email } : {}),
          ...(updates.telepon ? { telepon: updates.telepon } : {}),
          ...(updates.kelas ? { kelas: updates.kelas } : {}),
          ...(updates.jurusan ? { jurusan: updates.jurusan } : {}),
          ...(updates.username ? { username: updates.username } : {}),
          ...(updates.password ? { password: updates.password } : {}),
          ...(updates.statusAkun ? { status: updates.statusAkun } : {}),
          role,
          roleLabel: updates.roleLabel || existing.roleLabel,
          linkedId: id
        };
        return copy;
      } else {
        const username = (updates.username || (updates.email ? updates.email.split('@')[0] : id)).toLowerCase().trim();
        const newAcc: UserAccount = {
          id: `usr-${id}`,
          username,
          password: updates.password || (role === 'kkk' ? 'kkk123' : role === 'manajemen_bk' ? 'bk123' : 'guru123'),
          nama: namaLengkap || 'Guru Wali SMKN 1 Jember',
          email: updates.email || `${username}@smkn1jember.sch.id`,
          role,
          roleLabel: updates.roleLabel || 'Guru Wali',
          kelas: updates.kelas || 'X KKBT',
          jurusan: updates.jurusan,
          status: (updates.statusAkun || 'Aktif') as 'Aktif' | 'Nonaktif',
          linkedId: id,
          telepon: updates.telepon
        };
        return [newAcc, ...prev];
      }
    });

    triggerAutoPushIfEnabled();
  };

  const deleteGuruWali = (id: string) => {
    setGuruWaliList(prev => prev.filter(g => g.id !== id));
    setAkunList(prev => prev.filter(a => a.linkedId !== id));
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

    // Pastikan semua akun pendidik yang diimpor juga ada di Akun Pengguna
    setAkunList(prev => {
      const copy = [...prev];
      newList.forEach(guru => {
        const rawRole = guru.role || 'guru_wali';
        const role: UserRole = rawRole === ('bk' as any) ? 'manajemen_bk' : rawRole;
        const cleanUsername = (guru.username || (guru.email ? guru.email.split('@')[0] : guru.nip.replace(/\s+/g, ''))).toLowerCase().trim() || `guru.${guru.id}`;
        const matchIdx = copy.findIndex(a =>
          a.linkedId === guru.id ||
          a.username.toLowerCase() === cleanUsername.toLowerCase() ||
          (guru.email && a.email && a.email.toLowerCase() === guru.email.toLowerCase())
        );

        const defaultLabel = guru.roleLabel || (
          role === 'kkk' ? `Ketua Konsentrasi Keahlian (KKK) ${guru.jurusan || guru.kelas}` :
          role === 'wali_kelas' ? `Wali Kelas ${guru.kelas}` :
          role === 'manajemen_bk' ? `Guru BK & Konselor` : `Guru Wali Kelas ${guru.kelas}`
        );

        const accData: UserAccount = {
          id: `usr-${guru.id}`,
          username: cleanUsername,
          password: guru.password || (role === 'kkk' ? 'kkk123' : role === 'manajemen_bk' ? 'bk123' : 'guru123'),
          nama: `${guru.nama}${guru.gelar ? ', ' + guru.gelar : ''}`.trim(),
          email: guru.email || `${cleanUsername}@smkn1jember.sch.id`,
          role,
          roleLabel: defaultLabel,
          kelas: guru.kelas,
          jurusan: role === 'kkk' ? (guru.jurusan || guru.kelas) : guru.jurusan,
          status: (guru.statusAkun || 'Aktif') as 'Aktif' | 'Nonaktif',
          linkedId: guru.id,
          telepon: guru.telepon
        };

        if (matchIdx >= 0) {
          copy[matchIdx] = { ...copy[matchIdx], ...accData };
        } else {
          copy.push(accData);
        }
      });
      return copy;
    });

    triggerAutoPushIfEnabled();
  };

  // Master Akun CRUD (Sinkronisasi Balik ke Guru Wali jika peran pendidik)
  const addAkun = (akun: Omit<UserAccount, 'id'>) => {
    const newId = `usr-${Date.now()}`;
    const newEntry: UserAccount = {
      ...akun,
      id: newId
    };
    setAkunList(prev => [newEntry, ...prev]);

    // Sinkronkan ke GuruWali jika peran pendidik
    const isTeacher = ['guru_wali', 'wali_kelas', 'kkk', 'manajemen_bk', 'bk'].includes(newEntry.role);
    if (isTeacher) {
      setGuruWaliList(prev => {
        const matchIdx = prev.findIndex(g =>
          (newEntry.linkedId && g.id === newEntry.linkedId) ||
          (newEntry.email && g.email && g.email.toLowerCase() === newEntry.email.toLowerCase()) ||
          (g.username && g.username.toLowerCase() === newEntry.username.toLowerCase())
        );

        const cleanRole: UserRole = (newEntry.role === ('bk' as any) ? 'manajemen_bk' : newEntry.role) as UserRole;

        if (matchIdx >= 0) {
          const copy = [...prev];
          copy[matchIdx] = {
            ...copy[matchIdx],
            nama: newEntry.nama.split(',')[0].trim(),
            gelar: newEntry.nama.includes(',') ? newEntry.nama.split(',').slice(1).join(',').trim() : copy[matchIdx].gelar,
            kelas: newEntry.kelas || copy[matchIdx].kelas,
            jurusan: newEntry.jurusan || copy[matchIdx].jurusan,
            role: cleanRole,
            roleLabel: newEntry.roleLabel,
            username: newEntry.username,
            password: newEntry.password,
            statusAkun: newEntry.status,
            email: newEntry.email || copy[matchIdx].email,
            telepon: newEntry.telepon || copy[matchIdx].telepon
          };
          return copy;
        } else {
          const newGwId = newEntry.linkedId || `gw-${Date.now()}`;
          const newGw: GuruWali = {
            id: newGwId,
            nip: /^\d+$/.test(newEntry.username) ? newEntry.username : `19850101 201001 1 ${Math.floor(100 + Math.random() * 900)}`,
            nama: newEntry.nama.split(',')[0].trim(),
            gelar: newEntry.nama.includes(',') ? newEntry.nama.split(',').slice(1).join(',').trim() : 'S.Pd',
            kelas: newEntry.kelas || 'X KKBT',
            jurusan: newEntry.jurusan || (cleanRole === 'kkk' ? newEntry.kelas || 'Kriya Kreatif Batik dan Tekstil' : 'Teknik Kejuruan'),
            telepon: newEntry.telepon || '081234567890',
            email: newEntry.email,
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            bio: `${newEntry.roleLabel || 'Pendidik'} SMKN 1 Jember.`,
            role: cleanRole,
            roleLabel: newEntry.roleLabel,
            username: newEntry.username,
            password: newEntry.password,
            statusAkun: newEntry.status
          };
          return [...prev, newGw];
        }
      });
    }

    triggerAutoPushIfEnabled();
  };

  const updateAkun = (id: string, updates: Partial<UserAccount>) => {
    setAkunList(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

    // Sinkronkan ke GuruWali jika akun terkait pendidik
    const currentAcc = akunList.find(a => a.id === id);
    const effectiveRole = (updates.role || (currentAcc ? currentAcc.role : 'guru_wali')) as UserRole;
    const isTeacher = ['guru_wali', 'wali_kelas', 'kkk', 'manajemen_bk', 'bk'].includes(effectiveRole);

    if (isTeacher) {
      setGuruWaliList(prev => {
        const matchIdx = prev.findIndex(g =>
          (currentAcc?.linkedId && g.id === currentAcc.linkedId) ||
          (g.id === id) ||
          (currentAcc?.email && g.email && g.email.toLowerCase() === currentAcc.email.toLowerCase()) ||
          (updates.email && g.email && g.email.toLowerCase() === updates.email.toLowerCase()) ||
          (g.username && currentAcc?.username && g.username.toLowerCase() === currentAcc.username.toLowerCase())
        );

        if (matchIdx >= 0) {
          const copy = [...prev];
          const existing = copy[matchIdx];
          copy[matchIdx] = {
            ...existing,
            ...(updates.nama ? {
              nama: updates.nama.split(',')[0].trim(),
              gelar: updates.nama.includes(',') ? updates.nama.split(',').slice(1).join(',').trim() : existing.gelar
            } : {}),
            ...(updates.kelas ? { kelas: updates.kelas } : {}),
            ...(updates.jurusan ? { jurusan: updates.jurusan } : {}),
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.telepon ? { telepon: updates.telepon } : {}),
            ...(updates.username ? { username: updates.username } : {}),
            ...(updates.password ? { password: updates.password } : {}),
            ...(updates.status ? { statusAkun: updates.status } : {}),
            role: effectiveRole,
            roleLabel: updates.roleLabel || existing.roleLabel
          };
          return copy;
        }
        return prev;
      });
    }

    triggerAutoPushIfEnabled();
  };

  const deleteAkun = (id: string) => {
    const target = akunList.find(a => a.id === id);
    setAkunList(prev => prev.filter(a => a.id !== id));
    if (target?.linkedId) {
      setGuruWaliList(prev => prev.filter(g => g.id !== target.linkedId));
    }
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
        syncPushSiswaToSheets,
        syncPullSiswaFromSheets,
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
