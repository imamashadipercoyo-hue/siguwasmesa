/**
 * Google Apps Script (Code.gs)
 * Backend Database Google Sheets untuk SIGUWA SMKN 1 JEMBER
 * Jl. Jambu No.17 Patrang - Jember (68118)
 * 
 * Teroptimasi untuk Kapasitas Skala Besar: Mampu menampung 3.000 - 10.000 Data Siswa
 * Menggunakan Arsitektur High-Performance Chunking & Batching (Anti-Timeout)
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT - SIGUWA SMKN 1 JEMBER (VERSI OPTIMASI TINGGI)
 * Sistem Informasi Terpadu Guru Wali & Pendampingan Karakter Murid Berbasis Web
 * Alamat: Jl. Jambu No.17 Patrang - Jember (68118)
 * =========================================================================
 * 
 * DILENGKAPI TEKNOLOGI BATCHING UNTUK 3.000+ DATA SISWA:
 * 1. Menghilangkan bottleneck autoResizeColumn (yang memicu batas waktu eksekusi).
 * 2. Menggunakan setColumnWidth instan (<10 milidetik).
 * 3. Mendukung eksekusi single-shot maupun chunked batching (saveSiswaChunk).
 * 4. Mendukung pembacaan cepat 1-call getValues() untuk 3.000 data dalam <1 detik.
 * 
 * PANDUAN CEPAT DEPLOYMENT / PEMBARUAN:
 * 1. Buka Google Spreadsheet database sekolah di Google Drive.
 * 2. Buka menu: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus seluruh kode lama di Code.gs, lalu Tempel (Paste) seluruh kode baru ini.
 * 4. Klik tombol Simpan (ikon disket).
 * 5. Klik: Terapkan (Deploy) > Kelola deployment (Manage deployments) > Klik Edit (ikon pensil).
 * 6. Pada Versi (Version), pilih 'Versi Baru' (New version) > Klik 'Terapkan' (Deploy).
 * 7. Buka SIGUWA > Menu Admin > Tab Google Sheets > Klik 'Test & Simpan URL'.
 */

// Konfigurasi Nama Sheet/Tab
var SHEET_NAMES = {
  SISWA: 'Siswa',
  GURU_WALI: 'GuruWali',
  AKUN: 'Akun',
  JURNAL: 'Jurnal',
  PRESENSI: 'Presensi',
  RUJUKAN: 'RujukanBK',
  JADWAL: 'Jadwal',
  PROFIL: 'ProfilSekolah'
};

// Header resmi tabel Siswa (Standar 3000 Data Terstruktur)
var SISWA_HEADERS = [
  'No',
  'NISN',
  'Nama Siswa',
  'Kelas',
  'Jurusan',
  'Jenis Kelamin',
  'Tanggal Lahir',
  'Alamat',
  'Nama Orang Tua / Wali',
  'No HP Orang Tua',
  'Nilai Rata-Rata',
  'Poin Karakter',
  'Status Pendampingan',
  'Catatan Khusus',
  'ID Siswa'
];

// Lebar kolom standar tabel Siswa (Menghindari kalkulasi autoResize lambat pada 3000 baris)
var SISWA_COL_WIDTHS = [50, 130, 240, 95, 220, 65, 110, 250, 200, 140, 80, 80, 160, 240, 120];

// Header resmi tabel Akun Pengguna
var AKUN_HEADERS = [
  'No',
  'Username / NISN',
  'Kata Sandi',
  'Nama Pengguna',
  'Kelas / Jurusan Diampu',
  'Email',
  'Peran / Role',
  'Status',
  'Terakhir Masuk',
  'ID Akun',
  'Role System',
  'Kontak WA'
];

var AKUN_COL_WIDTHS = [50, 150, 120, 220, 180, 200, 180, 90, 130, 140, 120, 140];

// Header resmi tabel Master Guru Wali & Kelas Pendidik (Terkoneksi Akun)
var GURU_WALI_HEADERS = [
  'No',
  'NIP',
  'Nama Lengkap',
  'Gelar',
  'Peran / Role',
  'Kelas / Jurusan Diampu',
  'Username Akun',
  'Kata Sandi',
  'Email',
  'No Telepon / WA',
  'Status Akun',
  'ID Guru',
  'Program Keahlian',
  'Bio Singkat'
];

var GURU_WALI_COL_WIDTHS = [50, 160, 220, 90, 180, 180, 140, 120, 200, 140, 90, 110, 200, 250];

