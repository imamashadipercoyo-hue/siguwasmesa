/**
 * Google Apps Script (Code.gs)
 * Backend Database Google Sheets untuk SIGUWA SMKN 1 JEMBER
 * Jl. Jambu No.17 Patrang - Jember (68118)
 * 
 * Struktur Kolom Tab Akun:
 * No | Username / NISN | Kata Sandi | Nama Pengguna | Kelas Diampu | Email | Peran / Role | Status | Terakhir Masuk | ID Akun | Role System | Kontak WA
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT - SIGUWA SMKN 1 JEMBER
 * Sistem Informasi Terpadu Guru Wali & Pendampingan Karakter Murid Berbasis Web Based Online
 * Alamat: Jl. Jambu No.17 Patrang - Jember (68118)
 * =========================================================================
 * 
 * PANDUAN CEPAT DEPLOYMENT:
 * 1. Buat Google Spreadsheet baru di Google Drive (misal: "DB_SIGUWA_SMKN1_JEMBER").
 * 2. Buka menu: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus semua kode default, lalu Tempel (Paste) seluruh kode ini ke file Code.gs.
 * 4. Klik tombol Simpan (ikon disket).
 * 5. Klik menu: Terapkan (Deploy) > Kelola deployment baru (New deployment).
 * 6. Pilih tipe: Aplikasi Web (Web App).
 * 7. Pada 'Jalankan sebagai' (Execute as), pilih: 'Saya' (Me).
 * 8. Pada 'Yang memiliki akses' (Who has access), pilih: 'Siapa saja' (Anyone).
 * 9. Klik 'Terapkan' (Deploy) dan salin URL Aplikasi Web (Web App URL) yang dihasilkan.
 * 10. Buka SIGUWA > Menu Admin > Tab Google Sheets > Tempel URL tersebut > Klik 'Test & Simpan'.
 */

// Konfigurasi Nama-nama Sheet/Tab
var SHEET_NAMES = {
  SISWA: 'Siswa',
  GURU_WALI: 'GuruWali',
  AKUN: 'Akun',
  JURNAL: 'Jurnal',
  PRESENSI: 'Presensi',
  RUJUKAN: 'RujukanBK',
  JADWAL: 'Jadwal'
};

// Header resmi tabel Akun Pengguna
var AKUN_HEADERS = [
  'No',
  'Username / NISN',
  'Kata Sandi',
  'Nama Pengguna',
  'Kelas Diampu',
  'Email',
  'Peran / Role',
  'Status',
  'Terakhir Masuk',
  'ID Akun',
  'Role System',
  'Kontak WA'
];

