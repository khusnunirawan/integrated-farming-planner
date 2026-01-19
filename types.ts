
export enum AppScreen {
  LOGIN = 'login',
  APP = 'app',
  RESULT = 'result'
}

export type ModelMode = 'flash' | 'pro';

export type SizePreset = 'Kecil' | 'Sedang' | 'Besar' | 'Custom';

export type Position = 
  | 'Otomatis' 
  | 'Kiri Atas' | 'Tengah Atas' | 'Kanan Atas'
  | 'Tengah Kiri' | 'Tengah' | 'Tengah Kanan'
  | 'Kiri Bawah' | 'Tengah Bawah' | 'Kanan Bawah';

export type Material = 'Otomatis' | 'Bata Merah' | 'Batako' | 'Kayu' | 'Alumunium';

export type GroundBase = 'Rumput' | 'Paving Block' | 'Batu Kerikil' | 'Tanah' | 'Daun Kering';

export interface ElementDetail {
  sizePreset: SizePreset;
  lengthM: number;
  widthM: number;
  areaM2: number;
  position: Position;
  notes?: string;
  refImageDataUrl?: string;
}

export interface RaisedBedDetail extends ElementDetail {
  plantsText: string;
  material: Material;
  hasTrellis: boolean;
}

export interface ProjectState {
  landPhotoDataUrl: string;
  landLengthM: number;
  landWidthM: number;
  groundBase: GroundBase;
  removePeople: boolean;
  modelMode: ModelMode;
  selectedElements: {
    chickenCoop: boolean;
    integratedFishPond: boolean;
    organicProcessingUnit: boolean;
    nurseryZone: boolean;
    toolShed: boolean;
    composter: boolean;
    maggotHouse: boolean;
    raisedBed: boolean;
  };
  elementsDetail: Record<string, ElementDetail>;
  raisedBeds: RaisedBedDetail[];
  finalImage?: string;
}

export interface AppData {
  auth: boolean;
  project: ProjectState;
}
