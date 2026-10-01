import { Document, Page, Text, View, Image, StyleSheet, Svg, Path, Polygon, Defs, LinearGradient, Stop, Font } from '@react-pdf/renderer';

/* The template never splits words with a hyphen. */
Font.registerHyphenationCallback((word) => [word]);

/* ================================================================ */
/* Layout copied from the CAPA invoice template (FACTURE N° 0022/2025) */
/* ================================================================ */

const BLUE_LIGHT = '#1ba8e3';
const BLUE_DARK = '#283c8e';
const GREY = '#a7a9ac';
const PURPLE = '#5b3a9c';

/* Table column widths (pt) — N°, Désignation, Quantité, Prix unitaire HT, Montant HT */
const COL = [17, 157, 78, 106, 142];

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 7.5, color: '#000', position: 'relative' },

  /* CAPA header */
  capa: { position: 'absolute', left: 73, top: 70 },
  capaTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: PURPLE, marginBottom: 4 },
  capaSub: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: PURPLE },
  capaPlace: { fontSize: 7, color: PURPLE, marginBottom: 1 },
  capaLine: { fontSize: 6.5, color: '#333', marginTop: 4 },
  capaLabel: { fontFamily: 'Helvetica-Bold' },

  /* Logo */
  logo: { position: 'absolute', left: 333, top: 12, flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 38, height: 38, overflow: 'hidden', borderRadius: 4 },
  logoText: { marginLeft: 8 },
  logoCapa: { fontFamily: 'Helvetica-Bold', fontSize: 27, color: BLUE_LIGHT, lineHeight: 1 },
  logoAlgerie: { fontFamily: 'Helvetica-Bold', fontSize: 6.5, color: BLUE_DARK, letterSpacing: 3, marginTop: 1, marginLeft: 10 },

  /* Everything from the client box down flows, so a long address
     pushes the date, number and table down instead of overlapping. */
  body: { position: 'absolute', left: 0, right: 0, top: 193 },

  /* Client ("Doit") box */
  doit: { marginLeft: 283, width: 248, borderWidth: 1, borderColor: '#000', paddingVertical: 4, paddingHorizontal: 5 },
  doitLine: { fontSize: 8, lineHeight: 1.45 },
  bold: { fontFamily: 'Helvetica-Bold' },
  date: { marginLeft: 391, marginTop: 3, fontFamily: 'Helvetica-Bold', fontSize: 7 },

  /* Invoice number box */
  numberBox: { marginLeft: 90, marginTop: 3, width: 316, height: 28, borderWidth: 1.5, borderColor: '#7f7f7f', justifyContent: 'center', alignItems: 'center' },
  numberText: { fontFamily: 'Helvetica-Bold', fontSize: 13 },

  /* Table */
  table: { marginLeft: 30, marginTop: 12, width: 500 },
  row: { flexDirection: 'row' },
  /* Every cell draws its right + bottom border; the first cell of a row
     adds the left one and the header row adds the top one. */
  headCell: { backgroundColor: '#c5d9f1', borderRightWidth: 0.75, borderBottomWidth: 0.75, borderTopWidth: 0.75, borderColor: '#000', fontFamily: 'Helvetica-Bold', fontSize: 7, textAlign: 'center', paddingVertical: 1.5 },
  cell: { backgroundColor: '#fff', borderRightWidth: 0.75, borderBottomWidth: 0.75, borderColor: '#000', paddingVertical: 1.5, paddingHorizontal: 2, justifyContent: 'center', minHeight: 10.5 },
  first: { borderLeftWidth: 0.75 },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },

  /* Amount in words */
  words: { fontFamily: 'Helvetica-Bold', fontSize: 7, marginTop: 22, marginLeft: 2, width: 420, lineHeight: 1.5 },

  /* Footer */
  footer: { position: 'absolute', left: 182, top: 728, flexDirection: 'row', fontSize: 5.5, color: '#444' },
});

/* ================================================================ */
/* HELPERS                                                           */
/* ================================================================ */

