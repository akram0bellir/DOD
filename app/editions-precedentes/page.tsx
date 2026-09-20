'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';

const EDITIONS = {
  '9ème Édition': [
    '/9me/BMQOISZOBYRTH.jpg',
    '/9me/EAHGAXCYFUIFH.png',
    '/9me/FWOUUMLBQOUIV.jpg',
    '/9me/GWUUCKLJXGNSG.jpg',
    '/9me/HFWZXNBBJEOOO.jpg',
    '/9me/JKEVKGLHRMAYS.jpg',
    '/9me/JVALLMKLZTJPQ.jpg',
    '/9me/NZFZMVHMLEEPM.jpg',
    '/9me/PLATHGWDCPLOQ.jpg',
    '/9me/RJDTYKSWTCPVT.jpg',
    '/9me/SBLQNHZHGHVAJ.jpg',
    '/9me/UZAPATIMVTVMI.jpg',
  ],

  '8ème Édition': [
    '/8me/AZBCFVLMGONMM.png',
    '/8me/CLHJYEKWCNBOG.png',
    '/8me/DGYPYNOUVVMMD.jpg',
    '/8me/EFOPDETZNPSMZ.png',
    '/8me/HWJMBENXYOOBO.png',
    '/8me/LKUVXOBGIQBCS.jpg',
    '/8me/LVEUYLYJVPBEU.jpg',
    '/8me/MCSEVUCTRGEXN.png',
    '/8me/MXDARHPYPJQSO.png',
    '/8me/NHKSIDUIMFLSD.jpg',
    '/8me/OGWHEHQMTEFVA.png',
    '/8me/RZPQHIWTPREJS.png',
    '/8me/TSKFQFCHMBQLG.jpg',
    '/8me/UXAQXCWUBBFGX.jpg',
    '/8me/WCDIUXVJROJQQ.jpg',
    '/8me/XNFSWQKRYYQRF.jpg',
    '/8me/XSEDPHFDTJXHF.jpg',
    '/8me/YIJINUKASASER.jpg',
    '/8me/YXVQRLIYGZLHI.png',
  ],
};

type Edition = keyof typeof EDITIONS;

export default function EditionsPrecedentes() {
  const { t } = useLanguage();
  const [edition, setEdition] = useState<Edition>('9ème Édition');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = EDITIONS[edition];

  return (
    <section className="w-full bg-white">

      {/* HEADER */}
      <div className="px-6 md:px-10 lg:px-16 py-16">
        <div className="max-w-[1400px] mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600 mb-4">
                SIPA
              </p>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-950">
                {t('Éditions précédentes')}
              </h2>

              <p className="mt-4 max-w-2xl text-gray-500">
                {t("Retour sur les moments forts des éditions précédentes du Salon International de la Pêche et de l'Aquaculture.")}
              </p>
            </div>

            {/* EDITION SELECT */}
            <div className="w-full md:w-[260px]">

              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {t('Choisir une édition')}
              </label>

              <select
                value={edition}
                onChange={(e) => setEdition(e.target.value as Edition)}
                className="
                  w-full
                  bg-gray-50
                  border border-gray-200
                  px-5 py-4
                  text-gray-900
                  font-semibold
                  outline-none
                  cursor-pointer
                  focus:border-sky-500
                "
              >
                <option value="9ème Édition">9ème Édition</option>
                <option value="8ème Édition">8ème Édition</option>
              </select>

            </div>

          </div>

        </div>
      </div>


      {/* EDITION BAR */}
      <div className="border-y border-gray-200 px-6 md:px-10 lg:px-16 py-5">

        <div className="max-w-[1400px] mx-auto flex justify-between items-center">

          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-sky-600 rounded-full" />

            <span className="font-semibold text-gray-900">
              {edition}
            </span>
          </div>

          <span className="text-sm text-gray-400">
            {images.length} {t('photographies')}
          </span>

        </div>

      </div>


      {/* GALLERY */}
      <AnimatePresence mode="wait">

        <motion.div
          key={edition}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            lg:grid-cols-6
            auto-rows-[180px]
            md:auto-rows-[220px]
            lg:auto-rows-[260px]
          "
        >

          {images.map((image, index) => (

            <motion.div
              key={image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: index * 0.03,
              }}
              onClick={() => setSelectedImage(image)}
              className="
                relative
                overflow-hidden
                bg-gray-100
                group
                cursor-pointer
              "
            >

              <Image
                src={image}
                alt={`${edition} - photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-105
                "
              />

              {/* Hover */}
              <div className="
                absolute
                inset-0
                bg-black/0
                group-hover:bg-black/20
                transition-all
                duration-300
              " />

            </motion.div>

          ))}

        </motion.div>

      </AnimatePresence>


      {/* ================================
          FULLSCREEN IMAGE
      ================================= */}
      <AnimatePresence>

        {selectedImage && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="
              fixed
              inset-0
              z-[9999]
              bg-black/95
              flex
              items-center
              justify-center
              p-4
              md:p-10
              cursor-zoom-out
            "
          >

            {/* CLOSE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="
                absolute
                top-5
                right-5
                md:top-8
                md:right-8
                z-10
                w-12
                h-12
                flex
                items-center
                justify-center
                bg-white/10
                hover:bg-white/20
                text-white
                text-3xl
                transition-colors
                cursor-pointer
              "
              aria-label="Fermer"
            >
              ×
            </button>


            {/* FULLSCREEN IMAGE */}
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                h-full
                max-w-[1600px]
                max-h-[95vh]
              "
            >

              <Image
                src={selectedImage}
                alt={`${edition} - image agrandie`}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </section>
  );
}
