'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Download } from 'lucide-react';
import { useState } from 'react';
import { Locale, useLanguage } from '@/lib/i18n';
import { DOCUMENT_KEYS, DOCUMENT_LABELS, useDocuments } from '@/lib/useDocuments';

export default function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();

  const [ficheOpen, setFicheOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ============================================================= */
  /* SMOOTH SCROLL TO FOOTER                                       */
  /* ============================================================= */

  const scrollToFooter = () => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  /* ============================================================= */
  /* DOWNLOADABLE FILES (PocketBase "Document" collection)         */
  /* ============================================================= */

  const { urls: documentUrls } = useDocuments();
  const ficheFiles = DOCUMENT_KEYS.filter((key) => documentUrls[key]).map((key) => ({
    name: t(DOCUMENT_LABELS[key]),
    file: documentUrls[key] as string,
  }));

  /* Helper to build nav links */
  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/espace-exposant', label: 'Espace Exposant' },
    { href: '/plan-du-salon', label: 'Plan du salon' },
    { href: '/editions-precedentes', label: 'Editions Précédentes' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-24 w-full max-w-[1400px] items-center px-4 md:px-8">

        {/* ======================================================= */}
        {/* LOGOS + ALGERIAN FLAG (LEFT)                            */}
        {/* ======================================================= */}

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-14 w-12 items-center justify-center overflow-hidden rounded bg-sky-600">
              <img src="/capa.png" alt="CAPA" className="h-full w-full object-contain" />
            </div>
            <div className="flex h-14 w-12 items-center justify-center overflow-hidden ">
              <img src="/sipa.png" alt="SIPA" className="h-full w-full object-contain" />
            </div>

            {/* Algerian Flag Badge */}
              <div className="flex h-14 w-12 items-center justify-center overflow-hidden rounded ">
              <img src="/dz.gif" alt="Algerian Flag" className="h-full w-full object-contain" />
            </div>

          </div>
        </div>

        {/* ======================================================= */}
        {/* CENTERED DESKTOP NAVIGATION                             */}
        {/* ======================================================= */}

        <nav className="mx-auto hidden min-w-0 items-center gap-0 lg:flex">
          {navLinks.slice(0, 3).map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`flex items-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sky-200 text-sky-900'
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                {t(link.label)}
              </span>
            </Link>
          ))}

          {/* FICHE DROPDOWN */}
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
              {t('Fiche')}
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
                      <span className="truncate">{item.name}</span>
                      <Download className="h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/editions-precedentes">
            <span
              className={`flex items-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                pathname === '/editions-precedentes'
                  ? 'bg-sky-200 text-sky-900'
                  : 'text-gray-700 hover:text-sky-600'
              }`}
            >
              {t('Editions Précédentes')}
            </span>
          </Link>
        </nav>

        {/* ======================================================= */}
        {/* LANGUAGE DROPDOWN & CONTACT (DESKTOP, RIGHT)            */}
        {/* ======================================================= */}

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          {/* Language Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-bold uppercase text-gray-700 transition-colors hover:bg-gray-100"
            >
              <span>{locale}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  langOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full z-50 mt-2 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  {(['fr', 'en', 'ar'] as Locale[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setLocale(option);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold uppercase transition-colors ${
                        locale === option
                          ? 'bg-sky-100 text-sky-700'
                          : 'text-gray-700 hover:bg-sky-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToFooter}
            className="shrink-0 cursor-pointer rounded bg-[#0ea5e9] px-6 py-2.5 text-sm font-medium text-white"
          >
            {t('Contact')}
          </motion.button>
        </div>

        {/* ======================================================= */}
        {/* MOBILE BUTTON                                           */}
        {/* ======================================================= */}

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ========================================================= */}
      {/* MOBILE NAV                                                */}
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
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 pb-3">
                {(['fr', 'en', 'ar'] as Locale[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLocale(option)}
                    aria-pressed={locale === option}
                    className={`rounded px-3 py-2 text-xs font-bold uppercase ${
                      locale === option
                        ? 'bg-sky-100 text-sky-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sky-50"
                >
                  {t(link.label)}
                </Link>
              ))}

              {/* Mobile Fiche */}
              <div>
                <button
                  type="button"
                  onClick={() => setFicheOpen(!ficheOpen)}
                  className="flex w-full items-center justify-between rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sky-50"
                >
                  {t('Fiche')}
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
                {t('Editions Précédentes')}
              </Link>

              <button
                type="button"
                onClick={scrollToFooter}
                className="mt-2 rounded bg-[#0ea5e9] px-6 py-3 text-sm font-medium text-white"
              >
                {t('Contact')}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}