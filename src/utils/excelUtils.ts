import * as XLSX from 'xlsx';
import { Siswa, GuruWali, UserAccount, JurnalLayanan } from '../types';

/**
 * Export Siswa to Excel (.xlsx)
 */
export function exportSiswaToExcel(siswaList: Siswa[], fileName = 'DATA_SISWA_SMKN1_JEMBER.xlsx') {
  const data = siswaList.map((s, index) => ({
    'No': index + 1,
    'NISN': s.nisn,
    'Nama Lengkap': s.nama,
    'Kelas': s.kelas,
    'Jurusan': s.jurusan,
    'Jenis Kelamin': s.jenisKelamin,
    'Tanggal Lahir': s.tanggalLahir,
    'Alamat': s.alamat,
    'Nama Orang Tua / Wali': s.namaOrtu,
    'No HP Orang Tua': s.noHpOrtu,
    'Nilai Rata-Rata': s.nilaiRataRata,
    'Poin Karakter': s.poinKarakter,
    'Status Pendampingan': s.statusPendampingan,
    'Catatan Khusus': s.catatanKhusus || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  // Auto-width columns
  const colWidths = [
    { wch: 6 },  // No
    { wch: 15 }, // NISN
    { wch: 30 }, // Nama
    { wch: 10 }, // Kelas
    { wch: 25 }, // Jurusan
    { wch: 12 }, // JK
    { wch: 14 }, // Tgl Lahir
    { wch: 45 }, // Alamat
    { wch: 25 }, // Nama Ortu
    { wch: 18 }, // No HP
    { wch: 12 }, // Nilai
    { wch: 12 }, // Karakter
    { wch: 20 }, // Status
    { wch: 40 }  // Catatan
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Download Template Excel Siswa
 */
export function downloadTemplateSiswaExcel() {
  const template = [
    {
      'NISN': '0094201436',
      'Nama': 'ANDIKA PRATAMA',
      'Kelas': 'X KKBT',
      'Jurusan': 'Kriya Kreatif Batik dan Tekstil',
      'JK': 'L',
      'Tanggal Lahir': '2009-04-22',
      'Alamat': 'Dusun Rayap, Patrang, Jember',
      'Nama Orang Tua': 'Pratama Suwandi',
      'No HP Orang Tua': '082245001479',
      'Nilai Rata-Rata': 85.0,
      'Poin Karakter': 90,
      'Status Pendampingan': 'Normal',
      'Catatan': 'Catatan khusus siswa...'
    },
    {
      'NISN': '0095992114',
      'Nama': 'ADITIA SAPUTRA',
      'Kelas': 'X TL',
      'Jurusan': 'Teknik Logistik',
      'JK': 'L',
      'Tanggal Lahir': '2009-11-05',
      'Alamat': 'Jl. Ikan Kakap, Kaliwates, Jember',
      'Nama Orang Tua': 'Saputra Hendrawan',
      'No HP Orang Tua': '085903143868',
      'Nilai Rata-Rata': 88.0,
      'Poin Karakter': 92,
      'Status Pendampingan': 'Siswa Berprestasi',
      'Catatan': 'Ketua kelas X TL...'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
  XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_SISWA_SMKN1_JEMBER.xlsx');
}

/**
 * Parse Excel file for Siswa Import
 */
export async function parseSiswaExcel(file: File): Promise<Partial<Siswa>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsed: Partial<Siswa>[] = rawJson.map((row, idx) => {
          // Normalize column headers
          const getVal = (possibleKeys: string[]) => {
            for (const key of possibleKeys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase() === key.toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const nisn = getVal(['nisn', 'nomor induk', 'nipd']) || `SIS${Date.now() + idx}`;
          const nama = getVal(['nama', 'nama lengkap', 'nama siswa', 'name']);
          const kelas = getVal(['kelas', 'class']) || 'X KKBT';
          const jurusan = getVal(['jurusan', 'program keahlian', 'major']) || 
            (kelas.includes('KKBT') ? 'Kriya Kreatif Batik dan Tekstil' : 'Teknik Logistik');
          
          let jk: 'L' | 'P' = 'L';
          const rawJK = getVal(['jk', 'jenis kelamin', 'gender']).toUpperCase();
          if (rawJK.startsWith('P') || rawJK === 'PEREMPUAN' || rawJK === 'WANITA') {
            jk = 'P';
          }

          let tglLahir = getVal(['tanggal lahir', 'tgl lahir', 'birthdate', 'tgl_lahir']);
          if (!tglLahir) tglLahir = '2010-01-01';
          // Convert slash format if needed: MM/DD/YYYY or DD/MM/YYYY
          if (tglLahir.includes('/')) {
            const parts = tglLahir.split('/');
            if (parts.length === 3) {
              const yyyy = parts[2].length === 4 ? parts[2] : `20${parts[2]}`;
              const mm = parts[0].padStart(2, '0');
              const dd = parts[1].padStart(2, '0');
              tglLahir = `${yyyy}-${mm}-${dd}`;
            }
          }

          const alamat = getVal(['alamat', 'domisili', 'address']) || 'Jember';
          const namaOrtu = getVal(['nama orang tua', 'nama ortu', 'wali', 'orang tua', 'nama wali']) || `Wali ${nama}`;
          let hp = getVal(['no hp orang tua', 'no hp ortu', 'no hp', 'hp', 'telepon', 'whatsapp', 'wa']);
          if (!hp) hp = '081234567890';
          if (!hp.startsWith('0') && !hp.startsWith('62')) hp = `0${hp}`;

          const nilai = parseFloat(getVal(['nilai rata-rata', 'nilai', 'rerata nilai'])) || 80.0;
          const karakter = parseInt(getVal(['poin karakter', 'karakter', 'poin'])) || 85;
          const statusRaw = getVal(['status pendampingan', 'status']) as any;
          const status = ['Normal', 'Siswa Berprestasi', 'Perhatian Khusus', 'Dalam Penanganan BK'].includes(statusRaw)
            ? statusRaw
            : 'Normal';

          const catatan = getVal(['catatan khusus', 'catatan', 'keterangan']);

          return {
            id: `sis-imp-${Date.now()}-${idx}`,
            nisn,
            nama,
            kelas,
            jurusan,
            jenisKelamin: jk,
            tanggalLahir: tglLahir,
            alamat,
            namaOrtu,
            noHpOrtu: hp,
            nilaiRataRata: nilai,
            poinKarakter: karakter,
            statusPendampingan: status,
            catatanKhusus: catatan
          };
        }).filter(s => s.nama && s.nama.length > 0);

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export Guru Wali to Excel (.xlsx)
 */
export function exportGuruWaliToExcel(guruList: GuruWali[], fileName = 'DATA_GURU_WALI_SMKN1_JEMBER.xlsx') {
  const data = guruList.map((g, index) => ({
    'No': index + 1,
    'NIP': g.nip,
    'Nama Lengkap': g.nama,
    'Gelar': g.gelar,
    'Wali Kelas': g.kelas,
    'Program Keahlian': g.jurusan,
    'No Telepon / WA': g.telepon,
    'Email Resmi': g.email,
    'Profil Singkat': g.bio
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 30 },
    { wch: 15 },
    { wch: 14 },
    { wch: 35 },
    { wch: 18 },
    { wch: 35 },
    { wch: 50 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guru Wali');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Akun Pengguna to Excel (.xlsx)
 */
export function exportAkunToExcel(akunList: UserAccount[], fileName = 'DATA_AKUN_SIGUWA_SMKN1_JEMBER.xlsx') {
  const data = akunList.map((a, index) => ({
    'No': index + 1,
    'Username': a.username,
    'Nama Pengguna': a.nama,
    'Email': a.email,
    'Role Akses': a.roleLabel,
    'Kode Role': a.role,
    'Status Akun': a.status,
    'Terakhir Masuk': a.lastLogin || '-',
    'Kontak Telepon': a.telepon || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 30 },
    { wch: 35 },
    { wch: 20 },
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
    { wch: 18 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Akun');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Jurnal Layanan to Excel (.xlsx)
 */
export function exportJurnalToExcel(jurnalList: JurnalLayanan[], fileName = 'JURNAL_4_LAYANAN_SMKN1_JEMBER.xlsx') {
  const data = jurnalList.map((j, index) => ({
    'No': index + 1,
    'Tanggal': j.tanggal,
    'Waktu (WIB)': j.jam,
    'Nama Siswa': j.siswaNama,
    'Kelas': j.kelas,
    'Jenis Layanan': `Layanan ${j.jenisLayanan.toUpperCase()}`,
    'Topik Bimbingan': j.topik,
    'Uraian Kasus': j.uraian,
    'Hasil & Kesepakatan': j.hasilKesepakatan,
    'Rencana Tindak Lanjut': j.tindakLanjut,
    'Status Penyelesaian': j.status,
    'Guru Wali Pencatat': j.guruWaliNama,
    'Tanggapan Orang Tua': j.tanggapanOrtu || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal Layanan');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Download Template Excel Guru Wali
 */
export function downloadTemplateGuruWaliExcel() {
  const template = [
    {
      'NIP': '19740512 199903 2 004',
      'Nama Lengkap': 'Dra. Hj. Endang Sulistiyowati',
      'Gelar': 'M.Pd',
      'Wali Kelas': 'X KKBT',
      'Program Keahlian': 'Kriya Kreatif Batik dan Tekstil',
      'No Telepon / WA': '081234567890',
      'Email Resmi': 'endang.sulistiyowati@smkn1jember.sch.id',
      'Profil Singkat': 'Guru Penggerak & Wali Kelas X Kriya Kreatif Batik dan Tekstil.'
    },
    {
      'NIP': '19820815 200801 1 012',
      'Nama Lengkap': 'Ahmad Fauzi',
      'Gelar': 'S.Kom., M.T',
      'Wali Kelas': 'X TL',
      'Program Keahlian': 'Teknik Logistik',
      'No Telepon / WA': '081398765432',
      'Email Resmi': 'ahmad.fauzi@smkn1jember.sch.id',
      'Profil Singkat': 'Wali Kelas X Teknik Logistik SMKN 1 Jember.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Guru Wali');
  XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_GURU_WALI_SMKN1_JEMBER.xlsx');
}

/**
 * Parse Excel file for Guru Wali Import
 */
export async function parseGuruWaliExcel(file: File): Promise<Partial<GuruWali>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsed: Partial<GuruWali>[] = rawJson.map((row, idx) => {
          const getVal = (possibleKeys: string[]) => {
            for (const key of possibleKeys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase() === key.toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const nip = getVal(['nip', 'nomor induk pegawai', 'nik']) || `1985${Date.now() + idx}`;
          const nama = getVal(['nama', 'nama lengkap', 'nama guru', 'name']);
          const gelar = getVal(['gelar', 'title']) || 'S.Pd';
          const kelas = getVal(['wali kelas', 'kelas', 'kelas binaan']) || 'X KKBT';
          const jurusan = getVal(['program keahlian', 'jurusan', 'kejuruan']) || 'Kriya Kreatif Batik dan Tekstil';
          let telepon = getVal(['no telepon / wa', 'no telepon', 'telepon', 'hp', 'no hp', 'whatsapp', 'wa']);
          if (!telepon) telepon = '081234567890';
          if (!telepon.startsWith('0') && !telepon.startsWith('62')) telepon = `0${telepon}`;

          const email = getVal(['email resmi', 'email']) || `${nama.toLowerCase().replace(/[^a-z]/g, '')}@smkn1jember.sch.id`;
          const bio = getVal(['profil singkat', 'profil', 'bio', 'keterangan']) || `Guru Wali Kelas ${kelas} SMKN 1 Jember.`;

          return {
            id: `gw-imp-${Date.now()}-${idx}`,
            nip,
            nama,
            gelar,
            kelas,
            jurusan,
            telepon,
            email,
            bio,
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          };
        }).filter(g => g.nama && g.nama.length > 0);

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Download Template Excel Akun Pengguna
 */
export function downloadTemplateAkunExcel() {
  const template = [
    {
      'Username': 'admin.siguwa',
      'Nama Pengguna': 'Administrator Utama SMKN 1 Jember',
      'Email': 'admin.siguwa@smkn1jember.sch.id',
      'Kode Role': 'admin',
      'Role Akses': 'Super Administrator',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '08113456789'
    },
    {
      'Username': 'endang.sulistiyowati',
      'Nama Pengguna': 'Dra. Hj. Endang Sulistiyowati, M.Pd',
      'Email': 'endang.sulistiyowati@smkn1jember.sch.id',
      'Kode Role': 'guru_wali',
      'Role Akses': 'Guru Wali Kelas X KKBT',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '081234567890'
    },
    {
      'Username': '0094201436',
      'Nama Pengguna': 'Pratama Suwandi (Wali Andika)',
      'Email': 'wali.andika@gmail.com',
      'Kode Role': 'wali_murid',
      'Role Akses': 'Wali Murid X KKBT',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '082245001479'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Akun');
  XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_AKUN_SMKN1_JEMBER.xlsx');
}

/**
 * Parse Excel file for Akun Import
 */
export async function parseAkunExcel(file: File): Promise<Partial<UserAccount>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsed: Partial<UserAccount>[] = rawJson.map((row, idx) => {
          const getVal = (possibleKeys: string[]) => {
            for (const key of possibleKeys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase() === key.toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const username = getVal(['username', 'user', 'nisn', 'id pengguna']);
          const nama = getVal(['nama pengguna', 'nama', 'name']);
          const email = getVal(['email', 'surel']) || `${username}@smkn1jember.sch.id`;
          
          let roleRaw = getVal(['kode role', 'role', 'peran']).toLowerCase();
          let role: UserAccount['role'] = 'guru_wali';
          if (roleRaw.includes('admin')) role = 'admin';
          else if (roleRaw.includes('wali_murid') || roleRaw.includes('orang_tua') || roleRaw.includes('wali')) role = 'wali_murid';
          else if (roleRaw.includes('bk') || roleRaw.includes('kesiswaan')) role = 'manajemen_bk';
          else role = 'guru_wali';

          const roleLabelMap: Record<string, string> = {
            admin: 'Super Administrator',
            guru_wali: 'Guru Wali',
            manajemen_bk: 'BK & Kesiswaan',
            wali_murid: 'Wali Murid'
          };

          const roleLabel = getVal(['role akses', 'label role', 'peran akses']) || roleLabelMap[role];
          const statusRaw = getVal(['status akun', 'status']).toLowerCase();
          const status: 'Aktif' | 'Nonaktif' = statusRaw.includes('non') ? 'Nonaktif' : 'Aktif';
          const telepon = getVal(['kontak telepon', 'telepon', 'no hp', 'hp', 'wa']);

          return {
            id: `usr-imp-${Date.now()}-${idx}`,
            username,
            nama,
            email,
            role,
            roleLabel,
            status,
            telepon,
            lastLogin: 'Baru diimpor'
          };
        }).filter(a => a.username && a.nama);

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

