/**
 * Google Apps Script (Code.gs)
 * Backend Database Google Sheets untuk SIGUWA SMKN 1 JEMBER
 * Jl. Jambu No.17 Patrang - Jember
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT - SIGUWA SMKN 1 JEMBER
 * Sistem Informasi Guru Wali & Pendamping Karakter Peserta Didik
 * Alamat: Jl. Jambu No.17 Patrang - Jember (68118)
 * =========================================================================
 * 
 * PANDUAN CEPAT DEPLOYMENT:
 * 1. Buat Google Spreadsheet baru di Google Drive (misal beri nama: "DB_SIGUWA_SMKN1_JEMBER").
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
          akun: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.AKUN)),
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
        // Simpan keseluruhan data (Master Siswa, Guru, Jurnal, Presensi)
        if (payload.data) {
          if (payload.data.siswa) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.SISWA), payload.data.siswa);
          if (payload.data.guruWali) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.GURU_WALI), payload.data.guruWali);
          if (payload.data.akun) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.AKUN), payload.data.akun);
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

      case 'saveAkunList':
        if (payload.akunList) {
          writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.AKUN), payload.akunList);
        }
        result = { success: true, message: 'Data Master Akun Pengguna berhasil diperbarui di Google Sheets.' };
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
 * Helper: Mengubah array of objects menjadi baris pada Sheet
 */
function writeJsonToSheet(sheet, items) {
  if (!items || items.length === 0) return;
  sheet.clearContents();

  // Dapatkan header dari keys objek pertama
  var headers = Object.keys(items[0]);
  var rows = [headers];

  for (var i = 0; i < items.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = items[i][headers[j]];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
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
}

/**
 * Helper: Membaca sheet dan mengembalikan array of objects
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
      
      // Auto parse JSON if stringified
      if (typeof cellVal === 'string' && (cellVal.startsWith('{') || cellVal.startsWith('['))) {
        try {
          cellVal = JSON.parse(cellVal);
        } catch (e) {}
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
