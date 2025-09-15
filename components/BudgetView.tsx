import React, { useMemo } from 'react';
import { Transaction, BudgetRule, Category, Settings } from '../types';
import { MOCK_BUDGET_RULES } from '../constants';

interface BudgetViewProps {
    transactions: Transaction[];
    budgetRule: BudgetRule;
    setBudgetRule: (rule: BudgetRule) => void;
    totalIncome: number;
    categories: Category[];
    settings: Settings;
}

const BudgetView: React.FC<BudgetViewProps> = ({ transactions, budgetRule, setBudgetRule, totalIncome, categories, settings }) => {

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
    
    const formatCurrency = (amount: number) => {
        if (isNaN(amount)) amount = 0;
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    const { needsSpent, wantsSpent, savingsContributions } = useMemo(() => {
        let needs = 0, wants = 0, savings = 0;
        transactions.forEach(t => {
            if (t.type === 'EXPENSE') {
                const category = categoryMap.get(t.categoryId);
                if (category?.type === 'NEEDS') needs += t.amount;
                else if (category?.type === 'WANTS') wants += t.amount;
                else if (category?.type === 'SAVINGS') savings += t.amount;
            }
        });
        return { needsSpent: needs, wantsSpent: wants, savingsContributions: savings };
    }, [transactions, categoryMap]);
    
    const needsBudget = totalIncome * (budgetRule.needs / 100);
    const wantsBudget = totalIncome * (budgetRule.wants / 100);
    const savingsTarget = totalIncome * (budgetRule.savings / 100);

    const ProgressBar = ({ label, spent, budget, color }: { label: string, spent: number, budget: number, color: string}) => {
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        const isOver = percentage > 100;
        const displayPercentage = Math.min(percentage, 100);
        return (
            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">{label}</h3>
                    <p className={`font-semibold ${isOver ? 'text-accent-red' : ''}`}>
                        {formatCurrency(spent)} / {formatCurrency(budget)}
                    </p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                    <div className={`${isOver ? 'bg-accent-red' : color} h-4 rounded-full`} style={{ width: `${displayPercentage}%` }}></div>
                </div>
                {isOver && <p className="text-accent-red text-sm mt-2">You've overspent in this category!</p>}
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Budget Management</h1>
                <select
                    value={budgetRule.name}
                    onChange={(e) => {
                        const newRule = MOCK_BUDGET_RULES.find(r => r.name === e.target.value);
                        if (newRule) setBudgetRule(newRule);
                    }}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {MOCK_BUDGET_RULES.map(rule => <option key={rule.name} value={rule.name}>{rule.name}</option>)}
                </select>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg mb-8 text-center">
                <p>Based on your current total income of <span className="font-bold text-secondary">{formatCurrency(totalIncome)}</span>, your budget is:</p>
            </div>

            <div className="space-y-6">
                <ProgressBar label={`Needs (${budgetRule.needs}%)`} spent={needsSpent} budget={needsBudget} color="bg-accent-blue" />
                <ProgressBar label={`Wants (${budgetRule.wants}%)`} spent={wantsSpent} budget={wantsBudget} color="bg-accent-yellow" />
                <ProgressBar label={`Savings (${budgetRule.savings}%)`} spent={savingsContributions} budget={savingsTarget} color="bg-secondary" />
            </div>
        </div>
    );
};

export default BudgetView;