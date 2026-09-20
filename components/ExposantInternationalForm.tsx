'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { useLanguage } from '@/lib/i18n';

/* ================================================================ */
/* POCKETBASE                                                        */
/* ================================================================ */

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL ??
  'https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com';

const pb = new PocketBase(PB_URL);

/* PocketBase puts the real reason in error.response.data, keyed by
   field name. error.message is always "Failed to create record." */
function describePbError(error: unknown): string {
  if (error instanceof ClientResponseError) {
    const fields = error.response?.data as
      | Record<string, { message?: string }>
      | undefined;

    if (fields && Object.keys(fields).length > 0) {
      return Object.entries(fields)
        .map(([field, info]) => `${field} → ${info?.message ?? 'invalide'}`)
        .join(' | ');
    }

    return error.message || `HTTP ${error.status}`;
  }

  if (error instanceof Error) return error.message;

  return 'Erreur lors de l’envoi de la demande.';
}

/* ================================================================ */
/* SERVICES                                                          */
/* ================================================================ */

const CHAIRS = [
  { id: 'c1', name: 'ALINEA B chair', price: 6500 },
  { id: 'c2', name: 'EVEREST B chair', price: 2500 },
  { id: 'c3', name: 'CONFORT high chair', price: 7000 },
  { id: 'c4', name: 'SIMILI high chair, black', price: 5500 },
  { id: 'c5', name: 'OR chair, red and beige', price: 2000 },
  { id: 'c6', name: 'PATCHWORK chair, grey', price: 8000 },
  { id: 'c7', name: 'RÉUNION N chair', price: 2500 },
  { id: 'c8', name: 'SCANDINAVE B chair', price: 4200 },
];

const TABLES = [
  { id: 't1', name: 'STANDARD desk (80×35×90)', price: 10500 },
  { id: 't2', name: 'STANDARD desk with panelling', price: 14000 },
  { id: 't3', name: 'ROUNDED large table (120×90)', price: 14000 },
  { id: 't4', name: 'SIMPLY large table (120×70)', price: 14000 },
  { id: 't5', name: 'ATELIER table (140×65×70)', price: 10500 },
  { id: 't6', name: 'TRIPODE coffee table (Ø60×60)', price: 8500 },
  { id: 't7', name: 'CLASSIC high table (Ø60)', price: 8500 },
  { id: 't8', name: 'SCANDINAVE high table (Ø60×100)', price: 8000 },
  { id: 't9', name: 'RONDE table (Ø80×70)', price: 5000 },
  {
    id: 't10',
    name: 'SCANDINAVE square glass table (85×85×75)',
    price: 8500,
  },
  {
    id: 't11',
    name: 'SCANDINAVE round glass table (Ø80×75)',
    price: 7000,
  },
];

const LOUNGE = [
  {
    id: 's1',
    name: 'Premium lounge set, 4 seats + coffee table (red)',
    price: 60000,
  },
  { id: 's2', name: 'Standard lounge chair, black, 1 seat', price: 7000 },
  {
    id: 's3',
    name: 'Standard lounge set, black, 4 seats + coffee table',
    price: 25000,
  },
  { id: 's4', name: 'VIP lounge set, 4 seats + coffee table', price: 50000 },
  { id: 's5', name: 'STANDARD coffee table', price: 5500 },
];

