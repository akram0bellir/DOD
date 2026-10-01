'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { useLanguage } from '@/lib/i18n';
import { storeFacture } from '@/lib/facture';

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
/* PRICING CONSTANTS (same values as the original SIPA page)         */
/* ================================================================ */

const DROITS_INSCRIPTION = 20000;
const ELECTRICITE_DA_PAR_M2_JOUR = 20;
const JOURS_SALON = 4;
const TVA_RATE = 0.19;
const HOSTESS_MAX_DAYS = JOURS_SALON;

/* ================================================================ */
/* SECTEURS D'ACTIVITÉ (select with 37 options, 37 = "à préciser")   */
/* ================================================================ */

const SECTEURS: { id: number; label: string }[] = [
  { id: 1, label: 'Pêche : Pêche artisanale' },
  { id: 2, label: 'Pêche : Pêche côtière' },
  { id: 3, label: 'Pêche : Pêche industrielle' },
  { id: 4, label: 'Pêche : Pêche au corail' },
  { id: 5, label: 'Pêche : Pêche continentale' },
  { id: 6, label: 'Pêche : Pêche récréative' },
  { id: 7, label: 'Pêche : Pêche au thon rouge' },
  { id: 8, label: 'Aquaculture : Aquaculture marine' },
  { id: 9, label: 'Aquaculture : Aquaculture continentale' },
  { id: 10, label: "Aquaculture : Pisciculture intégrée (produits d'eau douce)" },
  { id: 11, label: 'Autres secteurs : Aliments pour poissons' },
  { id: 12, label: 'Autres secteurs : Génétique et reproduction' },
  { id: 13, label: 'Autres secteurs : Écloseries' },
  { id: 14, label: 'Autres secteurs : Fabrication de cages flottantes' },
  { id: 15, label: 'Autres secteurs : Fabrication de filets de pêche' },
  { id: 16, label: 'Autres secteurs : Équipements pour élevage de poissons' },
  { id: 17, label: 'Autres secteurs : Équipements pour la pêche professionnelle' },
  { id: 18, label: 'Autres secteurs : Appareils de pêche et navires' },
  { id: 19, label: 'Autres secteurs : Construction navale' },
  { id: 20, label: 'Autres secteurs : Équipements portuaires' },
  { id: 21, label: 'Autres secteurs : Hygiène et santé des poissons' },
  { id: 22, label: 'Autres secteurs : Transformation des produits halieutiques' },
  { id: 23, label: 'Autres secteurs : Biotechnologies marines' },
  { id: 24, label: 'Autres secteurs : Énergies renouvelables' },
  { id: 25, label: 'Autres secteurs : Consultance' },
  { id: 26, label: 'Autres secteurs : Commerce et distribution' },
  { id: 27, label: 'Autres secteurs : Logistique' },
  { id: 28, label: 'Autres secteurs : Écotourisme et pêche récréative' },
  { id: 29, label: 'Autres secteurs : Finance et investissements' },
  { id: 30, label: 'Autres secteurs : Bateaux de plaisance' },
  { id: 31, label: 'Autres secteurs : Centres de recherche' },
  { id: 32, label: 'Autres secteurs : Plongée sous-marine' },
  { id: 33, label: 'Autres secteurs : Assurance' },
  { id: 34, label: 'Autres secteurs : Banque' },
  { id: 35, label: 'Autres secteurs : Coopérative' },
  { id: 36, label: 'Autres secteurs : Association' },
  { id: 37, label: 'Autres : À préciser' },
];

const SECTEUR_AUTRE_ID = 37;

/* ================================================================ */
/* STAND TYPES + ALLOWED SURFACES                                    */
/* Outdoor spaces start at 48 m², exactly like the original page.    */
/* ================================================================ */

const SURFACES_INTERIEUR = [
  12, 18, 24, 36, 48, 54, 60, 72, 80, 100, 120, 150, 200, 250, 300,
];
const SURFACES_DECOUVERT = SURFACES_INTERIEUR.filter((s) => s >= 48);