/**
 * Handle HTTP GET Request
 * Membaca data secara Real-time dari Google Sheets
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';

    checkAndInitSheets(ss);

    var responseData = {};

    if (action === 'getAll') {
      responseData = {
        success: true,
        message: 'Data berhasil disinkronisasi dari Google Sheet SMKN 1 Jember',
        timestamp: new Date().toISOString(),
        data: {
          siswa: getSiswaDataAsJson(ss.getSheetByName(SHEET_NAMES.SISWA)),
          guruWali: getGuruWaliDataAsJson(ss.getSheetByName(SHEET_NAMES.GURU_WALI)),
          akun: getAkunDataAsJson(ss.getSheetByName(SHEET_NAMES.AKUN)),
          jurnal: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.JURNAL)),
          presensi: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.PRESENSI)),
          rujukanBK: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.RUJUKAN)),
          jadwal: getSheetDataAsJson(ss.getSheetByName(SHEET_NAMES.JADWAL)),
          profilSekolah: getProfilDataAsJson(ss.getSheetByName(SHEET_NAMES.PROFIL))
        }
      };
    } else if (action === 'getSiswa') {
      var siswaData = getSiswaDataAsJson(ss.getSheetByName(SHEET_NAMES.SISWA));
      responseData = {
        success: true,
        total: siswaData.length,
        message: 'Berhasil memuat ' + siswaData.length + ' data siswa',
        data: siswaData,
        timestamp: new Date().toISOString()
      };
    } else if (action === 'ping') {
      responseData = {
        success: true,
        message: 'Koneksi ke Google Sheets Backend SMKN 1 Jember Terhubung Aktif (Mendukung 3.000+ Data)!',
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
 * Menerima payload dari aplikasi SIGUWA (Dukungan Chunking & Batching)
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
          message: 'Koneksi Berhasil! Database Google Sheet siap menampung data besar.'
        };
        break;

      case 'syncAll':
        // Simpan data menyeluruh
        if (payload.data) {
          if (payload.data.siswa) writeSiswaToSheet(ss.getSheetByName(SHEET_NAMES.SISWA), payload.data.siswa);
          if (payload.data.guruWali) writeGuruWaliToSheet(ss.getSheetByName(SHEET_NAMES.GURU_WALI), payload.data.guruWali);
          if (payload.data.akun) writeAkunToSheet(ss.getSheetByName(SHEET_NAMES.AKUN), payload.data.akun);
          if (payload.data.jurnal) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.JURNAL), payload.data.jurnal);
          if (payload.data.presensi) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.PRESENSI), payload.data.presensi);
          if (payload.data.rujukanBK) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.RUJUKAN), payload.data.rujukanBK);
          if (payload.data.jadwal) writeJsonToSheet(ss.getSheetByName(SHEET_NAMES.JADWAL), payload.data.jadwal);
          if (payload.data.schoolProfile || payload.data.profilSekolah) writeProfilToSheet(ss.getSheetByName(SHEET_NAMES.PROFIL), payload.data.schoolProfile || payload.data.profilSekolah);
        }
        result = {
          success: true,
          message: 'Sinkronisasi menyeluruh ke Google Sheets berhasil disimpan!',
          timestamp: new Date().toISOString()
        };
        break;

      case 'saveProfilSekolah':
        if (payload.profilSekolah || payload.schoolProfile) {
          writeProfilToSheet(ss.getSheetByName(SHEET_NAMES.PROFIL), payload.profilSekolah || payload.schoolProfile);
        }
        result = { success: true, message: 'Profil sekolah & data Kepala Sekolah berhasil disimpan di Google Sheets.' };
        break;

      case 'saveSiswaList':
        if (payload.siswaList) {
          writeSiswaToSheet(ss.getSheetByName(SHEET_NAMES.SISWA), payload.siswaList);
        }
        result = { 
          success: true, 
          message: 'Data Master Siswa (' + (payload.siswaList ? payload.siswaList.length : 0) + ' data) berhasil disimpan di Google Sheets.' 
        };
        break;

      case 'clearSiswaList':
        clearSiswaSheet(ss.getSheetByName(SHEET_NAMES.SISWA));
        result = { 
          success: true, 
          message: 'Seluruh data peserta didik pada Google Spreadsheet berhasil dikosongkan.' 
        };
        break;

      // Solusi Skalabilitas 3.000 data: Menerima data per-chunk secara bertahap
      case 'saveSiswaChunk':
        var chunkIndex = payload.chunkIndex || 0;
        var totalChunks = payload.totalChunks || 1;
        var items = payload.items || [];
        var startingNo = payload.startingNo || 1;

        appendSiswaChunkToSheet(
          ss.getSheetByName(SHEET_NAMES.SISWA),
          chunkIndex,
          totalChunks,
          items,
          startingNo
        );

        result = {
          success: true,
          message: 'Bagian ' + (chunkIndex + 1) + ' dari ' + totalChunks + ' (' + items.length + ' siswa) tersimpan rapi.',
          chunkIndex: chunkIndex,
          totalChunks: totalChunks
        };
        break;

      case 'saveAkunList':
        if (payload.akunList) {
          writeAkunToSheet(ss.getSheetByName(SHEET_NAMES.AKUN), payload.akunList);
        }
        result = { success: true, message: 'Data Master Akun Pengguna berhasil diperbarui di Google Sheets.' };
        break;

      case 'saveGuruWaliList':
        if (payload.guruWaliList) {
          writeGuruWaliToSheet(ss.getSheetByName(SHEET_NAMES.GURU_WALI), payload.guruWaliList);
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
      message: 'Gagal memproses permintaan POST pada Google Sheets: ' + err.message
    });
  }
}

/**
 * =========================================================================
 * KHUSUS TAB SISWA (KAPASITAS TINGGI: HINGGA 3.000 - 10.000 BARIS)
 * =========================================================================
 */

