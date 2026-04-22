'use client';

import { motion } from 'framer-motion';
import CountrySelector from './dashboard/CountrySelector';
import ClimateRiskToggle from './dashboard/ClimateRiskToggle';
import CountryHeader from './dashboard/CountryHeader';
import KeyFindings from './dashboard/KeyFindings';
import KpiRow from './dashboard/KpiRow';
import DimensionBreakdown from './dashboard/DimensionBreakdown';
import DistrictMap from './dashboard/DistrictMap';
import TopDistrictsTable from './dashboard/TopDistrictsTable';
import BurdenDistributionChart from './dashboard/BurdenDistributionChart';
import GlobalOverview from './dashboard/GlobalOverview';
import { useDashboardState } from './dashboard/useDashboardState';

export default function Dashboard() {
    const {
        countries,
        selectedCountry,
        geoData,
        summaryStats,
        climateRiskType,
        isLoading,
        isLoadingMap,
        loadError,
        setSelectedCountry,
        setClimateRiskType,
    } = useDashboardState();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--climate-teal)] border-t-transparent" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <p className="text-gray-700">{loadError}</p>
            </div>
        );
    }

    const tripleBurdenDistricts = summaryStats?.distribution[3]?.count ?? 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--climate-teal)] mb-2">
                    Data explorer
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] bg-clip-text text-transparent">
                    Triple Burden Dashboard
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl">
                    Explore district-level poverty, climate risk, and sanitation data for{' '}
                    {countries.length.toLocaleString()} countries.
                </p>
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <CountrySelector
                    countries={countries}
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                />
                <ClimateRiskToggle value={climateRiskType} onChange={setClimateRiskType} />
            </div>

            {selectedCountry && summaryStats ? (
                <motion.div
                    key={selectedCountry.iso3}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <CountryHeader
                        country={selectedCountry}
                        climateRiskType={climateRiskType}
                        geoData={geoData}
                        tripleBurdenDistricts={tripleBurdenDistricts}
                    />

                    <KeyFindings
                        country={selectedCountry}
                        stats={summaryStats}
                        climateRiskType={climateRiskType}
                    />

                    <KpiRow
                        country={selectedCountry}
                        climateRiskType={climateRiskType}
                        tripleBurdenDistricts={tripleBurdenDistricts}
                    />

                    {geoData && (
                        <DimensionBreakdown
                            country={selectedCountry}
                            geoData={geoData}
                            climateRiskType={climateRiskType}
                        />
                    )}

                    <div className="grid lg:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="lg:col-span-2 modern-card p-6"
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-bold">{selectedCountry.name} district map</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Hover a district to see detailed metrics
                                </p>
                            </div>
                            <DistrictMap
                                geoData={geoData}
                                isLoading={isLoadingMap}
                                climateRiskType={climateRiskType}
                            />
                        </motion.div>

                        <BurdenDistributionChart stats={summaryStats} climateRiskType={climateRiskType} />
                    </div>

                    {geoData && (
                        <TopDistrictsTable geoData={geoData} climateRiskType={climateRiskType} />
                    )}
                </motion.div>
            ) : selectedCountry && isLoadingMap ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--climate-teal)] border-t-transparent" />
                </div>
            ) : (
                <GlobalOverview
                    countries={countries}
                    climateRiskType={climateRiskType}
                    onSelectCountry={setSelectedCountry}
                />
            )}
        </div>
    );
}
