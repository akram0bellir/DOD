'use client';

import { useState } from 'react';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { useLanguage } from '@/lib/i18n';

// These MUST match the option values declared on the Secteur_dactivite
// field in PocketBase, character for character, accents included.
// If that field is a plain text field, any value is accepted and this
// array is purely a UI concern.
const SECTEURS = ['Peche', 'Aquaculture', 'Equipements', 'Autres'];

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL ??
  'https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com';

const pb = new PocketBase(PB_URL);

// PocketBase puts the real reason in error.response.data, keyed by field:
// { Secteur_dactivite: { code: 'validation_in_invalid', message: '...' } }
// error.message is always the generic "Failed to create record."
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

  return 'Une erreur est survenue lors de l’envoi de votre demande.';
}

export default function VisiteurB2BForm() {
  const { t } = useLanguage();

  // =========================
  // FORM STATES
  // =========================

  const [visitorsName, setVisitorsName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [secteur, setSecteur] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [commercialRegisterN, setCommercialRegisterN] = useState('');
  const [mobile, setMobile] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [pays, setPays] = useState('');
  const [autreSecteur, setAutreSecteur] = useState('');

  const [tva, setTva] = useState(false);
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tva || !consent) return;

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      // Only the sector value itself goes into the select-backed field.
      // The free-text precision for "Autres" is kept apart, because a
      // select field rejects any value outside its declared options.
      const values: Record<string, string> = {
        Visitors_name: visitorsName,
        Contact_person: contactPerson,
        Secteur_dactivite: secteur,
        phone: phone,
        Fax: fax,
        Commercial_Register_N: commercialRegisterN,
        Mobile: mobile,
        Tax_ID_number: taxIdNumber,
        Email: email,
        Adresse: adresse,
        Ville: ville,
        Site_web: siteWeb,
        Pays: pays,
      };

      // If your collection has a text column for the free-text sector,
      // put its real name here and uncomment. Otherwise leave it out:
      // sending an unknown field name is a 400 on recent PocketBase.
      // if (secteur === 'Autres' && autreSecteur) {
      //   values.Autre_secteur = autreSecteur;
      // }

      // Empty strings are rejected by non-text field types (url, email,
      // number, date). Optional blanks are simply not sent.
      const data = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== '')
      );

      const record = await pb
        .collection('Visiteur_professionnel_B2B')
        .create(data);

      console.log('Record created:', record.id, record);

      setIsSuccess(true);
      setMessage(t('Votre demande a été envoyée avec succès.'));

      // Reset form
      setVisitorsName('');
      setContactPerson('');
      setSecteur('');
      setPhone('');
      setFax('');
      setCommercialRegisterN('');
      setMobile('');
      setTaxIdNumber('');
      setEmail('');
      setAdresse('');
      setVille('');
      setSiteWeb('');
      setPays('');
      setAutreSecteur('');
      setTva(false);
      setConsent(false);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* Title Section */}
      <div className="flex flex-col gap-4 text-white">
        <h1 className="text-4xl font-bold tracking-wide">
          {t('Visiteur professionnel B2B')}
        </h1>

        <p className="font-semibold text-base max-w-[700px] leading-relaxed">
          {t('Renseignez vos informations pour accéder aux badges professionnels et planifier vos rendez-vous B2B.')}
        </p>
      </div>

      {/* Section 1: Informations sur le visiteur */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('INFORMATIONS SUR LE VISITEUR:')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          {/* Dénomination */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Dénomination du visiteur')} *
            </label>

            <input
              type="text"
              name="raison_sociale"
              required
              value={visitorsName}
              onChange={(e) => setVisitorsName(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Personne à contacter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Personne à contacter')}
            </label>

            <input
              type="text"
              name="p_a_contacter"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Secteur */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Secteur d'activité")} *
            </label>

            <select
              name="secteur"
              required
              value={secteur}
              onChange={(e) => setSecteur(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            >
              <option value="">{t("Secteur d'activité")} *</option>

              {SECTEURS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Téléphone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Tél')} *
            </label>

            <input
              type="text"
              name="telephone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Autre secteur */}
          {secteur === 'Autres' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-black">
                {t('Préciser le secteur')}
              </label>

              <input
                type="text"
                name="autre_secteur"
                value={autreSecteur}
                onChange={(e) => setAutreSecteur(e.target.value)}
                className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Fax */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Fax')}
            </label>

            <input
              type="text"
              name="fax"
              value={fax}
              onChange={(e) => setFax(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Registre de commerce */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Registre de commerce N°')}
            </label>

            <input
              type="text"
              name="rc"
              value={commercialRegisterN}
              onChange={(e) => setCommercialRegisterN(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Mobile')}
            </label>

            <input
              type="text"
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Identifiant fiscal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('N° Identifiant fiscal')}
            </label>

            <input
              type="text"
              name="nif"
              value={taxIdNumber}
              onChange={(e) => setTaxIdNumber(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Email')} *
            </label>

            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Adresse */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Adresse')} *
            </label>

            <input
              type="text"
              name="adresse"
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Site web */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Site web')}
            </label>

            <input
              type="text"
              name="siteweb"
              placeholder="https://..."
              value={siteWeb}
              onChange={(e) => setSiteWeb(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Ville */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Ville')} *
            </label>

            <input
              type="text"
              name="ville"
              required
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Pays */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Pays')} *
            </label>

            <input
              type="text"
              name="pays"
              required
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Droits d'inscription */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-4">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t("DROITS D'INSCRIPTION:")}
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              15 000 DA
            </span>

            <span className="text-black text-base font-semibold">
              / {t('Visiteur national')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#0ea5e9] text-2xl font-bold">
              250 €
            </span>

            <span className="text-black text-base font-semibold">
              / {t('Visiteur international')}
            </span>
          </div>
        </div>
      </div>

      {/* Consent & submission */}
      <div className="flex flex-col gap-6">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('CONFIRMATION:')}
        </div>

        <div className="flex flex-col gap-4 text-white text-sm font-bold">

          {/* TVA */}
          <label className="flex items-start gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              required
              checked={tva}
              onChange={(e) => setTva(e.target.checked)}
              className="w-5 h-5 accent-white rounded-sm mt-0.5 shrink-0"
            />

            <span className="font-normal leading-relaxed">
              {t('Les prix sont donnés en hors-taxe, il y a lieu de compter en sus 19 % de TVA.')}
            </span>
          </label>

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-5 h-5 accent-white rounded-sm mt-0.5 shrink-0"
            />

            <span className="font-normal leading-relaxed">
              {t("J'autorise la Chambre Algérienne de la Pêche et de l'Aquaculture à collecter et traiter mes données personnelles dans le cadre de la validation de ma demande d'inscription, conformément à la loi 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.")}
            </span>
          </label>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-sm font-semibold ${
              isSuccess ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* Submit Box */}
        <div className="w-full bg-white rounded-xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center shadow-lg min-h-[120px]">

          <div className="flex flex-col gap-2 w-full md:w-auto text-center md:text-left">
            <span className="text-2xl font-black text-black uppercase tracking-wide">
              {t('Envoyer la demande')}
            </span>

            <span className="text-base font-bold text-gray-500">
              {t('Vous recevrez votre badge professionnel par email')}
            </span>
          </div>

          <button
            type="submit"
            disabled={!tva || !consent || loading}
            className="mt-6 md:mt-0 bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-md px-10 h-12 hover:bg-[#0284c7] transition-colors text-sm tracking-wide"
          >
            {loading ? t('ENVOI...') : t('ENVOYER')}
          </button>
        </div>
      </div>
    </form>
  );
}