'use client';

import { useEffect, useMemo, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '@/lib/pocketbase';
import { fetchCollection } from '@/lib/useCollection';
import { fromEUR } from '@/lib/currency';

/* Prices are edited in PocketBase, one set per currency:
     DA  (national)       → "price"        + Chaise, Table, Salon, Electronique_et_accessoire
     EUR (international)  → "price_ERRO"   + the same catalogues with "_erro"
     USD (international)  → "price_dollar" + the same catalogues with "_dollar"
   An empty / invalid price field keeps the built-in price below.
   The additional services (SERVICES SUPPLEMENTAIRES) are exactly the
   records of the four catalogues — there is no local list: an empty
   catalogue shows no items. Only prices change: the select fields sent to
   PocketBase (stand_type, facade, catalogue) keep their old option codes. */

export type TariffCurrency = 'DA' | 'EUR' | 'USD';

export type StandCode = 'amenage' | 'non_amenage' | 'decouvert';
export type FacadeCode = '2' | '3' | '4';
export type CatalogueCode = 'cover4' | 'cover3' | 'cover2' | 'half';

export type Tariff = {
  registration: number;
  stand: Record<StandCode, number>;
  facade: Record<FacadeCode, number>;
  catalogue: Record<CatalogueCode, number>;
  services: Record<ServiceCategory, CatalogueItem[]>;
};

/* Tabs of SERVICES SUPPLEMENTAIRES, in display order */
export type ServiceCategory = 'Chaise' | 'Table' | 'Salon' | 'Electronique et accessoire';

/* One record of a catalogue collection (fields: title, price; optional
   unit = "m2" for items priced per m²). */
export type CatalogueItem = {
  id: string;
  name: string;
  price: number;
  unit: 'event' | 'm2';
};

const SOURCES: Record<TariffCurrency, { collection: string; id: string; suffix: string }> = {
  DA: { collection: 'price', id: 'un7o7ej4ft95g94', suffix: '' },
  EUR: { collection: 'price_ERRO', id: 'zrt5m48c6ewspk4', suffix: '_erro' },
  USD: { collection: 'price_dollar', id: 'm7gortblxbxrtx5', suffix: '_dollar' },
};

const CATALOGUES: Record<ServiceCategory, string> = {
  Chaise: 'Chaise',
  Table: 'Table',
  Salon: 'Salon',
  'Electronique et accessoire': 'Electronique_et_accessoire',
};
const SERVICE_CATEGORIES = Object.keys(CATALOGUES) as ServiceCategory[];

type BaseTariff = Omit<Tariff, 'services'>;

const DEFAULT_DA: BaseTariff = {
  registration: 20000,
  stand: { amenage: 17000, non_amenage: 12000, decouvert: 10000 },
  facade: { '2': 17000, '3': 22000, '4': 32000 },
  catalogue: { cover4: 120000, cover3: 100000, cover2: 80000, half: 32000 },
};

const DEFAULT_EUR: BaseTariff = {
  registration: 350,
  stand: { amenage: 250, non_amenage: 200, decouvert: 150 },
  facade: { '2': 250, '3': 350, '4': 400 },
  catalogue: { cover4: 2000, cover3: 1600, cover2: 1500, half: 400 },
};

const mapValues = <K extends string>(values: Record<K, number>, fn: (n: number) => number) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, fn(v as number)])) as Record<K, number>;

const toUSD = (n: number) => fromEUR(n, 'USD');

const DEFAULTS: Record<TariffCurrency, BaseTariff> = {
  DA: DEFAULT_DA,
  EUR: DEFAULT_EUR,
  USD: {
    registration: toUSD(DEFAULT_EUR.registration),
    stand: mapValues(DEFAULT_EUR.stand, toUSD),
    facade: mapValues(DEFAULT_EUR.facade, toUSD),
    catalogue: mapValues(DEFAULT_EUR.catalogue, toUSD),
  },
};

/* Codes stored in the exhibitor records (old prices, kept as select
   options) → tariff entry. National and international codes together. */
