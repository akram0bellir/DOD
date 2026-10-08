'use client';

import { useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '@/lib/pocketbase';

/* Every collection is fetched once per page load and shared by all
   components that read it. Records come back oldest first, so the order
   on the site is the order they were added in PocketBase. */
const cache = new Map<string, Promise<RecordModel[]>>();

export function fetchCollection(name: string): Promise<RecordModel[]> {
  let request = cache.get(name);
  if (!request) {
    request = pb
      .collection(name)
      .getFullList({ sort: '+created', requestKey: null })
      .catch((err) => {
        console.error(`PocketBase error (${name}):`, err);
        cache.delete(name); // allow a retry on next mount
        return [];
      });
    cache.set(name, request);
  }
  return request;
}

export function useCollection(name: string) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCollection(name).then((result) => {
      if (!active) return;
      setRecords(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [name]);

  return { records, loading };
}

/* URLs of the files stored in a file field (single or multiple). */
export function fileUrls(record: RecordModel, field: string, options?: { download?: boolean }): string[] {
  const value = record[field];
  const names: string[] = Array.isArray(value) ? value : value ? [value] : [];
  return names.map((name) => pb.files.getURL(record, name, options));
}

export function fileUrl(record: RecordModel, field: string, options?: { download?: boolean }): string | undefined {
  return fileUrls(record, field, options)[0];
}

/* Picks the field for the current language: `<base>_ar` in Arabic,
   `<base>_fr` otherwise (the collections have no English columns). */
export function localized(record: RecordModel, base: string, locale: string): string {
  const ar = record[`${base}_ar`];
  const fr = record[`${base}_fr`];
  return (locale === 'ar' && ar ? ar : fr || ar || '') as string;
}
