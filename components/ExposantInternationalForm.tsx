'use client';

import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { useLanguage } from '@/lib/i18n';
import { storeFacture } from '@/lib/facture';
import { canonicalCountry, canonicalWilaya, isAlgeria } from '@/lib/location';
import LocationField from '@/components/LocationField';
import { useCurrency } from '@/lib/currency';
import { serviceName } from '@/lib/serviceNames';
import { useTariff, type CatalogueCode, type FacadeCode, type ServiceCategory } from '@/lib/tariff';

/* ================================================================ */
/* POCKETBASE                                                        */
/* ================================================================ */

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL ??
  'https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com';

const pb = new PocketBase(PB_URL);

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
/* TARIFF — SIPA international exhibitors, HT                        */
/* Registration, stand, façade, catalogue and furniture prices come  */
/* from PocketBase: "price_ERRO" + *_erro catalogues in euros,        */
/* "price_dollar" + *_dollar catalogues in dollars (lib/tariff.ts).  */
/* The EUR prices written here are the fallbacks. Electricity and    */
/* hostesses stay fixed in EUR (converted for USD).                  */
/* ================================================================ */

const ELECTRICITY_RATE = 5; // € per m² per day
const EVENT_DAYS = 4; // 06 → 09 November
const VAT_RATE = 0.19;
const HOSTESS_RATE = 100; // € per person per day
const HOSTESS_MAX_DAYS = 4;
const HOSTESS_MAX_PEOPLE = 20; // sanity limit

type StandTypeCode = 'amenage' | 'non_amenage' | 'decouvert';

/* Values of the stand_type select in PocketBase. "non_amenage " really
   has a trailing space there; any other spelling is rejected. */
const PB_STAND_TYPE: Record<StandTypeCode, string> = {
  amenage: 'amenage',
  non_amenage: 'non_amenage ',
  decouvert: 'decouvert',
};

const STAND_TYPES: {
  code: StandTypeCode;
  label: string;
}[] = [
  { code: 'amenage', label: 'Stand aménagé' },
  { code: 'non_amenage', label: 'Stand non aménagé' },
  { code: 'decouvert', label: 'Emplacement découvert' },
];

const SURFACES = [12, 18, 24, 36, 48, 54, 60, 72, 80, 100, 120, 150, 200, 250, 300];

/* Official lookup table — not a formula */
const ALLOCATIONS: Record<number, { badges: number; macarons: number }> = {
  12: { badges: 2, macarons: 1 },
  18: { badges: 3, macarons: 1 },
  24: { badges: 4, macarons: 2 },
  36: { badges: 5, macarons: 2 },
  48: { badges: 5, macarons: 2 },
  54: { badges: 5, macarons: 2 },
  60: { badges: 5, macarons: 3 },
  72: { badges: 5, macarons: 3 },
  80: { badges: 6, macarons: 3 },
  100: { badges: 7, macarons: 3 },
  120: { badges: 8, macarons: 3 },
  150: { badges: 8, macarons: 3 },
  200: { badges: 8, macarons: 3 },
  250: { badges: 10, macarons: 4 },
  300: { badges: 12, macarons: 5 },
};

/* `value` is the PocketBase select option (the original EUR price),
   sent unchanged; the amount charged comes from the tariff. */
const FACADES: { code: FacadeCode; label: string; value: number }[] = [
  { code: '2', label: 'Emplacement à 02 façades', value: 250 },
  { code: '3', label: 'Emplacement à 03 façades', value: 350 },
  { code: '4', label: 'Emplacement à 04 façades', value: 400 },
];

const ADS: { code: CatalogueCode; label: string; value: number }[] = [
  { code: 'cover4', label: '4ème page de couverture', value: 2000 },
  { code: 'cover3', label: '3ème page de couverture', value: 1600 },
  { code: 'cover2', label: '2ème page de couverture', value: 1500 },
  { code: 'half', label: '1/2 page intérieure couleur', value: 400 },
];

