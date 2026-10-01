'use client';

import { useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '@/lib/pocketbase';

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

/* Fetched once and shared by every component that uses the hook. */
let documentsPromise: Promise<DocumentUrls> | null = null;

function fetchDocuments(): Promise<DocumentUrls> {
  if (!documentsPromise) {
    documentsPromise = pb
      .collection('Document')
      .getList(1, 1, { requestKey: null })
      .then((resultList) => {
        const record: RecordModel | undefined = resultList.items[0];
        const urls: DocumentUrls = {};
        if (!record) return urls;

        for (const key of DOCUMENT_KEYS) {
          // A file field is a string, or an array when it allows several files.
          const value = record[key];
          const filename = Array.isArray(value) ? value[0] : value;
          if (filename) {
            urls[key] = pb.files.getURL(record, filename, { download: true });
          }
        }
        return urls;
      })
      .catch((err) => {
        console.error('PocketBase error (Document):', err);
        documentsPromise = null; // allow a retry on next mount
        return {};
      });
  }
  return documentsPromise;
}

export function useDocuments() {
  const [urls, setUrls] = useState<DocumentUrls>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchDocuments().then((result) => {
      if (!active) return;
      setUrls(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { urls, loading };
}
