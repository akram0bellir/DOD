'use client';

import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useLanguage } from '@/lib/i18n';

const timelineItems = [
  'Rencontrer des acheteurs qualifiés et des partenaires potentiels.',
  'Présenter vos produits et services à un public professionnel ciblé.',
  'Développer votre réseau et créer de nouvelles opportunités commerciales.',
  'Renforcer votre visibilité et positionner votre entreprise sur le marché.',
];

export default function Timeline() {
  const { t } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 25%'],
  });

  // Smooth liquid movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  const liquidHeight = useTransform(
    smoothProgress,
    [0, 1],
    ['0%', '100%']
  );

  return (
    <section
      ref={timelineRef}
      className="relative w-full overflow-hidden bg-[#354358] py-20 sm:py-24 md:py-32"
    >
      {/* ---------------------------------------------------------- */}
      {/* CENTER TIMELINE                                             */}
      {/* ---------------------------------------------------------- */}

      <div className="absolute left-5 sm:left-8 md:left-1/2 top-10 bottom-10 w-[3px] md:w-1 -translate-x-1/2 bg-white/20 rounded-full">
        {/* Liquid filling */}
        <motion.div
          style={{ height: liquidHeight }}
          className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-cyan-200 via-sky-300 to-white shadow-[0_0_15px_rgba(186,230,253,0.8)]"
        />

        {/* Liquid glow */}
        <motion.div
          style={{ top: liquidHeight }}
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
        />
      </div>

      {/* Top endpoint */}
      <div className="absolute left-5 sm:left-8 md:left-1/2 top-8 -translate-x-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#354358] border-[5px] border-gray-200 z-20 shadow-lg" />

      {/* Bottom endpoint */}
      <div className="absolute left-5 sm:left-8 md:left-1/2 bottom-8 -translate-x-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 z-20 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

      {/* ---------------------------------------------------------- */}
      {/* CONTENT                                                     */}
      {/* ---------------------------------------------------------- */}

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-10">
        <div className="flex flex-col gap-12 sm:gap-16 md:gap-20">
          {timelineItems.map((text, index) => {
            const isLeft = index % 2 === 0;

            return (
              <TimelineItem
                key={index}
                text={t(text)}
                index={index}
                isLeft={isLeft}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* TIMELINE ITEM                                                     */
/* ---------------------------------------------------------------- */

function TimelineItem({
  text,
  index,
  isLeft,
}: {
  text: string;
  index: number;
  isLeft: boolean;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: isLeft ? -60 : 60,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.35,
      }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative flex w-full ${
        isLeft
          ? 'justify-start md:justify-start'
          : 'justify-start md:justify-end'
      }`}
    >
      {/* -------------------------------------------------------- */}
      {/* CONNECTOR                                                 */}
      {/* -------------------------------------------------------- */}

      <div
        className={`hidden md:block absolute top-1/2 h-[3px] w-[8%] bg-white/30 ${
          isLeft ? 'left-[42%]' : 'right-[42%]'
        }`}
      />

      {/* -------------------------------------------------------- */}
      {/* CENTER DOT                                                */}
      {/* -------------------------------------------------------- */}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{
          scale: 1,
          opacity: 1,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 0.4,
          delay: 0.2 + index * 0.08,
          type: 'spring',
          stiffness: 250,
          damping: 15,
        }}
        className="
          absolute
          left-5 sm:left-8 md:left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          z-30
          w-5 h-5
          md:w-7 md:h-7
          rounded-full
          bg-white
          border-[4px]
          border-[#354358]
          shadow-[0_0_0_4px_rgba(255,255,255,0.25)]
        "
      />

      {/* -------------------------------------------------------- */}
      {/* CARD                                                      */}
      {/* -------------------------------------------------------- */}

      <motion.div
        whileHover={{
          y: -8,
          scale: 1.015,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        className={`
          relative
          w-[calc(100%-2.5rem)]
          sm:w-[calc(100%-3.5rem)]
          md:w-[43%]
          ml-10
          sm:ml-14
          md:ml-0
          ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}
        `}
      >
        {/* Card glow */}
        <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div
          className="
            relative
            min-h-[150px]
            sm:min-h-[170px]
            md:min-h-[190px]
            flex
            items-center
            justify-center
            rounded-2xl
            bg-white
            px-7
            py-8
            sm:px-9
            sm:py-10
            md:px-10
            md:py-12
            shadow-[0_15px_40px_rgba(0,0,0,0.22)]
            border border-white/80
          "
        >
          {/* Number */}
          <div
            className="
              absolute
              top-4
              left-5
              flex
              items-center
              justify-center
              w-9
              h-9
              rounded-full
              bg-[#354358]
              text-white
              font-bold
              text-sm
              shadow-md
            "
          >
            {String(index + 1).padStart(2, '0')}
          </div>

          <p
            className="
              max-w-[430px]
              text-center
              text-base
              sm:text-lg
              md:text-xl
              lg:text-[22px]
              leading-relaxed
              font-bold
              text-[#354358]
            "
          >
            {text}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}