/**
 * Handle HTTP GET Request
 * Membaca data secara Real-time dari Google Sheets dan mengirimkan JSON ke aplikasi
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';

    // Inisialisasi sheet jika belum ada
    checkAndInitSheets(ss);

    var responseData = {};

    if (action === 'getAll') {
      responseData = {
        success: true,
        message: 'Data berhasil disinkronisasi dari Google Sheet SMKN 1 Jember',
        timestamp: new Date().toISOString(),
        data: {
          siswa: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.SISWA)),
          guruWali: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.GURU_WALI)),
          akun: getAkunDataAsJson(ss.getSheetByName(SHEET_NAMES.AKUN)),
          jurnal: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.JURNAL)),
          presensi: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.PRESENSI)),
          rujukanBK: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.RUJUKAN)),
          jadwal: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.JADWAL))
        }
      };
    } else if (action === 'ping') {
      responseData = {
        success: true,
        message: 'Koneksi ke Google Sheets Backend SMKN 1 Jember Terhubung Aktif!',
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        timestamp: new Date().toISOString()
      };
    }

    return createJsonResponse(responseData);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString(),
      message: 'Gagal memproses permintaan GET pada Google Sheets'
    });
  }
}

/**
 * Handle HTTP POST Request
 * Menerima payload dari aplikasi SIGUWA (Push, Tambah, Edit, Hapus, Import)
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndInitSheets(ss);

    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action;

    var result = { success: true };

    switch (action) {
      case 'ping':
        result = {
          success: true,
          message: 'Koneksi Berhasil! Database Google Sheet siap digunakan.'
        };
        break;

      case 'syncAll':
        // Simpan keseluruhan data
        if (payload.data) {
          if (payload.data.siswa) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.SISWA), payload.data.siswa);
          if (payload.data.guruWali) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.GURU_WALI), payload.data.guruWali);
          if (payload.data.akun) writeAkunToSheet(ss.getSheetByName(SHEET_NAMES.AKUN), payload.data.akun);
          if (payload.data.jurnal) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.JURNAL), payload.data.jurnal);
          if (payload.data.presensi) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.PRESENSI), payload.data.presensi);
          if (payload.data.rujukanBK) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.RUJUKAN), payload.data.rujukanBK);
          if (payload.data.jadwal) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.JADWAL), payload.data.jadwal);
        }
        result = {
          success: true,
          message: 'Sinkronisasi menyeluruh ke Google Sheets berhasil disimpan!',
          timestamp: new Date().toISOString()
        };
        break;

      case 'saveAkunList':
        if (payload.akunList) {
          writeAkunToSheet(ss.getSheetByName(SHEET_NAMES.AKUN), payload.akunList);
        }
        result = { success: true, message: 'Data Master Akun Pengguna berhasil diperbarui di Google Sheets.' };
        break;

      case 'saveSiswaList':
        if (payload.siswaList) {
          writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.SISWA), payload.siswaList);
        }
        result = { success: true, message: 'Data Master Siswa berhasil diperbarui di Google Sheets.' };
        break;

      case 'saveGuruWaliList':
        if (payload.guruWaliList) {
          writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.GURU_WALI), payload.guruWaliList);
        }
        result = { success: true, message: 'Data Master Guru Wali berhasil diperbarui di Google Sheets.' };
        break;

      case 'saveJurnalList':
        if (payload.jurnalList) {
          writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.JURNAL), payload.jurnalList);
        }
        result = { success: true, message: 'Data Jurnal Layanan berhasil disimpan ke Google Sheets.' };
        break;

      case 'savePresensi':
        if (payload.presensiList) {
          writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.PRESENSI), payload.presensiList);
        }
        result = { success: true, message: 'Presensi berhasil diperbarui di Google Sheets.' };
        break;

      default:
        result = { success: false, message: 'Aksi "' + action + '" tidak dikenali' };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString(),
      message: 'Gagal memproses permintaan POST pada Google Sheets'
    });
  }
}

/**
 * Khusus Akun: Menulis data akun dengan format tabel rapi:
 * No | Username / NISN | Kata Sandi | Nama Pengguna | Kelas Diampu | Email | Peran / Role | Status | Terakhir Masuk | ID Akun | Role System | Kontak WA
 */
