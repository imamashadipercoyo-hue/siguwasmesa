/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LayananJournalView } from './components/LayananJournalView';
import { PresensiView } from './components/PresensiView';
import { SiswaListView } from './components/SiswaListView';
import { RujukanBKView } from './components/RujukanBKView';
import { JadwalHomeVisitView } from './components/JadwalHomeVisitView';
import { KonsultasiMasukView } from './components/KonsultasiMasukView';
import { PortalWaliMuridView } from './components/PortalWaliMuridView';
import { AdminMasterView } from './components/admin/AdminMasterView';
import { ModalInputJurnal } from './components/ModalInputJurnal';
import { CetakLaporanModal } from './components/CetakLaporanModal';
import { LayananType, JurnalLayanan } from './types';
import { GraduationCap, MapPin, Phone, Mail, Globe, Shield } from 'lucide-react';

function MainAppContent() {
  const { currentRole } = useApp();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Modal Jurnal states
  const [isModalJurnalOpen, setIsModalJurnalOpen] = useState(false);
  const [modalPrefillType, setModalPrefillType] = useState<LayananType | undefined>(undefined);
  const [modalPrefillSiswaId, setModalPrefillSiswaId] = useState<string | undefined>(undefined);
  const [modalEditData, setModalEditData] = useState<JurnalLayanan | undefined>(undefined);

  // Modal Cetak states
  const [isCetakOpen, setIsCetakOpen] = useState(false);

  const handleOpenModalInputJurnal = (
    prefillType?: LayananType,
    prefillSiswaId?: string,
    editData?: JurnalLayanan
  ) => {
    setModalPrefillType(prefillType);
    setModalPrefillSiswaId(prefillSiswaId);
    setModalEditData(editData);
    setIsModalJurnalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        onOpenPrint={() => setIsCetakOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-6">
        {currentRole === 'admin' ? (
          <AdminMasterView />
        ) : currentRole === 'wali_murid' ? (
          <PortalWaliMuridView />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenModalInputJurnal={handleOpenModalInputJurnal}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenPrint={() => setIsCetakOpen(true)}
              />
            )}

            {activeTab === 'layanan' && (
              <LayananJournalView
                onOpenModalInput={handleOpenModalInputJurnal}
              />
            )}

            {activeTab === 'presensi' && (
              <PresensiView />
            )}

            {activeTab === 'siswa' && (
              <SiswaListView
                onOpenModalInput={handleOpenModalInputJurnal}
              />
            )}

            {activeTab === 'rujukan_bk' && (
              <RujukanBKView />
            )}

            {activeTab === 'jadwal' && (
              <JadwalHomeVisitView />
            )}

            {activeTab === 'konsultasi_masuk' && (
              <KonsultasiMasukView />
            )}
          </>
        )}
      </main>

      {/* Footer SMKN 1 Jember */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800">
                SMK Negeri 1 Jember
              </p>
              <p className="text-[11px] text-slate-500">
                Jl. Jambu No.17 Patrang - Jember (68118), Jawa Timur
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <Phone className="w-3 h-3 text-slate-400" />
              (0331) 487535
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Mail className="w-3 h-3 text-slate-400" />
              info@smkn1jember.sch.id
            </span>
            <span>•</span>
            <span className="text-slate-400">
              © {new Date().getFullYear()} SIGUWA SMKN 1 Jember
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Input Jurnal */}
      <ModalInputJurnal
        isOpen={isModalJurnalOpen}
        onClose={() => {
          setIsModalJurnalOpen(false);
          setModalEditData(undefined);
        }}
        prefillType={modalPrefillType}
        prefillSiswaId={modalPrefillSiswaId}
        editData={modalEditData}
      />

      {/* Modal Cetak Laporan */}
      <CetakLaporanModal
        isOpen={isCetakOpen}
        onClose={() => setIsCetakOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
