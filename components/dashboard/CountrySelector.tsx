'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import {
  REGION_ORDER,
  INCOME_GROUP_ORDER,
  regionLabels,
  incomeGroupLabels,
  formatNumber,
} from './constants';
import type { CountryStats } from './types';

interface Props {
  countries: CountryStats[];
  selectedCountry: CountryStats | null;
  onSelect: (c: CountryStats | null) => void;
  compact?: boolean;
  initialRegion?: string | null;
}

export default function CountrySelector({
  countries,
  selectedCountry,
  onSelect,
  compact = false,
  initialRegion = null,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<string | null>(initialRegion);
  const [income, setIncome] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRegion !== null) setRegion(initialRegion);
  }, [initialRegion]);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return countries.filter((c) => {
      if (region && c.region !== region) return false;
      if (income && c.income_group !== income) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.iso3.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [countries, searchQuery, region, income]);

  return (
    <div className="relative" ref={containerRef}>
      {!compact && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a country
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[var(--climate-teal)] transition-colors text-left"
      >
        {selectedCountry ? (
          <span className="font-medium truncate">{selectedCountry.name}</span>
        ) : (
          <span className="text-gray-400">Choose a country…</span>
        )}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden"
          >
            <div className="p-2 border-b space-y-2">
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setRegion(null)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    region === null
                      ? 'bg-[var(--climate-teal)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All regions
                </button>
                {REGION_ORDER.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setRegion(region === code ? null : code)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      region === code
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
                  type="button"
                  onClick={() => setIncome(null)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    income === null
                      ? 'bg-[var(--sanitation-blue)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All incomes
                </button>
                {INCOME_GROUP_ORDER.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setIncome(income === code ? null : code)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      income === code
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
                  placeholder="Search countries…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--climate-teal)] focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
              {filtered.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  No countries match these filters
                </div>
              )}
            </div>
            <div className="overflow-y-auto max-h-60">
              {filtered.map((c) => (
                <button
                  key={c.iso3}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedCountry?.iso3 === c.iso3 ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.districts} districts</div>
                  </div>
                  <div className="text-sm text-gray-500 flex-shrink-0">
                    {formatNumber(c.population)} pop
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
