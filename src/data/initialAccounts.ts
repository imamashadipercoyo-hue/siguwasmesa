import { UserAccount } from '../types';

export const INITIAL_AKUN: UserAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'admin.siguwa',
    nama: 'Administrator Utama SMKN 1 Jember',
    email: 'admin.siguwa@smkn1jember.sch.id',
    role: 'admin',
    roleLabel: 'Super Administrator',
    status: 'Aktif',
    lastLogin: '2026-10-22 08:15',
    telepon: '08113456789'
  },
  {
    id: 'usr-gw-1',
    username: 'endang.sulistiyowati',
    nama: 'Dra. Hj. Endang Sulistiyowati, M.Pd',
    email: 'endang.sulistiyowati@smkn1jember.sch.id',
    role: 'guru_wali',
    roleLabel: 'Guru Wali Kelas X KKBT',
    status: 'Aktif',
    lastLogin: '2026-10-22 07:45',
    linkedId: 'gw-1',
    telepon: '081234567890'
  },
  {
    id: 'usr-gw-2',
    username: 'ahmad.fauzi',
    nama: 'Ahmad Fauzi, S.Kom., M.T',
    email: 'ahmad.fauzi@smkn1jember.sch.id',
    role: 'guru_wali',
    roleLabel: 'Guru Wali Kelas X TL',
    status: 'Aktif',
    lastLogin: '2026-10-22 07:50',
    linkedId: 'gw-2',
    telepon: '081398765432'
  },
  {
    id: 'usr-bk-1',
    username: 'sri.wahyuni',
    nama: 'Sri Wahyuni, S.E., M.M',
    email: 'sri.wahyuni@smkn1jember.sch.id',
    role: 'manajemen_bk',
    roleLabel: 'Koordinator BK & Kesiswaan',
    status: 'Aktif',
    lastLogin: '2026-10-21 15:30',
    linkedId: 'gw-3',
    telepon: '081567891234'
  },
  {
    id: 'usr-kes-1',
    username: 'bambang.supriyadi',
    nama: 'Bambang Supriyadi, S.Pd',
    email: 'bambang.supriyadi@smkn1jember.sch.id',
    role: 'manajemen_bk',
    roleLabel: 'Pembina Kesiswaan Kelas X',
    status: 'Aktif',
    lastLogin: '2026-10-21 16:10',
    linkedId: 'gw-4',
    telepon: '081298712345'
  },
  {
    id: 'usr-wali-1',
    username: '0094201436',
    nama: 'Pratama Suwandi (Wali Andika Pratama)',
    email: 'wali.andika@gmail.com',
    role: 'wali_murid',
    roleLabel: 'Wali Murid X KKBT',
    status: 'Aktif',
    lastLogin: '2026-10-22 06:30',
    linkedId: 'sis-577',
    telepon: '082245001479'
  },
  {
    id: 'usr-wali-2',
    username: '0094672070',
    nama: 'Bambang Wulandari (Wali Anggita Putri)',
    email: 'wali.anggita@gmail.com',
    role: 'wali_murid',
    roleLabel: 'Wali Murid X KKBT',
    status: 'Aktif',
    lastLogin: '2026-10-21 19:40',
    linkedId: 'sis-578',
    telepon: '085189099312'
  },
  {
    id: 'usr-wali-3',
    username: '0095992114',
    nama: 'Saputra Hendrawan (Wali Aditia Saputra)',
    email: 'wali.aditia@gmail.com',
    role: 'wali_murid',
    roleLabel: 'Wali Murid X TL',
    status: 'Aktif',
    lastLogin: '2026-10-22 07:10',
    linkedId: 'sis-614',
    telepon: '085903143868'
  }
];