type StandType = {
  value: string; // price per m², kept as the value so stand_type stays numeric
  label: string;
  rate: number;
  surfaces: number[];
};

const STAND_TYPES: StandType[] = [
  {
    value: '17000',
    label: 'Stand aménagé (17.000 DA/m²)',
    rate: 17000,
    surfaces: SURFACES_INTERIEUR,
  },
  {
    value: '12000',
    label: 'Stand non aménagé (12.000 DA/m²)',
    rate: 12000,
    surfaces: SURFACES_INTERIEUR,
  },
  {
    value: '10000',
    label: 'Emplacement découvert (10.000 DA/m²)',
    rate: 10000,
    surfaces: SURFACES_DECOUVERT,
  },
];

const FACADES = [
  { value: '17000', label: 'Emplacement à 02 façades 17.000 DA' },
  { value: '22000', label: 'Emplacement à 03 façades 22.000 DA' },
  { value: '32000', label: 'Emplacement à 04 façades 32.000 DA' },
];

const PUBLICITES = [
  { value: '120000', label: '4ème page de couverture 120.000 DA' },
  { value: '100000', label: '3ème page de couverture 100.000 DA' },
  { value: '80000', label: '2ème page de couverture 80.000 DA' },
  { value: '32000', label: '1/2 page intérieure couleur 32.000 DA' },
];

/* ================================================================ */
/* BADGES / MACARONS — fixed lookup table from the original page.    */
/* This is NOT a formula: the organiser set these values by hand.    */
/* ================================================================ */

