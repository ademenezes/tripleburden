import TripleBurdenVis from '@/components/TripleBurdenVis';
import Layout from '@/components/Layout';
import { AlertCircle, Users, Globe, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-gray-50 opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--climate-teal)] via-[var(--sanitation-blue)] to-[var(--poverty-earth)] bg-clip-text text-transparent leading-tight">
              The Global Sanitation Crisis
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              Understanding the devastating convergence of poverty, climate risk, and inadequate sanitation
              affecting over <span className="font-semibold text-gray-900">1 billion people</span> in urban areas worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Infographic */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TripleBurdenVis />
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">The Problem</h2>
            <div className="modern-card p-10">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Poverty, climate risks, and low access to sanitation services afflict many people in urban areas.
                This <span className="font-semibold bg-gradient-to-r from-[var(--sanitation-blue)] to-[var(--climate-teal)] bg-clip-text text-transparent">triple burden</span> coalesces
                to affect between one-quarter and one-third of the urban population in developing countries.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                These three factors do not exist in isolation. They create a <span className="font-semibold text-gray-900">cycle of
                  inescapable risk</span> where climate change exacerbates sanitation failures, which in turn deepens
                poverty and health risks. The combination is greater than the sum of its parts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16 text-center">Main Findings</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Water Stress Card */}
            <div className="modern-card overflow-hidden group">
              <div className="bg-gradient-to-br from-[var(--climate-teal-light)] to-[var(--climate-teal)] text-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">Water Stress</h3>
                </div>
                <div className="text-6xl font-bold mb-6">919M</div>
                <p className="text-lg opacity-95 leading-relaxed">
                  people (26% of urban population in developing countries) face all three burdens when
                  water stress is the climate driver
                </p>
              </div>
            </div>

            {/* Flood Risk Card */}
            <div className="modern-card overflow-hidden group">
              <div className="bg-gradient-to-br from-[var(--sanitation-blue-light)] to-[var(--sanitation-blue)] text-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">Flood Risk</h3>
                </div>
                <div className="text-6xl font-bold mb-6">1.1B</div>
                <p className="text-lg opacity-95 leading-relaxed">
                  people (32% of urban population) are affected when flooding is the climate risk
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Impact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--poverty-earth-light)] to-[var(--poverty-earth)] text-white">
                <Globe className="w-7 h-7" />
              </div>
              <h2 className="text-4xl font-bold">Regional Impact</h2>
            </div>
            <div className="modern-card p-10">
              <div className="space-y-8">
                <div className="border-l-4 pl-6 py-2" style={{ borderColor: 'var(--climate-teal)' }}>
                  <h3 className="text-2xl font-semibold mb-4">South Asia: The Epicenter</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50">
                      <span className="text-5xl font-bold bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] bg-clip-text text-transparent">57%</span>
                      <p className="text-sm text-gray-600 mt-2">affected by water stress</p>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                      <span className="text-5xl font-bold bg-gradient-to-r from-[var(--sanitation-blue)] to-[var(--sanitation-blue-dark)] bg-clip-text text-transparent">72%</span>
                      <p className="text-sm text-gray-600 mt-2">affected by flood risk</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-6">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="font-bold text-xl mb-2 text-gray-700">Central Asia</div>
                    <div className="text-4xl font-bold" style={{ color: 'var(--poverty-earth)' }}>~28%</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="font-bold text-xl mb-2 text-gray-700">MENA</div>
                    <div className="text-4xl font-bold" style={{ color: 'var(--poverty-earth)' }}>~25%</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="font-bold text-xl mb-2 text-gray-700">Sub-Saharan Africa</div>
                    <div className="text-4xl font-bold" style={{ color: 'var(--poverty-earth)' }}>~20%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Data Explorer CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Explore the Data</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Interactive dashboard with maps and statistics for 200+ countries
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-2xl hover:scale-105 group"
            style={{ background: 'linear-gradient(135deg, var(--climate-teal), var(--sanitation-blue))' }}
          >
            Open Data Explorer
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Case Studies Teaser */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Case Studies</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Detailed analysis of areas facing the triple burden in Bangladesh, Philippines, and Nigeria
          </p>
          <a
            href="/results"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-2xl hover:scale-105 group"
            style={{ background: 'linear-gradient(135deg, var(--poverty-earth), var(--sanitation-blue))' }}
          >
            Explore Results
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
