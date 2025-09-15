
import React, { useMemo, useState } from 'react';
import { Transaction, Category, Settings } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface TransactionsViewProps {
    transactions: Transaction[];
    categories: Category[];
    settings: Settings;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (id: string) => void;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, categories, settings, onEditTransaction, onDeleteTransaction }) => {
    const [filter, setFilter] = useState('');
    const [sortKey, setSortKey] = useState('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(settings.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const filteredAndSortedTransactions = useMemo(() => {
        return transactions
            .filter(t => t.description.toLowerCase().includes(filter.toLowerCase()) || categoryMap.get(t.categoryId)?.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => {
                let valA: any;
                let valB: any;

                switch (sortKey) {
                    case 'date':
                        valA = new Date(a.date).getTime();
                        valB = new Date(b.date).getTime();
                        break;
                    case 'amount':
                        valA = a.amount;
                        valB = b.amount;
                        break;
                    case 'category':
                        valA = categoryMap.get(a.categoryId)?.name || '';
                        valB = categoryMap.get(b.categoryId)?.name || '';
                        break;
                    default:
                        return 0;
                }
                
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [transactions, filter, sortKey, sortOrder, categoryMap]);
    
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };
    
    const SortIndicator = ({ columnKey }: { columnKey: string }) => {
        if (sortKey !== columnKey) return null;
        return <span>{sortOrder === 'desc' ? ' ↓' : ' ↑'}</span>;
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Transactions</h1>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <input
                    type="text"
                    placeholder="Search transactions by description or category..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4 cursor-pointer" onClick={() => handleSort('date')}>Date <SortIndicator columnKey='date' /></th>
                            <th className="p-4">Description</th>
                            <th className="p-4 cursor-pointer" onClick={() => handleSort('category')}>Category <SortIndicator columnKey='category' /></th>
                            <th className="p-4 text-right cursor-pointer" onClick={() => handleSort('amount')}>Amount <SortIndicator columnKey='amount' /></th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedTransactions.map(t => {
                             const category = categoryMap.get(t.categoryId);
                             return (
                                <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4">{formatDate(t.date)}</td>
                                    <td className="p-4">{t.description}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            {category?.icon}
                                            <span>{category?.name || 'Uncategorized'}</span>
                                        </div>
                                    </td>
                                    <td className={`p-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-secondary' : 'text-accent-red'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => onEditTransaction(t)} className="p-2 hover:bg-gray-600 rounded-full mr-2">
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDeleteTransaction(t.id)} className="p-2 hover:bg-gray-600 rounded-full">
                                            <TrashIcon className="w-5 h-5 text-accent-red" />
                                        </button>
                                    </td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsView;
