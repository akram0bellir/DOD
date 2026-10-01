'use client';

import { Download, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const PLAN_PDF = '/documents/plan-sipa-2025.pdf';

const ZONES = [
  { letter: 'A', label: 'Banques, assurances et dispositifs d’aide à l’investissement' },
  { letter: 'B', label: 'Aquaculture et activités connexes' },
  { letter: 'C', label: 'Pêche et activités connexes' },
  { letter: 'D', label: 'Administrations et Organisations nationales et internationales' },
];

export default function PlanDuSalon() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center w-full bg-white pb-24 font-sans">
      {/* Top Banner */}
      <div className="w-full max-w-[1400px] bg-[#2a3441] h-20 mt-8 mb-8 flex items-center justify-center px-8 rounded-md mx-4">
        <span className="text-white text-2xl md:text-4xl font-bold text-center">{t('Plan du salon')}</span>
      </div>

      <div className="w-full max-w-[1400px] bg-[#2a3441] rounded-xl p-4 md:p-10 flex flex-col gap-6 shadow-xl mx-4">
        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <a
            href={PLAN_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-100"
          >
            <Maximize2 className="h-4 w-4" />
            {t('Ouvrir en plein écran')}
          </a>
          <a
            href={PLAN_PDF}
            download="Plan SIPA 2025.pdf"
            className="flex items-center gap-2 rounded-md bg-[#38bdf8] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0ea5e9]"
          >
            <Download className="h-4 w-4" />
            {t('Télécharger le plan')}
          </a>
        </div>

        {/* PDF viewer */}
        <div className="w-full overflow-hidden rounded-lg bg-white">
          <object
            data={`${PLAN_PDF}#view=FitH&toolbar=0`}
            type="application/pdf"
            className="w-full h-[75vh] min-h-[400px]"
          >
            {/* Fallback for browsers that cannot display PDFs inline (most mobiles) */}
            <div className="flex h-[300px] flex-col items-center justify-center gap-4 p-6 text-center text-gray-700">
              <p>{t('Votre navigateur ne peut pas afficher le plan ici.')}</p>
              <a
                href={PLAN_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#38bdf8] px-5 py-2.5 text-sm font-bold text-white"
              >
                {t('Ouvrir le plan')}
              </a>
            </div>
          </object>
        </div>

        {/* Zones legend */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ZONES.map((zone) => (
            <div key={zone.letter} className="flex items-center gap-3 rounded-md bg-white/10 px-4 py-3 text-white">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#38bdf8] font-bold">
                {zone.letter}
              </span>
              <span className="text-sm">{t(zone.label)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