/**
 * Mengosongkan data peserta didik pada Google Spreadsheet dan menyisakan header resmi rapi
 */
function clearSiswaSheet(sheet) {
  if (!sheet) return;
  sheet.clearContents();
  sheet.getRange(1, 1, 1, SISWA_HEADERS.length).setValues([SISWA_HEADERS]);
  var headerRange = sheet.getRange(1, 1, 1, SISWA_HEADERS.length);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  applySiswaColumnWidths(sheet);
}

/**
 * Menulis seluruh data siswa secara langsung dengan Batching Memory V8
 */
function writeSiswaToSheet(sheet, siswaList) {
  if (!sheet) return;
  clearSiswaSheet(sheet);
  if (!siswaList || siswaList.length === 0) return;

  // 3. Tulis Baris Data dalam blok 1.000 baris untuk efisiensi RAM Apps Script
  var CHUNK_SIZE = 1000;
  for (var i = 0; i < siswaList.length; i += CHUNK_SIZE) {
    var chunk = siswaList.slice(i, i + CHUNK_SIZE);
    var rows = [];

    for (var k = 0; k < chunk.length; k++) {
      var s = chunk[k];
      var no = i + k + 1;
      var nisn = String(s.nisn || '').trim();
      if (/^0\\d+/.test(nisn)) nisn = "'" + nisn;

      var noHp = String(s.noHpOrtu || '').trim();
      if (/^0\\d+/.test(noHp)) noHp = "'" + noHp;

      var tglLahir = String(s.tanggalLahir || '2010-01-01');
      if (tglLahir.includes('T')) tglLahir = tglLahir.split('T')[0];

      rows.push([
        no,
        nisn,
        String(s.nama || '').trim(),
        String(s.kelas || 'X KKBT').trim(),
        String(s.jurusan || '').trim(),
        String(s.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
        tglLahir,
        String(s.alamat || '').trim(),
        String(s.namaOrtu || '').trim(),
        noHp,
        Number(s.nilaiRataRata) || 80,
        Number(s.poinKarakter) || 85,
        String(s.statusPendampingan || 'Normal').trim(),
        String(s.catatanKhusus || '').trim(),
        String(s.id || ('sis-' + no)).trim()
      ]);
    }

    var startRow = 2 + i;
    sheet.getRange(startRow, 1, rows.length, SISWA_HEADERS.length).setValues(rows);
  }
}

/**
 * Menulis data siswa secara bertahap (Chunked Upload) untuk dataset sangat besar
 */
function appendSiswaChunkToSheet(sheet, chunkIndex, totalChunks, chunkItems, startingNo) {
  if (chunkIndex === 0) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, SISWA_HEADERS.length).setValues([SISWA_HEADERS]);
    var headerRange = sheet.getRange(1, 1, 1, SISWA_HEADERS.length);
    headerRange.setBackground('#1e3a8a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');

    applySiswaColumnWidths(sheet);
  }

  if (!chunkItems || chunkItems.length === 0) return;

  var lastRow = sheet.getLastRow();
  var startRow = (chunkIndex === 0) ? 2 : (lastRow + 1);
  var baseNo = (typeof startingNo === 'number' && startingNo > 0) ? startingNo : (startRow - 1);

  var rows = [];
  for (var k = 0; k < chunkItems.length; k++) {
    var s = chunkItems[k];
    var no = baseNo + k;
    var nisn = String(s.nisn || '').trim();
    if (/^0\\d+/.test(nisn)) nisn = "'" + nisn;

    var noHp = String(s.noHpOrtu || '').trim();
    if (/^0\\d+/.test(noHp)) noHp = "'" + noHp;

    var tglLahir = String(s.tanggalLahir || '2010-01-01');
    if (tglLahir.includes('T')) tglLahir = tglLahir.split('T')[0];

    rows.push([
      no,
      nisn,
      String(s.nama || '').trim(),
      String(s.kelas || 'X KKBT').trim(),
      String(s.jurusan || '').trim(),
      String(s.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
      tglLahir,
      String(s.alamat || '').trim(),
      String(s.namaOrtu || '').trim(),
      noHp,
      Number(s.nilaiRataRata) || 80,
      Number(s.poinKarakter) || 85,
      String(s.statusPendampingan || 'Normal').trim(),
      String(s.catatanKhusus || '').trim(),
      String(s.id || ('sis-' + no)).trim()
    ]);
  }

  sheet.getRange(startRow, 1, rows.length, SISWA_HEADERS.length).setValues(rows);
}

