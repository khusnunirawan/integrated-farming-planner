
import { SizePreset, ElementDetail, Position, RaisedBedDetail, Material, GroundBase } from './types';

export const APP_PASSWORD = "ayongopi123"; // Password statis untuk demo

export const SIZE_PRESETS: Record<Exclude<SizePreset, 'Custom'>, { l: number; w: number }> = {
  'Kecil': { l: 1, w: 1 },
  'Sedang': { l: 2, w: 1 },
  'Besar': { l: 3, w: 1 }
};

export const ELEMENT_LABELS: Record<string, string> = {
  chickenCoop: "Kandang Ayam",
  integratedFishPond: "Kolam Ikan Terintegrasi",
  organicProcessingUnit: "Unit Pengolahan Organik",
  nurseryZone: "Zona Penyemaian / Pembibitan",
  toolShed: "Gudang Alat",
  composter: "Komposter",
  maggotHouse: "Rumah Maggot",
  raisedBed: "Raised Bed (Bedengan)"
};

export const MATERIAL_OPTIONS: Material[] = ['Otomatis', 'Bata Merah', 'Batako', 'Kayu', 'Alumunium'];

export const GROUND_BASE_OPTIONS: GroundBase[] = ['Asli / Apa Adanya', 'Rumput', 'Paving Block', 'Batu Kerikil', 'Tanah', 'Daun Kering'];

export const INITIAL_ELEMENT_DETAIL: ElementDetail = {
  sizePreset: 'Sedang',
  lengthM: 2,
  widthM: 1,
  areaM2: 2,
  position: 'Otomatis'
};

// Specific default configurations for elements
export const DEFAULT_ELEMENT_CONFIGS: Record<string, ElementDetail> = {
  chickenCoop: {
    sizePreset: 'Custom',
    lengthM: 2,
    widthM: 1,
    areaM2: 2,
    position: 'Otomatis',
    notes: "Signature Style: Dinding kayu cokelat vernis, Atap spandek merah, Pondasi batako abu-abu, Area umbaran kawat ram dengan atap bening."
  },
  integratedFishPond: { ...INITIAL_ELEMENT_DETAIL, sizePreset: 'Besar', lengthM: 3, widthM: 1.5, areaM2: 4.5 },
  composter: { ...INITIAL_ELEMENT_DETAIL, sizePreset: 'Kecil', lengthM: 1, widthM: 1, areaM2: 1 },
  maggotHouse: { ...INITIAL_ELEMENT_DETAIL, sizePreset: 'Sedang', lengthM: 2, widthM: 1, areaM2: 2 },
};

export const INITIAL_RAISED_BED: RaisedBedDetail = {
  ...INITIAL_ELEMENT_DETAIL,
  plantsText: '',
  material: 'Otomatis',
  hasTrellis: false
};
