import Layout from '@/components/Layout';
import { CheckCircle2, Droplets, TrendingDown, Home } from 'lucide-react';

export default function Methodology() {
    return (
        <Layout>
            <div className="bg-gradient-to-br from-gray-50 to-white py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-6">Methodology</h1>
                    <p className="text-xl text-gray-600 mb-12">
                        How we identify and measure the Triple Burden
                    </p>

                    {/* Definition */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold mb-6">Defining the Triple Burden</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                An urban district is categorized as facing the <strong>Triple Burden</strong> if it meets
                                <strong> all three</strong> of the following criteria:
                            </p>
                        </div>
                    </section>

                    {/* Three Criteria */}
                    <section className="mb-12 space-y-6">
                        {/* Climate Risk */}
                        <div className="bg-gradient-to-r from-[var(--climate-teal-light)] to-[var(--climate-teal)] text-white p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Droplets className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">1. Climate Risk</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Water Stress ≥ 10%</h4>
                                    <p className="text-sm opacity-90">
                                        Defined as the ratio of total water demand to renewable surface water and groundwater,
                                        estimated at the sub-basin level.
                                    </p>
                                    <p className="text-xs mt-2 opacity-75">Source: AQUEDUCT 4 (World Resources Institute)</p>
                                </div>
                                <div className="text-center font-semibold">OR</div>
                                <div className="bg-white/10 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Flood Risk ≥ 14%</h4>
                                    <p className="text-sm opacity-90">
                                        Population at significant risk of flooding (≥15cm inundation depth) in a 1-in-100 year event.
                                    </p>
                                    <p className="text-xs mt-2 opacity-75">Source: Fathom-Global 2.0</p>
                                </div>
                            </div>
                        </div>

                        {/* Poverty */}
                        <div className="bg-gradient-to-r from-[var(--poverty-earth-light)] to-[var(--poverty-earth)] text-white p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingDown className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">2. Poverty</h3>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Poverty Rate ≥ 33%</h4>
                                <p className="text-sm opacity-90 mb-3">
                                    Share of population with income or consumption per person per day lower than poverty lines:
                                </p>
                                <ul className="text-sm space-y-1 opacity-90">
                                    <li>• US$2.15 (extreme poverty)</li>
                                    <li>• US$3.65 (lower-middle income countries)</li>
                                    <li>• US$6.85 (upper-middle income countries)</li>
                                </ul>
                                <p className="text-xs mt-3 opacity-75">Source: World Bank GSAP (2017 PPP, 2019 data)</p>
                            </div>
                        </div>

                        {/* Low Sanitation */}
                        <div className="bg-gradient-to-r from-[var(--sanitation-blue-light)] to-[var(--sanitation-blue)] text-white p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Home className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">3. Low Access to Sanitation</h3>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Access to Sewerage/Septic Tanks ≤ 75%</h4>
                                <p className="text-sm opacity-90">
                                    Percentage of population with access to improved sanitation facilities (sewerage or septic tanks).
                                    Districts with 75% or lower access are considered to have low sanitation coverage.
                                </p>
                                <p className="text-xs mt-2 opacity-75">Source: Deshpande et al. (2020) - Bayesian geostatistical model covering 88 LMICs</p>
                            </div>
                        </div>
                    </section>

                    {/* Urbanization Standard */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold mb-6">Standardized Urbanization</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Districts (second level of political division) are selected as the unit of analysis.
                                A district is classified as <strong>urban</strong> if at least 5% of its land consists of grids
                                in the four categories deemed urban by the Global Human Settlement Layer (GHSL).
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-[var(--climate-teal)] mb-2">26%</div>
                                    <p className="text-sm text-gray-600">of ~38,000 districts are urban</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-[var(--sanitation-blue)] mb-2">5%</div>
                                    <p className="text-sm text-gray-600">of global land area</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-[var(--poverty-earth)] mb-2">58%</div>
                                    <p className="text-sm text-gray-600">of global population</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Sources Summary */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6">Data Sources</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--climate-teal)' }} />
                                    <div>
                                        <strong>Climate Risk:</strong> AQUEDUCT 4 (WRI), Fathom-Global 2.0
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--poverty-earth)' }} />
                                    <div>
                                        <strong>Poverty:</strong> World Bank GSAP (Geospatial Poverty Portal)
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--sanitation-blue)' }} />
                                    <div>
                                        <strong>Sanitation:</strong> Deshpande et al. (2020) - 88 LMICs, 600+ sources
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--foreground)' }} />
                                    <div>
                                        <strong>Boundaries:</strong> GADM (Database of Global Administrative Boundaries)
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
