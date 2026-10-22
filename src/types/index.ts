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

export interface UserAccount {
  id: string;
  username: string;
  nama: string;
  email: string;
  role: 'admin' | 'guru_wali' | 'manajemen_bk' | 'wali_murid';
  roleLabel: string;
  status: 'Aktif' | 'Nonaktif';
  lastLogin?: string;
  linkedId?: string; // id GuruWali atau id Siswa
  telepon?: string;
}

export interface GoogleSheetsConfig {
  appsScriptUrl: string;
  spreadsheetId?: string;
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  syncMessage?: string;
}

export type UserRole = 'admin' | 'guru_wali' | 'wali_murid' | 'manajemen_bk';
