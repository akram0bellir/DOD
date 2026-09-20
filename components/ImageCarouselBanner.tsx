'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

const slides = [
  {
    id: 1,
    image: '/img/SJFWLPVLEWFNS.jpeg',
    alt: 'SIPA 2025',
    title: 'الصالون الدولي للصيد البحري و تربية المائيات 2025',
  },
  {
    id: 2,
    image: '/img/UBRENZPSLBATB.jpeg',
    alt: 'SIPA 2025',
    title: 'SIPA 2025 : du 06 au 09 Novembre 2025',
  },
  {
    id: 3,
    image: '/img/UTLBEHJZCKLHK.jpeg',
    alt: 'Fishing and Aquaculture Exhibition SIPA 2025',
    title: 'Fishing and Aquaculture Exhibition SIPA 2025',
  },
  {
    id: 4,
    image: '/img/HFRSQIZFENEKN.jpg',
    alt: 'SIPA 2025',
    title: 'الصالون الدولي للصيد البحري و تربية المائيات 2025',
  },
  {
    id: 5,
    image: '/img/LUOAWDLDIAISH.jpg',
    alt: 'SIPA 2025',
    title: 'SIPA 2025 : du 06 au 09 Novembre 2025',
  },
  {
    id: 6,
    image: '/img/DSTDVXSJVZOIG.webp',
    alt: 'SIPA 2025',
    title: 'الصالون الدولي للصيد البحري و تربية المائيات 2025',
  },
  {
    id: 7,
    image: '/img/UDOKOJDVMVTJA.webp',
    alt: 'Fishing and Aquaculture Exhibition SIPA 2025',
    title: 'Fishing and Aquaculture Exhibition SIPA 2025',
  },
];

export default function ImageCarouselBanner() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="
        relative mx-auto mt-8 mb-16
        flex h-[90vh] w-[94vw] max-w-[1200px]
        max-h-[600px]
        items-center justify-center
        overflow-hidden
        rounded-[1.5rem]
        bg-[#d9d9d9]

        sm:rounded-[1.75rem]
        lg:w-[90vw]
        lg:rounded-[2rem]
      "
    >
      {/* ======================================================= */}
      {/* BACKGROUND IMAGE                                        */}
      {/* ======================================================= */}

      <div className="absolute inset-0 h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.alt}
              fill
              priority
              sizes="(max-width: 768px) 94vw, (max-width: 1200px) 92vw, 1200px"
              className="object-cover"
            />

            {/* Dark overlay — makes the text readable */}
            <div className="absolute inset-0 bg-black/35" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ======================================================= */}
      {/* LEFT THUMBNAILS                                         */}
      {/* ======================================================= */}

      <div
        className="
          absolute left-3 top-1/2 z-30
          flex -translate-y-1/2 flex-col gap-2

          sm:left-4
          sm:gap-2.5

          md:left-5 md:gap-3

          lg:left-6
        "
      >
        {slides.map((slide, index) => {
          const isActive = currentIndex === index;

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Afficher ${slide.alt}`}
              className={`
                relative
                h-8 w-11
                overflow-hidden rounded
                transition-all duration-300

                sm:h-9 sm:w-13
                md:h-10 md:w-14

                ${
                  isActive
                    ? 'scale-105 shadow-lg ring-2 ring-white'
                    : 'opacity-60 hover:scale-105 hover:opacity-100'
                }
              `}
            >
              <Image
                src={slide.image}
                alt={`Thumbnail ${slide.id}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* ======================================================= */}
      {/* TEXT + BUTTONS                                          */}
      {/* ======================================================= */}

      <div className="absolute inset-0 z-20 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            className="
              w-full
              px-16
              text-left

              sm:px-20

              md:px-24

              lg:px-28
            "
          >
            <div className="max-w-[850px]">

              {/* TITLE */}
              <h1
                className="
                  mb-5
                  text-2xl
                  font-bold
                  leading-tight
                  text-white

                  sm:text-3xl
                  md:text-4xl
                  lg:text-5xl
                  xl:text-6xl
                "
              >
                {t(currentSlide.title)}
              </h1>

              {/* BUTTONS */}
              <div
                className="
                  flex
                  flex-col
                  items-start
                  gap-3

                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-4
                "
              >
                {/* National */}
                <Link
                  href="/espace-exposant"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    bg-[#0ea5e9]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    transition-all
                    hover:bg-[#0284c7]
                    hover:scale-[1.02]

                    sm:px-6
                    sm:py-3
                    md:px-7
                  "
                >
                  {t('Exposant National')}
                </Link>

                {/* International */}
                <Link
                  href="/espace-exposant"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-900
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    transition-all
                    hover:bg-black
                    hover:scale-[1.02]

                    sm:px-6
                    sm:py-3
                    md:px-7
                  "
                >
                  {t('Exposant International')}
                </Link>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ======================================================= */}
      {/* WHATSAPP FAB                                             */}
      {/* ======================================================= */}

      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Contact us on WhatsApp"
        className="
          absolute
          bottom-4
          right-4
          z-40
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-[#25D366]
          shadow-lg

          sm:bottom-5
          sm:right-5
          sm:h-14
          sm:w-14

          md:bottom-6
          md:right-6
          md:h-16
          md:w-16

          lg:bottom-8
          lg:right-8
        "
      >
        <svg
          className="h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.button>

    </div>
  );
}
