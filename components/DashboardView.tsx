import React, { useMemo } from 'react';
import { Transaction, Goal, BudgetRule, Category, Settings } from '../types';
import ProgressRing from './ProgressRing';
import { PlusIcon } from './Icons';
import { ICON_MAP } from '../constants';

interface DashboardViewProps {
    transactions: Transaction[];
    goals: Goal[];
    balance: number;
    budgetRule: BudgetRule;
    categories: Category[];
    settings: Settings;
    onAddTransactionClick: () => void;
    onAddGoalClick: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ transactions, goals, balance, budgetRule, categories, settings, onAddTransactionClick, onAddGoalClick }) => {
    const recentTransactions = transactions.slice(0, 5);

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    const { needsSpent, wantsSpent, savingsContributions, totalIncome } = useMemo(() => {
        let needs = 0;
        let wants = 0;
        let savings = 0;
        const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);

        transactions.forEach(t => {
            if (t.type === 'EXPENSE') {
                const category = categoryMap.get(t.categoryId);
                if (category) {
                    if (category.type === 'NEEDS') needs += t.amount;
                    else if (category.type === 'WANTS') wants += t.amount;
                    else if (category.type === 'SAVINGS') savings += t.amount;
                }
            }
        });
        return { needsSpent: needs, wantsSpent: wants, savingsContributions: savings, totalIncome: income };
    }, [transactions, categoryMap]);
    
    const needsBudget = totalIncome * (budgetRule.needs / 100);
    const wantsBudget = totalIncome * (budgetRule.wants / 100);
    const savingsTarget = totalIncome * (budgetRule.savings / 100);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <div className="flex space-x-4">
                     <button onClick={onAddGoalClick} className="flex items-center space-x-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        <span>Set Goal</span>
                    </button>
                    <button onClick={onAddTransactionClick} className="flex items-center space-x-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg col-span-1 md:col-span-3">
                    <p className="text-gray-400 text-lg">Current Balance</p>
                    <p className="text-5xl font-bold text-white mt-2">{formatCurrency(balance)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4">Needs ({budgetRule.needs}%)</h3>
                    <ProgressRing percentage={(needsSpent / needsBudget) * 100} color="accent-blue" />
                    <p className="mt-4 text-lg">{formatCurrency(needsSpent)} / {formatCurrency(needsBudget)}</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4">Wants ({budgetRule.wants}%)</h3>
                    <ProgressRing percentage={(wantsSpent / wantsBudget) * 100} color="accent-yellow" />
                    <p className="mt-4 text-lg">{formatCurrency(wantsSpent)} / {formatCurrency(wantsBudget)}</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4">Savings ({budgetRule.savings}%)</h3>
                    <ProgressRing percentage={(savingsContributions / savingsTarget) * 100} color="secondary" />
                    <p className="mt-4 text-lg">{formatCurrency(savingsContributions)} / {formatCurrency(savingsTarget)}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {recentTransactions.map(t => {
                            const category = categoryMap.get(t.categoryId);
                            const IconComponent = category ? (ICON_MAP[category.icon] || ICON_MAP['ShoppingIcon']) : ICON_MAP['ShoppingIcon'];
                            return (
                                <div key={t.id} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-gray-700 p-2 rounded-full"><IconComponent /></div>
                                        <div>
                                            <p className="font-semibold">{category?.name}</p>
                                            <p className="text-sm text-gray-400">{t.description}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${t.type === 'INCOME' ? 'text-secondary' : 'text-accent-red'}`}>
                                        {t.type === 'INCOME' ? '+' : ''}{formatCurrency(t.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Goal Progress</h3>
                    <div className="space-y-4">
                        {goals.slice(0, 3).map(goal => <GoalCard key={goal.id} goal={goal} settings={settings} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GoalCard: React.FC<{ goal: Goal; settings: Settings; }> = ({ goal, settings }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };
    
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    return (
        <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg">{goal.name}</p>
                    <p className="text-sm text-gray-300">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default DashboardView;