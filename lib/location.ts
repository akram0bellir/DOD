/* ================================================================ */
/* COUNTRY + WILAYA NORMALISATION                                    */
/* ================================================================ */
/* People type the same place many ways ("Algérie", "ALGERIA", "DZ",  */
/* "الجزائر"; "Alger", "16", "16000", "Wilaya d'Alger"...). Every     */
/* alias resolves to one canonical value, so PocketBase records can   */
/* be filtered reliably: countries are stored by their French name,   */
/* wilayas as "16 - Alger".                                           */

export type Place = {
  /* The value written to the form / PocketBase. */
  value: string;
  /* Names shown in the suggestion list, per locale. */
  labels: { fr: string; en: string; ar: string };
  /* Everything that should resolve to this place, already normalised. */
  keys: string[];
};

/* ---------------------------------------------------------------- */
/* TEXT NORMALISATION                                                */
/* ---------------------------------------------------------------- */

/* Lowercase, no accents, no Arabic diacritics or letter variants,
   punctuation (hyphens, apostrophes...) turned into spaces. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel, tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/* Spaces and articles removed, so "Tizi-Ouzou" = "tizi ouzou" =
   "TiziOuzou" and "El Oued" = "Oued", "البليدة" = "بليده". */
function compact(text: string): string {
  const words = normalize(text).split(' ');
  return words
    .filter((w) => words.length === 1 || !['el', 'al', 'l', 'd', 'de', 'du', 'des', 'la', 'le', 'les', 'of', 'the'].includes(w))
    .map((w) => (w.startsWith('ال') && w.length > 3 ? w.slice(2) : w))
    .join('');
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/* Exact compact match first, then a unique close spelling
   ("Bejaya", "Tizi Ouzu"), then a unique prefix ("Émirats"). */
function resolve(input: string, places: Place[]): Place | null {
  const key = compact(input);
  if (!key) return null;

  const exact = places.find((p) => p.keys.includes(key));
  if (exact) return exact;

  if (key.length >= 5) {
    const maxDistance = key.length >= 9 ? 2 : 1;
    const close = places.filter((p) => p.keys.some((k) => k.length >= 5 && levenshtein(key, k) <= maxDistance));
    if (close.length === 1) return close[0];
  }

  if (key.length >= 4) {
    const prefixed = places.filter((p) => p.keys.some((k) => k.startsWith(key)));
    if (prefixed.length === 1) return prefixed[0];
  }

  return null;
}

/* Suggestions for the dropdown, best matches first. */
function search(input: string, places: Place[], limit: number): Place[] {
  const key = compact(input);
  if (!key) return places.slice(0, limit);

  const ranked: Array<[number, Place]> = [];
  for (const p of places) {
    let rank = -1;
    if (p.keys.includes(key)) rank = 0;
    else if (p.keys.some((k) => k.startsWith(key))) rank = 1;
    else if (p.keys.some((k) => k.includes(key))) rank = 2;
    if (rank >= 0) ranked.push([rank, p]);
  }

  const best = resolve(input, places);
  if (best && !ranked.some(([, p]) => p === best)) ranked.push([0, best]);

  return ranked
    .sort((a, b) => a[0] - b[0])
    .slice(0, limit)
    .map(([, p]) => p);
}

function makeKeys(names: string[]): string[] {
  return [...new Set(names.map(compact).filter(Boolean))];
}

/* ---------------------------------------------------------------- */
/* COUNTRIES                                                         */
/* ---------------------------------------------------------------- */

const ISO_CODES =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT ' +
  'MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG ' +
  'UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW';

/* Aliases Intl.DisplayNames doesn't produce. */
const COUNTRY_ALIASES: Record<string, string[]> = {
  DZ: ['Algerie', 'Algeria', 'Algérie', 'DZA', 'El Djazair', 'Al Djazair', 'Al Jazair', 'Djazair', 'Dzayer', 'جزائر', 'République algérienne'],
  AE: ['UAE', 'EAU', 'Émirats', 'Emirates', 'United Arab Emirates', 'Emirats Arabes Unis', 'الإمارات', 'Dubai', 'Dubaï', 'Abu Dhabi'],
  SA: ['KSA', 'Arabie', 'Saudi', 'Saudi Arabia', 'السعودية'],
  US: ['USA', 'Etats-Unis', 'Etats Unis', 'United States of America', 'America', 'Amérique'],
  GB: ['UK', 'Royaume Uni', 'United Kingdom', 'Angleterre', 'England', 'Grande Bretagne', 'Great Britain', 'Britain'],
  NL: ['Hollande', 'Holland', 'Pays Bas'],
  TN: ['TUN', 'Tunisia'],
  MA: ['MAR', 'Morocco', 'المغرب'],
  EG: ['EGY', 'Egypt', 'مصر'],
  CN: ['Chine', 'PRC', 'الصين'],
  TR: ['Türkiye', 'Turkiye', 'Turkey', 'Turquie'],
  KR: ['Corée du Sud', 'South Korea', 'Korea'],
  CI: ["Côte d'Ivoire", 'Cote d Ivoire', 'Ivory Coast'],
  DE: ['Allemagne', 'Germany', 'Deutschland'],
  ES: ['Espagne', 'Spain', 'España'],
  IT: ['Italie', 'Italy', 'Italia'],
  RU: ['Russie', 'Russia'],
};

let countriesCache: Place[] | null = null;

export function countries(): Place[] {
  if (countriesCache) return countriesCache;

  const names = (locale: string) => {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' });
    } catch {
      return null;
    }
  };
  const fr = names('fr');
  const en = names('en');
  const ar = names('ar');

  countriesCache = ISO_CODES.split(' ')
    .map((code) => {
      const labels = {
        fr: fr?.of(code) ?? code,
        en: en?.of(code) ?? code,
        ar: ar?.of(code) ?? code,
      };
      return {
        value: labels.fr,
        labels,
        keys: makeKeys([code, labels.fr, labels.en, labels.ar, ...(COUNTRY_ALIASES[code] ?? [])]),
      };
    })
    .sort((a, b) => a.value.localeCompare(b.value, 'fr'));

  return countriesCache;
}

