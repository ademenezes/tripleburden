import Layout from '@/components/Layout';
import { MapPin, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Results() {
    return (
        <Layout>
            <div className="bg-gradient-to-br from-gray-50 to-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-6">Results & Regional Analysis</h1>
                    <p className="text-xl text-gray-600 mb-12">
                        Global and regional breakdown of the Triple Burden impact
                    </p>

                    {/* Global Overview */}
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold mb-8">Global Impact</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4" style={{ borderColor: 'var(--climate-teal)' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-8 h-8" style={{ color: 'var(--climate-teal)' }} />
                                    <h3 className="text-2xl font-bold">Water Stress Scenario</h3>
                                </div>
                                <div className="text-5xl font-bold mb-4" style={{ color: 'var(--climate-teal)' }}>919M</div>
                                <p className="text-gray-700 mb-4">
                                    people (26% of urban population in developing countries) face all three burdens simultaneously
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        When water stress is considered as the climate risk driver
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4" style={{ borderColor: 'var(--sanitation-blue)' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-8 h-8" style={{ color: 'var(--sanitation-blue)' }} />
                                    <h3 className="text-2xl font-bold">Flood Risk Scenario</h3>
                                </div>
                                <div className="text-5xl font-bold mb-4" style={{ color: 'var(--sanitation-blue)' }}>1.1B</div>
                                <p className="text-gray-700 mb-4">
                                    people (32% of urban population) are affected by the triple burden
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        When flooding is considered as the climate risk driver
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Regional Breakdown */}
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold mb-8">Regional Breakdown</h2>

                        {/* South Asia - Highlighted */}
                        <div className="bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] text-white p-8 rounded-xl shadow-lg mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-8 h-8" />
                                <h3 className="text-2xl font-bold">South Asia: The Epicenter</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/10 p-6 rounded-lg">
                                    <div className="text-4xl font-bold mb-2">57%</div>
                                    <p className="text-lg">of urban population affected</p>
                                    <p className="text-sm opacity-75 mt-2">Water Stress Scenario</p>
                                </div>
                                <div className="bg-white/10 p-6 rounded-lg">
                                    <div className="text-4xl font-bold mb-2">72%</div>
                                    <p className="text-lg">of urban population affected</p>
                                    <p className="text-sm opacity-75 mt-2">Flood Risk Scenario</p>
                                </div>
                            </div>
                            <p className="mt-6 text-sm opacity-90">
                                South Asia shows the highest incidence of the triple burden globally, with flood risk
                                being twice as impactful as the next most-affected region.
                            </p>
                        </div>

                        {/* Other Regions */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h4 className="text-xl font-bold mb-4">Central Asia</h4>
                                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--poverty-earth)' }}>~28%</div>
                                <p className="text-gray-600">of urban population facing the triple burden</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h4 className="text-xl font-bold mb-4">Middle East & North Africa</h4>
                                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--poverty-earth)' }}>~25-26%</div>
                                <p className="text-gray-600">of urban population facing the triple burden</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h4 className="text-xl font-bold mb-4">Sub-Saharan Africa</h4>
                                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--poverty-earth)' }}>~20-21%</div>
                                <p className="text-gray-600">of urban population facing the triple burden</p>
                            </div>
                        </div>
                    </section>

                    {/* Case Studies */}
                    <section>
                        <h2 className="text-3xl font-bold mb-8">Country Case Studies</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <p className="text-gray-700 mb-6">
                                The analysis highlights specific areas facing the triple burden in the following countries:
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="border-l-4 pl-4" style={{ borderColor: 'var(--climate-teal)' }}>
                                    <h4 className="text-xl font-bold mb-2">🇧🇩 Bangladesh</h4>
                                    <p className="text-gray-600 text-sm">
                                        Significant areas facing convergence of flood risk, poverty, and inadequate sanitation
                                    </p>
                                </div>
                                <div className="border-l-4 pl-4" style={{ borderColor: 'var(--sanitation-blue)' }}>
                                    <h4 className="text-xl font-bold mb-2">🇵🇭 Philippines</h4>
                                    <p className="text-gray-600 text-sm">
                                        Urban districts near Davao and other regions experiencing the triple burden
                                    </p>
                                </div>
                                <div className="border-l-4 pl-4" style={{ borderColor: 'var(--poverty-earth)' }}>
                                    <h4 className="text-xl font-bold mb-2">🇳🇬 Nigeria</h4>
                                    <p className="text-gray-600 text-sm">
                                        Multiple urban areas affected by the intersection of all three vulnerabilities
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Key Insight */}
                    <section className="mt-12">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-8 rounded-xl border-l-4" style={{ borderColor: 'var(--sanitation-blue)' }}>
                            <div className="flex items-start gap-4">
                                <TrendingUp className="w-8 h-8 flex-shrink-0 mt-1" style={{ color: 'var(--sanitation-blue)' }} />
                                <div>
                                    <h3 className="text-xl font-bold mb-3">Key Insight</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        The triple burden affects between <strong>one-quarter and one-third</strong> of the urban
                                        population in developing countries. This is not just a statistical overlap—it represents
                                        a <strong>cycle of inescapable risk</strong> where each burden amplifies the others, creating
                                        conditions far worse than the sum of individual challenges.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
