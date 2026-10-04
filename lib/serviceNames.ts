/* Display names of the additional services (furniture, equipment…).
   The forms store `name` as written in the catalogues (English, except
   "Hôtesse d'accueil"); this table gives the French / English / Arabic
   label for each one. Brand / model names (SCANDINAVE, MB27-P…) stay as is. */

type Names = { fr: string; en?: string; ar: string };

const SERVICE_NAMES: Record<string, Names> = {
  /* Chairs */
  'ALINEA B chair': { fr: 'Chaise ALINEA B', ar: 'كرسي ALINEA B' },
  'EVEREST B chair': { fr: 'Chaise EVEREST B', ar: 'كرسي EVEREST B' },
  'CONFORT high chair': { fr: 'Chaise haute CONFORT', ar: 'كرسي مرتفع CONFORT' },
  'SIMILI high chair, black': { fr: 'Chaise haute SIMILI, noire', ar: 'كرسي مرتفع SIMILI، أسود' },
  'OR chair, red and beige': { fr: 'Chaise OR, rouge et beige', ar: 'كرسي OR، أحمر وبيج' },
  'PATCHWORK chair, grey': { fr: 'Chaise PATCHWORK, grise', ar: 'كرسي PATCHWORK، رمادي' },
  'RÉUNION N chair': { fr: 'Chaise RÉUNION N', ar: 'كرسي RÉUNION N' },
  'SCANDINAVE B chair': { fr: 'Chaise SCANDINAVE B', ar: 'كرسي SCANDINAVE B' },

  /* Tables */
  'STANDARD desk (80×35×90)': { fr: 'Table Desk STANDARD (80×35×90)', ar: 'مكتب استقبال STANDARD (80×35×90)' },
  'STANDARD desk with panelling': { fr: 'Table Desk STANDARD avec habillage', ar: 'مكتب استقبال STANDARD مع تلبيس' },
  'ROUNDED large table (120×90)': { fr: 'Grande table ROUNDED (120×90)', ar: 'طاولة كبيرة ROUNDED (120×90)' },
  'SIMPLY large table (120×70)': { fr: 'Grande table SIMPLY (120×70)', ar: 'طاولة كبيرة SIMPLY (120×70)' },
  'ATELIER table (140×65×70)': { fr: 'Table ATELIER (140×65×70)', ar: 'طاولة ATELIER (140×65×70)' },
  'TRIPODE coffee table (Ø60×60)': { fr: 'Table basse TRIPODE (Ø60×60)', ar: 'طاولة قهوة TRIPODE (Ø60×60)' },
  'CLASSIC high table (Ø60)': { fr: 'Table haute CLASSIC (Ø60)', ar: 'طاولة مرتفعة CLASSIC (Ø60)' },
  'SCANDINAVE high table (Ø60×100)': { fr: 'Table haute SCANDINAVE (Ø60×100)', ar: 'طاولة مرتفعة SCANDINAVE (Ø60×100)' },
  'RONDE table (Ø80×70)': { fr: 'Table RONDE (Ø80×70)', ar: 'طاولة RONDE (Ø80×70)' },
  'SCANDINAVE square glass table (85×85×75)': { fr: 'Table SCANDINAVE carrée en verre (85×85×75)', ar: 'طاولة زجاجية مربعة SCANDINAVE (85×85×75)' },
  'SCANDINAVE round glass table (Ø80×75)': { fr: 'Table SCANDINAVE ronde en verre (Ø80×75)', ar: 'طاولة زجاجية مستديرة SCANDINAVE (Ø80×75)' },

  /* Lounge */
  'Premium lounge set, 4 seats + coffee table (red)': { fr: 'Salon Premium 4 places + table basse (rouge)', ar: 'صالون Premium بأربعة مقاعد + طاولة قهوة (أحمر)' },
  'Standard lounge chair, black, 1 seat': { fr: 'Fauteuil Standard noir, 1 place', ar: 'أريكة Standard سوداء، مقعد واحد' },
  'Standard lounge set, black, 4 seats + coffee table': { fr: 'Salon Standard noir, 4 places + table basse', ar: 'صالون Standard أسود بأربعة مقاعد + طاولة قهوة' },
  'VIP lounge set, 4 seats + coffee table': { fr: 'Salon VIP 4 places + table basse', ar: 'صالون VIP بأربعة مقاعد + طاولة قهوة' },
  'STANDARD coffee table': { fr: 'Table basse STANDARD', ar: 'طاولة قهوة STANDARD' },

  /* Electronics & accessories */
  'Plastic waste bin': { fr: 'Corbeille en plastique', ar: 'سلة مهملات بلاستيكية' },
  'Metal waste bin': { fr: 'Corbeille métallique', ar: 'سلة مهملات معدنية' },
  '32" LED TV screen': { fr: 'Écran TV LED 32"', ar: 'شاشة تلفاز LED مقاس 32 بوصة' },
  '43" LED TV screen': { fr: 'Écran TV LED 43"', ar: 'شاشة تلفاز LED مقاس 43 بوصة' },
  '50" LED TV screen': { fr: 'Écran TV LED 50"', ar: 'شاشة تلفاز LED مقاس 50 بوصة' },
  '55" LED TV screen': { fr: 'Écran TV LED 55"', ar: 'شاشة تلفاز LED مقاس 55 بوصة' },
  '65" LED TV screen': { fr: 'Écran TV LED 65"', ar: 'شاشة تلفاز LED مقاس 65 بوصة' },
  'Metal shelving unit': { fr: 'Étagère métallique', ar: 'رفوف معدنية' },
  'Guide line stand': { fr: 'Poteau guide-file', ar: 'عمود تنظيم الطوابير' },
  'Capsule coffee machine': { fr: 'Machine à café - capsules', ar: 'آلة قهوة بالكبسولات' },
  Carpet: { fr: 'Moquette', ar: 'موكيت' },
  'Power strips': { fr: 'Multiprises', ar: 'مشتركات كهربائية' },
  'Artificial plants': { fr: 'Plantes artificielles', ar: 'نباتات اصطناعية' },
  'A4 literature stand (MB27-M)': { fr: 'Porte-documents A4 (MB27-M)', ar: 'حامل وثائق A4 (MB27-M)' },
  'A4 literature stand (MB27-P)': { fr: 'Porte-documents A4 (MB27-P)', ar: 'حامل وثائق A4 (MB27-P)' },
  'A4 literature stand (MB27-PM)': { fr: 'Porte-documents A4 (MB27-PM)', ar: 'حامل وثائق A4 (MB27-PM)' },
  'Aluminium storage door': { fr: 'Porte de réserve en aluminium', ar: 'باب مخزن من الألمنيوم' },
  Lectern: { fr: 'Pupitre', ar: 'منصة خطابة' },
  '90L refrigerator': { fr: 'Réfrigérateur 90 L', ar: 'ثلاجة 90 لتر' },
  '3-spot electrical strip': { fr: 'Rampe électrique 3 spots', ar: 'شريط إنارة بثلاثة أضواء' },
  'Floor-standing TV mount': { fr: 'Support TV sur pied', ar: 'حامل تلفاز أرضي' },
  'Display case MB26-BI': { fr: 'Vitrine MB26-BI', ar: 'واجهة عرض MB26-BI' },
  'Display case MB26-CO': { fr: 'Vitrine MB26-CO', ar: 'واجهة عرض MB26-CO' },
  'Display case MB26-UN': { fr: 'Vitrine MB26-UN', ar: 'واجهة عرض MB26-UN' },

  /* Services (French source name) */
  "Hôtesse d'accueil": { fr: "Hôtesse d'accueil", en: 'Hostess', ar: 'مضيفة استقبال' },
};

/* Label of a service in the given language; unknown names are returned unchanged. */
export function serviceName(name: string, locale: string): string {
  const names = SERVICE_NAMES[name];
  if (!names) return name;
  if (locale === 'ar') return names.ar;
  if (locale === 'en') return names.en ?? name;
  return names.fr;
}
