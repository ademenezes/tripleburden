import { Suspense } from 'react';
import Dashboard from '@/components/Dashboard';
import Layout from '@/components/Layout';

export default function DashboardPage() {
    return (
        <Layout>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[600px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--climate-teal)] border-t-transparent" />
                    </div>
                }
            >
                <Dashboard />
            </Suspense>
        </Layout>
    );
}

export const metadata = {
    title: 'Data Explorer',
    description: 'Explore district-level triple burden data across 217 countries',
};
