import { UserAccount } from '../types';

/**
 * Normalizes and deduplicates user accounts.
 * 1. Deduplicates by username (case-insensitive).
 * 2. Merges complementary fields (preserves password, kelas, role, telepon, lastLogin).
 * 3. Enforces strictly unique IDs across the entire list.
 */
export function deduplicateAccounts(accounts: UserAccount[]): UserAccount[] {
  if (!Array.isArray(accounts)) return [];

  const seenUsernames = new Map<string, UserAccount>();

  // Pass 1: Deduplicate and merge by username
  for (let i = 0; i < accounts.length; i++) {
    const raw = accounts[i];
    if (!raw) continue;

    const username = String(raw.username || '').trim();
    if (!username) continue;

    const lowerKey = username.toLowerCase();
    const existing = seenUsernames.get(lowerKey);

    if (existing) {
      // Merge: keep the richer/more explicit fields
      seenUsernames.set(lowerKey, {
        ...existing,
        ...raw,
        username,
        nama: raw.nama || existing.nama,
        password: raw.password || existing.password,
        kelas: raw.kelas || existing.kelas,
        jurusan: raw.jurusan || existing.jurusan,
        email: raw.email || existing.email,
        role: raw.role || existing.role,
        roleLabel: raw.roleLabel || existing.roleLabel,
        status: raw.status || existing.status,
        telepon: raw.telepon || existing.telepon,
        lastLogin: raw.lastLogin && raw.lastLogin !== '-' ? raw.lastLogin : existing.lastLogin,
        linkedId: raw.linkedId || existing.linkedId,
        id: existing.id || raw.id
      });
    } else {
      seenUsernames.set(lowerKey, {
        ...raw,
        username
      });
    }
  }

  // Pass 2: Ensure strictly unique IDs
  const seenIds = new Set<string>();
  const result: UserAccount[] = [];

  seenUsernames.forEach((account, uname) => {
    let finalId = account.id ? String(account.id).trim() : '';

    // If ID is missing, or has already been used by another item, generate a guaranteed unique ID
    if (!finalId || seenIds.has(finalId)) {
      finalId = `usr-${uname}-${result.length + 1}-${Date.now()}`;
    }

    seenIds.add(finalId);

    const r = account.role || 'guru_wali';
    let defaultLabel = 'Pengguna';
    if (r === 'admin') defaultLabel = 'Super Administrator';
    else if (r === 'kkk') defaultLabel = `KKK Jurusan ${account.jurusan || account.kelas || ''}`.trim();
    else if (r === 'wali_kelas') defaultLabel = `Wali Kelas ${account.kelas || ''}`.trim();
    else if (r === 'bk' || r === 'manajemen_bk') defaultLabel = `BK & Kesiswaan (${account.kelas || 'Beberapa Kelas'})`;
    else if (r === 'guru_wali') defaultLabel = `Guru Wali Kelas ${account.kelas || ''}`.trim();
    else if (r === 'wali_murid') defaultLabel = `Wali Murid ${account.kelas || ''}`.trim();

    result.push({
      ...account,
      id: finalId,
      status: account.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
      role: r,
      roleLabel: account.roleLabel || defaultLabel
    });
  });

  return result;
}