const BADGES_MACARONS: Record<number, { badges: number; macarons: number }> = {
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

/* ================================================================ */
/* SERVICES — IDs match the original "supplementN" numbering         */
/* ================================================================ */

type ServiceUnit = 'event' | 'm2' | 'person_day';

type Service = {
  id: string;
  name: string;
  price: number;
  unit: ServiceUnit;
};

type ServiceCategory =
  | 'Chaise'
  | 'Table'
  | 'Salon'
  | 'Electronique et accessoire'
  | 'Service';

const ev = (n: number, name: string, price: number): Service => ({
  id: `supplement${n}`,
  name,
  price,
  unit: 'event',
});

const SERVICE_CATALOGUE: Record<ServiceCategory, Service[]> = {
  Chaise: [
    ev(6, 'ALINEA B chair', 6500),
    ev(1, 'EVEREST B chair', 2500),
    ev(8, 'CONFORT high chair', 7000),
    ev(7, 'SIMILI high chair, black', 5500),
    ev(4, 'OR chair, red and beige', 2000),
    ev(5, 'PATCHWORK chair, grey', 8000),
    ev(3, 'RÉUNION N chair', 2500),
    ev(2, 'SCANDINAVE B chair', 4200),
  ],
  Table: [
    ev(18, 'STANDARD desk (80×35×90)', 10500),
    ev(19, 'STANDARD desk with panelling', 14000),
    ev(17, 'ROUNDED large table (120×90)', 14000),
    ev(16, 'SIMPLY large table (120×70)', 14000),
    ev(10, 'ATELIER table (140×65×70)', 10500),
    ev(15, 'TRIPODE coffee table (Ø60×60)', 8500),
    ev(14, 'CLASSIC high table (Ø60)', 8500),
    ev(13, 'SCANDINAVE high table (Ø60×100)', 8000),
    ev(9, 'RONDE table (Ø80×70)', 5000),
    ev(12, 'SCANDINAVE square glass table (85×85×75)', 8500),
    ev(11, 'SCANDINAVE round glass table (Ø80×75)', 7000),
  ],
  Salon: [
    ev(23, 'Premium lounge set, 4 seats + coffee table (red)', 60000),
    ev(20, 'Standard lounge chair, black, 1 seat', 7000),
    ev(21, 'Standard lounge set, black, 4 seats + coffee table', 25000),
    ev(24, 'VIP lounge set, 4 seats + coffee table', 50000),
    ev(22, 'STANDARD coffee table', 5500),
  ],
  'Electronique et accessoire': [
    ev(45, 'Plastic waste bin', 800),
    ev(46, 'Metal waste bin', 1600),
    ev(27, '32" LED TV screen', 20000),
    ev(28, '43" LED TV screen', 24000),
    ev(29, '50" LED TV screen', 36000),
    ev(30, '55" LED TV screen', 48000),
    ev(31, '65" LED TV screen', 100000),
    ev(44, 'Metal shelving unit', 6000),
    ev(42, 'Guide line stand', 5000),
    ev(26, 'Capsule coffee machine', 16000),
    { id: 'supplement40', name: 'Carpet', price: 1700, unit: 'm2' },
    ev(48, 'Power strips', 800),
    ev(39, 'Artificial plants', 5500),
    ev(38, 'A4 literature stand (MB27-M)', 16000),
    ev(36, 'A4 literature stand (MB27-P)', 8000),
    ev(37, 'A4 literature stand (MB27-PM)', 6500),
    ev(41, 'Aluminium storage door', 16000),
    ev(43, 'Lectern', 16000),
    ev(25, '90L refrigerator', 10500),
    ev(47, '3-spot electrical strip', 3200),
    ev(32, 'Floor-standing TV mount', 24000),
    ev(35, 'Display case MB26-BI', 21000),
    ev(33, 'Display case MB26-CO', 17000),
    ev(34, 'Display case MB26-UN', 17000),
  ],
  Service: [
    {
      id: 'supplement49',
      name: "Hôtesse d'accueil",
      price: 10000,
      unit: 'person_day',
    },
  ],
};

const SERVICE_CATEGORIES = Object.keys(SERVICE_CATALOGUE) as ServiceCategory[];
const ALL_SERVICES: Service[] = SERVICE_CATEGORIES.flatMap(
  (c) => SERVICE_CATALOGUE[c]
);

const UNIT_LABEL: Record<ServiceUnit, string> = {
  event: 'Événement',
  m2: 'm²',
  person_day: 'Pers / Jour',
};

const QTY_LABEL: Record<ServiceUnit, string> = {
  event: 'Qté',
  m2: 'm²',
  person_day: 'Pers.',
};

/* ================================================================ */
/* HELPERS                                                           */
/* ================================================================ */

const round2 = (n: number) => Math.round(n * 100) / 100;

const formatDA = (n: number) =>
  n.toLocaleString('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ================================================================ */
/* COMPONENT                                                         */
/* ================================================================ */

export default function ExposantNationalForm() {
  const { t } = useLanguage();

  const [activeService, setActiveService] =
    useState<ServiceCategory>('Chaise');

  /* -------------------------------------------------------------- */
  /* DEMANDE DE PARTICIPATION                                       */
  /* -------------------------------------------------------------- */

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

  /* Honeypot: real users never see or fill this field. */
  const [honeypot, setHoneypot] = useState('');

  /* -------------------------------------------------------------- */
  /* RESERVATION DE STAND                                           */
  /* -------------------------------------------------------------- */

  const [choixStand, setChoixStand] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [majorationFacades, setMajorationFacades] = useState('');
  const [publiciteCatalogue, setPubliciteCatalogue] = useState('');

  /* -------------------------------------------------------------- */
  /* SERVICES                                                        */
  /* -------------------------------------------------------------- */

  const [selectedServices, setSelectedServices] = useState<
    Record<string, number>
  >({});
  const [hostessDays, setHostessDays] = useState(1);

  /* -------------------------------------------------------------- */
  /* SIGNALETIQUE                                                    */
  /* -------------------------------------------------------------- */

  const [nomEnseigne, setNomEnseigne] = useState('');

  /* -------------------------------------------------------------- */
  /* CONDITIONS                                                      */
  /* -------------------------------------------------------------- */

  const [acceptTva, setAcceptTva] = useState(false);
  const [acceptAnnulation, setAcceptAnnulation] = useState(false);
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [showConditions, setShowConditions] = useState(false);

  /* -------------------------------------------------------------- */
  /* SUBMISSION STATE                                                */
  /* -------------------------------------------------------------- */

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  /* ================================================================ */
  /* STAND CALCULATIONS                                               */
  /* ================================================================ */

  const standType = STAND_TYPES.find((s) => s.value === choixStand);
  const availableSurfaces = standType?.surfaces ?? [];

  const prixParM2 = standType?.rate ?? 0;
  /* Like the original: no stand type means surface counts as 0. */
  const surfaceM2 = standType ? Number(superficie || 0) : 0;
  const surfaceValide =
    !!standType && availableSurfaces.includes(surfaceM2);

  const prixStand = prixParM2 * surfaceM2;

  /* Electricity = surface × 4 days × 20 DA  (= 80 × surface) */
  const electricite = surfaceM2 * JOURS_SALON * ELECTRICITE_DA_PAR_M2_JOUR;

  const majoration = Number(majorationFacades || 0);
  const publicite = Number(publiciteCatalogue || 0);

  /* Changing the stand type resets the surface (original stand_cat). */
  const handleStandTypeChange = (value: string) => {
    setChoixStand(value);
    setSuperficie('');
  };

  /* ================================================================ */
  /* SERVICES CALCULATIONS                                            */
  /* ================================================================ */

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

  const selectedAdditionalServices = ALL_SERVICES.filter(
    (service) => selectedServices[service.id]
  ).map((service) => {
    const qty = selectedServices[service.id];
    const days = service.unit === 'person_day' ? hostessDays : 1;
    return {
      ...service,
      qty,
      days,
      lineTotal: service.price * qty * days,
    };
  });

  const totalAdditionalServices = selectedAdditionalServices.reduce(
    (total, service) => total + service.lineTotal,
    0
  );

  const hostessLine = selectedAdditionalServices.find(
    (s) => s.unit === 'person_day'
  );

  /* ================================================================ */
  /* TOTALS                                                            */
  /* ================================================================ */

  const totalHT =
    DROITS_INSCRIPTION +
    prixStand +
    electricite +
    majoration +
    publicite +
    totalAdditionalServices;

  const tva = round2(totalHT * TVA_RATE);
  const totalTTC = round2(totalHT + tva);

  /* ================================================================ */
  /* BADGES / MACARONS                                                 */
  /* ================================================================ */

  const badgesMacarons = surfaceValide ? BADGES_MACARONS[surfaceM2] : null;

  /* ================================================================ */
  /* VALIDATION                                                         */
  /* ================================================================ */

  const isAutreSecteur = Number(secteurId) === SECTEUR_AUTRE_ID;

  const requiredFields: Array<[string, string]> = [
    ['Raison Sociale', raisonSociale],
    ["Secteur d'activité", secteurId],
    ...(isAutreSecteur
      ? ([['Préciser le secteur', autreSecteur]] as Array<[string, string]>)
      : []),
    ['Registre de commerce', registreCommerce],
    ['Identifiant fiscal', identifiantFiscal],
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

  const missing = requiredFields
    .filter(([, value]) => value.trim() === '')
    .map(([label]) => label);

  const emailValid = EMAIL_RE.test(email.trim());
  const termsAccepted = acceptTva && acceptAnnulation && acceptConditions;

  /* ================================================================ */
  /* SUBMIT                                                             */
  /* ================================================================ */

  const handleSubmit = async () => {
    setMessage('');
    setIsSuccess(false);

    /* Bot filled the hidden field: pretend success, send nothing. */
    if (honeypot.trim() !== '') {
      console.warn('Honeypot filled — submission NOT sent to PocketBase:', honeypot);
      setIsSuccess(true);
      setMessage(t('Demande envoyée avec succès.'));
      return;
    }

    if (missing.length > 0) {
      setMessage(`Champs obligatoires manquants : ${missing.join(', ')}`);
      return;
    }

    if (!emailValid) {
      setMessage("L'adresse email n'est pas valide.");
      return;
    }

    if (!surfaceValide) {
      setMessage("La superficie choisie n'est pas disponible pour ce type de stand.");
      return;
    }

    if (!termsAccepted) {
      setMessage('Veuillez accepter les trois conditions.');
      return;
    }

    setLoading(true);

    try {
      const secteur = SECTEURS.find((s) => s.id === Number(secteurId));
      const sectorValue = isAutreSecteur
        ? `Autres : ${autreSecteur.trim()}`
        : secteur?.label ?? '';

      const additionalServices = selectedAdditionalServices.map((s) => ({
        id: s.id,
        name: s.name,
        unit: s.unit,
        price: s.price,
        qty: s.qty,
        days: s.days,
        line_total: s.lineTotal,
      }));

      /* Text columns — empty optional values are dropped rather than
         sent as '', which non-text field types reject. */
      const textValues: Record<string, string> = {
        company_name: raisonSociale.trim(),
        country: pays.trim(),
        sector_activity: sectorValue,
        contact_person: personneContact.trim(),
        company_registration_no: registreCommerce.trim(),
        phone: tel.trim(),
        tax_id_no: identifiantFiscal.trim(),
        fax: fax.trim(),
        address: adresse.trim(),
        website: siteWeb.trim(),
        city: ville.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        fascia_company_name: nomEnseigne.trim(),
        STATUS: 'received',
      };

      const data: Record<string, unknown> = Object.fromEntries(
        Object.entries(textValues).filter(([, v]) => v !== '')
      );

      data.stand_type = prixParM2;
      data.surface = surfaceM2;

      if (majorationFacades !== '') data.facade = majoration;
      if (publiciteCatalogue !== '') data.catalogue = publicite;

      /* Sent as a real array for a `json` column. If ADDITIONAL_SERVICES
         is a plain `text` column instead, wrap it:
         JSON.stringify(additionalServices) */
      data.ADDITIONAL_SERVICES = additionalServices;

      data.exhibitor_badges = badgesMacarons?.badges ?? 0;
      data.access_passes = badgesMacarons?.macarons ?? 0;

      data.hostess_selected = !!hostessLine;

      data.terms_prices_excl_tax = acceptTva;
      data.terms_no_refund = acceptAnnulation;
      data.terms_general_conditions = acceptConditions;

      /* Informative only — the server must recalculate it. */
      data.total_ht = totalHT;

      const record = await pb.collection('Exposant_national').create(data);

      console.info('Saved to', PB_URL, '— record id:', record.id);

      /* The request is saved; a failed invoice must not turn it into an error. */
      try {
        await storeFacture(record);
      } catch (factureError) {
        console.error('Facture PDF not stored:', factureError);
      }

      setIsSuccess(true);
      setMessage(`${t('Demande envoyée avec succès.')} (Réf. ${record.id})`);
    } catch (error) {
      if (error instanceof ClientResponseError) {
        console.error('PocketBase error', error.status, error.response?.data);
      } else {
        console.error('PocketBase error', error);
      }

      setIsSuccess(false);
      setMessage(describePbError(error));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* STYLES                                                             */
  /* ================================================================ */

  const inputClass =
    'w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500 disabled:opacity-60';

  const labelClass = 'text-sm font-bold text-black';

  const textField = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    options: { required?: boolean; type?: string; placeholder?: string } = {}
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>
        {t(label)} {options.required && '*'}
      </label>
      <input
        type={options.type ?? 'text'}
        required={options.required}
        placeholder={options.placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={inputClass}
      />
    </div>
  );

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
          {t('Inscription exposant national')}
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

          {textField('Raison Sociale', raisonSociale, setRaisonSociale, { required: true })}
          {textField('Personne à contacter', personneContact, setPersonneContact, { required: true })}

          {/* SECTEUR — select, with "à préciser" for id 37 */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t("Secteur d'activité")} *</label>
            <select
              value={secteurId}
              onChange={(e) => {
                setSecteurId(e.target.value);
                if (Number(e.target.value) !== SECTEUR_AUTRE_ID) setAutreSecteur('');
              }}
              className={inputClass}
            >
              <option value="">{t("Sélectionnez un secteur")}</option>
              {SECTEURS.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.label)}
                </option>
              ))}
            </select>

            {isAutreSecteur && (
              <input
                type="text"
                required
                placeholder={t('Préciser le secteur')}
                value={autreSecteur}
                onChange={(e) => setAutreSecteur(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          {textField('Tél', tel, setTel, { required: true, type: 'tel' })}
          {textField('Registre de commerce N°', registreCommerce, setRegistreCommerce, { required: true })}
          {textField('Fax', fax, setFax, { type: 'tel' })}
          {textField('N° Identifiant fiscal', identifiantFiscal, setIdentifiantFiscal, { required: true })}
          {textField('Site web', siteWeb, setSiteWeb, { type: 'url', placeholder: 'https://...' })}
          {textField('Adresse', adresse, setAdresse, { required: true })}
          {textField('Mobile', mobile, setMobile, { required: true, type: 'tel' })}
          {textField('Ville', ville, setVille, { required: true })}
          {textField('Email', email, setEmail, { required: true, type: 'email' })}
          {textField('Pays', pays, setPays, { required: true })}

        </div>

        {/* HONEYPOT — hidden from people, visible to bots */}
        {/* No label and a meaningless name, so browser autofill and
            password managers don't recognise it and leave it empty. */}
        <div aria-hidden="true" className="absolute -left-[10000px] w-px h-px overflow-hidden">
          <input
            type="text"
            name="hp_x9q"
            tabIndex={-1}
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-[#0ea5e9] text-2xl font-bold">
            {t("Droits d'inscription:")}
          </span>
          <span className="text-black text-2xl font-bold">
            {formatDA(DROITS_INSCRIPTION)} DA
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
            <label className={labelClass}>{t('Type de stand')} *</label>
            <select
              value={choixStand}
              onChange={(e) => handleStandTypeChange(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sélectionnez un stand')}</option>
              {STAND_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(s.label)}
                </option>
              ))}
            </select>
          </div>

          {/* SURFACE — depends on stand type */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('Superficie')} *</label>
            <select
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
              disabled={!standType}
              className={inputClass}
            >
              <option value="">
                {standType
                  ? t('Sélectionnez la superficie')
                  : t("Choisissez d'abord le type de stand")}
              </option>
              {availableSurfaces.map((s) => (
                <option key={s} value={s}>
                  {s} m²
                </option>
              ))}
            </select>
          </div>

          {/* FACADES */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              {t('Majoration façades supplémentaires (forfait)')}
            </label>
            <select
              value={majorationFacades}
              onChange={(e) => setMajorationFacades(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sans façade supplémentaire')}</option>
              {FACADES.map((f) => (
                <option key={f.value} value={f.value}>
                  {t(f.label)}
                </option>
              ))}
            </select>
          </div>

          {/* CATALOGUE */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('Publicité sur le catalogue')}</label>
            <select
              value={publiciteCatalogue}
              onChange={(e) => setPubliciteCatalogue(e.target.value)}
              className={inputClass}
            >
              <option value="">{t('Sans publicité')}</option>
              {PUBLICITES.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(p.label)}
                </option>
              ))}
            </select>
          </div>

        </div>

        <p className="text-sm font-bold text-black mt-2">
          {t("L'aménagement du stand comprend : Moquette, cloisons, 1 table, 3 chaises, 3 spots, signalétiques prise de raccommodement électrique 220V")}
        </p>

        {/* PRICE BREAKDOWN */}
        <div className="flex flex-col gap-5 mt-2">

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Prix stand :')}
            </span>
            <span className="text-black text-2xl font-bold text-right">
              {surfaceValide && (
                <span className="block text-sm font-semibold text-gray-500">
                  {formatDA(prixParM2)} × {surfaceM2} m²
                </span>
              )}
              {formatDA(prixStand)} DA
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Électricité :')}
            </span>
            <span className="text-black text-2xl font-bold text-right">
              <span className="block text-sm font-semibold text-gray-500">
                {surfaceM2} m² × {JOURS_SALON} {t('jours')} × {ELECTRICITE_DA_PAR_M2_JOUR} DA
              </span>
              {formatDA(electricite)} DA
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Façades :')}
            </span>
            <span className="text-black text-2xl font-bold">
              {formatDA(majoration)} DA
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              {t('Publicité catalogue :')}
            </span>
            <span className="text-black text-2xl font-bold">
              {formatDA(publicite)} DA
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
          {SERVICE_CATEGORIES.map((category) => {
            const count = SERVICE_CATALOGUE[category].filter(
              (s) => selectedServices[s.id]
            ).length;

            return (
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
                {count > 0 && ` (${count})`}
              </button>
            );
          })}
        </div>

        {/* SERVICES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

          {SERVICE_CATALOGUE[activeService].map((service) => {
            const selected = !!selectedServices[service.id];
            const quantity = selectedServices[service.id] || 0;
            const isHostess = service.unit === 'person_day';

            return (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                className={`border rounded-xl p-6 flex flex-col gap-4 transition-colors shadow-sm ${
                  selected
                    ? 'border-black bg-black'
                    : 'border-gray-300 bg-[#f8fafc] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">

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
                      {t(service.name)}
                    </span>

                    <span
                      className={`text-sm ${
                        selected ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatDA(service.price)} DA HT / {t(UNIT_LABEL[service.unit])}
                    </span>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-3 shrink-0">

                    <button
                      type="button"
                      aria-label={`Sélectionner ${service.name}`}
                      aria-pressed={selected}
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
                          aria-label="Diminuer"
                          onClick={() => changeQuantity(service.id, quantity - 1)}
                          className="w-8 h-8 rounded bg-white text-black font-bold hover:bg-gray-200"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-white font-bold">
                          {quantity}
                          <span className="block text-[10px] font-normal text-gray-400">
                            {t(QTY_LABEL[service.unit])}
                          </span>
                        </span>

                        <button
                          type="button"
                          aria-label="Augmenter"
                          onClick={() => changeQuantity(service.id, quantity + 1)}
                          className="w-8 h-8 rounded bg-white text-black font-bold hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* HOSTESS DAYS (1–4) */}
                {selected && isHostess && (
                  <div className="flex items-center justify-between gap-3 text-white text-sm">
                    <label htmlFor="hostess-days" className="font-bold">
                      {t('Nombre de jours')}
                    </label>
                    <select
                      id="hostess-days"
                      value={hostessDays}
                      onChange={(e) => setHostessDays(Number(e.target.value))}
                      className="bg-white text-black rounded h-8 px-2"
                    >
                      {Array.from({ length: HOSTESS_MAX_DAYS }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* LINE TOTAL */}
                {selected && (
                  <div className="text-right text-sm text-gray-300">
                    {formatDA(service.price)} × {quantity}
                    {isHostess && ` × ${hostessDays} ${t('jour(s)')}`} ={' '}
                    <strong className="text-white">
                      {formatDA(service.price * quantity * (isHostess ? hostessDays : 1))} DA
                    </strong>
                  </div>
                )}
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
            {formatDA(totalAdditionalServices)} DA HT
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

        <div className="flex flex-col gap-1.5 mt-2">
          <label className={labelClass}>
            {t("Nom de la société à faire figurer sur l'enseigne du stand (Maximum 20 caractères) :")} *
          </label>

          <input
            type="text"
            required
            maxLength={20}
            value={nomEnseigne}
            onChange={(e) => setNomEnseigne(e.target.value)}
            className={inputClass}
          />

          <span className="text-xs text-gray-500">
            {nomEnseigne.length}/20 {t('caractères')}
          </span>
        </div>

        {/* BADGES / MACARONS — read-only, from the lookup table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              {t('Nombre de badges exposants (calculé automatiquement)')}
            </label>
            <input
              type="text"
              readOnly
              value={badgesMacarons ? badgesMacarons.badges : t('Veuillez choisir la superficie')}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              {t('Macarons (calculé automatiquement)')}
            </label>
            <input
              type="text"
              readOnly
              value={badgesMacarons ? badgesMacarons.macarons : t('Veuillez choisir la superficie')}
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

          <div className="flex items-center gap-3 w-fit">
            <input
              id="accept-conditions"
              type="checkbox"
              checked={acceptConditions}
              onChange={(e) => setAcceptConditions(e.target.checked)}
              className="w-5 h-5 accent-white rounded-sm cursor-pointer"
            />
            <label htmlFor="accept-conditions" className="cursor-pointer">
              {t("J'accepte")}
            </label>
            <button
              type="button"
              onClick={() => setShowConditions(true)}
              className="underline text-[#38bdf8] hover:text-white"
            >
              {t('les conditions générales')}
            </button>
          </div>

        </div>

        <p className="text-gray-400 text-sm leading-relaxed mt-2">
          {t("Le soussigné confirme sa participation au 10ème Salon International de la Pêche et de l'Aquaculture qui se tiendra Du 06 Au 09 novembre 2025 au Centre de Conventions d'Oran et déclare avoir pris connaissance du règlement général du salon et s'engage à en respecter toutes les clauses et les conditions.")}
        </p>

        {/* ======================================================== */}
        {/* TOTAL                                                     */}
        {/* ======================================================== */}

        <div className="w-full bg-white rounded-xl mt-6 p-8 md:p-12 flex flex-col gap-4 shadow-lg">

          {[
            ["Droits d'inscription", DROITS_INSCRIPTION],
            ['Stand', prixStand],
            ['Électricité', electricite],
            ['Façades', majoration],
            ['Publicité catalogue', publicite],
            ['Services supplémentaires', totalAdditionalServices],
          ].map(([label, amount]) => (
            <div key={label as string} className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">{t(label as string)}</span>
              <span className="font-bold text-black">{formatDA(amount as number)} DA</span>
            </div>
          ))}

          <div className="border-t border-gray-200 my-2" />

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">{t('Total HT')}</span>
            <span className="text-xl font-black text-black">{formatDA(totalHT)} DA</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-600">{t('TVA (19%)')}</span>
            <span className="text-xl font-black text-black">{formatDA(tva)} DA</span>
          </div>

          <div className="border-t border-gray-200 my-2" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <span className="text-2xl font-black text-black uppercase tracking-wide">
                {t('Total à payer')}
              </span>
              <span className="text-base font-bold text-gray-500">
                {t('TVA (19%) incluse')}
              </span>
            </div>
            <span className="text-4xl font-black text-[#0ea5e9]">
              {formatDA(totalTTC)} DA TTC
            </span>
          </div>

        </div>

        {/* MESSAGE */}
        {message && (
          <p
            role="alert"
            className={`text-sm font-semibold ${
              isSuccess ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* SUBMIT — only disabled while sending, so the user sees why
            a submission is refused instead of a dead button. */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold h-[88px] rounded-xl text-2xl hover:bg-[#0284c7] transition-colors"
        >
          {loading ? t('ENVOI...') : t('Soumettre la demande')}
        </button>

      </div>

      {/* ========================================================== */}
      {/* CONDITIONS GÉNÉRALES — loi 18-07 consent (original popup)  */}
      {/* ========================================================== */}

      {showConditions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowConditions(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl p-8 max-w-xl w-full flex flex-col gap-4 text-black text-sm leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              {t("Je consens à ce que la Chambre Algérienne de la Pêche et de l'Aquaculture collecte et traite mes données à caractère personnel, que j'ai introduites dans ce formulaire, et cela dans le cadre du traitement de ma demande en ligne, conformément à la loi 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.")}
            </p>
            <p>
              {t("La CAPA vous informe de vos droits à l'information, l'accès, la rectification et l'opposition au traitement de vos données à caractère personnel.")}
            </p>
            <button
              type="button"
              onClick={() => setShowConditions(false)}
              className="bg-[#0ea5e9] text-white font-bold rounded-md py-2 px-6 w-fit self-end hover:bg-[#0284c7]"
            >
              {t('Fermer')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}