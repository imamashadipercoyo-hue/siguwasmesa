import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  UserCheck,
  MapPin,
  Save,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { SchoolProfileConfig, DEFAULT_SCHOOL_PROFILE } from '../../types';

interface ModalPengaturanSekolahProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalPengaturanSekolah: React.FC<ModalPengaturanSekolahProps> = ({
  isOpen,
  onClose
}) => {
  const { schoolProfile, updateSchoolProfile, googleSheetsConfig } = useApp();

  const [formData, setFormData] = useState<SchoolProfileConfig>({
    ...schoolProfile
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...schoolProfile });
      setSuccessMessage(null);
    }
  }, [isOpen, schoolProfile]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SchoolProfileConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    const result = await updateSchoolProfile(formData);
    setIsSaving(false);

    if (result.success) {
      setSuccessMessage('Pengaturan Nama Kepala Sekolah & Alamat berhasil disimpan ke Google Sheets!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      alert(`Gagal menyimpan: ${result.message}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan ke data bawaan SMKN 1 Jember?')) {
      setFormData({ ...DEFAULT_SCHOOL_PROFILE });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl my-6 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Pengaturan Akun Administrator</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Seting Kepala Sekolah & Alamat Sekolah
              </h3>
              <p className="text-xs text-slate-300">
                Pembaruan identitas resmi SMKN 1 Jember langsung ke database Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Identitas Kepala Sekolah */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>1. Identitas Kepala Sekolah (Penandatangan Laporan)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Nama Kepala Sekolah & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaKepalaSekolah}
                  onChange={(e) => handleChange('namaKepalaSekolah', e.target.value)}
                  placeholder="Contoh: Drs. Sri Hartono, M.Pd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                />
                <p className="text-[10px] text-slate-500">
                  Dicetak pada kolom: <em>Mengetahui, Kepala Sekolah</em>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
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
                <p className="text-[10px] text-slate-500">
                  Nomor Induk Pegawai resmi Kepala Sekolah
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Identitas & Alamat Sekolah */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Nama & Alamat Lembaga Sekolah</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
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
                <label className="font-bold text-slate-800 block">
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
                <p className="text-[10px] text-slate-500">
                  Dicetak pada baris alamat Kop Surat Laporan PDF dan footer aplikasi
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.emailSekolah}
                    onChange={(e) => handleChange('emailSekolah', e.target.value)}
                    placeholder="info@smkn1jember.sch.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-white"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black cursor-pointer transition-all shadow-md shadow-blue-900/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan ke Google Sheets...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
