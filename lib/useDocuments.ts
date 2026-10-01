'use client';

import { fileUrl, useCollection } from '@/lib/useCollection';

/* File fields of the PocketBase "Document" collection. */
export type DocumentKey =
  | 'Exposant_National'
  | 'Exposant_International'
  | 'Regeneration_facture'
  | 'Demande_Invitation_Pour_Visa'
  | 'Visiteur_Professionnel_B2B'
  | 'Fiche_technique_SIPA';

/* Display label (also the i18n key) for each document. */
export const DOCUMENT_LABELS: Record<DocumentKey, string> = {
  Exposant_National: 'Exposant National',
  Exposant_International: 'Exposant International',
  Regeneration_facture: 'Regénération facture',
  Demande_Invitation_Pour_Visa: 'Demande Invitation Pour Visa',
  Visiteur_Professionnel_B2B: 'Visiteur Professionnel B2B',
  Fiche_technique_SIPA: 'Fiche technique SIPA',
};

export const DOCUMENT_KEYS = Object.keys(DOCUMENT_LABELS) as DocumentKey[];

export type DocumentUrls = Partial<Record<DocumentKey, string>>;

/* Download URL of each file. When several records exist, the most
   recently added one that has a given file wins. */
export function useDocuments() {
  const { records, loading } = useCollection('Document');

  const urls: DocumentUrls = {};
  for (const record of records) {
    for (const key of DOCUMENT_KEYS) {
      const url = fileUrl(record, key, { download: true });
      if (url) urls[key] = url;
    }
  }

  return { urls, loading };
}
