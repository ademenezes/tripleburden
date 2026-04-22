import Layout from '@/components/Layout';
import SectionHeading from '@/components/shared/SectionHeading';
import ResultsSections from '@/components/results/ResultsSections';
import { TrendingUp } from 'lucide-react';

export const metadata = {
    title: 'Results & Regional Analysis',
    description:
        'Global and regional breakdown of the Triple Burden impact across 217 countries, with case studies for Bangladesh, Philippines, and Nigeria.',
};

export default function Results() {
    return (
        <Layout>
            <div className="bg-gradient-to-br from-gray-50 to-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-14">
                        <SectionHeading
                            as="h1"
                            eyebrow="Analysis"
                            size="lg"
                            subtitle="Where the triple burden concentrates — aggregated from the district-level dataset."
                        >
                            Results &amp; regional analysis
                        </SectionHeading>
                    </div>

                    <ResultsSections />

                    <section className="mt-16">
                        <div
                            className="bg-gradient-to-r from-gray-100 to-gray-50 p-8 rounded-xl border-l-4"
                            style={{ borderColor: 'var(--sanitation-blue)' }}
                        >
                            <div className="flex items-start gap-4">
                                <TrendingUp
                                    className="w-8 h-8 flex-shrink-0 mt-1"
                                    style={{ color: 'var(--sanitation-blue)' }}
                                />
                                <div>
                                    <h3 className="text-xl font-bold mb-3">Key insight</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        The triple burden affects between <strong>one-quarter and one-third</strong> of
                                        the urban population in developing countries. This is not just a statistical
                                        overlap — it represents a{' '}
                                        <strong>cycle of inescapable risk</strong> where each burden amplifies the others,
                                        creating conditions far worse than the sum of individual challenges.
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
