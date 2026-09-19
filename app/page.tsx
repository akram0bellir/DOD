'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import ImageCarouselBanner from '@/components/ImageCarouselBanner';
import IntroSection from '@/components/IntroSection';
import NestedSquaresLayout from '@/components/NestedSquaresLayout';
import PartnerTicker from '@/components/PartnerTicker';
import Timeline from '@/components/TimelineItems';

const algeriaData = [
  { label: 'Nom officiel', value: 'République Démocratique Algérienne' },
  { label: 'Type de système', value: 'Républicain' },
  { label: 'Villes principales', value: 'Alger, Oran, Constantine, Annaba' },
  { label: 'Croissance démographique', value: '1,53%' },
  { label: 'Langue officielle', value: 'Arabe et tamazight' },
  { label: 'Monnaie', value: 'Dinar algérien' },
  { label: 'Capitale de la République', value: 'Alger' },
  { label: 'Superficie', value: '2 381 741 km²' },
  { label: 'Population', value: '43,9 millions de personnes (janvier2019)' },
  { label: 'Religion', value: "L'Islam est la religion d'État" },
  { label: 'Jours ouvrables', value: 'Du dimanche au jeudi' },
  { label: 'Unité de temps', value: 'Greenwich + 1' },
  { label: 'Indicatif téléphonique', value: '+213' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full bg-white pb-24">
       
   <ImageCarouselBanner />
   <IntroSection />


      {/* Stats Bar */}
      <div className="w-full max-w-[1200px] bg-[#42a5f5] rounded-xl flex flex-wrap divide-y md:divide-y-0 md:divide-x divide-sky-300 py-6 px-4 mb-16 shadow-md">
        <div className="flex-1 flex items-center justify-center gap-2 min-w-[200px] py-4 md:py-0">
          <span className="text-white font-semibold tracking-wider">PAYS</span>
          <span className="text-white font-black text-3xl">30+</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 min-w-[200px] py-4 md:py-0">
          <span className="text-white font-semibold tracking-wider">EXPOSANTS</span>
          <span className="text-white font-black text-3xl">170+</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 min-w-[200px] py-4 md:py-0">
          <span className="text-white font-semibold tracking-wider text-center leading-tight">SOCIÉTÉS<br/>INTERNATIONALES</span>
          <span className="text-white font-black text-3xl">16+</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 min-w-[200px] py-4 md:py-0">
          <span className="text-white font-semibold tracking-wider">VISITEURS</span>
          <span className="text-white font-black text-3xl">25K+</span>
        </div>
      </div>


      <NestedSquaresLayout />


      {/* Timeline Section */}
      <Timeline />

      <PartnerTicker />


      {/* Objectives Section */}
      <div className="w-full max-w-[1200px] mx-auto px-6 py-20 flex flex-col md:flex-row gap-16 items-stretch">
         <div className="flex-1 flex flex-col">
            <h2 className="text-4xl font-bold text-sky-600 mb-8">Objectif</h2>
            <ul className="space-y-6 text-sm font-medium leading-relaxed list-disc pl-5 marker:text-black">
               <li>Coopération entre les opérateurs économiques nationaux et internationaux, afin de stimuler l'échange d'expériences et le développement commun dans les secteurs de la pêche et de l'aquaculture.</li>
               <li>Identifier et promouvoir les nouvelles technologies révolutionnant la pêche et l'aquaculture, tout en facilitant le transfert de compétences et d'expertise à l'échelle internationale.</li>
               <li>Mettre en lumière les projets innovants dans les domaines de la pêche maritime et de l'aquaculture, et soutenir l'émergence d'entreprises innovantes, contribuant ainsi à l'évolution du secteur.</li>
               <li>Engager des discussions stratégiques sur les modalités de coopération et de partenariat avec les pays frères et amis, ainsi qu'avec les organisations internationales et régionales, afin de renforcer les liens dans le domaine de la pêche et de l'aquaculture.</li>
               <li>Valoriser les capacités et les opportunités d'investissements dans les secteurs de la pêche et de l'aquaculture, en mettant en évidence leur potentiel pour un développement durable et rentable.</li>
               <li>Offrir une plateforme pour découvrir les dernières innovations et tendances des filières de la pêche et de l'aquaculture, permettant ainsi aux professionnels de se tenir informés des évolutions du marché.</li>
               <li>Encourager la coopération intersectorielle et les partenariats stratégiques en vue de diversifier et de renforcer les activités liées à la pêche et à l'aquaculture, dans un objectif de durabilité et d'innovation continue.</li>
            </ul>
         </div>
         <div className="w-full md:w-[350px] bg-[#d9d9d9] shrink-0 min-h-[500px]"></div>
      </div>

      {/* L'Algérie Section - Sticky Layout */}
      {/* We use relative positioning on the section and sticky on the map container */}
      <section className="relative w-full border-t border-gray-200 bg-white">
  <div className="w-full max-w-[1200px] mx-auto px-6 py-24 flex flex-col md:flex-row items-start gap-12">

    {/* Scrollable Text Side */}
    <div className="w-full md:w-1/2 flex flex-col z-10">
      <h2 className="text-[2.5rem] font-bold text-black mb-12">
        L'Algérie
      </h2>

      <div className="flex flex-col gap-8 pb-[30vh]">
        {algeriaData.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <h3 className="text-[#0ea5e9] text-lg font-semibold">
              {item.label}
            </h3>
            <p className="text-gray-800 text-lg font-medium">
              {item.value}
            </p>
          </div>
        ))}

        <div className="mt-8 border-t border-gray-200 pt-8"></div>

        {algeriaData.map((item, index) => (
          <div key={`dup-${index}`} className="flex flex-col gap-1">
            <h3 className="text-[#0ea5e9] text-lg font-semibold">
              {item.label}
            </h3>
            <p className="text-gray-800 text-lg font-medium">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Sticky Map Side */}
    <div className="hidden md:flex w-1/2 sticky top-32 h-[calc(100vh-12rem)] items-center justify-center self-start">
      <img
        src="/dz 1.png"
        alt=""
        className="w-full h-full object-contain"
      />
    </div>

  </div>
</section>

    </div>
  );
}