export const STAND_CODE: Record<string, StandCode> = {
  '17000': 'amenage', '12000': 'non_amenage', '10000': 'decouvert',
  amenage: 'amenage', non_amenage: 'non_amenage', decouvert: 'decouvert',
};
export const FACADE_CODE: Record<string, FacadeCode> = {
  '17000': '2', '22000': '3', '32000': '4',
  '250': '2', '350': '3', '400': '4',
};
export const CATALOGUE_CODE: Record<string, CatalogueCode> = {
  '120000': 'cover4', '100000': 'cover3', '80000': 'cover2', '32000': 'half',
  '2000': 'cover4', '1600': 'cover3', '1500': 'cover2', '400': 'half',
};

/* PocketBase stores these prices as text ("17000", "17 000", "12,5"). */
function amount(value: unknown, fallback: number): number {
  const n =
    typeof value === 'number'
      ? value
      : parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const toItems = (records: RecordModel[]): CatalogueItem[] =>
  records
    .map((r) => ({
      id: r.id,
      name: String(r.title ?? '').trim(),
      price: amount(r.price, 0),
      unit: String(r.unit ?? '').trim().toLowerCase() === 'm2' ? ('m2' as const) : ('event' as const),
    }))
    .filter((item) => item.name !== '');

function buildTariff(
  currency: TariffCurrency,
  record: RecordModel | null,
  lists: Partial<Record<ServiceCategory, RecordModel[]>>
): Tariff {
  const d = DEFAULTS[currency];
  const r = record ?? ({} as RecordModel);

  return {
    registration: amount(r.Droits_dinscription, d.registration),
    stand: {
      amenage: amount(r.Type_de_stand_Stand_amenage, d.stand.amenage),
      non_amenage: amount(r.Type_de_stand_Stand_non_amenage, d.stand.non_amenage),
      decouvert: amount(r.Type_de_stand_Emplacement_decouvert, d.stand.decouvert),
    },
    facade: {
      '2': amount(r.Emplacement_a_02_facades, d.facade['2']),
      '3': amount(r.Emplacement_a_03_facades, d.facade['3']),
      '4': amount(r.Emplacement_a_04_facadeS, d.facade['4']),
    },
    catalogue: {
      cover4: amount(r['4eme_page_de_couverture'], d.catalogue.cover4),
      cover3: amount(r['3eme_page_de_couverture'], d.catalogue.cover3),
      cover2: amount(r['2eme_page_de_couverture'], d.catalogue.cover2),
      half: amount(r['12_page_interieure_couleur'], d.catalogue.half),
    },
    services: Object.fromEntries(
      SERVICE_CATEGORIES.map((c) => [c, toItems(lists[c] ?? [])])
    ) as Record<ServiceCategory, CatalogueItem[]>,
  };
}

export const defaultTariff = (currency: TariffCurrency) => buildTariff(currency, null, {});

const cache = new Map<TariffCurrency, Promise<Tariff>>();

/* Fetched once per page load and currency. Never rejects: on error the
   built-in prices are used. */
export function loadTariff(currency: TariffCurrency): Promise<Tariff> {
  let request = cache.get(currency);
  if (!request) {
    const { collection, id, suffix } = SOURCES[currency];
    request = Promise.all([
      pb
        .collection(collection)
        .getOne(id, { requestKey: null })
        .catch((err) => {
          console.error(`PocketBase error (${collection}):`, err);
          return null;
        }),
      ...SERVICE_CATEGORIES.map((c) => fetchCollection(`${CATALOGUES[c]}${suffix}`)),
    ]).then(([record, ...lists]) =>
      buildTariff(
        currency,
        record as RecordModel | null,
        Object.fromEntries(SERVICE_CATEGORIES.map((c, i) => [c, lists[i] as RecordModel[]]))
      )
    );
    cache.set(currency, request);
  }
  return request;
}

export function useTariff(currency: TariffCurrency) {
  const [loaded, setLoaded] = useState<{ currency: TariffCurrency; tariff: Tariff } | null>(null);

  useEffect(() => {
    let active = true;
    loadTariff(currency).then((tariff) => {
      if (active) setLoaded({ currency, tariff });
    });
    return () => {
      active = false;
    };
  }, [currency]);

  /* Until the current currency is loaded, show its built-in prices */
  const fallback = useMemo(() => defaultTariff(currency), [currency]);
  const ready = loaded?.currency === currency;
  return { tariff: ready ? loaded.tariff : fallback, loading: !ready };
}
