import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Send,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { KonsultasiWaliMurid } from '../types';

export const KonsultasiMasukView: React.FC = () => {
  const {
    currentGuruWali,
    konsultasiList,
    respondKonsultasi,
    siswaList
  } = useApp();

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const classStudents = siswaList.filter(s => s.kelas === currentGuruWali.kelas);
  const classStudentIds = classStudents.map(s => s.id);

  // Konsultasi for this class or relevant
  const relevantKonsultasi = konsultasiList.filter(k => classStudentIds.includes(k.siswaId));

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    respondKonsultasi(id, replyText);
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1 border border-emerald-200">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Layanan Komunikasi & Konsultasi Terbuka</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pesan Masuk & Konsultasi Wali Murid
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Daftar curahan hati, pertanyaan, dan pengajuan konsultasi dari orang tua/wali siswa kelas {currentGuruWali.kelas}. Guru Wali dapat langsung membalas secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
              {relevantKonsultasi.filter(k => k.status === 'Menunggu Respon').length} Menunggu Balasan
            </span>
          </div>
        </div>
      </div>

      {/* List Messages */}
      <div className="space-y-4">
        {relevantKonsultasi.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Tidak ada pesan masuk</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Saat ini belum ada pengajuan konsultasi baru dari orang tua siswa kelas {currentGuruWali.kelas}.
            </p>
          </div>
        ) : (
          relevantKonsultasi.map(k => {
            const isReplying = activeReplyId === k.id;

            return (
              <div
                key={k.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      Dari: {k.namaOrtu} (Wali {k.siswaNama})
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {k.tanggal} {k.jam} WIB
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    k.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                    k.status === 'Dijadwalkan' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {k.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {k.topik}
                  </h3>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-700">
                    "{k.pesan}"
                  </div>

                  {k.responGuruWali && (
                    <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span>Balasan Anda (Guru Wali):</span>
                        <span className="text-[10px] text-indigo-700 font-normal">{k.tanggalRespon}</span>
                      </div>
                      <p className="text-indigo-900 leading-relaxed italic">
                        "{k.responGuruWali}"
                      </p>
                    </div>
                  )}

                  {isReplying && (
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2.5 text-xs animate-fade-in">
                      <label className="font-bold text-slate-800 block">
                        Tulis Respon Resmi Guru Wali:
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tuliskan jawaban yang menenangkan, informatif, atau jadwalkan tatap muka..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSendReply(k.id)}
                          className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Balasan ke Portal Ortu</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`https://wa.me/62${k.noHp.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Langsung ({k.noHp})</span>
                  </a>

                  {!isReplying && (
                    <button
                      onClick={() => {
                        setActiveReplyId(k.id);
                        setReplyText(k.responGuruWali || '');
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold cursor-pointer"
                    >
                      {k.responGuruWali ? 'Ubah Balasan' : 'Balas Konsultasi'}
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
