/**
 * Google Sheets & Apps Script Integration Service
 * Menghubungkan SIGUWA secara Real-Time ke Google Sheets via Apps Script Web App
 */

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6PaZIJji6e7dFCMgcxs2a2hnmc5yXPlAqgeSNlfvg6G3Ar_B42qzFQ_f1nux19XzQ/exec';

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

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
    // Attempt fallback POST in case of CORS or redirection issues on GET
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
    } catch (innerErr) {
      // Ignore innerErr and return main error
    }

    return {
      success: false,
      message: 'Gagal membaca data dari Google Sheets',
      error: err.message
    };
  }
}

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