function writeAkunToSheet(sheet, akunList) {
  if (!akunList || akunList.length === 0) return;
  sheet.clear();

  // Deduplikasi data akun berdasarkan username
  var seenUsernames = {};
  var uniqueAccounts = [];
  for (var i = 0; i < akunList.length; i++) {
    var a = akunList[i];
    if (!a || !a.username) continue;
    var uname = String(a.username).trim().toLowerCase();
    if (!seenUsernames[uname]) {
      seenUsernames[uname] = true;
      uniqueAccounts.push(a);
    }
  }

  var rows = [AKUN_HEADERS];

  for (var k = 0; k < uniqueAccounts.length; k++) {
    var item = uniqueAccounts[k];
    var no = k + 1;
    var username = String(item.username || '').trim();
    var password = String(item.password || (item.role === 'admin' ? 'admin123' : item.role === 'guru_wali' ? 'guru123' : item.role === 'manajemen_bk' ? 'bk123' : '123456'));
    var nama = String(item.nama || '');
    var kelas = String(item.kelas || (item.role === 'admin' ? 'Semua Kelas' : item.role === 'guru_wali' ? 'X KKBT' : '-'));
    var email = String(item.email || '');
    var roleLabel = String(item.roleLabel || (item.role === 'admin' ? 'Super Administrator' : 'Guru Wali'));
    var status = (String(item.status).toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif');
    var lastLogin = String(item.lastLogin || '-');
    var id = String(item.id || ('usr-' + username + '-' + (k + 1)));
    var roleSystem = String(item.role || 'guru_wali');
    var telepon = String(item.telepon || '');

    // Format username & telepon dengan petik tunggal jika diawali angka 0 agar tidak hilang di Spreadsheet
    if (/^0\\d+/.test(username)) {
      username = "'" + username;
    }
    if (/^0\\d+/.test(telepon)) {
      telepon = "'" + telepon;
    }

    rows.push([
      no,
      username,
      password,
      nama,
      kelas,
      email,
      roleLabel,
      status,
      lastLogin,
      id,
      roleSystem,
      telepon
    ]);
  }

  var range = sheet.getRange(1, 1, rows.length, AKUN_HEADERS.length);
  range.setValues(rows);

  // Format Header Baris Pertama
  var headerRange = sheet.getRange(1, 1, 1, AKUN_HEADERS.length);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Format Kolom No dan Status ke Tengah
  if (rows.length > 1) {
    sheet.getRange(2, 1, rows.length - 1, 1).setHorizontalAlignment('center');
    sheet.getRange(2, 8, rows.length - 1, 1).setHorizontalAlignment('center');
  }

  // Auto-fit kolom agar rapi dibaca
  for (var col = 1; col <= AKUN_HEADERS.length; col++) {
    sheet.autoResizeColumn(col);
  }
}

/**
 * Khusus Akun: Membaca tabel Akun dan mengubah ke JSON yang dipahami aplikasi
 */
function getAkunDataAsJson(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var result = [];
  var seenMap = {};

  for (var r = 1; r < values.length; r++) {
    var rowValues = values[r];
    var rowObj = {};

    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c] || '').trim();
      var val = rowValues[c];
      if (val === undefined || val === null) val = '';
      rowObj[h] = val;
    }

    // Ekstrak data akun baik dengan header Bahasa Indonesia maupun Key CamelCase
    var rawUsername = rowObj['Username / NISN'] || rowObj['Username'] || rowObj['username'] || '';
    var cleanUsername = String(rawUsername).replace(/^'/, '').trim();
    if (!cleanUsername) continue;

    // Cegah duplikasi username dari baris ganda
    var lowerUser = cleanUsername.toLowerCase();
    if (seenMap[lowerUser]) continue;
    seenMap[lowerUser] = true;

    var password = String(rowObj['Kata Sandi'] || rowObj['Password'] || rowObj['password'] || '');
    var nama = String(rowObj['Nama Pengguna'] || rowObj['Nama'] || rowObj['nama'] || '');
    var kelas = String(rowObj['Kelas Diampu'] || rowObj['Kelas'] || rowObj['kelas'] || '');
    var email = String(rowObj['Email'] || rowObj['email'] || '');
    var roleLabel = String(rowObj['Peran / Role'] || rowObj['Role Akses'] || rowObj['roleLabel'] || '');
    var status = String(rowObj['Status'] || rowObj['status'] || 'Aktif');
    var lastLogin = String(rowObj['Terakhir Masuk'] || rowObj['lastLogin'] || '-');
    var id = String(rowObj['ID Akun'] || rowObj['ID Sistem'] || rowObj['id'] || ('usr-' + lowerUser + '-' + r));
    var role = String(rowObj['Role System'] || rowObj['role'] || '');
    var telepon = String(rowObj['Kontak WA'] || rowObj['Telepon'] || rowObj['telepon'] || '').replace(/^'/, '');

    // Inferensi role jika kosong
    if (!role) {
      if (lowerUser.includes('admin') || roleLabel.toLowerCase().includes('admin')) {
        role = 'admin';
      } else if (roleLabel.toLowerCase().includes('bk') || lowerUser.includes('bk')) {
        role = 'manajemen_bk';
      } else if (roleLabel.toLowerCase().includes('wali murid') || /^\\d{10}$/.test(cleanUsername)) {
        role = 'wali_murid';
      } else {
        role = 'guru_wali';
      }
    }

    if (!roleLabel) {
      roleLabel = (role === 'admin' ? 'Super Administrator' : role === 'guru_wali' ? ('Guru Wali ' + (kelas || '')) : role === 'manajemen_bk' ? 'Koordinator BK' : 'Wali Murid');
    }

    result.push({
      id: id,
      username: cleanUsername,
      password: password,
      nama: nama,
      kelas: kelas,
      email: email,
      role: role,
      roleLabel: roleLabel.trim(),
      status: (status.toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif'),
      lastLogin: lastLogin,
      telepon: telepon
    });
  }

  return result;
}

/**
 * Helper: Mengubah array of objects menjadi baris pada Sheet umum
 */
function writeJsonToSheet(sheet, items) {
  if (!items || items.length === 0) return;
  sheet.clear();

  // Kumpulkan seluruh header unik agar tidak ada kolom yang hilang
  var headerMap = {};
  var headers = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it) continue;
    for (var k in it) {
      if (it.hasOwnProperty(k) && !headerMap[k]) {
        headerMap[k] = true;
        headers.push(k);
      }
    }
  }

  if (headers.length === 0) return;

  var rows = [headers];

  for (var r = 0; r < items.length; r++) {
    var row = [];
    var currentItem = items[r];
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = currentItem ? currentItem[key] : '';
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      
      // Amankan NISN, NIP, Telepon agar nol di depan tidak terhapus
      var valStr = String(val);
      if ((key === 'nisn' || key === 'nip' || key === 'telepon' || key === 'noHpOrtu') && /^0\\d+/.test(valStr)) {
        val = "'" + valStr;
      }
      row.push(val);
    }
    rows.push(row);
  }

  var range = sheet.getRange(1, 1, rows.length, headers.length);
  range.setValues(rows);

  // Format header baris pertama
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  for (var c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Helper: Membaca sheet umum dan mengembalikan array of objects
 */
function getSheetDataAsJson(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var result = [];

  for (var r = 1; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      var cellVal = values[r][c];
      
      if (typeof cellVal === 'string') {
        cellVal = cellVal.replace(/^'/, '');
        if (cellVal.startsWith('{') || cellVal.startsWith('[')) {
          try {
            cellVal = JSON.parse(cellVal);
          } catch (e) {}
        }
      }
      obj[key] = cellVal;
    }
    result.push(obj);
  }
  return result;
}

/**
 * Helper: Inisialisasi otomatis tab-tab pada Spreadsheet baru
 */
function checkAndInitSheets(ss) {
  var sheetNames = [
    SHEET_NAMES.SISWA,
    SHEET_NAMES.GURU_WALI,
    SHEET_NAMES.AKUN,
    SHEET_NAMES.JURNAL,
    SHEET_NAMES.PRESENSI,
    SHEET_NAMES.RUJUKAN,
    SHEET_NAMES.JADWAL
  ];

  for (var i = 0; i < sheetNames.length; i++) {
    var name = sheetNames[i];
    var s = ss.getSheetByName(name);
    if (!s) {
      s = ss.insertSheet(name);
    }
  }

  // Hapus sheet default "Sheet1" jika ada dan ada sheet lain
  var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

/**
 * Helper: Format Response JSON dengan CORS Header
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
