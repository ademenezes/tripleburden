export type ClimateRiskType = 'flood' | 'water_stress';

export interface CountryStats {
  iso3: string;
  name: string;
  region: string | null;
  income_group: string | null;
  districts: number;
  population: number;
  pop_triple_burden_flood: number;
  pop_triple_burden_water_stress: number;
  burden_distribution_flood: Record<string, number>;
  burden_distribution_water_stress: Record<string, number>;
}

export interface DistrictFeature {
  type: 'Feature';
  properties: {
    mundis_id: number;
    nam1: string;
    nam2: string;
    popdist: number;
    shrurb: number;
    p215ln: number;
    p365ln: number;
    p685ln: number;
    d_pov: number;
    shpopfld: number;
    d_fld: number;
    bws_cat: number;
    d_wtrstr: number;
    impsan: number;
    sewlat: number;
    d_lowsan: number;
    impwat?: number;
    reg1?: string;
    incgrp?: string;
    tb_fld: number;
    tb_wtrstr: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONData {
  type: 'FeatureCollection';
  features: DistrictFeature[];
}

export interface LevelStats {
  count: number;
  population: number;
  combos: Record<string, { count: number; population: number }>;
}

export interface SummaryStats {
  distribution: Record<number, LevelStats>;
  totalPop: number;
  missingData: number;
  // Top-level nam1 (parent region) with the most triple-burden districts.
  dominantRegion: string | null;
  // Which single dimension flags the most districts overall (for narrative).
  dominantDimension: 'P' | 'C' | 'S' | null;
}