export const ALGERIE = 'Algérie';

export function resolveCountry(input: string): Place | null {
  return resolve(input, countries());
}

export function searchCountries(input: string, limit = 8): Place[] {
  return search(input, countries(), limit);
}

/* Canonical value, or the trimmed input if nothing matches. */
export function canonicalCountry(input: string): string {
  return resolveCountry(input)?.value ?? input.trim();
}

export function isAlgeria(country: string): boolean {
  return resolveCountry(country)?.value === ALGERIE;
}

/* ---------------------------------------------------------------- */
/* WILAYAS (58)                                                      */
/* ---------------------------------------------------------------- */

/* [code, French, Arabic, other spellings / English / old names] */
const WILAYA_DATA: Array<[number, string, string, string[]]> = [
  [1, 'Adrar', 'أدرار', []],
  [2, 'Chlef', 'الشلف', ['Chelef', 'Orléansville', 'El Asnam', 'Ech Cheliff']],
  [3, 'Laghouat', 'الأغواط', ['Aghouat']],
  [4, 'Oum El Bouaghi', 'أم البواقي', ['Oum Bouaghi', 'Canrobert']],
  [5, 'Batna', 'باتنة', []],
  [6, 'Béjaïa', 'بجاية', ['Bejaia', 'Bejaya', 'Bgayet', 'Vgayet', 'Bougie', 'Bugia']],
  [7, 'Biskra', 'بسكرة', []],
  [8, 'Béchar', 'بشار', ['Bechar', 'Colomb Béchar']],
  [9, 'Blida', 'البليدة', ['Boulaida']],
  [10, 'Bouira', 'البويرة', ['Tubirett']],
  [11, 'Tamanrasset', 'تمنراست', ['Tamanghasset', 'Tam', 'Fort Laperrine']],
  [12, 'Tébessa', 'تبسة', ['Tebessa', 'Theveste']],
  [13, 'Tlemcen', 'تلمسان', ['Tilimsen', 'Tlemsen']],
  [14, 'Tiaret', 'تيارت', ['Tihert', 'Tahert']],
  [15, 'Tizi Ouzou', 'تيزي وزو', ['Tizi', 'Tizi Wezzu']],
  [16, 'Alger', 'الجزائر', ['Algiers', 'Alger Centre', 'Algiers Centre', 'Alger Ville', 'El Djazair', 'Al Jazair', 'Dzayer', 'Wilaya d Alger', 'الجزائر العاصمة', 'العاصمة']],
  [17, 'Djelfa', 'الجلفة', ['Jelfa']],
  [18, 'Jijel', 'جيجل', ['Djidjelli', 'Jijeli']],
  [19, 'Sétif', 'سطيف', ['Setif', 'Stif']],
  [20, 'Saïda', 'سعيدة', ['Saida']],
  [21, 'Skikda', 'سكيكدة', ['Philippeville']],
  [22, 'Sidi Bel Abbès', 'سيدي بلعباس', ['Sidi Bel Abbes', 'Sidi Belabbes', 'SBA', 'Bel Abbes']],
  [23, 'Annaba', 'عنابة', ['Bône', 'Bone', 'Hippone']],
  [24, 'Guelma', 'قالمة', ['Calama']],
  [25, 'Constantine', 'قسنطينة', ['Qacentina', 'Ksentina', 'Cirta']],
  [26, 'Médéa', 'المدية', ['Medea', 'Lemdiyya']],
  [27, 'Mostaganem', 'مستغانم', ['Mosta']],
  [28, "M'Sila", 'المسيلة', ['Msila', 'Masila']],
  [29, 'Mascara', 'معسكر', ['Mouaskar']],
  [30, 'Ouargla', 'ورقلة', ['Wargla']],
  [31, 'Oran', 'وهران', ['Wahran', 'Ouahran']],
  [32, 'El Bayadh', 'البيض', ['Bayadh', 'Géryville']],
  [33, 'Illizi', 'إليزي', ['Fort Polignac']],
  [34, 'Bordj Bou Arréridj', 'برج بوعريريج', ['Bordj Bou Arreridj', 'BBA', 'Bordj']],
  [35, 'Boumerdès', 'بومرداس', ['Boumerdes', 'Rocher Noir']],
  [36, 'El Tarf', 'الطارف', ['Tarf']],
  [37, 'Tindouf', 'تندوف', []],
  [38, 'Tissemsilt', 'تيسمسيلت', ['Vialar']],
  [39, 'El Oued', 'الوادي', ['Oued Souf', 'Souf']],
  [40, 'Khenchela', 'خنشلة', []],
  [41, 'Souk Ahras', 'سوق أهراس', ['Thagaste']],
  [42, 'Tipaza', 'تيبازة', ['Tipasa']],
  [43, 'Mila', 'ميلة', []],
  [44, 'Aïn Defla', 'عين الدفلى', ['Ain Defla', 'Duperré']],
  [45, 'Naâma', 'النعامة', ['Naama']],
  [46, 'Aïn Témouchent', 'عين تموشنت', ['Ain Temouchent']],
  [47, 'Ghardaïa', 'غرداية', ['Ghardaia']],
  [48, 'Relizane', 'غليزان', ['Ghilizane', 'Ighil Izane']],
  [49, 'Timimoun', 'تيميمون', []],
  [50, 'Bordj Badji Mokhtar', 'برج باجي مختار', ['BBM']],
  [51, 'Ouled Djellal', 'أولاد جلال', ['Ouled Jellal']],
  [52, 'Béni Abbès', 'بني عباس', ['Beni Abbes']],
  [53, 'In Salah', 'عين صالح', ['Ain Salah', 'Aïn Salah']],
  [54, 'In Guezzam', 'عين قزام', ['Ain Guezzam']],
  [55, 'Touggourt', 'تقرت', ['Tougourt', 'Tuggurt']],
  [56, 'Djanet', 'جانت', ['Janet']],
  [57, "El M'Ghair", 'المغير', ['El Meghaier', 'El Mghair', 'Meghaier']],
  [58, 'El Meniaa', 'المنيعة', ['El Menia', 'El Goléa', 'El Golea']],
];

