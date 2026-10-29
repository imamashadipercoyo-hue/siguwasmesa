export type LayananType = 'bimbingan' | 'pembinaan' | 'monitoring' | 'konsultasi';

export type StatusLayanan = 'Selesai' | 'Dalam Proses' | 'Dirujuk ke BK' | 'Perlu Home Visit';

export type StatusPendampingan = 'Normal' | 'Perhatian Khusus' | 'Siswa Berprestasi' | 'Dalam Penanganan BK';

export type PresensiStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export interface GuruWali {
  id: string;
  nip: string;
  nama: string;
  gelar: string;
  kelas: string;
  jurusan: string;
  telepon: string;
  email: string;
  avatar: string;
  bio: string;
  role?: UserRole;
  roleLabel?: string;
  username?: string;
  password?: string;
  statusAkun?: 'Aktif' | 'Nonaktif';
}

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  alamat: string;
  namaOrtu: string;
  noHpOrtu: string;
  nilaiRataRata: number;
  poinKarakter: number; // Skala 0-100 atau poin positif/negatif
  statusPendampingan: StatusPendampingan;
  catatanKhusus?: string;
}

export interface JurnalLayanan {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jam: string; // HH:mm
  siswaId: string;
  siswaNama: string;
  kelas: string;
  jenisLayanan: LayananType;
  topik: string;
  uraian: string;
  hasilKesepakatan: string;
  tindakLanjut: string;
  status: StatusLayanan;
  guruWaliId: string;
  guruWaliNama: string;
  visibleToParent: boolean;
  tanggapanOrtu?: string;
  tanggalTanggapan?: string;
}

export interface PresensiRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  siswaId: string;
  kelas: string;
  status: PresensiStatus;
  keterangan?: string;
}

export interface RujukanBK {
  id: string;
  tanggal: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  guruWaliId: string;
  guruWaliNama: string;
  alasanRujukan: string;
  indikasiMasalah: string;
  upayaGuruWali: string;
  status: 'Menunggu Verifikasi' | 'Diterima Guru BK' | 'Proses Konseling' | 'Selesai';
  catatanGuruBK?: string;
  tanggalTindakLanjut?: string;
}

export interface JadwalPertemuan {
  id: string;
  tanggal: string;
  jam: string;
  jenisPertemuan: 'Home Visit' | 'Panggilan Orang Tua' | 'Konsultasi Rutin' | 'Konferensi Kasus BK';
  siswaId: string;
  siswaNama: string;
  orangTuaNama: string;
  tempat: string;
  agenda: string;
  status: 'Terjadwal' | 'Terlaksana' | 'Dibatalkan';
  catatanHasil?: string;
}

export interface KonsultasiWaliMurid {
  id: string;
  tanggal: string;
  jam: string;
  siswaId: string;
  siswaNama: string;
  namaOrtu: string;
  noHp: string;
  topik: string;
  pesan: string;
  status: 'Menunggu Respon' | 'Dijadwalkan' | 'Selesai';
  responGuruWali?: string;
  tanggalRespon?: string;
}

export type UserRole = 'admin' | 'guru_wali' | 'wali_kelas' | 'kkk' | 'manajemen_bk' | 'bk' | 'wali_murid';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  nama: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  kelas?: string; // Kelas diampu (Guru Wali: 1 kelas, Wali Kelas: beberapa kelas, BK: beberapa kelas, Admin: Semua Kelas, Wali Murid: kelas anak)
  jurusan?: string; // Khusus KKK (1 Jurusan yang diampu)
  status: 'Aktif' | 'Nonaktif';
  lastLogin?: string;
  linkedId?: string; // id GuruWali atau id Siswa
  telepon?: string;
}

export interface GoogleSheetsConfig {
  appsScriptUrl: string;
  spreadsheetId?: string;
  autoSync: boolean;
  syncIntervalSeconds?: number; // Setting interval auto sinkron (detik, e.g. 15, 30, 60, 120, 300, 600, atau 0 untuk nonaktif)
  lastSyncTime?: string;
  syncStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  syncMessage?: string;
}

export const SMKN1_LOGO_URL = 'https://iili.io/n8W0HZu.md.png';
export const PROV_JATIM_LOGO_URL = 'https://iili.io/nkNmwes.png';

export interface SchoolProfileConfig {
  namaSekolah: string;
  alamatSekolah: string;
  teleponSekolah: string;
  emailSekolah: string;
  websiteSekolah: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  kotaTandaTangan: string;
  logoSekolah?: string;
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfileConfig = {
  namaSekolah: 'SMK Negeri 1 Jember',
  alamatSekolah: 'Jalan Jambu No. 17 Patrang - Jember (68118), Jawa Timur',
  teleponSekolah: '(0331) 487535',
  emailSekolah: 'info@smkn1jember.sch.id',
  websiteSekolah: 'www.smkn1jember.sch.id',
  namaKepalaSekolah: 'Drs. Sri Hartono, M.Pd',
  nipKepalaSekolah: '19680714 199412 1 002',
  kotaTandaTangan: 'Jember',
  logoSekolah: SMKN1_LOGO_URL
};

export interface SiguwaBackupPayload {
  version: string;
  appName: string;
  sekolah: string;
  exportDate: string;
  exportDateFormatted: string;
  counts: {
    siswa: number;
    guruWali: number;
    akun: number;
    jurnal: number;
    presensi: number;
    rujukanBK: number;
    jadwal: number;
    konsultasi: number;
  };
  data: {
    siswa: Siswa[];
    guruWali: GuruWali[];
    akun: UserAccount[];
    jurnal: JurnalLayanan[];
    presensi: PresensiRecord[];
    rujukanBK: RujukanBK[];
    jadwal: JadwalPertemuan[];
    konsultasi: KonsultasiWaliMurid[];
    googleSheetsConfig?: Partial<GoogleSheetsConfig>;
    schoolProfile?: SchoolProfileConfig;
  };
}
