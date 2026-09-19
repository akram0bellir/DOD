'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Download } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();

  const [ficheOpen, setFicheOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ============================================================= */
  /* PUT YOUR DOWNLOADABLE FILES HERE                              */
  /* ============================================================= */

  const ficheFiles = [
    {
      name: 'Brochure SIPA 2025',
      file: '/documents/brochure-sipa-2025.pdf',
    },
    {
      name: 'Fiche technique',
      file: '/documents/fiche-technique.pdf',
    },
    {
      name: 'Règlement général',
      file: '/documents/reglement-general.pdf',
    },
    {
      name: 'Plan du salon',
      file: '/documents/plan-salon.pdf',
    },
  ];

  const links = [
    { name: 'Accueil', path: '/' },
    { name: 'Espace Exposant', path: '/espace-exposant' },
    { name: 'Editions Précédentes', path: '/editions-precedentes' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-24 w-full max-w-[1400px] items-center px-4 md:px-8">

        {/* ======================================================= */}
        {/* LOGOS + NAVIGATION — SAME CONTAINER AS YOUR ORIGINAL   */}
        {/* ======================================================= */}

        <div className="flex min-w-0 flex-1 items-center gap-8">

          {/* Logos */}
          <div className="flex shrink-0 items-center gap-4">
            <div className="flex items-center gap-2">

              <div className="flex h-14 w-12 flex-col items-center justify-center rounded bg-sky-600 text-[8px] font-bold leading-tight text-white">
                <span>SIPA</span>
                <span>2025</span>
              </div>

              <div className="flex h-14 w-12 flex-col items-center justify-center rounded border border-sky-200 bg-sky-100 text-[8px] font-bold leading-tight text-sky-800">
                <span>10ème</span>
                <span>SIPA</span>
              </div>

              <div className="flex h-10 w-14">
                <div className="h-full w-1/2 bg-green-600" />
                <div className="relative flex h-full w-1/2 items-center justify-center border border-gray-200 bg-white">
                  <div className="absolute text-lg text-red-500">★</div>
                </div>
              </div>

            </div>
          </div>

          {/* ===================================================== */}
          {/* DESKTOP NAVIGATION — STILL BESIDE LOGOS              */}
          {/* ===================================================== */}

          <nav className="hidden min-w-0 items-center gap-0 lg:flex">

            {/* Accueil */}
            <Link href="/">
              <span
                className={`flex items-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-sky-200 text-sky-900'
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Accueil
              </span>
            </Link>

            {/* Espace Exposant */}
            <Link href="/espace-exposant">
              <span
                className={`flex items-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/espace-exposant'
                    ? 'bg-sky-200 text-sky-900'
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Espace Exposant
              </span>
            </Link>

            {/* =================================================== */}
            {/* FICHE DROPDOWN                                      */}
            {/* =================================================== */}

            <div
              className="relative"
              onMouseEnter={() => setFicheOpen(true)}
              onMouseLeave={() => setFicheOpen(false)}
            >
              <button
                type="button"
                onClick={() => setFicheOpen(!ficheOpen)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  ficheOpen
                    ? 'bg-sky-200 text-sky-900'
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Fiche

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    ficheOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {ficheOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                  >
                    {ficheFiles.map((item) => (
                      <a
                        key={item.file}
                        href={item.file}
                        download
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
                      >
                        <span className="truncate">
                          {item.name}
                        </span>

                        <Download className="h-4 w-4 shrink-0" />
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Editions précédentes */}
            <Link href="/editions-precedentes">
              <span
                className={`flex items-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/editions-precedentes'
                    ? 'bg-sky-200 text-sky-900'
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Editions Précédentes
              </span>
            </Link>

          </nav>
        </div>

        {/* ======================================================= */}
        {/* CONTACT — REMAINS ON THE RIGHT                         */}
        {/* ======================================================= */}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden shrink-0 rounded bg-[#0ea5e9] px-6 py-2.5 text-sm font-medium text-white lg:block"
        >
          Contact
        </motion.button>

        {/* ======================================================= */}
        {/* MOBILE BUTTON                                          */}
        {/* ======================================================= */}

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* MOBILE NAV — ONLY APPEARS BELOW lg                       */}
      {/* ========================================================= */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-white lg:hidden"
          >
            <div className="flex flex-col px-4 py-3">

              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sky-50"
              >
                Accueil
              </Link>

              <Link
                href="/espace-exposant"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sky-50"
              >
                Espace Exposant
              </Link>

              {/* Mobile Fiche */}
              <div>
                <button
                  type="button"
                  onClick={() => setFicheOpen(!ficheOpen)}
                  className="flex w-full items-center justify-between rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sky-50"
                >
                  Fiche

                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      ficheOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {ficheOpen && (
                  <div className="ml-4 border-l border-gray-200">
                    {ficheFiles.map((item) => (
                      <a
                        key={item.file}
                        href={item.file}
                        download
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-sky-50"
                      >
                        <span>{item.name}</span>
                        <Download className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/editions-precedentes"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sky-50"
              >
                Editions Précédentes
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded bg-[#0ea5e9] px-6 py-3 text-sm font-medium text-white"
              >
                Contact
              </button>

            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
