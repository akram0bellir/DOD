'use client';

import PocketBase from 'pocketbase';
import {
  Facebook,
  Youtube,
  Linkedin,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

const pb = new PocketBase('https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com');

export default function Footer() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    Nom_et_prenom_: '',
    Telephone_: '',
    Email: '',
    Message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove messages when user starts editing again
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const data = {
        Nom_et_prenom_: formData.Nom_et_prenom_,
        Telephone_: formData.Telephone_,
        Email: formData.Email,
        Message: formData.Message,
      };

      await pb.collection('CONTACTEZ_NOUS').create(data);

      setSuccess('Votre message a été envoyé avec succès.');

      setFormData({
        Nom_et_prenom_: '',
        Telephone_: '',
        Email: '',
        Message: '',
      });
    } catch (err) {
      console.error('PocketBase error:', err);
      setError(
        'Une erreur est survenue lors de l’envoi du message. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full flex flex-col items-center">
      {/* ========================================================= */}
      {/* DARK SECTION                                              */}
      {/* ========================================================= */}

      <div className="w-full bg-[#2c3545] py-16 flex justify-center">
        <div className="w-full max-w-[1400px] px-8 flex flex-col gap-12">

          {/* Section title */}
          <h3 className="text-gray-400 text-sm px-8 font-semibold tracking-wider">
            SIPALGERIE
          </h3>

          <div className="w-full max-w-[1200px] px-8 flex flex-col md:flex-row gap-12">

            {/* =================================================== */}
            {/* LEFT — CONTACT INFORMATION                          */}
            {/* =================================================== */}

            <div className="w-full md:w-1/2 flex flex-col gap-6">

              <h2 className="text-white text-2xl font-bold mb-4">
                {t('Contactez-nous')}
              </h2>

              <div className="flex flex-col gap-4">

                {/* ADDRESS */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-300 shrink-0 rounded flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#2c3545]" />
                  </div>

                  <div>
                    <h4 className="text-white font-bold">
                      {t('Address')}
                    </h4>

                    <p className="text-gray-300 text-sm">
                      Centre des Conventions Mohamed BEN AHMED - ORAN
                    </p>
                  </div>
                </div>

                {/* PHONE */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-300 shrink-0 rounded flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#2c3545]" />
                  </div>

                  <div>
                    <h4 className="text-white font-bold">
                      {t('Phone')}
                    </h4>

                    <p className="text-gray-300 text-sm">
                      +213 5 60 36 40 08 /// +213 6 61 13 11 17
                    </p>
                  </div>
                </div>

                {/* WHATSAPP */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-300 shrink-0 rounded flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#2c3545]" />
                  </div>

                  <div>
                    <h4 className="text-white font-bold">
                      {t('Whatsapp')}
                    </h4>

                    <p className="text-gray-300 text-sm">
                      +213 5 60 36 40 08 /// +213 6 61 13 11 17
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-300 shrink-0 rounded flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#2c3545]" />
                  </div>

                  <div>
                    <h4 className="text-white font-bold">
                      {t('Email')}
                    </h4>

                    <p className="text-gray-300 text-sm">
                      sipa@capaalgerie.dz
                    </p>
                  </div>
                </div>

              </div>

              {/* ================================================= */}
              {/* GOOGLE MAP                                        */}
              {/* ================================================= */}

              <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-inner mt-4">
                <iframe
                  title="Google Maps Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d3.058756!3d36.753768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x992762a420ba219e!2zMzDCsDQ1JzEzLjYiTiAzwrAwMy0zMS41IkU!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus&cid=11030410180222653830"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

            </div>

            {/* =================================================== */}
            {/* RIGHT — CONTACT FORM                                */}
            {/* =================================================== */}

            <form
              onSubmit={handleSubmit}
              className="w-full md:w-1/2 flex flex-col gap-4"
            >

              {/* NAME */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">
                  {t('Nom et prénom')} *
                </label>

                <input
                  type="text"
                  name="Nom_et_prenom_"
                  value={formData.Nom_et_prenom_}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full h-12 bg-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#42a5f5] px-4 text-black"
                />
              </div>

              {/* PHONE */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">
                  {t('Telephone')} *
                </label>

                <input
                  type="tel"
                  name="Telephone_"
                  value={formData.Telephone_}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  className="w-full h-12 bg-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#42a5f5] px-4 text-black"
                />
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">
                  {t('Email')} *
                </label>

                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full h-12 bg-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#42a5f5] px-4 text-black"
                />
              </div>

              {/* MESSAGE */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">
                  {t('Message')}
                </label>

                <textarea
                  name="Message"
                  value={formData.Message}
                  onChange={handleChange}
                  className="w-full h-32 bg-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#42a5f5] p-4 resize-none text-black"
                />
              </div>

              {/* SUCCESS */}
              {success && (
                <div className="text-green-400 text-sm font-medium">
                  {success}
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{
                  scale: loading ? 1 : 1.02,
                }}
                whileTap={{
                  scale: loading ? 1 : 0.98,
                }}
                className="w-full h-12 bg-[#42a5f5] text-white font-semibold rounded mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t('Envoi en cours...')
                  : t('Envoyer Message')}
              </motion.button>

            </form>

          </div>
        </div>
      </div>

    </footer>
  );
}
