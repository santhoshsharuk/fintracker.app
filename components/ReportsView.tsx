import React, { useMemo } from 'react';
import { Transaction, Category, Settings } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsViewProps {
    transactions: Transaction[];
    categories: Category[];
    settings: Settings;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, categories, settings }) => {
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    const formatCurrencyWithCents = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    const expenseByCategoryData = useMemo(() => {
        const expenseData: { [key: string]: number } = {};
        transactions
            .filter(t => t.type === 'EXPENSE')
            .forEach(t => {
                const categoryName = categoryMap.get(t.categoryId)?.name || 'Uncategorized';
                expenseData[categoryName] = (expenseData[categoryName] || 0) + t.amount;
            });
        return Object.entries(expenseData).map(([name, value]) => ({ name, value }));
    }, [transactions, categoryMap]);
    
    const incomeVsExpenseData = useMemo(() => {
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'INCOME') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expense += t.amount;
            }
        });
        return Object.entries(monthlyData)
            .map(([name, values]) => ({ name, ...values }))
            .sort((a,b) => new Date(`1 ${a.name}`).getTime() - new Date(`1 ${b.name}`).getTime());
    }, [transactions]);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Reports & Analytics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Expense Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={expenseByCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                // FIX: Cast props to 'any' to resolve TypeScript error on the 'percent' property, which is a common issue with recharts type definitions.
                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {expenseByCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrencyWithCents(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Income vs. Expense</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={incomeVsExpenseData}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(tick) => formatCurrency(tick)} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                labelStyle={{ color: '#E5E7EB' }}
                                formatter={(value: number) => formatCurrencyWithCents(value)}
                            />
                            <Legend />
                            <Bar dataKey="income" fill="#10B981" />
                            <Bar dataKey="expense" fill="#EF4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;