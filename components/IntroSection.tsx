import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useDocuments } from '@/lib/useDocuments';
import { fileUrl, localized, useCollection } from '@/lib/useCollection';

/* Shown only while the "IntroSection" collection is empty or unreachable. */
const FALLBACK_EDITION = 'SIPA 2025';
const FALLBACK_TITLE = "Salon International de la Pêche et de l'Aquaculture.";
const FALLBACK_POSTER = '/img/BYTRNNQIBZFWZ.jpg';

export default function IntroSection() {
  const { t, locale } = useLanguage();
  const { urls: documentUrls } = useDocuments();
  const ficheTechniqueUrl = documentUrls.Fiche_technique_SIPA ?? '/BASTMZELHBDMU.pdf';

  /* Content from the PocketBase "IntroSection" collection (latest record) */
  const { records } = useCollection('IntroSection');
  const intro = records[records.length - 1];
  // The French text column is named "test_fr" in PocketBase.
  const introText = intro
    ? locale === 'ar' && intro.text_ar
      ? intro.text_ar
      : intro.text_fr || intro.test_fr || intro.text_ar || ''
    : '';
  const dbParagraphs = String(introText)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const edition = intro?.edition || FALLBACK_EDITION;
  const title = (intro && localized(intro, 'title', locale)) || t(FALLBACK_TITLE);
  const poster = (intro && fileUrl(intro, 'poster')) || FALLBACK_POSTER;

  const fallbackParagraphs = [
    "Depuis plus de vingt ans, le Salon International de la Pêche et de l'Aquaculture (SIPA) s'affirme comme un carrefour essentiel de rencontres et d'échanges entre professionnels du secteur.",
    "Il offre une plateforme d'opportunités pour renforcer les liens entre les opérateurs nationaux et internationaux, facilitant ainsi l'identification de partenariats stratégiques et d'investissements dans le domaine de la pêche, de l'aquaculture et de leurs activités connexes.",
    "Le SIPA a été un catalyseur majeur dans la dynamisation du secteur, contribuant activement à son essor exceptionnel ces dernières années. L'attractivité des investissements a été renforcée grâce à un environnement des affaires favorable, initié par une politique gouvernementale visionnaire axée sur le développement durable et la compétitivité du secteur.",
    "Cette dynamique a permis au secteur de se moderniser et de s'affirmer comme un acteur clé dans la sécurité alimentaire, tout en contribuant au développement durable des systèmes de production locaux, affirmant ainsi sa dimension stratégique au niveau national et international.",
    "La 10e édition du SIPA, tout comme ses précédentes éditions couronnées de succès, représente un rendez-vous incontournable pour les acteurs de la pêche et de l'aquaculture. Depuis sa première édition en 2003, le salon a acquis une envergure internationale, attirant plus de 17 nationalités lors de l'édition précédente en 2024. Véritable levier de développement pour l'industrie, il met en lumière la stratégie sectorielle, souligne l'importance économique des investissements productifs et favorise des échanges interprofessionnels essentiels à la croissance de ce secteur clé.",
  ];
  const paragraphs = dbParagraphs.length > 0 ? dbParagraphs : fallbackParagraphs;

  return (
    <section className="w-full flex justify-center py-8">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-stretch gap-12 px-6 mb-16">

        {/* Poster */}
        <div className="w-full md:w-[500px] shrink-0 flex flex-col gap-4">
          <img
            src={poster}
            alt={edition}
            className="w-full rounded-xl object-cover"
          />

          <motion.a
            href={ficheTechniqueUrl}
            download
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#42a5f5] text-white py-4 rounded-md font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>

            {t('Télécharger la fiche technique')}
          </motion.a>
        </div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <h3 className="text-[#0284c7] font-bold tracking-wide">
              {edition}
            </h3>

            <h2 className="text-4xl md:text-5xl font-bold text-[#0284c7] leading-tight">
              {t(title)}
            </h2>

            <div className="flex flex-col gap-4 text-gray-700 text-sm leading-relaxed mt-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{t(paragraph)}</p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}