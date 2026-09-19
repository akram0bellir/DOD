'use client';

import { useState } from 'react';
import PocketBase from 'pocketbase';
import emailjs from '@emailjs/browser';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const pb = new PocketBase('https://YOUR-POCKETBASE-URL');
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

export default function RegenerationFactureForm() {
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── STEP 1: check email exists, send 4-digit code ───
  const sendCode = async () => {
    setError(''); setLoading(true);
    try {
      const filter = pb.filter('email = {:e}', { e: email });
      const [nat, intl] = await Promise.all([
        pb.collection('Exposant_national').getFullList({ filter }),
        pb.collection('Exposant_International').getFullList({ filter }),
      ]);

      if (nat.length + intl.length === 0) {
        throw new Error('Aucune inscription trouvée avec cet email.');
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { to_email: email, code },
        EMAILJS_PUBLIC_KEY
      );

      setGeneratedCode(code); // stored in memory only — zero real security, that's the tradeoff
      setStep('code');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: verify the code ───
  const verifyCode = async () => {
    setError('');
    if (codeInput !== generatedCode) {
      return setError('Code incorrect.');
    }
    const filter = pb.filter('email = {:e}', { e: email });
    const [nat, intl] = await Promise.all([
      pb.collection('Exposant_national').getFullList({ filter }),
      pb.collection('Exposant_International').getFullList({ filter }),
    ]);
    setRecords([...nat, ...intl]);
    setStep('done');
  };

  return (
    <div className="bg-white rounded-xl p-8 md:p-12 flex flex-col gap-8 text-black max-w-2xl">
      <h2 className="text-2xl font-bold text-[#0ea5e9]">Régénération de facture</h2>

      {step === 'email' && (
        <>
          <p className="text-sm text-gray-600">
            Entrez votre email d'inscription — nous vous enverrons un code de vérification.
          </p>
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-sm font-bold">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3" />
          </div>
          <button onClick={sendCode} disabled={loading}
            className="bg-[#0ea5e9] text-white font-bold py-2.5 px-6 rounded-md w-fit disabled:opacity-50">
            {loading ? 'Envoi...' : 'Envoyer le code'}
          </button>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="text-sm text-gray-600">Un code à 4 chiffres a été envoyé à <b>{email}</b>.</p>
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-sm font-bold">Code *</label>
            <input type="text" maxLength={4} value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="bg-[#f3f4f6] border border-gray-300 rounded h-10 px-3" />
          </div>
          <button onClick={verifyCode}
            className="bg-[#0ea5e9] text-white font-bold py-2.5 px-6 rounded-md w-fit">
            Vérifier
          </button>
        </>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {step === 'done' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-green-600 font-bold">✓ Identité vérifiée. {records.length} inscription(s) trouvée(s).</p>
          {records.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{r.company_name}</p>
                <p className="text-sm text-gray-600">
                  Stand: {r.stand_type} DA · Surface: {r.surface} m² · Total HT: {r.total_ht} DA
                </p>
                <p className="text-sm">Statut: <b>{r.STATUS}</b></p>
              </div>
              <PDFDownloadLink document={<FacturePDF record={r} />} fileName={`facture_${r.company_registration_no}.pdf`}>
                {({ loading: pdfLoading }) => (
                  <button className="bg-[#0ea5e9] text-white font-bold py-2 px-4 rounded-md text-sm">
                    {pdfLoading ? '...' : 'Télécharger PDF'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}