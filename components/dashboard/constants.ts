import type { ClimateRiskType } from './types';

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const burdenColors: Record<number, string> = {
  0: '#e8f5e9',
  1: '#fff3e0',
  2: '#ffcc80',
  3: '#d32f2f',
};

export const burdenLabels: Record<number, string> = {
  0: 'No burden',
  1: '1 burden',
  2: '2 burdens',
  3: 'Triple burden',
};

export const regionLabels: Record<string, string> = {
  EAP: 'East Asia & Pacific',
  ECA: 'Europe & Central Asia',
  LAC: 'Latin America & Caribbean',
  MENAAP: 'MENA, Afghanistan, Pakistan',
  NorthAm: 'North America',
  SA: 'South Asia',
  SSA: 'Sub-Saharan Africa',
};

export const REGION_ORDER = ['SSA', 'SA', 'EAP', 'LAC', 'MENAAP', 'ECA', 'NorthAm'];

export const incomeGroupLabels: Record<string, string> = {
  '1_HIC': 'High income',
  '2_UMIC': 'Upper middle income',
  '3_LMIC': 'Lower middle income',
  '4_LIC': 'Low income',
};

export const INCOME_GROUP_ORDER = ['4_LIC', '3_LMIC', '2_UMIC', '1_HIC'];

export const COMBO_ORDER_AT_LEVEL: Record<number, string[]> = {
  0: ['None'],
  1: ['P', 'C', 'S'],
  2: ['P+C', 'P+S', 'C+S'],
  3: ['P+C+S'],
};

export const CLIMATE_RISK_LABELS: Record<ClimateRiskType, string> = {
  flood: 'Flood risk',
  water_stress: 'Water stress',
};

// Thresholds used by the methodology (kept in sync with docs/methodology page).
export const THRESHOLDS = {
  povertyPct: 33,
  floodPct: 14,
  waterStressCatMin: 3,
  sanitationPct: 75,
};

export const dimensionShortLabel = (dim: string, riskType: ClimateRiskType): string => {
  if (dim === 'P') return 'Poverty';
  if (dim === 'S') return 'Low sanitation';
  return riskType === 'flood' ? 'Flood risk' : 'Water stress';
};

export const comboLabel = (combo: string, riskType: ClimateRiskType): string => {
  if (combo === 'None' || combo === '') return 'None';
  const parts = combo.split('+');
  if (parts.length === 1) return `${dimensionShortLabel(parts[0], riskType)} only`;
  return parts.map((p) => dimensionShortLabel(p, riskType)).join(' + ');
};

export const formatNumber = (n: number): string => {
  if (!isFinite(n)) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
};

export const formatPercent = (n: number, digits = 1): string => {
  if (!isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
};

// TB share bands — used by KpiRow to colour-code severity.
export const tbShareBand = (share: number): 'low' | 'mid' | 'high' => {
  if (share < 5) return 'low';
  if (share < 15) return 'mid';
  return 'high';
};