const SECTORS = [
  'Pêche : Pêche artisanale',
  'Pêche : Pêche côtière',
  'Pêche : Pêche industrielle',
  'Pêche : Pêche au corail',
  'Pêche : Pêche continentale',
  'Pêche : Pêche récréative',
  'Pêche : Pêche au thon rouge',
  'Aquaculture : Aquaculture marine',
  'Aquaculture : Aquaculture continentale',
  "Aquaculture : Pisciculture intégrée (produits d'eau douce)",
  'Autres secteurs : Aliments pour poissons',
  'Autres secteurs : Génétique et reproduction',
  'Autres secteurs : Écloseries',
  'Autres secteurs : Fabrication de cages flottantes',
  'Autres secteurs : Fabrication de filets de pêche',
  'Autres secteurs : Équipements pour élevage de poissons',
  'Autres secteurs : Équipements pour la pêche professionnelle',
  'Autres secteurs : Appareils de pêche et navires',
  'Autres secteurs : Construction navale',
  'Autres secteurs : Équipements portuaires',
  'Autres secteurs : Hygiène et santé des poissons',
  'Autres secteurs : Transformation des produits halieutiques',
  'Autres secteurs : Biotechnologies marines',
  'Autres secteurs : Énergies renouvelables',
  'Autres secteurs : Consultance',
  'Autres secteurs : Commerce et distribution',
  'Autres secteurs : Logistique',
  'Autres secteurs : Écotourisme et pêche récréative',
  'Autres secteurs : Finance et investissements',
  'Autres secteurs : Bateaux de plaisance',
  'Autres secteurs : Centres de recherche',
  'Autres secteurs : Plongée sous-marine',
  'Autres secteurs : Assurance',
  'Autres secteurs : Banque',
  'Autres secteurs : Coopérative',
  'Autres secteurs : Association',
  'Autres : À préciser',
];
const OTHER_SECTOR_ID = '37';

/* ================================================================ */
/* HELPERS                                                           */
/* ================================================================ */

const round2 = (n: number) => Math.round(n * 100) / 100;

const clampInt = (value: string, min: number, max: number) => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ================================================================ */
/* COMPONENT                                                         */
/* ================================================================ */