export const WILAYAS: Place[] = WILAYA_DATA.map(([code, fr, ar, aliases]) => {
  const num = String(code).padStart(2, '0');
  return {
    value: `${num} - ${fr}`,
    labels: { fr: `${num} - ${fr}`, en: `${num} - ${aliases.find((a) => a === 'Algiers') ?? fr}`, ar: `${num} - ${ar}` },
    keys: makeKeys([fr, ar, ...aliases]),
  };
});

/* "Wilaya d'Alger", "ولاية وهران", "Alger Centre", "Oran ville" →
   just the place name. */
function stripWilayaWords(input: string): string {
  return normalize(input)
    .replace(/^(wilaya|willaya|wilayat|province|ولايه|ولاية)( (de|d|of))?\s*/, '')
    .replace(/\s(centre|center|ville|city|وسط)$/, '')
    .trim();
}

/* A wilaya number from "16", "16 - Alger", "16000" (postal code). */
function wilayaFromNumber(input: string): Place | null {
  const text = input.trim();
  const postal = text.match(/\b(\d{2})\d{3}\b/);
  const leading = text.match(/^0?(\d{1,2})(?!\d)/);
  const code = Number(leading?.[1] ?? postal?.[1] ?? NaN);
  return code >= 1 && code <= WILAYAS.length ? WILAYAS[code - 1] : null;
}

export function resolveWilaya(input: string): Place | null {
  return wilayaFromNumber(input) ?? resolve(input, WILAYAS) ?? resolve(stripWilayaWords(input), WILAYAS);
}

export function searchWilayas(input: string, limit = 8): Place[] {
  const byNumber = wilayaFromNumber(input);
  if (byNumber) return [byNumber];
  const stripped = stripWilayaWords(input);
  return search(stripped || input, WILAYAS, limit);
}

export function canonicalWilaya(input: string): string {
  return resolveWilaya(input)?.value ?? input.trim();
}
