'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, MapPin, Users, AlertTriangle, Droplets, TrendingUp, X, ChevronDown } from 'lucide-react';

// Types
interface CountryStats {
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

interface DistrictFeature {
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

interface GeoJSONData {
    type: 'FeatureCollection';
    features: DistrictFeature[];
}

// Burden filter type
type ClimateRiskType = 'flood' | 'water_stress';

// Color scales for burden levels
const burdenColors: Record<number, string> = {
    0: '#e8f5e9', // Green - no burden
    1: '#fff3e0', // Light orange - 1 burden
    2: '#ffcc80', // Orange - 2 burdens
    3: '#d32f2f', // Red - triple burden
};

const burdenLabels: Record<number, string> = {
    0: 'No burden',
    1: '1 burden',
    2: '2 burdens',
    3: 'Triple burden',
};

// World Bank region codes from the 2_TB dataset — shown as pretty labels,
// filtered by raw code.
const regionLabels: Record<string, string> = {
    EAP: 'East Asia & Pacific',
    ECA: 'Europe & Central Asia',
    LAC: 'Latin America & Caribbean',
    MENAAP: 'MENA, Afghanistan, Pakistan',
    NorthAm: 'North America',
    SA: 'South Asia',
    SSA: 'Sub-Saharan Africa',
};

const REGION_ORDER = ['SSA', 'SA', 'EAP', 'LAC', 'MENAAP', 'ECA', 'NorthAm'];

const incomeGroupLabels: Record<string, string> = {
    '1_HIC': 'High income',
    '2_UMIC': 'Upper middle income',
    '3_LMIC': 'Lower middle income',
    '4_LIC': 'Low income',
};

const INCOME_GROUP_ORDER = ['4_LIC', '3_LMIC', '2_UMIC', '1_HIC'];

// Prefix for static assets; set in next.config for GitHub Pages project-site
// deployments, empty string for local dev and root-hosted deploys.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function Dashboard() {
    // State
    const [countries, setCountries] = useState<CountryStats[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<CountryStats | null>(null);
    const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMap, setIsLoadingMap] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedIncomeGroup, setSelectedIncomeGroup] = useState<string | null>(null);
    const [climateRiskType, setClimateRiskType] = useState<ClimateRiskType>('flood');
    const [hoveredDistrict, setHoveredDistrict] = useState<DistrictFeature | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Load countries on mount
    useEffect(() => {
        fetch(`${BASE_PATH}/data/countries.json`)
            .then(res => res.json())
            .then((data: CountryStats[]) => {
                setCountries(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load countries:', err);
                setIsLoading(false);
            });
    }, []);

    // Filtered countries for search + region + income group
    const filteredCountries = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return countries.filter(c => {
            if (selectedRegion && c.region !== selectedRegion) return false;
            if (selectedIncomeGroup && c.income_group !== selectedIncomeGroup) return false;
            if (query && !c.name.toLowerCase().includes(query) && !c.iso3.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [countries, searchQuery, selectedRegion, selectedIncomeGroup]);

    // Load country GeoJSON when selected
    useEffect(() => {
        if (!selectedCountry) {
            setGeoData(null);
            return;
        }

        setIsLoadingMap(true);
        fetch(`${BASE_PATH}/data/districts/${selectedCountry.iso3.toLowerCase()}.json`)
            .then(res => res.json())
            .then((data: GeoJSONData) => {
                setGeoData(data);
                setIsLoadingMap(false);
            })
            .catch(err => {
                console.error('Failed to load district data:', err);
                setIsLoadingMap(false);
            });
    }, [selectedCountry]);

    // Calculate bounding box for the map
    const bounds = useMemo(() => {
        if (!geoData) return null;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        geoData.features.forEach(feature => {
            const processCoords = (coords: number[]) => {
                if (coords.length >= 2) {
                    minX = Math.min(minX, coords[0]);
                    maxX = Math.max(maxX, coords[0]);
                    minY = Math.min(minY, coords[1]);
                    maxY = Math.max(maxY, coords[1]);
                }
            };

            const processPolygon = (polygon: number[][]) => {
                polygon.forEach(processCoords);
            };

            if (feature.geometry.type === 'Polygon') {
                (feature.geometry.coordinates as number[][][]).forEach(processPolygon);
            } else if (feature.geometry.type === 'MultiPolygon') {
                (feature.geometry.coordinates as number[][][][]).forEach(mp => mp.forEach(processPolygon));
            }
        });

        return { minX, minY, maxX, maxY };
    }, [geoData]);

    // Convert geo coordinates to SVG coordinates
    const projectCoords = useCallback((lon: number, lat: number, width: number, height: number) => {
        if (!bounds) return { x: 0, y: 0 };

        const { minX, minY, maxX, maxY } = bounds;
        const padding = 20;
        const mapWidth = width - padding * 2;
        const mapHeight = height - padding * 2;

        const x = padding + ((lon - minX) / (maxX - minX)) * mapWidth;
        const y = padding + ((maxY - lat) / (maxY - minY)) * mapHeight; // Flip Y axis

        return { x, y };
    }, [bounds]);

    // Generate SVG path for a feature with coordinate validation
    const featureToPath = useCallback((feature: DistrictFeature, width: number, height: number): string => {
        const paths: string[] = [];

        // Simplify coordinates by taking every Nth point for large polygons
        const simplifyRing = (ring: number[][], threshold: number = 50): number[][] => {
            if (ring.length <= threshold) return ring;
            const step = Math.ceil(ring.length / threshold);
            const simplified: number[][] = [];
            for (let i = 0; i < ring.length; i += step) {
                simplified.push(ring[i]);
            }
            // Ensure we include the last point to close the polygon
            if (simplified[simplified.length - 1] !== ring[ring.length - 1]) {
                simplified.push(ring[ring.length - 1]);
            }
            return simplified;
        };

        const processRing = (ring: number[][]) => {
            if (!ring || ring.length < 3) return '';

            // Simplify large rings
            const simplifiedRing = simplifyRing(ring);

            const points: string[] = [];
            for (const coord of simplifiedRing) {
                // Validate coordinates
                if (!coord || coord.length < 2 ||
                    typeof coord[0] !== 'number' || typeof coord[1] !== 'number' ||
                    !isFinite(coord[0]) || !isFinite(coord[1])) {
                    continue;
                }

                const { x, y } = projectCoords(coord[0], coord[1], width, height);

                // Validate projected coordinates
                if (!isFinite(x) || !isFinite(y)) continue;

                points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }

            if (points.length < 3) return '';
            return `M${points.join(' L')}Z`;
        };

        try {
            if (feature.geometry.type === 'Polygon') {
                (feature.geometry.coordinates as number[][][]).forEach(ring => {
                    const path = processRing(ring);
                    if (path) paths.push(path);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                (feature.geometry.coordinates as number[][][][]).forEach(polygon => {
                    polygon.forEach(ring => {
                        const path = processRing(ring);
                        if (path) paths.push(path);
                    });
                });
            }
        } catch (err) {
            console.warn('Error processing feature:', feature.properties?.mundis_id, err);
            return '';
        }

        return paths.join(' ');
    }, [projectCoords]);

    // Get burden level for a feature
    const getBurdenLevel = (feature: DistrictFeature): number => {
        const burdenValue = climateRiskType === 'flood'
            ? feature.properties.tb_fld
            : feature.properties.tb_wtrstr;
        return typeof burdenValue === 'number' ? burdenValue : -1;
    };

    // Which of the 3 dimensions flag this district for the current climate risk
    // mode. The overall burden level is the count of `active` here.
    const getBurdenBreakdown = (feature: DistrictFeature): { label: string; active: boolean }[] => {
        const p = feature.properties;
        const climate = climateRiskType === 'flood'
            ? { label: 'Flood risk', active: p.d_fld === 1 }
            : { label: 'Water stress', active: p.d_wtrstr === 1 };
        return [
            { label: 'Poverty', active: p.d_pov === 1 },
            climate,
            { label: 'Low sanitation', active: p.d_lowsan === 1 },
        ];
    };

    // Handle mouse events for tooltip
    const handleMouseMove = (e: React.MouseEvent, feature: DistrictFeature) => {
        setHoveredDistrict(feature);
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredDistrict(null);
    };

    // Download CSV functionality
    const downloadCSV = () => {
        if (!geoData || !selectedCountry) return;

        const headers = [
            'Region', 'District', 'Population', 'Urban Share (%)',
            'Poverty Rate ($2.15)', 'Poverty Rate ($3.65)', 'Poverty Rate ($6.85)',
            'Flood Risk (%)', 'Water Stress Category',
            'Improved Sanitation (%)', 'Sewer/Septic (%)', 'Improved Water (%)',
            'WB Region', 'Income Group',
            'Poverty Flag', 'Flood Flag', 'Water Stress Flag', 'Low Sanitation Flag',
            'Triple Burden (Flood)', 'Triple Burden (Water Stress)'
        ];

        const rows = geoData.features.map(f => [
            f.properties.nam1 || '',
            f.properties.nam2 || '',
            f.properties.popdist?.toFixed(0) || '',
            f.properties.shrurb?.toFixed(2) || '',
            f.properties.p215ln?.toFixed(2) || '',
            f.properties.p365ln?.toFixed(2) || '',
            f.properties.p685ln?.toFixed(2) || '',
            f.properties.shpopfld?.toFixed(2) || '',
            f.properties.bws_cat?.toString() || '',
            f.properties.impsan?.toFixed(2) || '',
            f.properties.sewlat?.toFixed(2) || '',
            f.properties.impwat?.toFixed(2) || '',
            f.properties.reg1 || '',
            f.properties.incgrp || '',
            f.properties.d_pov?.toString() || '',
            f.properties.d_fld?.toString() || '',
            f.properties.d_wtrstr?.toString() || '',
            f.properties.d_lowsan?.toString() || '',
            f.properties.tb_fld?.toString() || '',
            f.properties.tb_wtrstr?.toString() || '',
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedCountry.iso3}_triple_burden_data.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Calculate summary stats for selected country
    const summaryStats = useMemo(() => {
        if (!geoData) return null;

        const burdenKey = climateRiskType === 'flood' ? 'tb_fld' : 'tb_wtrstr';
        const distribution: Record<number, { count: number; population: number }> = {
            0: { count: 0, population: 0 },
            1: { count: 0, population: 0 },
            2: { count: 0, population: 0 },
            3: { count: 0, population: 0 },
        };

        let totalPop = 0;
        let missingData = 0;

        geoData.features.forEach(f => {
            const burden = f.properties[burdenKey as keyof typeof f.properties] as number;
            const pop = f.properties.popdist || 0;
            totalPop += pop;

            if (typeof burden === 'number' && burden >= 0 && burden <= 3) {
                distribution[burden].count++;
                distribution[burden].population += pop;
            } else {
                missingData++;
            }
        });

        return { distribution, totalPop, missingData };
    }, [geoData, climateRiskType]);

    // Format large numbers
    const formatNumber = (n: number): string => {
        if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
        return n.toFixed(0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--climate-teal)] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] bg-clip-text text-transparent">
                    Data Explorer
                </h1>
                <p className="text-gray-600">
                    Explore district-level triple burden data for {countries.length} countries
                </p>
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Country Selector */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Country
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[var(--climate-teal)] transition-colors text-left"
                        >
                            {selectedCountry ? (
                                <span className="font-medium">{selectedCountry.name}</span>
                            ) : (
                                <span className="text-gray-400">Choose a country...</span>
                            )}
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
                                >
                                    <div className="p-2 border-b space-y-2">
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => setSelectedRegion(null)}
                                                className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedRegion === null
                                                    ? 'bg-[var(--climate-teal)] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                All regions
                                            </button>
                                            {REGION_ORDER.map(code => (
                                                <button
                                                    key={code}
                                                    onClick={() => setSelectedRegion(selectedRegion === code ? null : code)}
                                                    className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedRegion === code
                                                        ? 'bg-[var(--climate-teal)] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    title={regionLabels[code]}
                                                >
                                                    {code}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => setSelectedIncomeGroup(null)}
                                                className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedIncomeGroup === null
                                                    ? 'bg-[var(--sanitation-blue)] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                All incomes
                                            </button>
                                            {INCOME_GROUP_ORDER.map(code => (
                                                <button
                                                    key={code}
                                                    onClick={() => setSelectedIncomeGroup(selectedIncomeGroup === code ? null : code)}
                                                    className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedIncomeGroup === code
                                                        ? 'bg-[var(--sanitation-blue)] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    title={incomeGroupLabels[code]}
                                                >
                                                    {code.slice(2)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search countries..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--climate-teal)] focus:border-transparent text-sm"
                                                autoFocus
                                            />
                                        </div>
                                        {filteredCountries.length === 0 && (
                                            <div className="text-xs text-gray-500 text-center py-2">
                                                No countries match these filters
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-y-auto max-h-60">
                                        {filteredCountries.map((country) => (
                                            <button
                                                key={country.iso3}
                                                onClick={() => {
                                                    setSelectedCountry(country);
                                                    setIsDropdownOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCountry?.iso3 === country.iso3 ? 'bg-teal-50' : ''
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium text-left">{country.name}</div>
                                                    <div className="text-xs text-gray-500">{country.districts} districts</div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatNumber(country.population)} pop
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Climate Risk Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Climate Risk Type
                    </label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setClimateRiskType('flood')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${climateRiskType === 'flood'
                                ? 'bg-white shadow text-[var(--sanitation-blue)]'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            🌊 Flood Risk
                        </button>
                        <button
                            onClick={() => setClimateRiskType('water_stress')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${climateRiskType === 'water_stress'
                                ? 'bg-white shadow text-[var(--climate-teal)]'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            💧 Water Stress
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {selectedCountry ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="modern-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin className="w-5 h-5 text-[var(--climate-teal)]" />
                                <span className="text-sm text-gray-600">Districts</span>
                            </div>
                            <div className="text-3xl font-bold">{selectedCountry.districts.toLocaleString()}</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="modern-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="w-5 h-5 text-[var(--sanitation-blue)]" />
                                <span className="text-sm text-gray-600">Population</span>
                            </div>
                            <div className="text-3xl font-bold">{formatNumber(selectedCountry.population)}</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="modern-card p-6 bg-gradient-to-br from-red-50 to-orange-50"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-gray-600">Triple Burden Pop</span>
                            </div>
                            <div className="text-3xl font-bold text-red-600">
                                {formatNumber(
                                    climateRiskType === 'flood'
                                        ? selectedCountry.pop_triple_burden_flood
                                        : selectedCountry.pop_triple_burden_water_stress
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="modern-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-[var(--poverty-earth)]" />
                                <span className="text-sm text-gray-600">TB Share</span>
                            </div>
                            <div className="text-3xl font-bold">
                                {selectedCountry.population > 0
                                    ? (
                                        ((climateRiskType === 'flood'
                                            ? selectedCountry.pop_triple_burden_flood
                                            : selectedCountry.pop_triple_burden_water_stress) /
                                            selectedCountry.population) *
                                        100
                                    ).toFixed(1)
                                    : 0}
                                %
                            </div>
                        </motion.div>
                    </div>

                    {/* Map and Legend */}
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Map */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="lg:col-span-3 modern-card p-6"
                        >
                            <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedCountry.name} - District Map</h2>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedCountry.region && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--climate-teal)]/10 text-[var(--climate-teal)] font-medium">
                                                {regionLabels[selectedCountry.region] ?? selectedCountry.region}
                                            </span>
                                        )}
                                        {selectedCountry.income_group && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--sanitation-blue)]/10 text-[var(--sanitation-blue)] font-medium">
                                                {incomeGroupLabels[selectedCountry.income_group] ?? selectedCountry.income_group}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={downloadCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                                >
                                    <Download className="w-4 h-4" />
                                    Download CSV
                                </button>
                            </div>

                            {isLoadingMap ? (
                                <div className="flex items-center justify-center h-96">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--climate-teal)] border-t-transparent"></div>
                                </div>
                            ) : geoData ? (
                                <div className="relative">
                                    <svg
                                        viewBox="0 0 800 600"
                                        className="w-full h-auto bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl"
                                        style={{ minHeight: '400px' }}
                                    >
                                        {geoData.features.map((feature, i) => {
                                            const burdenLevel = getBurdenLevel(feature);
                                            const color = burdenLevel >= 0 ? burdenColors[burdenLevel] : '#f5f5f5';
                                            const path = featureToPath(feature, 800, 600);

                                            return (
                                                <path
                                                    key={feature.properties.mundis_id || i}
                                                    d={path}
                                                    fill={color}
                                                    stroke="#ffffff"
                                                    strokeWidth={0.5}
                                                    className="transition-all duration-200 hover:stroke-gray-800 hover:stroke-2 cursor-pointer"
                                                    onMouseMove={(e) => handleMouseMove(e, feature)}
                                                    onMouseLeave={handleMouseLeave}
                                                    style={{ opacity: hoveredDistrict === feature ? 1 : 0.9 }}
                                                />
                                            );
                                        })}
                                    </svg>

                                    {/* Tooltip */}
                                    <AnimatePresence>
                                        {hoveredDistrict && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="fixed z-50 bg-white rounded-xl shadow-2xl p-4 max-w-xs pointer-events-none"
                                                style={{
                                                    left: tooltipPos.x + 15,
                                                    top: tooltipPos.y + 15,
                                                }}
                                            >
                                                <div className="font-bold text-lg mb-1">
                                                    {hoveredDistrict.properties.nam2 || 'Unknown District'}
                                                </div>
                                                <div className="text-sm text-gray-500 mb-3">
                                                    {hoveredDistrict.properties.nam1 || ''}
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Population:</span>
                                                        <span className="font-medium">{formatNumber(hoveredDistrict.properties.popdist || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Burden Level:</span>
                                                        <span
                                                            className="font-medium px-2 py-0.5 rounded"
                                                            style={{
                                                                backgroundColor: burdenColors[getBurdenLevel(hoveredDistrict)] || '#f5f5f5',
                                                                color: getBurdenLevel(hoveredDistrict) === 3 ? 'white' : 'inherit',
                                                            }}
                                                        >
                                                            {burdenLabels[getBurdenLevel(hoveredDistrict)] || 'No data'}
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 mt-1 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 mb-1">Dimensions flagged:</div>
                                                        {getBurdenBreakdown(hoveredDistrict).map(d => (
                                                            <div key={d.label} className="flex items-center gap-2 text-sm">
                                                                <span
                                                                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${d.active
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-gray-100 text-gray-400'
                                                                        }`}
                                                                    aria-hidden="true"
                                                                >
                                                                    {d.active ? '✓' : '–'}
                                                                </span>
                                                                <span className={d.active ? 'font-medium text-gray-800' : 'text-gray-400'}>
                                                                    {d.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {hoveredDistrict.properties.p215ln != null && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Poverty ($2.15):</span>
                                                            <span className="font-medium">{hoveredDistrict.properties.p215ln.toFixed(1)}%</span>
                                                        </div>
                                                    )}
                                                    {hoveredDistrict.properties.impsan != null && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Sanitation:</span>
                                                            <span className="font-medium">{hoveredDistrict.properties.impsan.toFixed(1)}%</span>
                                                        </div>
                                                    )}
                                                    {hoveredDistrict.properties.impwat != null && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Improved water:</span>
                                                            <span className="font-medium">{hoveredDistrict.properties.impwat.toFixed(1)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-96 text-gray-500">
                                    Failed to load map data
                                </div>
                            )}
                        </motion.div>

                        {/* Legend & Distribution */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="modern-card p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Burden Levels</h3>

                            {/* Legend */}
                            <div className="space-y-3 mb-6">
                                {[3, 2, 1, 0].map((level) => (
                                    <div key={level} className="flex items-center gap-3">
                                        <div
                                            className="w-6 h-6 rounded"
                                            style={{ backgroundColor: burdenColors[level] }}
                                        />
                                        <span className="text-sm">{burdenLabels[level]}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-gray-200" />
                                    <span className="text-sm text-gray-500">No data</span>
                                </div>
                            </div>

                            {/* Distribution */}
                            {summaryStats && (
                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Distribution</h4>
                                    <div className="space-y-2">
                                        {[3, 2, 1, 0].map((level) => {
                                            const stats = summaryStats.distribution[level];
                                            const percent = summaryStats.totalPop > 0
                                                ? (stats.population / summaryStats.totalPop) * 100
                                                : 0;
                                            return (
                                                <div key={level}>
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>{burdenLabels[level]}</span>
                                                        <span>{percent.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${percent}%`,
                                                                backgroundColor: burdenColors[level],
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="modern-card p-16 text-center"
                >
                    <Droplets className="w-16 h-16 mx-auto mb-6 text-[var(--climate-teal)] opacity-50" />
                    <h2 className="text-2xl font-bold mb-3">Select a Country to Begin</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Choose a country from the dropdown above to explore district-level triple burden data
                        including poverty, climate risk, and sanitation access.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