/* 525527.8 -> "525 527,80" (spaces as thousand separators, like the template) */
export function formatAmount(value: number): string {
  const [int, dec] = Math.abs(value).toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${value < 0 ? '-' : ''}${grouped},${dec}`;
}

const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

function under100(n: number): string {
  if (n < 17) return UNITS[n];
  if (n < 20) return `dix ${UNITS[n - 10]}`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t <= 6) return u === 0 ? TENS[t] : u === 1 ? `${TENS[t]} et un` : `${TENS[t]} ${UNITS[u]}`;
  if (t === 7) return u === 1 ? 'soixante et onze' : `soixante ${under100(10 + u)}`;
  if (t === 8) return u === 0 ? 'quatre vingts' : `quatre vingt ${UNITS[u]}`;
  return `quatre vingt ${under100(10 + u)}`;
}

function under1000(n: number, plural = true): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let words = '';
  if (h === 1) words = 'cent';
  else if (h > 1) words = `${UNITS[h]} cent${r === 0 && plural ? 's' : ''}`;
  if (r > 0) words = words ? `${words} ${under100(r)}` : under100(r);
  return words;
}

/* French number in words, without hyphens (as written on the template) */
export function numberToFrenchWords(n: number): string {
  if (n === 0) return 'zéro';
  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor(n / 1000) % 1000;
  const rest = n % 1000;
  if (millions) parts.push(`${under1000(millions, false)} million${millions > 1 ? 's' : ''}`);
  if (thousands) parts.push(thousands === 1 ? 'mille' : `${under1000(thousands, false)} mille`);
  if (rest) parts.push(under1000(rest));
  return parts.join(' ');
}

/* ================================================================ */
/* INVOICE LINES (built from an Exposant_national / _International record) */
/* ================================================================ */

type Line = { designation: string; quantity: number; unitPrice: number };

const STAND_LABELS: Record<string, string> = {
  /* national: stand_type is the price per m² */
  '17000': 'Stand aménagé (min12m²)',
  '12000': 'Stand non aménagé (min12m²)',
  '10000': 'Emplacement découvert (min48m²)',
  /* international: stand_type is a code */
  amenage: 'Stand aménagé (min12m²)',
  non_amenage: 'Stand non aménagé (min12m²)',
  decouvert: 'Emplacement découvert (min48m²)',
};

const NATIONAL = { fee: 20000, standRates: {} as Record<string, number>, electricity: 20, label: 'Participant national SIPA 2025' };
const INTERNATIONAL = {
  fee: 350,
  standRates: { amenage: 250, non_amenage: 200, decouvert: 150 } as Record<string, number>,
  electricity: 5,
  label: 'Participant international SIPA 2025',
};
const EVENT_DAYS = 4;

const FACADE_LABELS: Record<string, string> = {
  '17000': 'Emplacement à 02 façades', '22000': 'Emplacement à 03 façades', '32000': 'Emplacement à 04 façades',
  '250': 'Emplacement à 02 façades', '350': 'Emplacement à 03 façades', '400': 'Emplacement à 04 façades',
};

const CATALOGUE_LABELS: Record<string, string> = {
  '120000': 'Publicité catalogue : 4ème page de couverture', '100000': 'Publicité catalogue : 3ème page de couverture',
  '80000': 'Publicité catalogue : 2ème page de couverture', '32000': 'Publicité catalogue : 1/2 page intérieure couleur',
  '2000': 'Publicité catalogue : 4ème page de couverture', '1600': 'Publicité catalogue : 3ème page de couverture',
  '1500': 'Publicité catalogue : 2ème page de couverture', '400': 'Publicité catalogue : 1/2 page intérieure couleur',
};

export function buildInvoiceLines(record: any): Line[] {
  const isInternational = record.currency === 'EUR';
  const rules = isInternational ? INTERNATIONAL : NATIONAL;
  const surface = Number(record.surface || 0);
  const standKey = String(record.stand_type ?? '');
  const standRate = isInternational ? rules.standRates[standKey] ?? 0 : Number(record.stand_type || 0);

  const lines: Line[] = [{ designation: rules.label, quantity: 1, unitPrice: rules.fee }];

  if (surface > 0) {
    lines.push({ designation: STAND_LABELS[standKey] ?? 'Stand', quantity: surface, unitPrice: standRate });
    lines.push({ designation: 'Electricité par jour par m2', quantity: surface * EVENT_DAYS, unitPrice: rules.electricity });
  }

  if (record.facade) {
    lines.push({ designation: FACADE_LABELS[String(record.facade)] ?? 'Majoration façades', quantity: 1, unitPrice: Number(record.facade) });
  }
  if (record.catalogue) {
    lines.push({ designation: CATALOGUE_LABELS[String(record.catalogue)] ?? 'Publicité catalogue', quantity: 1, unitPrice: Number(record.catalogue) });
  }

  const services: any[] = Array.isArray(record.ADDITIONAL_SERVICES) ? record.ADDITIONAL_SERVICES : [];
  for (const s of services) {
    const quantity = Number(s.qty || 1) * Number(s.days || 1);
    lines.push({ designation: s.name, quantity, unitPrice: Number(s.price || 0) });
  }

  /* International hostesses are stored outside ADDITIONAL_SERVICES */
  if (isInternational && record.hostess_selected && record.hostess_count > 0) {
    lines.push({
      designation: "Hôtesse d'accueil (par personne par jour)",
      quantity: Number(record.hostess_count) * Number(record.hostess_days || 1),
      unitPrice: 100,
    });
  }

  return lines;
}

/* ================================================================ */
/* DECORATIONS (blue / grey corner bands of the template)            */
/* ================================================================ */

function Decorations() {
  return (
    <Svg fixed style={{ position: 'absolute', left: 0, top: 0 }} width={595} height={800}>
      <Defs>
        <LinearGradient id="topLeft" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BLUE_LIGHT} />
          <Stop offset="1" stopColor={BLUE_DARK} />
        </LinearGradient>
        <LinearGradient id="bottomRight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BLUE_DARK} />
          <Stop offset="1" stopColor={BLUE_LIGHT} />
        </LinearGradient>
        <LinearGradient id="bottomBand" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={BLUE_DARK} />
          <Stop offset="1" stopColor={BLUE_LIGHT} />
        </LinearGradient>
      </Defs>

      {/* top-left band + left bar */}
      <Path d="M17 14 L240 14 L224 37 L82 37 Q58 37 58 61 L58 236 L17 262 Z" fill="url(#topLeft)" />
      <Polygon points="226,37 244,14 278,14 260,37" fill={GREY} />
      <Polygon points="17,266 58,240 58,262 17,288" fill={GREY} />

      {/* bottom-right bar + bottom band */}
      <Polygon points="500,586 531,566 531,767 500,767" fill="url(#bottomRight)" />
      <Polygon points="500,584 531,564 531,542 500,562" fill={GREY} />
      <Polygon points="214,767 230,751 531,751 531,767" fill="url(#bottomBand)" />
      <Polygon points="178,767 194,751 228,751 212,767" fill={GREY} />
    </Svg>
  );
}

/* ================================================================ */
/* DOCUMENT                                                          */
/* ================================================================ */

export default function FacturePDF({ record, invoiceNumber }: { record: any; invoiceNumber?: string }) {
  const isInternational = record.currency === 'EUR';
  const currencyCode = isInternational ? 'EUR' : 'DA';
  const currencyWords = isInternational ? 'Euros' : 'Dinars Algerien';
  const money = (value: number) => `${formatAmount(value)} ${currencyCode}`;

  const lines = buildInvoiceLines(record);
  const montant = Math.round(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0) * 100) / 100;
  const tva = Math.round(montant * 0.19 * 100) / 100;
  const totalTTC = Math.round((montant + tva) * 100) / 100;

  const totalInt = Math.floor(totalTTC);
  const cents = Math.round((totalTTC - totalInt) * 100).toString().padStart(2, '0');

  const created = record.created ? new Date(record.created.replace(' ', 'T')) : new Date();
  const date = created.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const year = created.getFullYear();
  const number = invoiceNumber ?? record.invoice_number ?? String(record.id ?? '').slice(0, 4).toUpperCase();

  const logoSrc = typeof window !== 'undefined' ? `${window.location.origin}/capa.png` : '/capa.png';

  const siege = [record.address, record.city, record.country].filter(Boolean).join(', ');
  const adresse = [record.address, record.city].filter(Boolean).join(', ');

  const cellWidth = (i: number) => ({ width: COL[i] });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Decorations />

        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            {/* capa.png is the vertical logo: show only its square icon */}
            <Image src={logoSrc} style={{ position: 'absolute', left: 0, top: 0, width: 38, height: 56 }} />
          </View>
          <View style={styles.logoText}>
            <Text style={styles.logoCapa}>capa</Text>
            <Text style={styles.logoAlgerie}>ALGERIE</Text>
          </View>
        </View>

        {/* CAPA header */}
        <View style={styles.capa}>
          <Text style={styles.capaTitle}>Chambre Algérienne de la pêche et de l&apos;Aquaculture</Text>
          <Text style={styles.capaSub}>Salon International de la pêche et de l&apos;Aquaculture  (SIPA2025)</Text>
          <Text style={styles.capaPlace}>centre des conventions Oran 06-09 novembre 2025</Text>
          <Text style={{ fontSize: 6.5, color: '#333' }}><Text style={styles.capaLabel}>RC : </Text>16/00 096558484</Text>
          <Text style={styles.capaLine}><Text style={styles.capaLabel}>NIF : </Text>000416096558443</Text>
          <Text style={styles.capaLine}><Text style={styles.capaLabel}>NIS : </Text>000216459085919</Text>
          <Text style={styles.capaLine}><Text style={styles.capaLabel}>AI : </Text>16/24 9081003</Text>
          <Text style={styles.capaLine}><Text style={styles.capaLabel}>Domiciliation : </Text>CPA agence Amirouche -108</Text>
          <Text style={styles.capaLine}><Text style={styles.capaLabel}>RIB : </Text>00400108401016252425</Text>
          <Text style={{ fontSize: 8, color: '#000', marginTop: 1 }}>SWIFT: CPALDZALXXX</Text>
        </View>

        <View style={styles.body}>
        {/* Client box */}
        <View style={styles.doit}>
          <Text style={styles.doitLine}><Text style={styles.bold}>Doit</Text>:  {record.company_name ?? ''}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>Siége social</Text> {siege}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>Adresse:</Text> {adresse}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>Téléphone:</Text> {record.phone || record.mobile || ''}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>N°SIRET</Text> {record.company_registration_no ?? ''}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>N°TVA:</Text> {record.tax_id_no ?? ''}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>AI:</Text> {record.ai ?? ''}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>N°référence convention</Text> {record.convention_ref ?? ''}</Text>
          <Text style={styles.doitLine}><Text style={styles.bold}>PAVILLON</Text> {record.pavillon ?? ''}</Text>
        </View>
        <Text style={styles.date}>Alger le: {date}</Text>

        {/* Invoice number */}
        <View style={styles.numberBox}>
          <Text style={styles.numberText}>FACTURE N° {number}/ {year}</Text>
        </View>

        {/* Lines table */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headCell, styles.first, cellWidth(0), { textAlign: 'left' }]}>N°</Text>
            <Text style={[styles.headCell, cellWidth(1)]}>Désignation</Text>
            <Text style={[styles.headCell, cellWidth(2)]}>Quantité</Text>
            <Text style={[styles.headCell, cellWidth(3)]}>Prix unitaire HT {currencyCode}</Text>
            <Text style={[styles.headCell, cellWidth(4)]}>Montant HT {currencyCode}</Text>
          </View>

          {lines.map((line, i) => (
            <View key={i} style={styles.row} wrap={false}>
              <View style={[styles.cell, styles.first, cellWidth(0)]}><Text style={styles.center}>{i + 1}</Text></View>
              <View style={[styles.cell, cellWidth(1)]}><Text>{line.designation}</Text></View>
              <View style={[styles.cell, cellWidth(2)]}><Text style={styles.center}>{line.quantity}</Text></View>
              <View style={[styles.cell, cellWidth(3)]}><Text style={styles.right}>{money(line.unitPrice)}</Text></View>
              <View style={[styles.cell, cellWidth(4)]}><Text style={styles.right}>{money(line.quantity * line.unitPrice)}</Text></View>
            </View>
          ))}

          {[
            ['MONTANT', montant],
            ['TVA EXONORE', tva],
            ['TOTAL TTC', totalTTC],
          ].map(([label, value]) => (
            <View key={label as string} style={styles.row}>
              <View style={{ width: COL[0] + COL[1] }} />
              <View style={[styles.cell, styles.first, { width: COL[2] + COL[3] }]}><Text style={styles.center}>{label}</Text></View>
              <View style={[styles.cell, cellWidth(4)]}><Text style={styles.right}>{money(value as number)}</Text></View>
            </View>
          ))}

          <Text style={styles.words}>
            Arrêtée  la présente facture à la somme de: {numberToFrenchWords(totalInt)} {currencyWords} et {cents} Cts
          </Text>
        </View>
        </View>

        {/* Footer contacts */}
        <View style={styles.footer}>
          <View style={{ width: 79 }}>
            <Text>+213 661 13 11 17</Text>
            <Text>+213 560 36 40 08</Text>
          </View>
          <View style={{ width: 64 }}>
            <Text>+213 20 30 56 54</Text>
            <Text>+213 20 30 40 64</Text>
          </View>
          <View style={{ width: 70 }}>
            <Text>sipa@capaalgerie.dz</Text>
            <Text>www.sipalgerie.dz</Text>
          </View>
          <View style={{ width: 100 }}>
            <Text>Cité 400 Logements Bât.3A,</Text>
            <Text>N°3/4  El Hammamet, Chéraga,</Text>
            <Text>Alger.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