const ELECTRONICS = [
  { id: 'e1', name: 'Plastic waste bin', price: 800 },
  { id: 'e2', name: 'Metal waste bin', price: 1600 },
  { id: 'e3', name: '32" LED TV screen', price: 20000 },
  { id: 'e4', name: '43" LED TV screen', price: 24000 },
  { id: 'e5', name: '50" LED TV screen', price: 36000 },
  { id: 'e6', name: '55" LED TV screen', price: 48000 },
  { id: 'e7', name: '65" LED TV screen', price: 100000 },
  { id: 'e8', name: 'Metal shelving unit', price: 6000 },
  { id: 'e9', name: 'Guide line stand', price: 5000 },
  { id: 'e10', name: 'Capsule coffee machine', price: 16000 },
  { id: 'e11', name: 'Carpet (per m²)', price: 1700 },
  { id: 'e12', name: 'Power strips', price: 800 },
  { id: 'e13', name: 'Artificial plants', price: 5500 },
  { id: 'e14', name: 'A4 literature stand (MB27-M)', price: 16000 },
  { id: 'e15', name: 'A4 literature stand (MB27-P)', price: 8000 },
  { id: 'e16', name: 'A4 literature stand (MB27-PM)', price: 6500 },
  { id: 'e17', name: 'Aluminium storage door', price: 16000 },
  { id: 'e18', name: 'Lectern', price: 16000 },
  { id: 'e19', name: '90L refrigerator', price: 10500 },
  { id: 'e20', name: '3-spot electrical strip', price: 3200 },
  { id: 'e21', name: 'Floor-standing TV mount', price: 24000 },
  { id: 'e22', name: 'Display case MB26-BI', price: 21000 },
  { id: 'e23', name: 'Display case MB26-CO', price: 17000 },
  { id: 'e24', name: 'Display case MB26-UN', price: 17000 },
];

/* ================================================================ */
/* TYPES                                                             */
/* ================================================================ */

type Service = {
  id: string;
  name: string;
  price: number;
};

type ServiceCategory =
  | 'Chaise'
  | 'Table'
  | 'Salon'
  | 'Electronique et accessoire';

/* ================================================================ */
/* COMPONENT                                                         */
/* ================================================================ */

