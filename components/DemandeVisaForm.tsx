'use client';

import { useState } from 'react';
import PocketBase from 'pocketbase';
import { useLanguage } from '@/lib/i18n';

const pb = new PocketBase('https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com');

export default function DemandeVisaForm() {
  const { t } = useLanguage();
  // =========================
  // FORM STATES
  // =========================

  const [companyName, setCompanyName] = useState('');
  const [secteur, setSecteur] = useState('');
  const [commercialRegisterN, setCommercialRegisterN] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [telephone, setTelephone] = useState('');
  const [fax, setFax] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [siteweb, setSiteweb] = useState('');

  const [passportNumber, setPassportNumber] = useState('');
  const [autoriteEmettrice, setAutoriteEmettrice] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [purposeOfVisit, setPurposeOfVisit] = useState('');
  const [positionHeld, setPositionHeld] = useState('');
  const [arriveOn, setArriveOn] = useState('');
  const [departureOn, setDepartureOn] = useState('');

  // =========================
  // OTHER STATES
  // =========================

  const [consent, setConsent] = useState(false);
  const [scanFileName, setScanFileName] = useState('');
  const [scanFile, setScanFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!consent || !scanFile) return;

    setSubmitting(true);
    setMessage('');

    try {
      const data = {
        companyName: companyName,
        secteur: secteur,
        Commercial_Register_N: commercialRegisterN,
        Tax_ID_number: taxIdNumber,
        adresse: adresse,
        ville: ville,
        pays: pays,
        p_a_contacter: contactPerson,
        telephone: telephone,
        fax: fax,
        mobile: mobile,
        email: email,
        siteweb: siteweb,

        passportNumber: passportNumber,
        Autorite_emettrice: autoriteEmettrice,
        Date_of_issue: dateOfIssue,
        Expiration_date: expirationDate,
        Purpose_of_the_visit: purposeOfVisit,
        Position_held_: positionHeld,

        created_on: new Date().toISOString(),
        expire_on: expirationDate
          ? new Date(expirationDate).toISOString()
          : '',
        arrive_on: arriveOn
          ? new Date(arriveOn).toISOString()
          : '',
        departure_on: departureOn
          ? new Date(departureOn).toISOString()
          : '',

        s: 'received',
        note: '',
         scan: scanFile,
      };

      const record = await pb
        .collection('Demande_Invitation_Pour_Visa')
        .create(data);

      console.log('Record created:', record);

      setMessage(t('Votre demande a été envoyée avec succès.'));

      // =========================
      // RESET FORM
      // =========================

      setCompanyName('');
      setSecteur('');
      setCommercialRegisterN('');
      setTaxIdNumber('');
      setAdresse('');
      setVille('');
      setPays('');
      setContactPerson('');
      setTelephone('');
      setFax('');
      setMobile('');
      setEmail('');
      setSiteweb('');

      setPassportNumber('');
      setAutoriteEmettrice('');
      setDateOfIssue('');
      setExpirationDate('');
      setPurposeOfVisit('');
      setPositionHeld('');
      setArriveOn('');
      setDepartureOn('');

      setConsent(false);
      setScanFileName('');
      setScanFile(null);
    } catch (error) {
      console.error('PocketBase error:', error);

      setMessage(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de l’envoi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* Title Section */}
      <div className="flex flex-col gap-4 text-white">
        <h1 className="text-4xl font-bold tracking-wide">
          {t("Demande d'invitation pour visa")}
        </h1>

        <p className="font-semibold text-base max-w-[700px] leading-relaxed">
          {t("Renseignez vos informations de passeport pour l'obtention de la lettre d'invitation.")}
        </p>
      </div>

      {/* Section 1 */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('INFORMATIONS PROFESSIONNELLES DU VISITEUR:')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          {/* companyName */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Nom de l'entreprise")} *
            </label>

            <input
              type="text"
              name="entreprise"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* secteur */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Secteur d'activité")} *
            </label>

            <input
              type="text"
              name="secteur"
              required
              placeholder="Ex: Technologies, Santé, ..."
              value={secteur}
              onChange={(e) => setSecteur(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Commercial_Register_N */}
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

          {/* Tax_ID_number */}
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

          {/* adresse */}
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

          {/* ville */}
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

          {/* pays */}
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

          {/* p_a_contacter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Personne à contacter')} *
            </label>

            <input
              type="text"
              name="p_a_contacter"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* telephone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Tél')} *
            </label>

            <input
              type="text"
              name="telephone"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* fax */}
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

          {/* mobile */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Mobile')} *
            </label>

            <input
              type="text"
              name="mobile"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* email */}
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

          {/* siteweb */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-bold text-black">
              {t('Site web')}
            </label>

            <input
              type="text"
              name="siteweb"
              value={siteweb}
              onChange={(e) => setSiteweb(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8">
        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('DÉTAILS DE LA DEMANDE DE VISA:')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-2">

          {/* passportNumber */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Numéro de passeport')} *
            </label>

            <input
              type="text"
              name="num_passeport"
              required
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Autorite_emettrice */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Autorité émettrice')} *
            </label>

            <input
              type="text"
              name="autorite"
              required
              value={autoriteEmettrice}
              onChange={(e) => setAutoriteEmettrice(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Date_of_issue */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Date d'émission")} *
            </label>

            <input
              type="date"
              name="created_on"
              required
              value={dateOfIssue}
              onChange={(e) => setDateOfIssue(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Expiration_date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Date d'expiration")} *
            </label>

            <input
              type="date"
              name="expire_on"
              required
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Purpose_of_the_visit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Objet de la visite')} *
            </label>

            <input
              type="text"
              name="objet"
              required
              value={purposeOfVisit}
              onChange={(e) => setPurposeOfVisit(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Position_held_ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Poste occupé')} *
            </label>

            <input
              type="text"
              name="poste"
              required
              value={positionHeld}
              onChange={(e) => setPositionHeld(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* arrive_on */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t("Date d'arrivée prévue")} *
            </label>

            <input
              type="date"
              name="arrive_on"
              required
              value={arriveOn}
              onChange={(e) => setArriveOn(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* departure_on */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-black">
              {t('Date de départ prévue')} *
            </label>

            <input
              type="date"
              name="departure_on"
              required
              value={departureOn}
              onChange={(e) => setDepartureOn(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Passport scan */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-bold text-black">
              {t('Upload scan passeport')} *
            </label>

            <label className="w-full bg-[#f3f4f6] border border-dashed border-gray-300 rounded h-10 px-3 flex items-center gap-2 cursor-pointer text-sm text-gray-600 focus-within:outline-none focus-within:border-sky-500">
              <span>
                {scanFileName || t('Choisir un fichier...')}
              </span>

              <input
                type="file"
                name="scan"
                required
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;

                  setScanFile(file);
                  setScanFileName(file?.name ?? '');
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="flex flex-col gap-6">

        <div className="bg-[#38bdf8] text-white font-bold py-2 px-6 rounded-md w-fit text-sm">
          {t('CONFIRMATION:')}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed max-w-[1000px]">
          {t("Le soussigné confirme sa demande d'invitation pour visa et déclare que les informations fournies ci-dessus sont exactes.")}
        </p>

        <label className="flex items-start gap-3 cursor-pointer w-fit text-white text-sm font-bold">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-5 h-5 accent-white rounded-sm mt-0.5 shrink-0"
          />

          <span className="font-normal leading-relaxed">
            {t("J'accepte que mes données personnelles soient collectées et traitées dans le cadre de cette demande, conformément à la loi n° 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.")}
          </span>
        </label>

        {/* Message */}
        {message && (
          <p
            className={`text-sm font-semibold ${
              message.includes('succès')
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!consent || !scanFile || submitting}
          className="mt-6 md:mt-0 bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-md px-10 h-12 hover:bg-[#0284c7] transition-colors text-sm tracking-wide"
        >
          {submitting ? t('ENVOI EN COURS...') : t('ENVOYER')}
        </button>
      </div>
    </form>
  );
}
