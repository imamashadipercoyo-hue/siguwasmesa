/**
 * Google Sheets & Apps Script Integration Service
 * Menghubungkan SIGUWA secara Real-Time ke Google Sheets via Apps Script Web App
 * Dilengkapi High-Performance Batching & Chunking untuk 3.000+ Data Siswa (Anti-Timeout)
 */

import { Siswa } from '../types';

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6PaZIJji6e7dFCMgcxs2a2hnmc5yXPlAqgeSNlfvg6G3Ar_B42qzFQ_f1nux19XzQ/exec';

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  totalSynced?: number;
}

/**
 * Tes koneksi ke Apps Script Web App
 */
export async function testAppsScriptConnection(url: string): Promise<SyncResult> {
  if (!url || !url.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script tidak valid. Pastikan diawali https://script.google.com/macros/s/...'
    };
  }

  try {
    const testUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return {
      success: json.success ?? true,
      message: json.message || 'Koneksi ke Google Sheets Backend berhasil diverifikasi!',
      data: json
    };
  } catch (err: any) {
    // In case of CORS on GET, attempt POST test
    try {
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' })
      });
      const postJson = await postResponse.json();
      return {
        success: postJson.success ?? true,
        message: postJson.message || 'Koneksi POST ke Google Sheets berhasil!',
        data: postJson
      };
    } catch (innerErr: any) {
      return {
        success: false,
        message: 'Gagal menghubungi Google Apps Script. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa saja).',
        error: err.message || String(err)
      };
    }
  }
}

/**
 * Membaca seluruh database (Siswa, Guru, Akun, Jurnal, Presensi, Rujukan, Jadwal)
 */
export async function fetchAllFromGoogleSheets(url: string): Promise<SyncResult> {
  try {
    const fetchUrl = url.includes('?') ? `${url}&action=getAll` : `${url}?action=getAll`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      return {
        success: true,
        message: 'Data berhasil diunduh dari Google Sheets',
        data: json.data
      };
    } else {
      return {
        success: false,
        message: json.message || 'Format data dari Google Sheets tidak sesuai',
        error: json.error
      };
    }
  } catch (err: any) {
    try {
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getAll' })
      });
      const postJson = await postResponse.json();
      if (postJson.success && postJson.data) {
        return {
          success: true,
          message: 'Data berhasil diunduh dari Google Sheets via POST',
          data: postJson.data
        };
      }
    } catch (innerErr) {}

    return {
      success: false,
      message: 'Gagal membaca data dari Google Sheets',
      error: err.message
    };
  }
}

/**
 * Membaca KHUSUS data siswa secara cepat (Super Cepat untuk 3.000 Siswa)
 */
export async function fetchSiswaFromGoogleSheets(url: string): Promise<SyncResult> {
  try {
    const fetchUrl = url.includes('?') ? `${url}&action=getSiswa` : `${url}?action=getSiswa`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return {
        success: true,
        message: `Berhasil memuat ${json.data.length} siswa dari Google Sheets`,
        data: json.data,
        totalSynced: json.data.length
      };
    }
    return {
      success: false,
      message: json.message || 'Gagal membaca tab Siswa'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Gagal mengambil data siswa dari Google Sheets',
      error: err.message
    };
  }
}

/**
 * Mengirim seluruh data secara menyeluruh (Push All)
 */
export async function pushAllToGoogleSheets(url: string, allData: any): Promise<SyncResult> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'syncAll',
        data: allData
      })
    });

    const json = await response.json();
    return {
      success: json.success ?? true,
      message: json.message || 'Data berhasil dikirim dan disimpan ke Google Sheets'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Gagal mengirim data ke Google Sheets',
      error: err.message
    };
  }
}

/**
 * MENGIRIM 3.000+ DATA SISWA DENGAN TEKNOLOGI CHUNKING BATCHING (ANTI-TIMEOUT)
 * Memecah data siswa menjadi potongan kecil (misal per 750 siswa per request)
 * sehingga tidak pernah melebihi batas waktu request HTTP Google Apps Script (30 detik).
 */
export async function pushSiswaToGoogleSheets(
  url: string,
  siswaList: Siswa[],
  onProgress?: (info: { chunkIndex: number; totalChunks: number; percent: number; message: string }) => void
): Promise<SyncResult> {
  if (!url || !siswaList) {
    return { success: false, message: 'URL atau data siswa tidak valid' };
  }

  const total = siswaList.length;
  if (total === 0) {
    return { success: true, message: 'Tidak ada data siswa untuk disimpan', totalSynced: 0 };
  }

  // Jika data kecil (di bawah 500 siswa), kirim sekaligus dalam 1 request cepat
  if (total <= 500) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSiswaList',
          siswaList
        })
      });
      const json = await response.json();
      return {
        success: json.success ?? true,
        message: json.message || `Berhasil menyimpan ${total} data siswa.`,
        totalSynced: total
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal menyimpan data siswa: ' + err.message,
        error: err.message
      };
    }
  }

  // JIKA DATA BESAR (MISAL 3.000 SISWA):
  // Pecah menjadi chunks berukuran 750 siswa per batch (3000 data = 4 batch)
  const CHUNK_SIZE = 750;
  const totalChunks = Math.ceil(total / CHUNK_SIZE);

  for (let c = 0; c < totalChunks; c++) {
    const startIdx = c * CHUNK_SIZE;
    const endIdx = Math.min(startIdx + CHUNK_SIZE, total);
    const chunkItems = siswaList.slice(startIdx, endIdx);
    const startingNo = startIdx + 1;
    const percent = Math.round(((c + 1) / totalChunks) * 100);

    const progressMsg = `Mengunggah batch ${c + 1} dari ${totalChunks} (${startingNo} - ${endIdx} dari ${total} siswa)...`;
    if (onProgress) {
      onProgress({
        chunkIndex: c,
        totalChunks,
        percent,
        message: progressMsg
      });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveSiswaChunk',
          chunkIndex: c,
          totalChunks,
          startingNo,
          items: chunkItems
        })
      });

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.message || `Gagal pada batch ${c + 1}`);
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mengunggah pada batch ${c + 1} (siswa ${startingNo}-${endIdx}): ${err.message}`,
        error: err.message,
        totalSynced: startIdx
      };
    }
  }

  return {
    success: true,
    message: `Berhasil mengunggah seluruh ${total} data siswa ke Google Sheets melalui ${totalChunks} batch tanpa kendala!`,
    totalSynced: total
  };
}