export default function ExposantInternationalForm() {
  const { t, locale } = useLanguage();
  /* French / Arabic: EUR tariff; English: USD tariff (see lib/currency.ts) */
  const { currency, price, format: formatMoney } = useCurrency();
  const { tariff, loading: tariffLoading } = useTariff(currency);

  /* SERVICES SUPPLEMENTAIRES: only the PocketBase catalogues
     (*_erro in EUR, *_dollar in USD) — no local list. */
  const serviceTabs = tariff.services;
  const allServices = useMemo(() => Object.values(serviceTabs).flat(), [serviceTabs]);

  /* ---------------- Participation ---------------- */
  const [raisonSociale, setRaisonSociale] = useState('');
  const [pays, setPays] = useState('');
  const [secteurId, setSecteurId] = useState('');
  const [autreSecteur, setAutreSecteur] = useState('');
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

  /* The city is matched against the wilayas only for Algeria. */
  const villeIsWilaya = isAlgeria(pays);

  /* ---------------- Stand ---------------- */
  const [choixStand, setChoixStand] = useState<StandTypeCode | ''>('');
  const [superficie, setSuperficie] = useState('');
  const [facadeCode, setFacadeCode] = useState('');
  const [adCode, setAdCode] = useState('');

  /* ---------------- Services ---------------- */
  const [activeService, setActiveService] = useState<ServiceCategory>('Chaise');
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});
  const [hostessSelected, setHostessSelected] = useState(false);
  const [hostessCount, setHostessCount] = useState(1);
  const [hostessDays, setHostessDays] = useState(1);

  /* ---------------- Signage ---------------- */
  const [nomEnseigne, setNomEnseigne] = useState('');

  /* ---------------- Conditions ---------------- */
  const [acceptTva, setAcceptTva] = useState(false);
  const [acceptAnnulation, setAcceptAnnulation] = useState(false);
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  /* ---------------- Anti-spam honeypot ---------------- */
  const [honeypot, setHoneypot] = useState('');

  /* ---------------- Submission ---------------- */
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  /* ================================================================ */
  /* CALCULATIONS                                                      */
  /* ================================================================ */

  const standType = STAND_TYPES.find((s) => s.code === choixStand);
  const surfaceM2 = Number(superficie || 0);

  // Every surface is offered for every stand type
  const availableSurfaces = SURFACES;

  /* Every amount below is in the current currency (EUR or USD) */
  const registrationFee = tariff.registration;
  const electricityRate = price(ELECTRICITY_RATE);
  const hostessRate = price(HOSTESS_RATE);

  const prixStand = standType ? round2(tariff.stand[standType.code] * surfaceM2) : 0;
  const electricite = round2(surfaceM2 * EVENT_DAYS * electricityRate); // = 20 × S in EUR

  const facade = FACADES.find((f) => f.code === facadeCode);
  const majoration = facade ? tariff.facade[facade.code] : 0;

  const ad = ADS.find((a) => a.code === adCode);
  const publicite = ad ? tariff.catalogue[ad.code] : 0;

  const selectedAdditionalServices = allServices.filter(
    (s) => selectedServices[s.id]
  ).map((s) => ({ ...s, qty: selectedServices[s.id] }));

  const totalAdditionalServices = selectedAdditionalServices.reduce(
    (sum, s) => sum + s.price * s.qty,
    0
  );

  const hostessTotal = hostessSelected
    ? round2(hostessRate * hostessCount * hostessDays)
    : 0;

  const totalHT = round2(
    registrationFee +
      prixStand +
      electricite +
      majoration +
      publicite +
      totalAdditionalServices +
      hostessTotal
  );
  const tva = round2(totalHT * VAT_RATE);
  const totalTTC = round2(totalHT + tva);

  const allocation = ALLOCATIONS[surfaceM2];
  const badges = allocation?.badges ?? 0;
  const macarons = allocation?.macarons ?? 0;

  /* ================================================================ */
  /* HANDLERS                                                          */
  /* ================================================================ */

  const handleStandTypeChange = (code: string) => {
    const next = STAND_TYPES.find((s) => s.code === code);
    setChoixStand(next ? next.code : '');
  };

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
      else next[id] = Math.min(quantity, 999);
      return next;
    });
  };

  /* ================================================================ */
  /* VALIDATION                                                        */
  /* ================================================================ */

  const getValidationError = (): string | null => {
    const required: Array<[string, string]> = [
      ['Raison Sociale', raisonSociale],
      ["Secteur d'activité", secteurId],
      ['N° Identifiant fiscal', identifiantFiscal],
      ['Adresse', adresse],
      ['Ville', ville],
      ['Pays', pays],
      ['Personne à contacter', personneContact],
      ['Tél', tel],
      ['Mobile', mobile],
      ['Email', email],
      ['Type de stand', choixStand],
      ['Superficie', superficie],
      ["Nom sur l'enseigne", nomEnseigne],
    ];
    if (secteurId === OTHER_SECTOR_ID) {
      required.push(['Préciser le secteur', autreSecteur]);
    }

    const missing = required
      .filter(([, v]) => v.trim() === '')
      .map(([label]) => t(label));

    if (missing.length > 0) {
      return `${t('Champs obligatoires manquants :')} ${missing.join(', ')}`;
    }
    if (!EMAIL_RE.test(email.trim())) {
      return t("L'adresse email n'est pas valide.");
    }
    if (!(acceptTva && acceptAnnulation && acceptConditions)) {
      return t('Veuillez accepter les trois conditions.');
    }
    return null;
  };

  /* ================================================================ */
  /* SUBMIT                                                            */
  /* ================================================================ */

  const handleSubmit = async () => {
    if (loading || submitted || tariffLoading) return;

    setMessage('');
    setIsSuccess(false);

    // Bots fill the hidden field: pretend success, send nothing
    if (honeypot.trim() !== '') {
      setSubmitted(true);
      setIsSuccess(true);
      setMessage(t('Demande envoyée avec succès.'));
      return;
    }

    const error = getValidationError();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);

    try {
      const sectorLabel =
        secteurId === OTHER_SECTOR_ID
          ? `Autres : ${autreSecteur.trim()}`
          : SECTORS[Number(secteurId) - 1];

      const textValues: Record<string, string> = {
        company_name: raisonSociale,
        country: canonicalCountry(pays),
        sector_activity: sectorLabel,
        contact_person: personneContact,
        company_registration_no: registreCommerce,
        phone: tel,
        tax_id_no: identifiantFiscal,
        fax,
        address: adresse,
        website: siteWeb,
        city: villeIsWilaya ? canonicalWilaya(ville) : ville.trim(),
        mobile,
        email,
        fascia_company_name: nomEnseigne,
      };

      const data: Record<string, unknown> = Object.fromEntries(
        Object.entries(textValues)
          .map(([k, v]) => [k, v.trim()])
          .filter(([, v]) => v !== '')
      );

      /* Selections — the server hook recomputes every amount from these */
      // Text code, not a price — sent exactly as the PocketBase select option.
      data.stand_type = PB_STAND_TYPE[choixStand as StandTypeCode];
      data.surface = surfaceM2;
      if (facade) data.facade = facade.value;
      if (ad) data.catalogue = ad.value;

      data.ADDITIONAL_SERVICES = selectedAdditionalServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        qty: s.qty,
        unit: s.unit ?? 'event',
      }));

      data.hostess_selected = hostessSelected;
      data.hostess_count = hostessSelected ? hostessCount : 0;
      data.hostess_days = hostessSelected ? hostessDays : 0;

      data.exhibitor_badges = badges;
      data.access_passes = macarons;

      data.terms_prices_excl_tax = acceptTva;
      data.terms_no_refund = acceptAnnulation;
      data.terms_general_conditions = acceptConditions;

      /* Informational only — overwritten server-side */
      data.stand_price = prixStand;
      data.electricity = electricite;
      data.services_total = totalAdditionalServices;
      data.hostess_total = hostessTotal;
      data.total_ht = totalHT;
      data.tva = tva;
      data.total_ttc = totalTTC;
      /* Amounts above are in this currency. facade / catalogue stay the
         EUR option codes, because those PocketBase select fields only
         accept the euro values. */
      data.currency = currency;
      data.STATUS = 'received';

      const record = await pb.collection('Exposant_International').create(data);

      /* The request is saved; a failed invoice must not turn it into an error. */
      try {
        await storeFacture(record, tariff);
      } catch (factureError) {
        console.error('Facture PDF not stored:', factureError);
      }

      setSubmitted(true);
      setIsSuccess(true);
      setMessage(t('Demande envoyée avec succès.'));
    } catch (err) {
      console.error('PocketBase error:', err);
      setIsSuccess(false);
      setMessage(describePbError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* UI HELPERS                                                        */
  /* ================================================================ */

  const inputClass =
    'w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500 disabled:opacity-50';

  const textField = (
    label: string,
    value: string,
    setter: (v: string) => void,
    options: { required?: boolean; type?: string; placeholder?: string } = {}
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-black">
        {t(label)} {options.required && '*'}
      </label>
      <input
        type={options.type ?? 'text'}
        value={value}
        placeholder={options.placeholder}
        onChange={(e) => setter(e.target.value)}
        className={inputClass}
      />
    </div>
  );

  const priceRow = (label: string, amount: number, strong = false) => (
    <div className="flex items-center justify-between">
      <span
        className={
          strong
            ? 'text-lg font-bold text-gray-600'
            : 'text-[#0ea5e9] text-xl font-bold'
        }
      >
        {t(label)}
      </span>
      <span className={strong ? 'text-xl font-black text-black' : 'text-xl font-bold text-black'}>
        {formatMoney(amount)}
      </span>
    </div>
  );

  const currentServices = serviceTabs[activeService];

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */

  return (
    <div className="flex flex-col gap-10">
      {/* TITLE */}
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

      {/* HONEYPOT — invisible to people, filled by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website confirmation
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {/* ========================================================== */}
      {/* 1 — DEMANDE DE PARTICIPATION                              */}
      {/* ========================================================== */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('Demande de participation:')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">
          {textField('Raison Sociale', raisonSociale, setRaisonSociale, { required: true })}
          <LocationField
            kind={'country'}
            label="Pays"
            value={pays}
            onChange={setPays}
            required
            inputClass={inputClass}
            labelClass="text-sm font-bold text-black"
          />

          {/* SECTOR — fixed list like the original, with "other" */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Secteur d'activité")} *
            </label>
            <select
              value={secteurId}
              onChange={(e) => setSecteurId(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez un secteur')}</option>
              {SECTORS.map((label, i) => (
                <option key={label} value={String(i + 1)}>
                  {t(label)}
                </option>
              ))}
            </select>
            {secteurId === OTHER_SECTOR_ID && (
              <input
                type="text"
                placeholder={t('Préciser le secteur')}
                value={autreSecteur}
                onChange={(e) => setAutreSecteur(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          {textField('Personne à contacter', personneContact, setPersonneContact, { required: true })}
          {textField('Registre de commerce N°', registreCommerce, setRegistreCommerce)}
          {textField('Tél', tel, setTel, { required: true, type: 'tel' })}
          {textField('N° Identifiant fiscal', identifiantFiscal, setIdentifiantFiscal, { required: true })}
          {textField('Fax', fax, setFax, { type: 'tel' })}
          {textField('Adresse', adresse, setAdresse, { required: true })}
          {textField('Site web', siteWeb, setSiteWeb, { type: 'url', placeholder: 'https://...' })}
          <LocationField
            kind={villeIsWilaya ? 'wilaya' : 'text'}
            label="Ville"
            value={ville}
            onChange={setVille}
            required
            inputClass={inputClass}
            labelClass="text-sm font-bold text-black"
          />
          {textField('Mobile', mobile, setMobile, { required: true, type: 'tel' })}
          {textField('Email', email, setEmail, { required: true, type: 'email' })}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-[#0ea5e9] text-2xl font-bold">
            {t("Droits d'inscription:")}
          </span>
          <span className="text-black text-2xl font-bold">
            {formatMoney(registrationFee)}
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
            <label className="text-sm font-bold text-black">{t('Type de stand')} *</label>
            <select
              value={choixStand}
              onChange={(e) => handleStandTypeChange(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez un stand')}</option>
              {STAND_TYPES.map((s) => (
                <option key={s.code} value={s.code}>
                  {`${t(s.label)} (${formatMoney(tariff.stand[s.code])}/m²)`}
                </option>
              ))}
            </select>
          </div>

          {/* SURFACE — all sizes, whatever the stand type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">{t('Superficie')} *</label>
            <select
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez la superficie')}</option>
              {availableSurfaces.map((s) => (
                <option key={s} value={String(s)}>
                  {s} m²
                </option>
              ))}
            </select>
          </div>

          {/* FACADES */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Majoration façades supplémentaires (forfait)')}
            </label>
            <select
              value={facadeCode}
              onChange={(e) => setFacadeCode(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sans façade supplémentaire')}</option>
              {FACADES.map((f) => (
                <option key={f.code} value={f.code}>
                  {`${t(f.label)} — ${formatMoney(tariff.facade[f.code])}`}
                </option>
              ))}
            </select>
          </div>

          {/* CATALOGUE */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Publicité sur le catalogue')}
            </label>
            <select
              value={adCode}
              onChange={(e) => setAdCode(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sans publicité')}</option>
              {ADS.map((a) => (
                <option key={a.code} value={a.code}>
                  {`${t(a.label)} — ${formatMoney(tariff.catalogue[a.code])}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm font-bold text-black mt-2">
          {t("L'aménagement du stand comprend : moquette, cloisons, 1 table, 3 chaises, 3 spots, signalétique, prise de raccordement électrique 220V")}
        </p>

        <div className="flex flex-col gap-5 mt-2">
          {priceRow('Prix stand :', prixStand)}
          <div className="flex flex-col gap-1">
            {priceRow('Électricité :', electricite)}
            <span className="text-xs text-gray-500">
              {`${surfaceM2} m² × ${EVENT_DAYS} ${t('jours')} × ${formatMoney(electricityRate)}`}
            </span>
          </div>
          {priceRow('Façades :', majoration)}
          {priceRow('Publicité catalogue :', publicite)}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3 — SERVICES SUPPLEMENTAIRES                              */}
      {/* ========================================================== */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('SERVICES SUPPLEMENTAIRES:')}
        </div>

        <div className="bg-gray-300/80 rounded-lg p-2 flex flex-wrap gap-2 text-base font-bold mt-2">
          {(Object.keys(serviceTabs) as ServiceCategory[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveService(category)}
              className={`py-3 px-6 rounded-md transition-colors ${
                activeService === category
                  ? 'bg-[#38bdf8] text-white'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {t(category)}
            </button>
          ))}
        </div>

{currentServices.length === 0 && (
          <p className="mt-4 text-sm text-gray-600">
            {tariffLoading ? t('Chargement…') : t('Aucun article disponible pour le moment.')}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {currentServices.map((service) => {
            const selected = !!selectedServices[service.id];
            const quantity = selectedServices[service.id] || 0;
            const unitLabel = service.unit === 'm2' ? 'm²' : t('Événement');

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
                <div
                  className="flex flex-col gap-2 cursor-pointer flex-1 pr-4"
                  onClick={() => toggleService(service.id)}
                >
                  <span className={`font-bold text-sm ${selected ? 'text-[#38bdf8]' : 'text-black'}`}>
                    {serviceName(service.name, locale)}
                  </span>
                  <span className={`text-sm ${selected ? 'text-gray-400' : 'text-gray-600'}`}>
                    {`${formatMoney(service.price)} HT / ${unitLabel}`}
                  </span>
                  {selected && (
                    <span className="text-sm font-semibold text-gray-400">
                      {`${quantity} × ${formatMoney(service.price)} = ${formatMoney(round2(service.price * quantity))}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    aria-label={`${t('Sélectionner')} ${serviceName(service.name, locale)}`}
                    aria-pressed={selected}
                    onClick={() => toggleService(service.id)}
                    className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                      selected ? 'border-[#38bdf8] bg-black' : 'border-gray-300 bg-black'
                    }`}
                  >
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />}
                  </button>

                  {selected && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={t('Diminuer')}
                        onClick={() => changeQuantity(service.id, quantity - 1)}
                        className="w-8 h-8 rounded bg-white text-black font-bold hover:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-white font-bold">{quantity}</span>
                      <button
                        type="button"
                        aria-label={t('Augmenter')}
                        onClick={() => changeQuantity(service.id, quantity + 1)}
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

        {/* HOSTESS — 100 € × people × days (max 4 days) */}
        <div className="border border-gray-300 rounded-xl p-6 flex flex-col gap-4 bg-[#f8fafc]">
          <label className="flex items-center gap-3 cursor-pointer w-fit text-sm font-bold text-black">
            <input
              type="checkbox"
              checked={hostessSelected}
              onChange={(e) => setHostessSelected(e.target.checked)}
              className="w-5 h-5 accent-[#0ea5e9] rounded-sm"
            />
            {`${t("Hôtesse d'accueil")} — ${formatMoney(hostessRate)} HT / ${t('personne')} / ${t('jour')}`}
          </label>

          {hostessSelected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-black">{t('Nombre de personnes')}</label>
                <input
                  type="number"
                  min={1}
                  max={HOSTESS_MAX_PEOPLE}
                  step={1}
                  value={hostessCount}
                  onChange={(e) => setHostessCount(clampInt(e.target.value, 1, HOSTESS_MAX_PEOPLE))}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-black">{t('Nombre de jours')}</label>
                <input
                  type="number"
                  min={1}
                  max={HOSTESS_MAX_DAYS}
                  step={1}
                  value={hostessDays}
                  onChange={(e) => setHostessDays(clampInt(e.target.value, 1, HOSTESS_MAX_DAYS))}
                  className={inputClass}
                />
              </div>
              <span className="text-sm font-bold text-black pb-2">
                {`${formatMoney(hostessRate)} × ${hostessCount} × ${hostessDays} = ${formatMoney(hostessTotal)}`}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col gap-3">
          {priceRow('Services supplémentaires :', totalAdditionalServices)}
          {priceRow('Hôtesses :', hostessTotal)}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 4 — SIGNALETIQUE                                           */}
      {/* ========================================================== */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('SIGNALETIQUE DU STAND:')}
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-sm font-bold text-black">
            {t("Nom de la société à faire figurer sur l'enseigne du stand (Maximum 20 caractères) :")} *
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Nombre de badges exposants (calculé automatiquement)')}
            </label>
            <input
              type="text"
              readOnly
              value={allocation ? String(badges) : t('Veuillez choisir la superficie')}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Macarons (calculé automatiquement)')}
            </label>
            <input
              type="text"
              readOnly
              value={allocation ? String(macarons) : t('Veuillez choisir la superficie')}
              className={inputClass}
            />
          </div>
        </div>
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

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                id="accept-conditions"
                type="checkbox"
                checked={acceptConditions}
                onChange={(e) => setAcceptConditions(e.target.checked)}
                className="w-5 h-5 accent-white rounded-sm"
              />
              <label htmlFor="accept-conditions" className="cursor-pointer">
                {t("J'accepte les conditions générales")}
              </label>
              <button
                type="button"
                onClick={() => setShowConsent((v) => !v)}
                aria-expanded={showConsent}
                className="underline text-sky-300"
              >
                {showConsent ? t('Masquer') : t('Lire')}
              </button>
            </div>

            {showConsent && (
              <p className="bg-white/10 rounded-lg p-4 font-normal leading-relaxed max-w-[900px]">
                {t("Je consens à ce que la Chambre Algérienne de la Pêche et de l'Aquaculture collecte et traite mes données à caractère personnel, que j'ai introduites dans ce formulaire, dans le cadre du traitement de ma demande en ligne, conformément à la loi 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel. La CAPA vous informe de vos droits à l'information, l'accès, la rectification et l'opposition au traitement de vos données à caractère personnel.")}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mt-2">
          {t("Le soussigné confirme sa participation au 10ème Salon International de la Pêche et de l'Aquaculture qui se tiendra Du 06 Au 09 novembre 2025 au Centre de Conventions d'Oran et déclare avoir pris connaissance du règlement général du salon et s'engage à en respecter toutes les clauses et les conditions.")}
        </p>

        {/* TOTAL */}
        <div className="w-full bg-white rounded-xl mt-6 p-8 md:p-12 flex flex-col gap-4 shadow-lg">
          {priceRow("Droits d'inscription", registrationFee, true)}
          {priceRow('Stand', prixStand, true)}
          {priceRow('Électricité', electricite, true)}
          {priceRow('Façades', majoration, true)}
          {priceRow('Publicité catalogue', publicite, true)}
          {priceRow('Services supplémentaires', totalAdditionalServices, true)}
          {priceRow('Hôtesses', hostessTotal, true)}

          <div className="border-t border-gray-200 my-2" />

          {priceRow('Total HT', totalHT, true)}
          {priceRow('TVA (19%)', tva, true)}

          <div className="border-t border-gray-200 my-2" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <span className="text-2xl font-black text-black uppercase tracking-wide">
                {t('Total à payer')}
              </span>
              <span className="text-base font-bold text-gray-500">{t('TVA (19%) incluse')}</span>
            </div>
            <span className="text-4xl font-black text-[#0ea5e9]">{formatMoney(totalTTC)}</span>
          </div>
        </div>

        {message && (
          <p
            role="status"
            className={`text-sm font-semibold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}
          >
            {message}
          </p>
        )}

        {/* Only disabled while sending or after success, so the user
            always sees why a submission is refused */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || submitted || tariffLoading}
          className="bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold h-[88px] rounded-xl text-2xl hover:bg-[#0284c7] transition-colors"
        >
          {loading
            ? t('ENVOI...')
            : submitted
              ? t('Demande envoyée')
              : t('Envoyer la demande')}
        </button>
      </div>
    </div>
  );
}