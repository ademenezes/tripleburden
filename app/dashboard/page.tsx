import Dashboard from '@/components/Dashboard';
import Layout from '@/components/Layout';

export default function DashboardPage() {
    return (
        <Layout>
            <Dashboard />
        </Layout>
    );
}

export const metadata = {
    title: 'Data Explorer - Triple Burden Dashboard',
    description: 'Explore district-level triple burden data across 200+ countries',
};
