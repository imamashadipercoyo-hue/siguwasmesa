import * as XLSX from 'xlsx';
import { Siswa, GuruWali, UserAccount, JurnalLayanan, UserRole } from '../types';

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
 * Export Guru Wali & Pendidik to Excel (.xlsx) dengan data akun terkoneksi
 */
export function exportGuruWaliToExcel(guruList: GuruWali[], fileName = 'DATA_GURU_WALI_SMKN1_JEMBER.xlsx') {
  const data = guruList.map((g, index) => {
    const rawRole = (g.role || 'guru_wali').toLowerCase();
    let roleLabel = g.roleLabel;
    if (!roleLabel) {
      if (rawRole === 'kkk') roleLabel = 'Ketua Konsentrasi Keahlian (KKK)';
      else if (rawRole === 'wali_kelas') roleLabel = 'Wali Kelas';
      else if (rawRole === 'manajemen_bk' || rawRole === 'bk') roleLabel = 'Guru BK & Konselor';
      else roleLabel = 'Guru Wali';
    }

    const username = g.username || (g.email ? g.email.split('@')[0] : g.nip.replace(/\s+/g, ''));
    const password = g.password || (rawRole === 'kkk' ? 'kkk123' : rawRole === 'manajemen_bk' ? 'bk123' : 'guru123');

    return {
      'No': index + 1,
      'NIP': g.nip,
      'Nama Lengkap': g.nama,
      'Gelar': g.gelar,
      'Peran / Role': roleLabel,
      'Kelas / Jurusan Diampu': g.role === 'kkk' ? (g.jurusan || g.kelas) : g.kelas,
      'Program Keahlian': g.jurusan,
      'Username Akun': username,
      'Kata Sandi': password,
      'Status Akun': g.statusAkun || 'Aktif',
      'No Telepon / WA': g.telepon,
      'Email Resmi': g.email,
      'Profil Singkat': g.bio
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 30 },
    { wch: 12 },
    { wch: 28 }, // Peran / Role
    { wch: 25 }, // Kelas / Jurusan Diampu
    { wch: 32 },
    { wch: 22 }, // Username
    { wch: 15 }, // Password
    { wch: 12 }, // Status
    { wch: 18 },
    { wch: 35 },
    { wch: 45 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guru Wali & Pendidik');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Akun Pengguna to Excel (.xlsx)
 */
export function exportAkunToExcel(akunList: UserAccount[], fileName = 'DATA_AKUN_SIGUWA_SMKN1_JEMBER.xlsx') {
  const data = akunList.map((a, index) => {
    let scopeDiampu = a.kelas || '-';
    if (a.role === 'kkk') {
      scopeDiampu = a.jurusan || a.kelas || 'Kriya Kreatif Batik dan Tekstil';
    } else if (a.role === 'admin') {
      scopeDiampu = 'Semua Kelas & Jurusan';
    } else if (a.role === 'guru_wali') {
      scopeDiampu = a.kelas || 'X KKBT';
    } else if (a.role === 'wali_kelas') {
      scopeDiampu = a.kelas || 'X KKBT, XI KKBT';
    } else if (a.role === 'bk' || a.role === 'manajemen_bk') {
      scopeDiampu = a.kelas || 'X KKBT, X TL';
    }

    return {
      'No': index + 1,
      'Username': a.username,
      'Kata Sandi': a.password || (a.role === 'admin' ? 'admin123' : a.role === 'kkk' ? 'kkk123' : a.role === 'guru_wali' || a.role === 'wali_kelas' ? 'guru123' : a.role === 'manajemen_bk' || a.role === 'bk' ? 'bk123' : '123456'),
      'Nama Pengguna': a.nama,
      'Kelas / Jurusan Diampu': scopeDiampu,
      'Email': a.email,
      'Role Akses': a.roleLabel,
      'Kode Role': a.role,
      'Status Akun': a.status,
      'Terakhir Masuk': a.lastLogin || '-',
      'Kontak Telepon': a.telepon || '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 16 },
    { wch: 30 },
    { wch: 28 }, // Kelas / Jurusan Diampu
    { wch: 35 },
    { wch: 28 },
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
 * Download Template Excel Guru Wali & Pendidik Terkoneksi Akun
 */
export function downloadTemplateGuruWaliExcel() {
  const template = [
    {
      'NIP': '19760914 200212 1 003',
      'Nama Lengkap': 'Drs. H. Mulyadi',
      'Gelar': 'M.Pd',
      'Kode Role': 'kkk',
      'Peran / Role': 'Ketua Konsentrasi Keahlian (KKK)',
      'Kelas / Jurusan Diampu': 'Kriya Kreatif Batik dan Tekstil',
      'Program Keahlian': 'Kriya Kreatif Batik dan Tekstil',
      'Username Akun': 'mulyadi.kkk',
      'Kata Sandi': 'kkk123',
      'Status Akun': 'Aktif',
      'No Telepon / WA': '081333445566',
      'Email Resmi': 'mulyadi.kkk@smkn1jember.sch.id',
      'Profil Singkat': 'Ketua Konsentrasi Keahlian (KKK) Jurusan KKBT SMKN 1 Jember.'
    },
    {
      'NIP': '19880410 201402 2 005',
      'Nama Lengkap': 'Rina Sulistyowati',
      'Gelar': 'S.Pd',
      'Kode Role': 'wali_kelas',
      'Peran / Role': 'Wali Kelas (Beberapa Kelas)',
      'Kelas / Jurusan Diampu': 'X KKBT, XI KKBT',
      'Program Keahlian': 'Kriya Kreatif Batik dan Tekstil',
      'Username Akun': 'rina.sulistyowati',
      'Kata Sandi': 'guru123',
      'Status Akun': 'Aktif',
      'No Telepon / WA': '081234998877',
      'Email Resmi': 'rina.sulistyowati@smkn1jember.sch.id',
      'Profil Singkat': 'Wali Kelas jenjang X dan XI KKBT SMKN 1 Jember.'
    },
    {
      'NIP': '19790321 200501 2 008',
      'Nama Lengkap': 'Sri Wahyuni',
      'Gelar': 'S.E., M.M',
      'Kode Role': 'manajemen_bk',
      'Peran / Role': 'BK (Beberapa Kelas)',
      'Kelas / Jurusan Diampu': 'X KKBT, X TL',
      'Program Keahlian': 'Bimbingan Konseling',
      'Username Akun': 'sri.wahyuni',
      'Kata Sandi': 'bk123',
      'Status Akun': 'Aktif',
      'No Telepon / WA': '081567891234',
      'Email Resmi': 'sri.wahyuni@smkn1jember.sch.id',
      'Profil Singkat': 'Guru Pendamping Khusus & Bimbingan Konseling Kelas X SMKN 1 Jember.'
    },
    {
      'NIP': '19740512 199903 2 004',
      'Nama Lengkap': 'Dra. Hj. Endang Sulistiyowati',
      'Gelar': 'M.Pd',
      'Kode Role': 'guru_wali',
      'Peran / Role': 'Guru Wali (1 Kelas Saja)',
      'Kelas / Jurusan Diampu': 'X KKBT',
      'Program Keahlian': 'Kriya Kreatif Batik dan Tekstil',
      'Username Akun': 'endang.sulistiyowati',
      'Kata Sandi': 'guru123',
      'Status Akun': 'Aktif',
      'No Telepon / WA': '081234567890',
      'Email Resmi': 'endang.sulistiyowati@smkn1jember.sch.id',
      'Profil Singkat': 'Guru Wali Kelas X Kriya Kreatif Batik dan Tekstil.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 30 },
    { wch: 12 },
    { wch: 16 }, // Kode Role
    { wch: 28 }, // Peran / Role
    { wch: 28 }, // Kelas / Jurusan Diampu
    { wch: 32 }, // Program Keahlian
    { wch: 20 }, // Username
    { wch: 15 }, // Password
    { wch: 12 }, // Status
    { wch: 18 },
    { wch: 35 },
    { wch: 45 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Guru & Akun');
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
          const scope = getVal(['kelas / jurusan diampu', 'kelas diampu', 'wali kelas', 'kelas', 'kelas binaan', 'jurusan diampu']) || 'X KKBT';
          const jurusan = getVal(['program keahlian', 'jurusan', 'kejuruan']) || (scope.includes('Batik') || scope.includes('KKBT') ? 'Kriya Kreatif Batik dan Tekstil' : 'Teknik Kejuruan');
          
          let telepon = getVal(['no telepon / wa', 'no telepon', 'telepon', 'hp', 'no hp', 'whatsapp', 'wa']);
          if (!telepon) telepon = '081234567890';
          if (!telepon.startsWith('0') && !telepon.startsWith('62')) telepon = `0${telepon}`;

          const email = getVal(['email resmi', 'email']) || `${nama.toLowerCase().replace(/[^a-z]/g, '')}@smkn1jember.sch.id`;
          const bio = getVal(['profil singkat', 'profil', 'bio', 'keterangan']) || `Pendidik SMKN 1 Jember.`;

          const rawRole = getVal(['kode role', 'peran / role', 'role', 'peran']).toLowerCase();
          let role: UserRole = 'guru_wali';
          if (rawRole.includes('kkk') || rawRole.includes('konsentrasi') || rawRole.includes('jurusan')) {
            role = 'kkk';
          } else if (rawRole.includes('wali_kelas') || rawRole.includes('walikelas') || rawRole.includes('wali kelas') || scope.includes(',')) {
            role = 'wali_kelas';
          } else if (rawRole.includes('bk') || rawRole.includes('konseling') || rawRole.includes('kesiswaan')) {
            role = 'manajemen_bk';
          } else {
            role = 'guru_wali';
          }

          const roleLabel = getVal(['peran / role', 'role akses']) || (
            role === 'kkk' ? `Ketua Konsentrasi Keahlian (KKK) ${jurusan || scope}` :
            role === 'wali_kelas' ? `Wali Kelas ${scope}` :
            role === 'manajemen_bk' ? `Guru BK & Konselor` : `Guru Wali Kelas ${scope}`
          );

          const username = getVal(['username akun', 'username', 'user']) || (email.includes('@') ? email.split('@')[0] : nip.replace(/\s+/g, ''));
          const password = getVal(['kata sandi', 'password', 'sandi']) || (role === 'kkk' ? 'kkk123' : role === 'manajemen_bk' ? 'bk123' : 'guru123');
          const statusAkun = (getVal(['status akun', 'status']).toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif';

          return {
            id: `gw-imp-${Date.now()}-${idx}`,
            nip,
            nama,
            gelar,
            kelas: scope,
            jurusan: role === 'kkk' ? (jurusan || scope) : jurusan,
            telepon,
            email,
            bio,
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            role,
            roleLabel,
            username,
            password,
            statusAkun
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
      'Kata Sandi': 'admin123',
      'Nama Pengguna': 'Administrator Utama SMKN 1 Jember',
      'Kelas / Jurusan Diampu': 'Semua Kelas & Jurusan',
      'Email': 'admin.siguwa@smkn1jember.sch.id',
      'Kode Role': 'admin',
      'Role Akses': 'Super Administrator',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '08113456789'
    },
    {
      'Username': 'mulyadi.kkk',
      'Kata Sandi': 'kkk123',
      'Nama Pengguna': 'Drs. H. Mulyadi, M.Pd',
      'Kelas / Jurusan Diampu': 'Kriya Kreatif Batik dan Tekstil',
      'Email': 'mulyadi.kkk@smkn1jember.sch.id',
      'Kode Role': 'kkk',
      'Role Akses': 'Ketua Konsentrasi Keahlian (KKK) KKBT',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '081333445566'
    },
    {
      'Username': 'sri.wahyuni',
      'Kata Sandi': 'bk123',
      'Nama Pengguna': 'Sri Wahyuni, S.E., M.M',
      'Kelas / Jurusan Diampu': 'X KKBT, X TL',
      'Email': 'sri.wahyuni@smkn1jember.sch.id',
      'Kode Role': 'bk',
      'Role Akses': 'Koordinator Guru BK',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '081567891234'
    },
    {
      'Username': 'rina.sulistyowati',
      'Kata Sandi': 'guru123',
      'Nama Pengguna': 'Rina Sulistyowati, S.Pd',
      'Kelas / Jurusan Diampu': 'X KKBT, XI KKBT',
      'Email': 'rina.sulistyowati@smkn1jember.sch.id',
      'Kode Role': 'wali_kelas',
      'Role Akses': 'Wali Kelas X KKBT & XI KKBT',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '081234998877'
    },
    {
      'Username': 'endang.sulistiyowati',
      'Kata Sandi': 'guru123',
      'Nama Pengguna': 'Dra. Hj. Endang Sulistiyowati, M.Pd',
      'Kelas / Jurusan Diampu': 'X KKBT',
      'Email': 'endang.sulistiyowati@smkn1jember.sch.id',
      'Kode Role': 'guru_wali',
      'Role Akses': 'Guru Wali Kelas X KKBT',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '081234567890'
    },
    {
      'Username': '0094201436',
      'Kata Sandi': '123456',
      'Nama Pengguna': 'Pratama Suwandi (Wali Andika)',
      'Kelas / Jurusan Diampu': 'X KKBT',
      'Email': 'wali.andika@gmail.com',
      'Kode Role': 'wali_murid',
      'Role Akses': 'Wali Murid X KKBT',
      'Status Akun': 'Aktif',
      'Kontak Telepon': '082245001479'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 32 },
    { wch: 28 }, // Kelas / Jurusan Diampu
    { wch: 35 },
    { wch: 16 },
    { wch: 30 },
    { wch: 14 },
    { wch: 18 }
  ];
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
          const password = getVal(['kata sandi', 'password', 'pass', 'sandi']) || 'siguwa123';
          const nama = getVal(['nama pengguna', 'nama', 'name']);
          const kelasOrJurusan = getVal([
            'kelas / jurusan diampu',
            'kelas/jurusan diampu',
            'kelas diampu',
            'jurusan diampu',
            'kelas',
            'jurusan',
            'wali kelas',
            'rombel'
          ]);
          const email = getVal(['email', 'surel']) || `${username}@smkn1jember.sch.id`;
          
          const roleRaw = getVal(['kode role', 'role', 'peran', 'role akses']).toLowerCase();
          let role: UserAccount['role'] = 'guru_wali';
          if (roleRaw.includes('admin')) {
            role = 'admin';
          } else if (roleRaw.includes('kkk') || roleRaw.includes('konsentrasi') || roleRaw.includes('jurusan')) {
            role = 'kkk';
          } else if (roleRaw.includes('wali_kelas') || roleRaw.includes('walikelas') || roleRaw.includes('wali kelas')) {
            role = 'wali_kelas';
          } else if (roleRaw.includes('bk') || roleRaw.includes('kesiswaan') || roleRaw.includes('konseling')) {
            role = 'manajemen_bk';
          } else if (roleRaw.includes('wali_murid') || roleRaw.includes('orang_tua') || roleRaw.includes('ortu') || roleRaw.includes('wali')) {
            role = 'wali_murid';
          } else {
            role = 'guru_wali';
          }

          let defaultScope = 'X KKBT';
          let defaultLabel = 'Guru Wali';
          let jurusanVal: string | undefined = undefined;

          if (role === 'admin') {
            defaultScope = 'Semua Kelas & Jurusan';
            defaultLabel = 'Super Administrator';
          } else if (role === 'kkk') {
            defaultScope = kelasOrJurusan || 'Kriya Kreatif Batik dan Tekstil';
            jurusanVal = defaultScope;
            defaultLabel = `Ketua Konsentrasi Keahlian (KKK) ${defaultScope}`;
          } else if (role === 'manajemen_bk') {
            defaultScope = kelasOrJurusan || 'X KKBT, X TL';
            defaultLabel = `Guru BK (${defaultScope})`;
          } else if (role === 'wali_kelas') {
            defaultScope = kelasOrJurusan || 'X KKBT, XI KKBT';
            defaultLabel = `Wali Kelas ${defaultScope}`;
          } else if (role === 'guru_wali') {
            defaultScope = kelasOrJurusan || 'X KKBT';
            defaultLabel = `Guru Wali Kelas ${defaultScope}`;
          } else if (role === 'wali_murid') {
            defaultScope = kelasOrJurusan || 'X KKBT';
            defaultLabel = `Wali Murid ${defaultScope}`;
          }

          const roleLabel = getVal(['role akses', 'label role', 'peran akses']) || defaultLabel;
          const statusRaw = getVal(['status akun', 'status']).toLowerCase();
          const status: 'Aktif' | 'Nonaktif' = statusRaw.includes('non') ? 'Nonaktif' : 'Aktif';
          const telepon = getVal(['kontak telepon', 'telepon', 'no hp', 'hp', 'wa']);

          return {
            id: `usr-imp-${Date.now()}-${idx}`,
            username,
            password,
            nama,
            email,
            role,
            roleLabel,
            kelas: kelasOrJurusan || defaultScope,
            jurusan: jurusanVal,
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

