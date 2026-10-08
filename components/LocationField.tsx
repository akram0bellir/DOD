'use client';

import { useId, useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import {
  resolveCountry,
  resolveWilaya,
  searchCountries,
  searchWilayas,
  type Place,
} from '@/lib/location';

/* Text input with a filtered suggestion list. Whatever the person
   types ("ALGERIA", "16000", "Bougie"...) is replaced on blur by the
   canonical value ("Algérie", "16 - Alger", "06 - Béjaïa"), so the
   stored data stays filterable. Unknown values are kept as typed.
   kind="text" is a plain input (city outside Algeria). */

type Props = {
  kind: 'country' | 'wilaya' | 'text';
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputClass: string;
  labelClass: string;
};

export default function LocationField({
  kind,
  label,
  value,
  onChange,
  required,
  inputClass,
  labelClass,
}: Props) {
  const { t, locale } = useLanguage();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const resolved =
    kind === 'country' ? resolveCountry(value) : kind === 'wilaya' ? resolveWilaya(value) : null;

  /* A field already holding a final value (e.g. the default
     "Algérie") lists everything, so it can be changed without
     clearing it first. */
  const query = resolved?.value === value ? '' : value;

  const suggestions = useMemo<Place[]>(() => {
    if (kind === 'country') return searchCountries(query, Infinity);
    if (kind === 'wilaya') return searchWilayas(query, Infinity);
    return [];
  }, [kind, query]);

  const choose = (place: Place) => {
    onChange(place.value);
    setOpen(false);
  };

  const handleBlur = () => {
    setOpen(false);
    if (resolved) onChange(resolved.value);
    else if (value !== value.trim()) onChange(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'ArrowDown') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = kind !== 'text' && open && suggestions.length > 0;
  const showUnknown = kind !== 'text' && !open && value.trim() !== '' && !resolved;

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>
        {t(label)} {required && '*'}
      </label>

      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          autoComplete="off"
          placeholder={
            kind === 'country'
              ? t('Tapez pour filtrer les pays')
              : kind === 'wilaya'
                ? t('Wilaya : nom ou numéro (ex. 16)')
                : undefined
          }
          role={kind === 'text' ? undefined : 'combobox'}
          aria-expanded={kind === 'text' ? undefined : showList}
          aria-controls={kind === 'text' ? undefined : listId}
          aria-autocomplete={kind === 'text' ? undefined : 'list'}
          onChange={(e) => {
            onChange(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={inputClass}
        />

        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg"
          >
            {suggestions.map((place, i) => {
              const localized = place.labels[locale];
              return (
                <li
                  key={place.value}
                  role="option"
                  aria-selected={i === active}
                  /* mousedown fires before the input's blur */
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(place);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm text-black ${
                    i === active ? 'bg-sky-100' : ''
                  }`}
                >
                  <span>{place.value}</span>
                  {localized !== place.value && (
                    <span className="text-xs text-gray-500">{localized}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showUnknown && (
        <p className="text-xs text-amber-600">
          {kind === 'country'
            ? t('Pays non reconnu, vérifiez l’orthographe.')
            : t('Wilaya non reconnue, vérifiez l’orthographe.')}
        </p>
      )}
    </div>
  );
}