export default function ExposantInternationalForm() {
  const { t } = useLanguage();

  /* ================================================================ */
  /* DYNAMIC DZD -> EUR EXCHANGE RATE                                */
  /* ================================================================ */

  const [dzdToEur, setDzdToEur] = useState<number | null>(null);
  const [exchangeRateDate, setExchangeRateDate] = useState<string | null>(
    null
  );
  const [exchangeRateLoading, setExchangeRateLoading] = useState(true);
  const [exchangeRateError, setExchangeRateError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchExchangeRate = async () => {
      try {
        setExchangeRateLoading(true);
        setExchangeRateError(false);

        /*
         * Frankfurter provides current official/global FX data
         * without requiring an API key.
         *
         * DZD is the source currency.
         * EUR is the displayed client currency.
         */
        const response = await fetch(
          'https://api.frankfurter.dev/v2/rate/dzd/eur',
          {
            signal: controller.signal,
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(`Exchange-rate API returned ${response.status}`);
        }

        const data: {
          date?: string;
          base?: string;
          quote?: string;
          rate?: number;
        } = await response.json();

        if (
          typeof data.rate !== 'number' ||
          !Number.isFinite(data.rate) ||
          data.rate <= 0
        ) {
          throw new Error('Invalid DZD/EUR exchange rate');
        }

        setDzdToEur(data.rate);
        setExchangeRateDate(data.date ?? null);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error('Exchange rate error:', error);

        setDzdToEur(null);
        setExchangeRateDate(null);
        setExchangeRateError(true);
      } finally {
        if (!controller.signal.aborted) {
          setExchangeRateLoading(false);
        }
      }
    };

    fetchExchangeRate();

    return () => {
      controller.abort();
    };
  }, []);

  /* ================================================================ */
  /* CURRENCY FORMATTERS                                              */
  /* ================================================================ */

  const formatDZD = (amount: number) => amount.toLocaleString('fr-DZ');

  const formatEUR = (amount: number) => {
    if (dzdToEur === null || !Number.isFinite(amount)) {
      return '—';
    }

    return (amount * dzdToEur).toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderPrice = (amount: number, suffix = 'DA') => (
    <div className="flex flex-col items-end">
      <span>
        {formatDZD(amount)} {suffix}
      </span>

      <span className="text-sm font-semibold text-gray-500">
        {exchangeRateLoading
          ? t('Conversion EUR...')
          : exchangeRateError
            ? t('EUR indisponible')
            : `≈ ${formatEUR(amount)}`}
      </span>
    </div>
  );

  const exchangeRateLabel =
    dzdToEur !== null
      ? `1 DA = ${dzdToEur.toLocaleString('fr-FR', {
          minimumFractionDigits: 6,
          maximumFractionDigits: 8,
        })} €`
      : t('Taux EUR indisponible');

  /* -------------------------------------------------------------- */
  /* ACTIVE SERVICE CATEGORY                                        */
  /* -------------------------------------------------------------- */

  const [activeService, setActiveService] =
    useState<ServiceCategory>('Chaise');

  /* -------------------------------------------------------------- */
  /* DEMANDE DE PARTICIPATION                                       */
  /* -------------------------------------------------------------- */

  const [raisonSociale, setRaisonSociale] = useState('');
  const [pays, setPays] = useState('');
  const [secteurActivite, setSecteurActivite] = useState('');
  const [personneContact, setPersonneContact] = useState('');
  const [registreCommerce, setRegistreCommerce] = useState('');
  const [tel, setTel] = useState('');
  const [identifiantFiscal, setIdentifiantFiscal] = useState('');
  const [fax, setFax] = useState('');
  const [adresse, setAdresse] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [ville, setVille] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  /* -------------------------------------------------------------- */
  /* RESERVATION DE STAND                                           */
  /* -------------------------------------------------------------- */

  const [choixStand, setChoixStand] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [majorationFacades, setMajorationFacades] = useState('');
  const [publiciteCatalogue, setPubliciteCatalogue] = useState('');

  /* -------------------------------------------------------------- */
  /* SERVICES SELECTION                                             */
  /* -------------------------------------------------------------- */

  const [selectedServices, setSelectedServices] = useState<
    Record<string, number>
  >({});

  /* -------------------------------------------------------------- */
  /* SIGNALETIQUE                                                    */
  /* -------------------------------------------------------------- */

  const [nomEnseigne, setNomEnseigne] = useState('');
  const [nombreBadges, setNombreBadges] = useState('');
  const [macarons, setMacarons] = useState('');
  const [hostessSelected, setHostessSelected] = useState(false);

  /* -------------------------------------------------------------- */
  /* CONDITIONS                                                      */
  /* -------------------------------------------------------------- */

  const [acceptTva, setAcceptTva] = useState(false);
  const [acceptAnnulation, setAcceptAnnulation] = useState(false);
  const [acceptConditions, setAcceptConditions] = useState(false);

  /* -------------------------------------------------------------- */
  /* SUBMISSION STATE                                                */
  /* -------------------------------------------------------------- */

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  /* ================================================================ */
  /* STAND CALCULATIONS                                               */
  /* ================================================================ */

  const droitsInscription = 20000;

  const prixParM2 = Number(choixStand || 0);
  const surfaceM2 = Number(superficie || 0);
  const prixStand = prixParM2 * surfaceM2;

  /* Electricity = surface × 4 days × 20 DA */
  const electricite = surfaceM2 * 4 * 20;

  const majoration = Number(majorationFacades || 0);
  const publicite = Number(publiciteCatalogue || 0);

  /* ================================================================ */
  /* CURRENT SERVICE LIST                                             */
  /* ================================================================ */

  const getCurrentServices = (): Service[] => {
    switch (activeService) {
      case 'Chaise':
        return CHAIRS;
      case 'Table':
        return TABLES;
      case 'Salon':
        return LOUNGE;
      case 'Electronique et accessoire':
        return ELECTRONICS;
      default:
        return [];
    }
  };

  const currentServices = getCurrentServices();

  const toggleService = (id: string) => {
    setSelectedServices((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  };

  const changeQuantity = (id: string, quantity: number) => {
    setSelectedServices((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  };

  const allServices: Service[] = [
    ...CHAIRS,
    ...TABLES,
    ...LOUNGE,
    ...ELECTRONICS,
  ];

  const selectedAdditionalServices = allServices
    .filter((service) => selectedServices[service.id])
    .map((service) => ({
      ...service,
      qty: selectedServices[service.id],
    }));

  const totalAdditionalServices = selectedAdditionalServices.reduce(
    (total, service) => total + service.price * service.qty,
    0
  );

  const totalHT =
    droitsInscription +
    prixStand +
    electricite +
    majoration +
    publicite +
    totalAdditionalServices;

  const tva = totalHT * 0.19;
  const totalTTC = totalHT + tva;

  /* ================================================================ */
  /* AUTOMATIC BADGES                                                   */
  /* ================================================================ */

  /*
   * You can change this rule later if the official
   * exhibition rules specify another calculation.
   *
   * Currently:
   * 1 badge per 9 m², minimum 2.
   */

  const calculatedBadges =
    surfaceM2 > 0 ? Math.max(2, Math.ceil(surfaceM2 / 9)) : 0;

  const calculatedMacarons =
    surfaceM2 > 0 ? Math.max(1, Math.ceil(surfaceM2 / 18)) : 0;

  /* ================================================================ */
  /* VALIDATION                                                         */
  /*                                                                    */
  /* The submit button is outside the <form> validation flow, so the    */
  /* required fields are checked here. Without this, a blank form is    */
  /* sent to PocketBase and every required column fails at once.        */
  /* ================================================================ */

  const requiredFields: Array<[string, string]> = [
    ['Raison Sociale', raisonSociale],
    ['Pays', pays],
    ["Secteur d'activité", secteurActivite],
    ['Personne à contacter', personneContact],
    ['Registre de commerce', registreCommerce],
    ['Tél', tel],
    ['Identifiant fiscal', identifiantFiscal],
    ['Adresse', adresse],
    ['Ville', ville],
    ['Mobile', mobile],
    ['Email', email],
    ['Stand type', choixStand],
    ['Superficie', superficie],
  ];

  const missing = requiredFields
    .filter(([, value]) => value.trim() === '')
    .map(([label]) => label);

  const termsAccepted = acceptTva && acceptAnnulation && acceptConditions;

  const canSubmit = missing.length === 0 && termsAccepted && !loading;

  /* ================================================================ */
  /* SUBMIT                                                             */
  /* ================================================================ */

  const handleSubmit = async () => {
    setMessage('');
    setIsSuccess(false);

    if (missing.length > 0) {
      setMessage(`Champs obligatoires manquants : ${missing.join(', ')}`);
      return;
    }

    if (!termsAccepted) {
      setMessage('Veuillez accepter les trois conditions.');
      return;
    }

    setLoading(true);

    try {
      const additionalServices = selectedAdditionalServices.map(
        (service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          qty: service.qty,
        })
      );

      /* Text columns — empty optional values are dropped rather than
         sent as '', which non-text field types reject. */
      const textValues: Record<string, string> = {
        company_name: raisonSociale,
        country: pays,
        sector_activity: secteurActivite,
        contact_person: personneContact,
        company_registration_no: registreCommerce,
        phone: tel,
        tax_id_no: identifiantFiscal,
        fax: fax,
        address: adresse,
        website: siteWeb,
        city: ville,
        mobile: mobile,
        email: email,
        fascia_company_name: nomEnseigne,
        NOTE: '',
        STATUS: 'received',
      };

      const data: Record<string, unknown> = Object.fromEntries(
        Object.entries(textValues).filter(([, v]) => v !== '')
      );

      /* Selects yield strings. These columns are numeric, so they are
         coerced here; the unpicked optional ones stay out entirely. */
      data.stand_type = prixParM2;
      data.surface = surfaceM2;

      if (majorationFacades !== '') data.facade = majoration;
      if (publiciteCatalogue !== '') data.catalogue = publicite;

      /* Sent as a real array for a `json` column. If ADDITIONAL_SERVICES
         is a plain `text` column instead, wrap it:
         JSON.stringify(additionalServices) */
      data.ADDITIONAL_SERVICES = additionalServices;

      data.exhibitor_badges =
        nombreBadges === '' ? calculatedBadges : Number(nombreBadges);

      data.access_passes =
        macarons === '' ? calculatedMacarons : Number(macarons);

      data.hostess_selected = hostessSelected;

      data.terms_prices_excl_tax = acceptTva;
      data.terms_no_refund = acceptAnnulation;
      data.terms_general_conditions = acceptConditions;

      data.total_ht = totalHT;

      console.log('Sending to PocketBase:', data);

      const record = await pb
        .collection('Exposant_International')
        .create(data);

      console.log('Created record:', record.id, record);

      setIsSuccess(true);
      setMessage(t('Demande envoyée avec succès.'));
    } catch (error) {
      console.error('PocketBase error:', error);

      if (error instanceof ClientResponseError) {
        console.error('status:', error.status);
        console.error(
          'field errors:',
          JSON.stringify(error.response?.data, null, 2)
        );
      }

      setIsSuccess(false);
      setMessage(describePbError(error));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* INPUT STYLE                                                       */
  /* ================================================================ */

  const inputClass =
    'w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500';

  /* ================================================================ */
  /* RENDER                                                             */
  /* ================================================================ */

  return (
    <div className="flex flex-col gap-10">

      {/* ========================================================== */}
      {/* TITLE                                                       */}
      {/* ========================================================== */}

      <div className="flex flex-col gap-4 text-white">

        <h1 className="text-4xl font-bold tracking-wide">
          {t('Inscription exposant international')}
        </h1>

        <p className="font-semibold text-base max-w-[700px] leading-relaxed">
          {t('Merci de bien vouloir nous retourner le formulaire suivant afin que nous puissions vous faire parvenir une facture.')}
        </p>

        <div className="bg-[#dc2626] text-white text-sm font-bold py-2.5 px-6 rounded-md w-fit mt-2">
          {t('Formulaire à retourner avant le 25 Octobre 2025')}
        </div>

      </div>

      {/* ========================================================== */}
      {/* 1 — DEMANDE DE PARTICIPATION                              */}
      {/* ========================================================== */}

      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('Demande de participation:')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          {/* RAISON SOCIALE */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Raison Sociale')} *
            </label>

            <input
              type="text"
              required
              value={raisonSociale}
              onChange={(e) => setRaisonSociale(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* PAYS */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Pays')} *
            </label>

            <input
              type="text"
              required
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* SECTEUR */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Secteur d'activité")} *
            </label>

            <input
              type="text"
              required
              value={secteurActivite}
              onChange={(e) => setSecteurActivite(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* CONTACT */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Personne à contacter')} *
            </label>

            <input
              type="text"
              required
              value={personneContact}
              onChange={(e) => setPersonneContact(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* RC */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Registre de commerce N°')} *
            </label>

            <input
              type="text"
              required
              value={registreCommerce}
              onChange={(e) => setRegistreCommerce(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* TEL */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Tél')} *
            </label>

            <input
              type="text"
              required
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* FISCAL */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('N° Identifiant fiscal')} *
            </label>

            <input
              type="text"
              required
              value={identifiantFiscal}
              onChange={(e) => setIdentifiantFiscal(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* FAX */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Fax')}
            </label>

            <input
              type="text"
              value={fax}
              onChange={(e) => setFax(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* ADDRESS */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Adresse')} *
            </label>

            <input
              type="text"
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* WEBSITE */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Site web')}
            </label>

            <input
              type="text"
              placeholder="https://..."
              value={siteWeb}
              onChange={(e) => setSiteWeb(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* CITY */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Ville')} *
            </label>

            <input
              type="text"
              required
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* MOBILE */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Mobile')} *
            </label>

            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* EMAIL */}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Email')} *
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

        </div>

        <div className="mt-4 flex items-center gap-2">

          <span className="text-[#0ea5e9] text-2xl font-bold">
            {t("Droits d'inscription:")}
          </span>

          <span className="text-black text-2xl font-bold">
            {renderPrice(droitsInscription)}
          </span>

        </div>

      </div>

      {/* ========================================================== */}
      {/* 2 — RESERVATION DE STAND                                  */}
      {/* ========================================================== */}

      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('RESERVATION DE STAND:')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          {/* STAND TYPE */}

          <div className="flex flex-col gap-1.5">

            <label className="text-sm font-bold text-black">
              {t('Stand type')} *
            </label>

            <select
              value={choixStand}
              onChange={(e) => setChoixStand(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez un stand')}</option>

              <option value="17000">
                Stand aménagé (17.000 DA/m²
                {dzdToEur !== null ? ` ≈ ${formatEUR(17000)}/m²` : ''})
              </option>

              <option value="12000">
                Stand non aménagé (12.000 DA/m²
                {dzdToEur !== null ? ` ≈ ${formatEUR(12000)}/m²` : ''})
              </option>

              <option value="10000">
                Emplacement découvert (10.000 DA/m²
                {dzdToEur !== null ? ` ≈ ${formatEUR(10000)}/m²` : ''})
              </option>
            </select>

          </div>

          {/* SURFACE */}

          <div className="flex flex-col gap-1.5">

            <label className="text-sm font-bold text-black">
              {t('Superficie')} *
            </label>

            <select
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez la superficie')}</option>
              <option value="12">12 m²</option>
              <option value="18">18 m²</option>
              <option value="24">24 m²</option>
              <option value="36">36 m²</option>
              <option value="48">48 m²</option>
              <option value="54">54 m²</option>
              <option value="60">60 m²</option>
              <option value="72">72 m²</option>
              <option value="80">80 m²</option>
              <option value="100">100 m²</option>
              <option value="120">120 m²</option>
              <option value="150">150 m²</option>
              <option value="200">200 m²</option>
              <option value="250">250 m²</option>
              <option value="300">300 m²</option>
            </select>

          </div>

          {/* FACADES */}

          <div className="flex flex-col gap-1.5">

            <label className="text-sm font-bold text-black">
              {t('Majoration façades supplémentaires (forfait)')}
            </label>

            <select
              value={majorationFacades}
              onChange={(e) => setMajorationFacades(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez une option')}</option>

              <option value="17000">
                {`Emplacement à 02 façades 17.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(17000)}` : ''}`}
              </option>

              <option value="22000">
                {`Emplacement à 03 façades 22.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(22000)}` : ''}`}
              </option>

              <option value="32000">
                {`Emplacement à 04 façades 32.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(32000)}` : ''}`}
              </option>
            </select>

          </div>

          {/* CATALOGUE */}

          <div className="flex flex-col gap-1.5">

            <label className="text-sm font-bold text-black">
              {t('Publicité sur le catalogue')}
            </label>

            <select
              value={publiciteCatalogue}
              onChange={(e) => setPubliciteCatalogue(e.target.value)}
              className={inputClass}
            >
              <option value="">Sélectionnez une option</option>

              <option value="120000">
                {`4ème page de couverture 120.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(120000)}` : ''}`}
              </option>

              <option value="100000">
                {`3ème page de couverture 100.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(100000)}` : ''}`}
              </option>

              <option value="80000">
                {`2ème page de couverture 80.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(80000)}` : ''}`}
              </option>

              <option value="32000">
                {`1/2 page intérieure couleur 32.000 DA${dzdToEur !== null ? ` ≈ ${formatEUR(32000)}` : ''}`}
              </option>
            </select>

          </div>

        </div>

        <p className="text-sm font-bold text-black mt-2">
          {t("L'aménagement du stand comprend : Moquette, cloisons, 1 table, 3 chaises, 3 spots, signalétiques prise de raccommodement électrique 220V")}
        </p>

        {/* PRICE BREAKDOWN */}

        <div className="flex flex-col gap-5 mt-2">

          <div className="flex items-center justify-between">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Prix stand :')}
            </span>
            <span className="text-black text-2xl font-bold">
              {renderPrice(prixStand)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Électricité :')}
            </span>
            <span className="text-black text-2xl font-bold">
              {renderPrice(electricite)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Façades :')}
            </span>
            <span className="text-black text-2xl font-bold">
              {renderPrice(majoration)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Publicité catalogue :')}
            </span>
            <span className="text-black text-2xl font-bold">
              {renderPrice(publicite)}
            </span>
          </div>

        </div>

      </div>

      {/* ========================================================== */}
      {/* 3 — SERVICES SUPPLEMENTAIRES                              */}
      {/* ========================================================== */}

      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('SERVICES SUPPLEMENTAIRES:')}
        </div>

        {/* CATEGORY TABS */}

        <div className="bg-gray-300/80 rounded-lg p-2 flex flex-wrap gap-2 text-base font-bold mt-2">

          {[
            'Chaise',
            'Table',
            'Salon',
            'Electronique et accessoire',
          ].map((service) => {

            const category = service as ServiceCategory;

            return (
              <button
                key={service}
                type="button"
                onClick={() => setActiveService(category)}
                className={`py-3 px-6 rounded-md transition-colors ${
                  activeService === category
                    ? 'bg-[#38bdf8] text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {t(service)}
              </button>
            );
          })}

        </div>

        {/* SERVICES */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

          {currentServices.map((service) => {

            const selected = !!selectedServices[service.id];
            const quantity = selectedServices[service.id] || 0;

            return (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                className={`border rounded-xl p-6 flex items-center justify-between transition-colors shadow-sm ${
                  selected
                    ? 'border-black bg-black'
                    : 'border-gray-300 bg-[#f8fafc] hover:bg-gray-50'
                }`}
              >

                {/* SERVICE INFO */}

                <div
                  className="flex flex-col gap-2 cursor-pointer flex-1 pr-4"
                  onClick={() => toggleService(service.id)}
                >
                  <span
                    className={`font-bold text-sm ${
                      selected ? 'text-[#38bdf8]' : 'text-black'
                    }`}
                  >
                    {service.name}
                  </span>

                  <span
                    className={`text-sm ${
                      selected ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {formatDZD(service.price)} DA HT / {t('Événement')}
                  </span>

                  <span className="text-sm font-semibold text-gray-500">
                    {exchangeRateLoading
                      ? t('Conversion EUR...')
                      : exchangeRateError
                        ? t('EUR indisponible')
                        : `≈ ${formatEUR(service.price)} / ${t('Événement')}`}
                  </span>
                </div>

                {/* RIGHT SIDE */}

                <div className="flex items-center gap-3 shrink-0">

                  <button
                    type="button"
                    aria-label={`Sélectionner ${service.name}`}
                    onClick={() => toggleService(service.id)}
                    className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                      selected
                        ? 'border-[#38bdf8] bg-black'
                        : 'border-gray-300 bg-black'
                    }`}
                  >
                    {selected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                    )}
                  </button>

                  {selected && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(service.id, quantity - 1)
                        }
                        className="w-8 h-8 rounded bg-white text-black font-bold hover:bg-gray-200"
                      >
                        −
                      </button>

                      <span className="w-8 text-center text-white font-bold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(service.id, quantity + 1)
                        }
                        className="w-8 h-8 rounded bg-white text-black font-bold hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  )}

                </div>

              </motion.div>
            );
          })}

        </div>

        {/* SERVICES TOTAL */}

        <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
          <span className="text-xl font-bold text-black">
            {t('Services supplémentaires :')}
          </span>
          <span className="text-2xl font-black text-[#0ea5e9]">
            {renderPrice(totalAdditionalServices, 'DA HT')}
          </span>
        </div>

      </div>

      {/* ========================================================== */}
      {/* 4 — SIGNALETIQUE                                           */}
      {/* ========================================================== */}

      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('SIGNALETIQUE DU STAND:')}
        </div>

        {/* ENSEIGNE */}

        <div className="flex flex-col gap-1.5 mt-2">

          <label className="text-sm font-bold text-black">
            {t("Nom de la société à faire figurer sur l'enseigne du stand (Maximum 20 caractères) :")}
          </label>

          <input
            type="text"
            maxLength={20}
            value={nomEnseigne}
            onChange={(e) => setNomEnseigne(e.target.value)}
            className={inputClass}
          />

          <span className="text-xs text-gray-500">
            {nomEnseigne.length}/20 {t('caractères')}
          </span>

        </div>

        {/* BADGES / MACARONS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Nombre de badges exposants (calculé automatiquement)')}
            </label>

            <input
              type="text"
              value={nombreBadges === '' ? calculatedBadges : nombreBadges}
              onChange={(e) => setNombreBadges(e.target.value)}
              className={inputClass}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Macarons (calculé automatiquement)')}
            </label>

            <input
              type="text"
              value={macarons === '' ? calculatedMacarons : macarons}
              onChange={(e) => setMacarons(e.target.value)}
              className={inputClass}
              readOnly
            />
          </div>

        </div>

        {/* HOTESSE — previously sent as always false with no control */}

        <label className="flex items-center gap-3 cursor-pointer w-fit text-sm font-bold text-black">
          <input
            type="checkbox"
            checked={hostessSelected}
            onChange={(e) => setHostessSelected(e.target.checked)}
            className="w-5 h-5 accent-[#0ea5e9] rounded-sm"
          />
          {t('Je souhaite réserver une hôtesse')}
        </label>

      </div>

      {/* ========================================================== */}
      {/* CONDITIONS DE PAIEMENT                                     */}
      {/* ========================================================== */}

      <div className="flex flex-col gap-6">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('CONDITIONS DE PAIEMENT:')}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed max-w-[1000px] mt-2">

          {t("Les frais de participation sont payables à 100 % après l'inscription et avant le 1er novembre 2025 par virement bancaire à l'ordre de:")}

          <br />

          {t('CAPA, Domicilié auprès de la Banque Crédit Populaire Algérie Agence colonel Amirouche Sous le numéro: RIB:')}

          <br />

          004001084010162524 25

          <br />

          SWIFT: CPALDZALXXX

        </p>

        {/* CONDITIONS */}

        <div className="flex flex-col gap-4 text-white text-sm font-bold mt-2">

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={acceptTva}
              onChange={(e) => setAcceptTva(e.target.checked)}
              className="w-5 h-5 accent-white rounded-sm"
            />
            {t('Les prix sont donnés en hors-taxe, il y a lieu de compter en sus 19 % de TVA.')}
          </label>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={acceptAnnulation}
              onChange={(e) => setAcceptAnnulation(e.target.checked)}
              className="w-5 h-5 accent-white rounded-sm"
            />
            {t("Au cas d'annulation de l'exposant, ce dernier ne peut prétendre à aucun remboursement.")}
          </label>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={acceptConditions}
              onChange={(e) => setAcceptConditions(e.target.checked)}
              className="w-5 h-5 accent-white rounded-sm"
            />
            {t("J'accepte les conditions générales")}
          </label>

        </div>

        {/* CONFIRMATION */}

        <p className="text-gray-400 text-sm leading-relaxed mt-2">
          {t("Le soussigné confirme sa participation au 10ème Salon International de la Pêche et de l'Aquaculture qui se tiendra Du 06 Au 09 novembre 2025 au Centre de Conventions d'Oran et déclare avoir pris connaissance du règlement général du salon et s'engage à en respecter toutes les clauses et les conditions.")}
        </p>

        {/* ======================================================== */}
        {/* EXCHANGE RATE NOTICE                                      */}
        {/* ======================================================== */}

        <div className="w-full bg-white/90 rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-gray-600">
              Taux de change EUR automatique
            </span>

            <span className="text-sm text-gray-500">
              {exchangeRateLoading
                ? t('Récupération du taux actuel...')
                : exchangeRateError
                  ? t('Impossible de récupérer le taux EUR actuellement.')
                  : `${exchangeRateLabel}${exchangeRateDate ? ` · Taux du ${exchangeRateDate}` : ''}`}
            </span>

            <span className="text-xs text-gray-400">
              {t("Les montants de référence restent en DA. Les montants en EUR sont calculés automatiquement à partir du taux récupéré par l'API.")}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TOTAL                                                     */}
        {/* ======================================================== */}

        <div className="w-full bg-white rounded-xl mt-6 p-8 md:p-12 flex flex-col gap-8 shadow-lg">

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">
              {t('Total HT')}
            </span>
            <span className="text-xl font-black text-black">
              {renderPrice(totalHT)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">
              {t('TVA (19%)')}
            </span>
            <span className="text-xl font-black text-black">
              {renderPrice(tva)}
            </span>
          </div>

          <div className="border-t border-gray-200" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex flex-col gap-2 text-center md:text-left">
              <span className="text-2xl font-black text-black uppercase tracking-wide">
                {t('Total à payer')}
              </span>
              <span className="text-base font-bold text-gray-500">
                {t('TVA (19%) incluse')}
              </span>
            </div>

            <div className="flex flex-col items-center md:items-end text-4xl font-black text-[#0ea5e9]">
              {renderPrice(totalTTC, 'DA TTC')}
            </div>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (
          <p
            className={`text-sm font-semibold ${
              isSuccess ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* ======================================================== */}
        {/* SUBMIT                                                     */}
        {/* ======================================================== */}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold h-[88px] rounded-xl text-2xl hover:bg-[#0284c7] transition-colors"
        >
          {loading ? t('ENVOI...') : t('Soumettre la demande')}
        </button>

      </div>

    </div>
  );
}