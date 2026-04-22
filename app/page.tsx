import Link from 'next/link';
import TripleBurdenVis from '@/components/TripleBurdenVis';
import Layout from '@/components/Layout';
import HomeDataSections from '@/components/home/HomeDataSections';
import GlobalTripleBurdenMap from '@/components/home/GlobalTripleBurdenMap';
import SectionHeading from '@/components/shared/SectionHeading';
import { AlertCircle, Users, ArrowRight } from 'lucide-react';

const CASE_STUDIES = [
  { iso3: 'BGD', name: 'Bangladesh', flag: '🇧🇩', accent: 'var(--climate-teal)' },
  { iso3: 'PHL', name: 'Philippines', flag: '🇵🇭', accent: 'var(--sanitation-blue)' },
  { iso3: 'NGA', name: 'Nigeria', flag: '🇳🇬', accent: 'var(--poverty-earth)' },
];

export default function Home() {
  return (
    <Layout>
      {/* Dark hero with rotating globe */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#0a5257_0%,#062b30_60%,#031518_100%)] text-white">
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              The Triple Burden.
              <br />
              <span className="text-amber-300">Where poverty, climate</span>
              <br />
              <span className="text-amber-300">and sanitation collide.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">
              A district-level view of the 1 billion urban residents living where poverty, climate
              risk and inadequate sanitation converge — and where the cost falls hardest.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 text-[#062b30] font-semibold rounded-lg bg-amber-300 hover:bg-amber-200 shadow-lg transition-all"
              >
                Open data explorer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#global-map"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg border border-white/25 text-white/90 hover:bg-white/10 transition-colors"
              >
                See the global map
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Global map section — continues the dark treatment */}
      <section
        id="global-map"
        className="bg-[#062b30] text-white pt-12 md:pt-16 pb-24 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlobalTripleBurdenMap />
        </div>
      </section>

      {/* Venn diagram — concept explainer */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-4">
            <div className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--climate-teal)] mb-3">
              The framework
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Three burdens. One compounding crisis.
            </h2>
          </div>
          <TripleBurdenVis />
        </div>
      </section>

      {/* Problem statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading as="h2" size="md" align="center" className="mb-10">
            The problem
          </SectionHeading>
          <div className="modern-card p-10">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Poverty, climate risk, and inadequate sanitation afflict many people in urban areas.
              This{' '}
              <span className="font-semibold bg-gradient-to-r from-[var(--sanitation-blue)] to-[var(--climate-teal)] bg-clip-text text-transparent">
                triple burden
              </span>{' '}
              affects between one-quarter and one-third of the urban population in developing
              countries.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              These three factors do not exist in isolation. They create a{' '}
              <span className="font-semibold text-gray-900">cycle of inescapable risk</span> where
              climate change exacerbates sanitation failures, which in turn deepen poverty and
              health risks. The combination is greater than the sum of its parts.
            </p>
          </div>
        </div>
      </section>

      {/* Main findings */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading as="h2" size="md" align="center" className="mb-14">
            Main findings
          </SectionHeading>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="modern-card overflow-hidden group">
              <div className="bg-gradient-to-br from-[var(--climate-teal-light)] to-[var(--climate-teal)] text-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">Water stress scenario</h3>
                </div>
                <div className="text-6xl font-bold mb-6 tabular-nums">919M</div>
                <p className="text-lg opacity-95 leading-relaxed">
                  people (26% of urban population in developing countries) face all three burdens
                  when water stress is the climate driver.
                </p>
              </div>
            </div>
            <div className="modern-card overflow-hidden group">
              <div className="bg-gradient-to-br from-[var(--sanitation-blue-light)] to-[var(--sanitation-blue)] text-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">Flood risk scenario</h3>
                </div>
                <div className="text-6xl font-bold mb-6 tabular-nums">1.1B</div>
                <p className="text-lg opacity-95 leading-relaxed">
                  people (32% of urban population) are affected when flooding is the climate risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              as="h2"
              size="md"
              align="center"
              eyebrow="By the numbers"
              className="mb-4"
              subtitle="Toggle between scenarios to see how the burden distributes across regions and income groups."
            >
              Where the burden concentrates
            </SectionHeading>
          </div>
          <div className="mt-10">
            <HomeDataSections />
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            as="h2"
            size="md"
            align="center"
            className="mb-10"
            subtitle="Drill into the districts that drive the headline numbers."
          >
            Case studies
          </SectionHeading>
          <div className="grid md:grid-cols-3 gap-4">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.iso3}
                href={`/dashboard?country=${c.iso3}`}
                className="modern-card p-6 flex items-center justify-between gap-4 group"
                style={{ borderLeft: `4px solid ${c.accent}` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">{c.flag}</span>
                  <div>
                    <div className="font-bold text-lg">{c.name}</div>
                    <div className="text-xs text-gray-500">View country profile</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/results"
              className="inline-flex items-center gap-2 text-[var(--climate-teal)] font-semibold hover:underline"
            >
              Read the full results write-up
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
