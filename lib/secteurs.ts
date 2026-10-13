/* ================================================================ */
/* SECTEURS D'ACTIVITÉ                                               */
/* ================================================================ */
/* Same list, ids and labels as the original site's id_secteur      */
/* select. Shared by every registration form. 37 = "à préciser":    */
/* the person types the sector, saved as "Autres : <text>".         */

export const SECTEURS: { id: number; label: string }[] = [
  { id: 1, label: 'Pêche : Pêche artisanale' },
  { id: 2, label: 'Pêche : Pêche côtière' },
  { id: 3, label: 'Pêche : Pêche industrielle' },
  { id: 4, label: 'Pêche : Pêche au corail' },
  { id: 5, label: 'Pêche : Pêche continentale' },
  { id: 6, label: 'Pêche : Pêche récréative' },
  { id: 7, label: 'Pêche : Pêche au thon rouge' },
  { id: 8, label: 'Aquaculture : Aquaculture marine' },
  { id: 9, label: 'Aquaculture : Aquaculture continentale' },
  { id: 10, label: "Aquaculture : Pisciculture intégré (produits d'eau douce)" },
  { id: 11, label: 'Autres secteurs : Aliments pour poissons' },
  { id: 12, label: 'Autres secteurs : Génétique et reproduction' },
  { id: 13, label: 'Autres secteurs : Écloseries' },
  { id: 14, label: 'Autres secteurs : Fabrication de cages flottantes' },
  { id: 15, label: 'Autres secteurs : Fabrication de filets de pêche' },
  { id: 16, label: 'Autres secteurs : Équipements pour élevage de poissons' },
  { id: 17, label: 'Autres secteurs : Équipements pour la pêche professionnelle' },
  { id: 18, label: 'Autres secteurs : Appareils de pêche et navires' },
  { id: 19, label: 'Autres secteurs : Construction navale' },
  { id: 20, label: 'Autres secteurs : Équipements portuaires' },
  { id: 21, label: 'Autres secteurs : Hygiène et santé des poissons' },
  { id: 22, label: 'Autres secteurs : Transformation des produits halieutiques' },
  { id: 23, label: 'Autres secteurs : Biotechnologies marines' },
  { id: 24, label: 'Autres secteurs : Énergies renouvelables' },
  { id: 25, label: 'Autres secteurs : Consultance' },
  { id: 26, label: 'Autres secteurs : Commerce et distribution' },
  { id: 27, label: 'Autres secteurs : Logistique' },
  { id: 28, label: 'Autres secteurs : Écotourisme et pêche récréative' },
  { id: 29, label: 'Autres secteurs : Finance et investissements' },
  { id: 30, label: 'Autres secteurs : Bateaux de plaisance' },
  { id: 31, label: 'Autres secteurs : Centres de recherche' },
  { id: 32, label: 'Autres secteurs : Plongée sous-marine' },
  { id: 33, label: 'Autres secteurs : Assurance' },
  { id: 34, label: 'Autres secteurs : Banque' },
  { id: 35, label: 'Autres secteurs : Coopérative' },
  { id: 36, label: 'Autres secteurs : Association' },
  { id: 37, label: 'Autres : A préciser' },
];

export const SECTEUR_AUTRE_ID = 37;

/* The text saved in PocketBase for the chosen id. */
export function secteurValue(id: string | number, autre: string): string {
  if (Number(id) === SECTEUR_AUTRE_ID) return `Autres : ${autre.trim()}`;
  return SECTEURS.find((s) => s.id === Number(id))?.label ?? '';
}
