import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  CheckCircle2,
  Save,
  RotateCcw,
  Printer,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { SchoolProfileConfig, DEFAULT_SCHOOL_PROFILE } from '../../types';

export const PengaturanSekolahView: React.FC = () => {
  const { schoolProfile, updateSchoolProfile, googleSheetsConfig } = useApp();

  const [formData, setFormData] = useState<SchoolProfileConfig>({
    ...schoolProfile
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleChange = (field: keyof SchoolProfileConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveSuccessMsg(null);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan pengaturan identitas sekolah ke nilai baku SMKN 1 Jember?')) {
      setFormData({ ...DEFAULT_SCHOOL_PROFILE });
      setSaveSuccessMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);

    const result = await updateSchoolProfile(formData);
    setIsSaving(false);

    if (result.success) {
      setSaveSuccessMsg(result.message);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } else {
      alert(`Gagal menyimpan: ${result.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-1 border border-indigo-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>Identitas Resmi Lembaga & Dokumen Cetak</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pengaturan Profil Sekolah & Kepala Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Atur identitas resmi SMKN 1 Jember, nama Kepala Sekolah, NIP, serta alamat lengkap. Data ini langsung tersimpan ke <strong>database Google Sheets</strong> dan otomatis diterapkan pada seluruh <strong>Kop Surat & Cetak Laporan Resmi</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              googleSheetsConfig.syncStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                googleSheetsConfig.syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <span>Penyimpanan Google Sheets: {googleSheetsConfig.syncStatus === 'connected' ? 'Aktif' : 'Standby'}</span>
            </span>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Input Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Section 1: Kepala Sekolah */}
            <div className="space-y-4 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Identitas Kepala Sekolah</span>
                </h3>
                <span className="text-[10px] text-slate-400">Pejabat Penandatangan Laporan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Nama Lengkap & Gelar Kepala Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaKepalaSekolah}
                    onChange={(e) => handleChange('namaKepalaSekolah', e.target.value)}
                    placeholder="Contoh: Drs. Sri Hartono, M.Pd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Tampil pada blok tanda tangan "Mengetahui, Kepala Sekolah"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    NIP Kepala Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nipKepalaSekolah}
                    onChange={(e) => handleChange('nipKepalaSekolah', e.target.value)}
                    placeholder="Contoh: 19680714 199412 1 002"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Nomor Induk Pegawai resmi Kepala Sekolah
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Identitas & Alamat Sekolah */}
            <div className="space-y-4 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Identitas & Alamat Lembaga</span>
                </h3>
                <span className="text-[10px] text-slate-400">Kop Surat & Identitas Resmi</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Nama Lembaga / Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaSekolah}
                    onChange={(e) => handleChange('namaSekolah', e.target.value)}
                    placeholder="Contoh: SMK Negeri 1 Jember"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Alamat Lengkap Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.alamatSekolah}
                    onChange={(e) => handleChange('alamatSekolah', e.target.value)}
                    placeholder="Contoh: Jalan Jambu No. 17 Patrang - Jember (68118), Jawa Timur"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Dicetak pada baris alamat kop laporan dan banner sistem
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Nomor Telepon / Fax
                    </label>
                    <input
                      type="text"
                      value={formData.teleponSekolah}
                      onChange={(e) => handleChange('teleponSekolah', e.target.value)}
                      placeholder="(0331) 487535"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Email Resmi Sekolah
                    </label>
                    <input
                      type="email"
                      value={formData.emailSekolah}
                      onChange={(e) => handleChange('emailSekolah', e.target.value)}
                      placeholder="info@smkn1jember.sch.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Website Resmi
                    </label>
                    <input
                      type="text"
                      value={formData.websiteSekolah}
                      onChange={(e) => handleChange('websiteSekolah', e.target.value)}
                      placeholder="www.smkn1jember.sch.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Kota Titimangsa Dokumen
                    </label>
                    <input
                      type="text"
                      value={formData.kotaTandaTangan}
                      onChange={(e) => handleChange('kotaTandaTangan', e.target.value)}
                      placeholder="Jember"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Logo Sekolah */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 block">
                    URL Ikon Logo Sekolah (SMKN 1 Jember)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={formData.logoSekolah || "https://iili.io/n8W0HZu.md.png"}
                        alt="Pratinjau Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://iili.io/n8W0HZu.md.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input
                        type="url"
                        value={formData.logoSekolah || ''}
                        onChange={(e) => handleChange('logoSekolah', e.target.value)}
                        placeholder="https://iili.io/n8W0HZu.md.png"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] text-slate-800 bg-white"
                      />
                      <p className="text-[10px] text-slate-400">
                        Ikon resmi SMKN 1 Jember aktif digunakan di Header, Login, Favicon, dan Kop Surat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Nilai Bawaan</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan Langsung ke Google Sheets</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>Pratinjau Langsung Kop Dokumen</span>
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Live Update
              </span>
            </div>

            {/* Simulated Kop Surat */}
            <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b-2 border-black">
                {/* Logo Jatim */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <img
                    src="https://iili.io/nkNmwes.png"
                    alt="Logo Jawa Timur"
                    className="w-8 h-10 object-contain"
                  />
                </div>

                <div className="flex-1 text-center font-serif leading-tight">
                  <p className="text-[9px] font-bold uppercase text-slate-800">
                    PEMERINTAH PROVINSI JAWA TIMUR
                  </p>
                  <p className="text-[9px] font-bold uppercase text-slate-800">
                    DINAS PENDIDIKAN
                  </p>
                  <p className="text-[8px] uppercase text-slate-700 font-semibold">
                    CABANG DINAS PENDIDIKAN WILAYAH JEMBER
                  </p>
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-950 mt-0.5">
                    {formData.namaSekolah || 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 JEMBER'}
                  </h4>
                  <p className="text-[8px] text-slate-600 line-clamp-1 mt-0.5 font-sans">
                    {formData.alamatSekolah || 'Jalan Jambu No. 17 Patrang - Jember (68118)'}
                  </p>
                  <p className="text-[7.5px] text-slate-500 font-sans">
                    Telp: {formData.teleponSekolah || '(0331) 487535'} • Email: {formData.emailSekolah || 'info@smkn1jember.sch.id'}
                  </p>
                </div>

                {/* Logo SMKN 1 Jember */}
                <div className="w-10 shrink-0 flex items-center justify-center">
                  <img
                    src={formData.logoSekolah || "https://iili.io/n8W0HZu.md.png"}
                    alt="Logo SMKN 1 Jember"
                    className="w-8 h-10 object-contain"
                  />
                </div>
              </div>

              {/* Sample Content & Tanda Tangan */}
              <div className="space-y-2 text-[10px] text-slate-600 font-sans pt-1">
                <div className="text-center font-bold uppercase text-slate-900 border-b border-slate-100 pb-1">
                  LAPORAN REKAPITULASI RESMI
                </div>

                <div className="pt-2 grid grid-cols-2 gap-4 text-[9px] text-center font-sans border-t border-slate-200">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold text-slate-900">Kepala {formData.namaSekolah}</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline text-slate-950">{formData.namaKepalaSekolah}</p>
                    <p className="text-[8px] text-slate-500">NIP. {formData.nipKepalaSekolah}</p>
                  </div>

                  <div>
                    <p>{formData.kotaTandaTangan}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-slate-900">Guru Wali Kelas</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline text-slate-950">Nama Guru Wali, S.Pd</p>
                    <p className="text-[8px] text-slate-500">NIP. 19850101 201001 1 001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs text-indigo-900">
              <span className="font-extrabold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Otomatisasi Penuh:</span>
              </span>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                Setiap perubahan pada nama Kepala Sekolah atau alamat di formulir ini langsung diperbarui di:
              </p>
              <ul className="list-disc list-inside text-[10.5px] text-indigo-700 space-y-0.5">
                <li>Seluruh berkas Cetak Laporan Jurnal Layanan</li>
                <li>Surat Undangan Pemanggilan Orang Tua & Home Visit</li>
                <li>Rekapitulasi Presensi & Master Siswa</li>
                <li>Header & Footer aplikasi SIGUWA</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
