import Link from 'next/link';
import { Droplets } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--climate-teal)] to-[var(--sanitation-blue)] transition-transform group-hover:scale-110">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-[var(--climate-teal)] to-[var(--sanitation-blue)] bg-clip-text text-transparent">
                Triple Burden
              </span>
            </Link>
            <div className="flex gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all hover:shadow-sm"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all hover:shadow-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/methodology"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all hover:shadow-sm"
              >
                Methodology
              </Link>
              <Link
                href="/results"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all hover:shadow-sm"
              >
                Results
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="glass border-t border-white/20 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>© 2025 Triple Burden Project | World Bank Data Analysis</p>
        </div>
      </footer>
    </div>
  );
}
