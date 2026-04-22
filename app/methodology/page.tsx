import Layout from '@/components/Layout';
import SectionHeading from '@/components/shared/SectionHeading';
import ThresholdDiagrams from '@/components/methodology/ThresholdDiagrams';
import SampleDistrict from '@/components/methodology/SampleDistrict';
import { CheckCircle2, Droplets, TrendingDown, Home } from 'lucide-react';

export const metadata = {
    title: 'Methodology',
    description:
        'How we identify and measure the Triple Burden: thresholds, data sources, and district-level urbanisation criteria.',
};

export default function Methodology() {
    return (
        <Layout>
            <div className="bg-gradient-to-br from-gray-50 to-white py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        as="h1"
                        eyebrow="How we measure it"
                        size="lg"
                        subtitle="Every district in the dataset is screened against three thresholds. Meeting all three is what defines a triple-burdened district."
                        className="mb-14"
                    >
                        Methodology
                    </SectionHeading>

                    {/* Definition */}
                    <section className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">Defining the triple burden</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <p className="text-gray-700 leading-relaxed">
                                An urban district is categorised as facing the <strong>triple burden</strong> if it
                                meets <strong>all three</strong> of the criteria below. A district is considered{' '}
                                <strong>urban</strong> if at least 5% of its land falls into the four urban categories
                                of the Global Human Settlement Layer (GHSL).
                            </p>
                        </div>
                    </section>

                    {/* Three criteria */}
                    <section className="mb-12 space-y-6">
                        <div className="bg-gradient-to-r from-[var(--climate-teal-light)] to-[var(--climate-teal)] text-white p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Droplets className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">1. Climate risk</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Water stress ≥ category 3</h4>
                                    <p className="text-sm opacity-90">
                                        Ratio of total water demand to renewable surface and groundwater, estimated at
                                        the sub-basin level. Aqueduct categories 3+ indicate medium-high stress or above.
                                    </p>
                                    <p className="text-xs mt-2 opacity-75">Source: AQUEDUCT 4 (World Resources Institute)</p>
                                </div>
                                <div className="text-center font-semibold">OR</div>
                                <div className="bg-white/10 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Flood risk ≥ 14%</h4>
                                    <p className="text-sm opacity-90">
                                        Share of population at significant risk of flooding (≥15cm inundation depth) in
                                        a 1-in-100-year event.
                                    </p>
                                    <p className="text-xs mt-2 opacity-75">Source: Fathom-Global 2.0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[var(--poverty-earth-light)] to-[var(--poverty-earth)] text-white p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingDown className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">2. Poverty</h3>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Poverty rate ≥ 33%</h4>
                                <p className="text-sm opacity-90 mb-3">
                                    Share of population with income or consumption per person per day below:
                                </p>
                                <ul className="text-sm space-y-1 opacity-90">
                                    <li>• US$2.15 (extreme poverty)</li>
                                    <li>• US$3.65 (lower-middle income countries)</li>
                                    <li>• US$6.85 (upper-middle income countries)</li>
                                </ul>
                                <p className="text-xs mt-3 opacity-75">Source: World Bank GSAP (2017 PPP, 2019 data)</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[var(--sanitation-blue-light)] to-[var(--sanitation-blue)] text-white p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Home className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">3. Low sanitation access</h3>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Sewerage/septic access ≤ 75%</h4>
                                <p className="text-sm opacity-90">
                                    Share of population with access to improved sanitation facilities (sewerage or
                                    septic tanks). Districts at or below 75% are flagged as low-access.
                                </p>
                                <p className="text-xs mt-2 opacity-75">
                                    Source: Deshpande et al. (2020) — Bayesian geostatistical model, 88 LMICs
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Threshold diagrams */}
                    <section className="mb-16">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold">How the thresholds look in data</h2>
                            <p className="text-gray-600 mt-1">
                                District-level distributions across three illustrative countries, with the threshold
                                for each criterion marked. Districts above (or below, for sanitation) the line
                                are flagged.
                            </p>
                        </div>
                        <ThresholdDiagrams />
                    </section>

                    {/* Sample district */}
                    <section className="mb-16">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold">What qualifies as triple-burdened?</h2>
                            <p className="text-gray-600 mt-1">
                                A worked example: one of the largest triple-burdened districts in Bangladesh.
                            </p>
                        </div>
                        <SampleDistrict iso3="bgd" />
                    </section>

                    {/* Urbanization standard */}
                    <section className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">Standardised urbanisation</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Districts (second-level political division) are the unit of analysis. A district is
                                classified as <strong>urban</strong> if at least 5% of its land consists of grids in
                                the four urban categories defined by the Global Human Settlement Layer (GHSL).
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-[var(--climate-teal)] mb-2 tabular-nums">26%</div>
                                    <p className="text-sm text-gray-600">of ~38,000 districts are urban</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-[var(--sanitation-blue)] mb-2 tabular-nums">5%</div>
                                    <p className="text-sm text-gray-600">of global land area</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-[var(--poverty-earth)] mb-2 tabular-nums">58%</div>
                                    <p className="text-sm text-gray-600">of global population</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data sources */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">Data sources</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2
                                        className="w-5 h-5 mt-1 flex-shrink-0"
                                        style={{ color: 'var(--climate-teal)' }}
                                    />
                                    <div>
                                        <strong>Climate risk:</strong> AQUEDUCT 4 (WRI), Fathom-Global 2.0
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2
                                        className="w-5 h-5 mt-1 flex-shrink-0"
                                        style={{ color: 'var(--poverty-earth)' }}
                                    />
                                    <div>
                                        <strong>Poverty:</strong> World Bank GSAP (Geospatial Poverty Portal)
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2
                                        className="w-5 h-5 mt-1 flex-shrink-0"
                                        style={{ color: 'var(--sanitation-blue)' }}
                                    />
                                    <div>
                                        <strong>Sanitation:</strong> Deshpande et al. (2020) — 88 LMICs, 600+ sources
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2
                                        className="w-5 h-5 mt-1 flex-shrink-0"
                                        style={{ color: 'var(--foreground)' }}
                                    />
                                    <div>
                                        <strong>Boundaries:</strong> GADM (Global Administrative Areas)
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