function applySiswaColumnWidths(sheet) {
  for (var c = 0; c < SISWA_COL_WIDTHS.length; c++) {
    sheet.setColumnWidth(c + 1, SISWA_COL_WIDTHS[c]);
  }
}

/**
 * Membaca 3.000+ data siswa dalam 1 panggilan getValues() cepat (<0.5 detik)
 */
function getSiswaDataAsJson(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, Math.min(lastCol, SISWA_HEADERS.length)).getValues();
  var headers = values[0];
  var result = [];

  // Peta indeks header
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toLowerCase().trim();
    colMap[h] = c;
  }

  var idxNisn = colMap['nisn'] !== undefined ? colMap['nisn'] : 1;
  var idxNama = colMap['nama siswa'] !== undefined ? colMap['nama siswa'] : (colMap['nama lengkap'] !== undefined ? colMap['nama lengkap'] : (colMap['nama'] !== undefined ? colMap['nama'] : 2));
  var idxKelas = colMap['kelas'] !== undefined ? colMap['kelas'] : 3;
  var idxJurusan = colMap['jurusan'] !== undefined ? colMap['jurusan'] : 4;
  var idxJK = colMap['jenis kelamin'] !== undefined ? colMap['jenis kelamin'] : (colMap['jk'] !== undefined ? colMap['jk'] : 5);
  var idxTgl = colMap['tanggal lahir'] !== undefined ? colMap['tanggal lahir'] : 6;
  var idxAlamat = colMap['alamat'] !== undefined ? colMap['alamat'] : 7;
  var idxOrtu = colMap['nama orang tua / wali'] !== undefined ? colMap['nama orang tua / wali'] : (colMap['nama ortu'] !== undefined ? colMap['nama ortu'] : 8);
  var idxHpOrtu = colMap['no hp orang tua'] !== undefined ? colMap['no hp orang tua'] : (colMap['no hp ortu'] !== undefined ? colMap['no hp ortu'] : 9);
  var idxNilai = colMap['nilai rata-rata'] !== undefined ? colMap['nilai rata-rata'] : (colMap['nilai'] !== undefined ? colMap['nilai'] : 10);
  var idxPoin = colMap['poin karakter'] !== undefined ? colMap['poin karakter'] : (colMap['poin'] !== undefined ? colMap['poin'] : 11);
  var idxStatus = colMap['status pendampingan'] !== undefined ? colMap['status pendampingan'] : (colMap['status'] !== undefined ? colMap['status'] : 12);
  var idxCatatan = colMap['catatan khusus'] !== undefined ? colMap['catatan khusus'] : (colMap['catatan'] !== undefined ? colMap['catatan'] : 13);
  var idxId = colMap['id siswa'] !== undefined ? colMap['id siswa'] : (colMap['id'] !== undefined ? colMap['id'] : 14);

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var rawNisn = String(row[idxNisn] !== undefined ? row[idxNisn] : '').replace(/^'/, '').trim();
    var rawNama = String(row[idxNama] !== undefined ? row[idxNama] : '').trim();
    if (!rawNisn && !rawNama) continue;

    var rawTgl = row[idxTgl];
    var formattedTgl = '2010-01-01';
    if (rawTgl instanceof Date) {
      formattedTgl = Utilities.formatDate(rawTgl, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
    } else if (typeof rawTgl === 'string' && rawTgl) {
      formattedTgl = rawTgl.includes('T') ? rawTgl.split('T')[0] : rawTgl.replace(/^'/, '').trim();
    }

    result.push({
      id: String(row[idxId] || ('sis-' + r)).trim(),
      nisn: rawNisn,
      nama: rawNama,
      kelas: String(row[idxKelas] || 'X KKBT').trim(),
      jurusan: String(row[idxJurusan] || '').trim(),
      jenisKelamin: String(row[idxJK] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
      tanggalLahir: formattedTgl,
      alamat: String(row[idxAlamat] || '').trim(),
      namaOrtu: String(row[idxOrtu] || '').trim(),
      noHpOrtu: String(row[idxHpOrtu] || '').replace(/^'/, '').trim(),
      nilaiRataRata: Number(row[idxNilai]) || 80,
      poinKarakter: Number(row[idxPoin]) || 85,
      statusPendampingan: String(row[idxStatus] || 'Normal').trim(),
      catatanKhusus: String(row[idxCatatan] || '').trim()
    });
  }

  return result;
}

/**
 * =========================================================================
 * KHUSUS TAB AKUN PENGGUNA
 * =========================================================================
 */
function writeAkunToSheet(sheet, akunList) {
  if (!akunList || akunList.length === 0) return;
  sheet.clearContents();

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
    var password = String(item.password || (item.role === 'admin' ? 'admin123' : item.role === 'kkk' ? 'kkk123' : (item.role === 'guru_wali' || item.role === 'wali_kelas') ? 'guru123' : (item.role === 'manajemen_bk' || item.role === 'bk') ? 'bk123' : '123456'));
    var nama = String(item.nama || '');

    var scopeDiampu = item.kelas || '-';
    if (item.role === 'kkk') {
      scopeDiampu = item.jurusan || item.kelas || 'Kriya Kreatif Batik dan Tekstil';
    } else if (item.role === 'admin') {
      scopeDiampu = 'Semua Kelas & Jurusan';
    } else if (item.role === 'guru_wali') {
      scopeDiampu = item.kelas || 'X KKBT';
    } else if (item.role === 'wali_kelas') {
      scopeDiampu = item.kelas || 'X KKBT, XI KKBT';
    } else if (item.role === 'manajemen_bk' || item.role === 'bk') {
      scopeDiampu = item.kelas || 'X KKBT, X TL';
    }

    var email = String(item.email || '');
    var roleLabel = String(item.roleLabel || (item.role === 'admin' ? 'Super Administrator' : item.role === 'kkk' ? ('KKK ' + scopeDiampu) : item.role === 'wali_kelas' ? ('Wali Kelas ' + scopeDiampu) : item.role === 'guru_wali' ? ('Guru Wali ' + scopeDiampu) : 'Pengguna'));
    var status = (String(item.status).toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif');
    var lastLogin = String(item.lastLogin || '-');
    var id = String(item.id || ('usr-' + username + '-' + (k + 1)));
    var roleSystem = String(item.role || 'guru_wali');
    var telepon = String(item.telepon || '');

    if (/^0\\d+/.test(username)) username = "'" + username;
    if (/^0\\d+/.test(telepon)) telepon = "'" + telepon;

    rows.push([
      no,
      username,
      password,
      nama,
      scopeDiampu,
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

  var headerRange = sheet.getRange(1, 1, 1, AKUN_HEADERS.length);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  for (var c = 0; c < AKUN_COL_WIDTHS.length; c++) {
    sheet.setColumnWidth(c + 1, AKUN_COL_WIDTHS[c]);
  }
}

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

    var rawUsername = rowObj['Username / NISN'] || rowObj['Username'] || rowObj['username'] || '';
    var cleanUsername = String(rawUsername).replace(/^'/, '').trim();
    if (!cleanUsername) continue;

    var lowerUser = cleanUsername.toLowerCase();
    if (seenMap[lowerUser]) continue;
    seenMap[lowerUser] = true;

    var password = String(rowObj['Kata Sandi'] || rowObj['Password'] || rowObj['password'] || '');
    var nama = String(rowObj['Nama Pengguna'] || rowObj['Nama'] || rowObj['nama'] || '');
    var kelas = String(rowObj['Kelas / Jurusan Diampu'] || rowObj['Kelas Diampu'] || rowObj['Jurusan Diampu'] || rowObj['Kelas'] || rowObj['kelas'] || '');
    var email = String(rowObj['Email'] || rowObj['email'] || '');
    var roleLabel = String(rowObj['Peran / Role'] || rowObj['Role Akses'] || rowObj['roleLabel'] || '');
    var status = String(rowObj['Status'] || rowObj['status'] || 'Aktif');
    var lastLogin = String(rowObj['Terakhir Masuk'] || rowObj['lastLogin'] || '-');
    var id = String(rowObj['ID Akun'] || rowObj['ID Sistem'] || rowObj['id'] || ('usr-' + lowerUser + '-' + r));
    var role = String(rowObj['Role System'] || rowObj['role'] || '');
    var telepon = String(rowObj['Kontak WA'] || rowObj['Telepon'] || rowObj['telepon'] || '').replace(/^'/, '');

    if (!role) {
      var rLower = roleLabel.toLowerCase();
      if (lowerUser.includes('admin') || rLower.includes('admin')) {
        role = 'admin';
      } else if (lowerUser.includes('kkk') || rLower.includes('kkk') || rLower.includes('konsentrasi') || rLower.includes('jurusan')) {
        role = 'kkk';
      } else if (lowerUser.includes('wali.kelas') || rLower.includes('wali kelas') || rLower.includes('walikelas')) {
        role = 'wali_kelas';
      } else if (rLower.includes('bk') || lowerUser.includes('bk') || rLower.includes('konseling') || rLower.includes('kesiswaan')) {
        role = 'manajemen_bk';
      } else if (rLower.includes('wali murid') || /^\\d{10}$/.test(cleanUsername)) {
        role = 'wali_murid';
      } else {
        role = 'guru_wali';
      }
    }

    if (!roleLabel) {
      if (role === 'admin') roleLabel = 'Super Administrator';
      else if (role === 'kkk') roleLabel = 'Ketua Konsentrasi Keahlian (KKK) ' + kelas;
      else if (role === 'wali_kelas') roleLabel = 'Wali Kelas ' + kelas;
      else if (role === 'manajemen_bk' || role === 'bk') roleLabel = 'Guru BK & Konselor';
      else if (role === 'guru_wali') roleLabel = 'Guru Wali Kelas ' + kelas;
      else roleLabel = 'Wali Murid ' + kelas;
    }

    var jurusan = (role === 'kkk' ? kelas : undefined);

    result.push({
      id: id,
      username: cleanUsername,
      password: password,
      nama: nama,
      kelas: kelas,
      jurusan: jurusan,
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
 * =========================================================================
 * KHUSUS TAB GURU WALI & KELAS PENDIDIK
 * =========================================================================
 */
function writeGuruWaliToSheet(sheet, guruList) {
  if (!guruList || guruList.length === 0) return;
  sheet.clearContents();

  var seenNip = {};
  var uniqueGurus = [];
  for (var i = 0; i < guruList.length; i++) {
    var g = guruList[i];
    if (!g) continue;
    var key = (g.nip ? String(g.nip).trim() : '') || (g.nama ? String(g.nama).trim() : 'gw-' + i);
    if (!seenNip[key]) {
      seenNip[key] = true;
      uniqueGurus.push(g);
    }
  }

  var rows = [GURU_WALI_HEADERS];

  for (var k = 0; k < uniqueGurus.length; k++) {
    var guru = uniqueGurus[k];
    var no = k + 1;
    var nip = String(guru.nip || '').replace(/^'/, '').trim();
    var nama = String(guru.nama || '').trim();
    var gelar = String(guru.gelar || '').trim();
    var rawRole = String(guru.role || 'guru_wali').toLowerCase();
    var roleLabel = String(guru.roleLabel || '');
    var scopeDiampu = String(guru.kelas || '');

    if (rawRole === 'kkk') {
      scopeDiampu = String(guru.jurusan || guru.kelas || 'Kriya Kreatif Batik dan Tekstil');
      if (!roleLabel) roleLabel = 'Ketua Konsentrasi Keahlian (KKK) ' + scopeDiampu;
    } else if (rawRole === 'wali_kelas') {
      if (!roleLabel) roleLabel = 'Wali Kelas ' + scopeDiampu;
    } else if (rawRole === 'manajemen_bk' || rawRole === 'bk') {
      if (!roleLabel) roleLabel = 'Guru BK & Konselor';
    } else {
      if (!roleLabel) roleLabel = 'Guru Wali Kelas ' + scopeDiampu;
    }

    var username = String(guru.username || (guru.email ? guru.email.split('@')[0] : nip.replace(/\\s+/g, ''))).replace(/^'/, '').trim();
    var password = String(guru.password || (rawRole === 'kkk' ? 'kkk123' : rawRole === 'manajemen_bk' ? 'bk123' : 'guru123'));
    var email = String(guru.email || (username ? username + '@smkn1jember.sch.id' : ''));
    var telepon = String(guru.telepon || '').replace(/^'/, '');
    var status = String(guru.statusAkun || 'Aktif');
    var id = String(guru.id || 'gw-' + (k + 1));
    var jurusan = String(guru.jurusan || '');
    var bio = String(guru.bio || '');

    if (/^0\\d+/.test(nip)) nip = "'" + nip;
    if (/^0\\d+/.test(telepon)) telepon = "'" + telepon;
    if (/^0\\d+/.test(username)) username = "'" + username;

    rows.push([
      no,
      nip,
      nama,
      gelar,
      roleLabel,
      scopeDiampu,
      username,
      password,
      email,
      telepon,
      status,
      id,
      jurusan,
      bio
    ]);
  }

  var range = sheet.getRange(1, 1, rows.length, GURU_WALI_HEADERS.length);
  range.setValues(rows);

  var headerRange = sheet.getRange(1, 1, 1, GURU_WALI_HEADERS.length);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  for (var c = 0; c < GURU_WALI_COL_WIDTHS.length; c++) {
    sheet.setColumnWidth(c + 1, GURU_WALI_COL_WIDTHS[c]);
  }
}

function getGuruWaliDataAsJson(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var result = [];

  for (var r = 1; r < values.length; r++) {
    var rowValues = values[r];
    var rowObj = {};

    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c] || '').trim();
      var val = rowValues[c];
      if (val === undefined || val === null) val = '';
      rowObj[h] = val;
    }

    var nip = String(rowObj['NIP'] || rowObj['nip'] || '').replace(/^'/, '').trim();
    var nama = String(rowObj['Nama Lengkap'] || rowObj['Nama'] || rowObj['nama'] || '').trim();
    if (!nama && !nip) continue;

    var gelar = String(rowObj['Gelar'] || rowObj['gelar'] || '').trim();
    var rawRole = String(rowObj['Peran / Role'] || rowObj['Role'] || rowObj['role'] || '').toLowerCase();
    var scopeDiampu = String(rowObj['Kelas / Jurusan Diampu'] || rowObj['Kelas'] || rowObj['kelas'] || 'X KKBT').trim();
    var username = String(rowObj['Username Akun'] || rowObj['Username'] || rowObj['username'] || '').replace(/^'/, '').trim();
    var password = String(rowObj['Kata Sandi'] || rowObj['Password'] || rowObj['password'] || '').trim();
    var email = String(rowObj['Email'] || rowObj['email'] || '').trim();
    var telepon = String(rowObj['No Telepon / WA'] || rowObj['telepon'] || '').replace(/^'/, '').trim();
    var statusAkun = String(rowObj['Status Akun'] || rowObj['status'] || 'Aktif').trim();
    var id = String(rowObj['ID Guru'] || rowObj['id'] || ('gw-' + r)).trim();
    var jurusan = String(rowObj['Program Keahlian'] || rowObj['jurusan'] || '').trim();
    var bio = String(rowObj['Bio Singkat'] || rowObj['bio'] || '').trim();

    var role = 'guru_wali';
    if (rawRole.includes('kkk') || rawRole.includes('konsentrasi') || rawRole.includes('jurusan')) {
      role = 'kkk';
    } else if (rawRole.includes('wali_kelas') || rawRole.includes('walikelas') || rawRole.includes('wali kelas') || scopeDiampu.includes(',')) {
      role = 'wali_kelas';
    } else if (rawRole.includes('bk') || rawRole.includes('konseling') || rawRole.includes('kesiswaan')) {
      role = 'manajemen_bk';
    } else {
      role = 'guru_wali';
    }

    var roleLabel = String(rowObj['Peran / Role'] || '');
    if (!roleLabel) {
      if (role === 'kkk') roleLabel = 'Ketua Konsentrasi Keahlian (KKK) ' + (jurusan || scopeDiampu);
      else if (role === 'wali_kelas') roleLabel = 'Wali Kelas ' + scopeDiampu;
      else if (role === 'manajemen_bk') roleLabel = 'Guru BK & Konselor';
      else roleLabel = 'Guru Wali Kelas ' + scopeDiampu;
    }

    if (!username) {
      username = email ? email.split('@')[0] : (nip ? nip.replace(/\\s+/g, '') : ('guru' + r));
    }
    if (!password) {
      password = role === 'kkk' ? 'kkk123' : role === 'manajemen_bk' ? 'bk123' : 'guru123';
    }

    result.push({
      id: id,
      nip: nip,
      nama: nama,
      gelar: gelar,
      kelas: scopeDiampu,
      jurusan: jurusan || (role === 'kkk' ? scopeDiampu : ''),
      telepon: telepon,
      email: email,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: bio || (roleLabel + ' SMKN 1 Jember.'),
      role: role,
      roleLabel: roleLabel,
      username: username,
      password: password,
      statusAkun: (statusAkun.toLowerCase().includes('non') ? 'Nonaktif' : 'Aktif')
    });
  }

  return result;
}

/**
 * =========================================================================
 * HELPER UMUM SHEET LAIN (JURNAL, PRESENSI, RUJUKAN, JADWAL)
 * =========================================================================
 */
function writeJsonToSheet(sheet, items) {
  if (!items || items.length === 0) return;
  sheet.clearContents();

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

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Hanya autoResize jika baris sedikit (< 100 baris) agar tidak timeout
  if (items.length <= 100) {
    for (var c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }
}

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

function writeProfilToSheet(sheet, profil) {
  if (!sheet || !profil) return;
  sheet.clearContents();
  var rows = [
    ['Parameter Pengaturan', 'Nilai / Keterangan'],
    ['namaSekolah', profil.namaSekolah || 'SMK Negeri 1 Jember'],
    ['alamatSekolah', profil.alamatSekolah || 'Jl. Jambu No. 17 Patrang'],
    ['telepon', profil.telepon || '(0331) 487535'],
    ['email', profil.email || 'smkn1jember@yahoo.com'],
    ['website', profil.website || 'www.smkn1jember.sch.id'],
    ['namaKepalaSekolah', profil.namaKepalaSekolah || 'Drs. Sri Hartono, M.Pd'],
    ['nipKepalaSekolah', profil.nipKepalaSekolah ? "'" + String(profil.nipKepalaSekolah).replace(/^'/, '') : "'19670512 199412 1 002"],
    ['kotaTandaTangan', profil.kotaTandaTangan || 'Jember'],
    ['logoSekolah', profil.logoSekolah || 'https://iili.io/n8W0HZu.md.png']
  ];
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  var headerRange = sheet.getRange(1, 1, 1, 2);
  headerRange.setBackground('#1e3a8a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 400);
}

function getProfilDataAsJson(sheet) {
  if (!sheet) return null;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  var values = sheet.getRange(1, 1, lastRow, 2).getValues();
  var result = {};
  for (var r = 1; r < values.length; r++) {
    var key = String(values[r][0] || '').trim();
    var val = String(values[r][1] || '').replace(/^'/, '').trim();
    if (key) {
      result[key] = val;
    }
  }
  return result;
}

function checkAndInitSheets(ss) {
  var sheetNames = [
    SHEET_NAMES.SISWA,
    SHEET_NAMES.GURU_WALI,
    SHEET_NAMES.AKUN,
    SHEET_NAMES.JURNAL,
    SHEET_NAMES.PRESENSI,
    SHEET_NAMES.RUJUKAN,
    SHEET_NAMES.JADWAL,
    SHEET_NAMES.PROFIL
  ];

  for (var i = 0; i < sheetNames.length; i++) {
    var name = sheetNames[i];
    var s = ss.getSheetByName(name);
    if (!s) {
      s = ss.insertSheet(name);
    }
  }

  var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
