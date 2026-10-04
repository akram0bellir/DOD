'use client';

import { useLanguage } from '@/lib/i18n';

/* International prices are defined in euros. English visitors see them in
   US dollars, converted with this fixed rate (rounded to the cent).
   Change the rate here only — forms and invoices all read it. */
export const EUR_TO_USD = 1.1;

export type Currency = 'EUR' | 'USD';

export const currencyForLocale = (locale: string): Currency => (locale === 'en' ? 'USD' : 'EUR');

export const CURRENCY_SYMBOL: Record<Currency, string> = { EUR: '€', USD: '$' };

/* A euro tariff amount expressed in the given currency. */
export function fromEUR(eur: number, currency: Currency): number {
  return currency === 'USD' ? Math.round(eur * EUR_TO_USD * 100) / 100 : eur;
}

/* Formats an amount that is already in `currency`. */
export function formatMoney(amount: number, currency: Currency): string {
  return currency === 'USD'
    ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* Currency of the current language: EN → USD, FR / AR → EUR. */
export function useCurrency() {
  const { locale } = useLanguage();
  const currency = currencyForLocale(locale);
  return {
    currency,
    symbol: CURRENCY_SYMBOL[currency],
    /** euro tariff amount → amount in the current currency */
    price: (eur: number) => fromEUR(eur, currency),
    /** amount already in the current currency → "275,00 €" / "$302.50" */
    format: (amount: number) => formatMoney(amount, currency),
  };
}
