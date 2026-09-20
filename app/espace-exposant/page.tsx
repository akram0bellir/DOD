'use client';

import { useState } from 'react';
import ExposantNationalForm from '@/components/ExposantNationalForm';
import ExposantInternationalForm from '@/components/ExposantInternationalForm';
import RegenerationFactureForm from '@/components/RegenerationFactureForm';
import DemandeVisaForm from '@/components/DemandeVisaForm';
import VisiteurB2BForm from '@/components/VisiteurB2BForm';
import { useLanguage } from '@/lib/i18n';

export default function EspaceExposantContainer() {
   const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Exposant National');

  // Switch statement or mapping to render the right component dynamically
  const renderActiveForm = () => {
    switch (activeTab) {
      case 'Exposant National':
        return <ExposantNationalForm />;
      case 'Exposant International':
        return <ExposantInternationalForm />;
      case 'Regénération facture':
        return <RegenerationFactureForm />;
      case 'Demande Invitation Pour Visa':
        return <DemandeVisaForm />;
      case 'Visiteur Professionnel B2B':
        return <VisiteurB2BForm />;
      default:
        return <ExposantNationalForm />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-white pb-24 font-sans">
      {/* Top PIC Banner */}
      <div className="w-full max-w-[1400px] bg-[#2a3441] h-20 mt-8 mb-8 flex items-center justify-between px-8 rounded-md relative mx-4">
         <span className="text-white text-4xl font-bold absolute left-1/2 -translate-x-1/2">{t('10 ème Édition')}</span>
      </div>

      <div className="w-full max-w-[1400px] bg-[#2a3441] rounded-xl p-8 md:p-16 flex flex-col gap-10 shadow-xl mx-4">
         
         {/* Top Tabs Navigation Bar */}
         <div className="w-full bg-white rounded-lg flex flex-wrap p-1 gap-1">
            <button 
               onClick={() => setActiveTab('Exposant National')}
               className={`flex-1 min-w-[180px] px-4 py-2.5 font-bold text-sm rounded-md transition-colors text-center ${activeTab === 'Exposant National' ? 'bg-[#38bdf8] text-white' : 'bg-transparent text-gray-800 hover:bg-gray-100'}`}
            >
               {t('Exposant National')}
            </button>
            <button 
               onClick={() => setActiveTab('Exposant International')}
               className={`flex-1 min-w-[180px] px-4 py-2.5 font-bold text-sm rounded-md transition-colors text-center ${activeTab === 'Exposant International' ? 'bg-[#38bdf8] text-white' : 'bg-transparent text-gray-800 hover:bg-gray-100'}`}
            >
               {t('Exposant International')}
            </button>
            <button 
               onClick={() => setActiveTab('Regénération facture')}
               className={`flex-1 min-w-[180px] px-4 py-2.5 font-bold text-sm rounded-md transition-colors text-center ${activeTab === 'Regénération facture' ? 'bg-[#38bdf8] text-white' : 'bg-transparent text-gray-800 hover:bg-gray-100'}`}
            >
               {t('Regénération facture')}
            </button>
            <button 
               onClick={() => setActiveTab('Demande Invitation Pour Visa')}
               className={`flex-1 min-w-[180px] px-4 py-2.5 font-bold text-sm rounded-md transition-colors text-center ${activeTab === 'Demande Invitation Pour Visa' ? 'bg-[#38bdf8] text-white' : 'bg-transparent text-gray-800 hover:bg-gray-100'}`}
            >
               {t('Demande Invitation Pour Visa')}
            </button>
            <button 
               onClick={() => setActiveTab('Visiteur Professionnel B2B')}
               className={`flex-1 min-w-[180px] px-4 py-2.5 font-bold text-sm rounded-md transition-colors text-center ${activeTab === 'Visiteur Professionnel B2B' ? 'bg-[#38bdf8] text-white' : 'bg-transparent text-gray-800 hover:bg-gray-100'}`}
            >
               {t('Visiteur Professionnel B2B')}
            </button>
         </div>

         {/* Dynamic Component Insertion */}
         {renderActiveForm()}

      </div>
    </div>
  );
}