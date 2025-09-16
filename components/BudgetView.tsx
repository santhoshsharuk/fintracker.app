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

const ProjectionCard: React.FC<{
    title: string;
    projectedAmount: number;
    budgetAmount: number;
    settings: Settings;
    isSavings?: boolean;
}> = ({ title, projectedAmount, budgetAmount, settings, isSavings = false }) => {
    
    const formatCurrency = (amount: number) => {
        if (isNaN(amount)) amount = 0;
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    const difference = projectedAmount - budgetAmount;
    const daysPassed = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    if (daysPassed >= daysInMonth || budgetAmount <= 0) {
        return null; 
    }

    let isNegativeOutcome: boolean;
    let outcomeText: string;

    if (isSavings) {
        isNegativeOutcome = difference < 0;
        outcomeText = isNegativeOutcome ? 'below target' : 'above target';
    } else {
        isNegativeOutcome = difference > 0;
        outcomeText = isNegativeOutcome ? 'over budget' : 'under budget';
    }

    const outcomeColor = isNegativeOutcome ? 'text-accent-red' : 'text-secondary';
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
            <p className="text-3xl font-bold mt-2">{formatCurrency(projectedAmount)}</p>
            <p className={`mt-2 font-semibold ${outcomeColor}`}>
                {formatCurrency(Math.abs(difference))} {outcomeText}
            </p>
        </div>
    );
};


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
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth;
            })
            .forEach(t => {
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

    const projectionData = useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate();
        
        if (daysPassed <= 0 || daysPassed >= daysInMonth) {
            return { needs: needsSpent, wants: wantsSpent, savings: savingsContributions };
        }
        
        const daysRemaining = daysInMonth - daysPassed;

        const dailyAvgNeeds = needsSpent / daysPassed;
        const dailyAvgWants = wantsSpent / daysPassed;
        const dailyAvgSavings = savingsContributions / daysPassed;

        const projectedNeeds = needsSpent + (dailyAvgNeeds * daysRemaining);
        const projectedWants = wantsSpent + (dailyAvgWants * daysRemaining);
        const projectedSavings = savingsContributions + (dailyAvgSavings * daysRemaining);

        return {
            needs: projectedNeeds,
            wants: projectedWants,
            savings: projectedSavings,
        };
    }, [needsSpent, wantsSpent, savingsContributions]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold">Budget Management</h1>
                <select
                    value={budgetRule.name}
                    onChange={(e) => {
                        const newRule = MOCK_BUDGET_RULES.find(r => r.name === e.target.value);
                        if (newRule) setBudgetRule(newRule);
                    }}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                >
                    {MOCK_BUDGET_RULES.map(rule => <option key={rule.name} value={rule.name}>{rule.name}</option>)}
                </select>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg mb-8 text-center">
                <p>Based on your current month's total income of <span className="font-bold text-secondary">{formatCurrency(totalIncome)}</span>, your budget is:</p>
            </div>

            <div className="space-y-6">
                <ProgressBar label={`Needs (${budgetRule.needs}%)`} spent={needsSpent} budget={needsBudget} color="bg-accent-blue" />
                <ProgressBar label={`Wants (${budgetRule.wants}%)`} spent={wantsSpent} budget={wantsBudget} color="bg-accent-yellow" />
                <ProgressBar label={`Savings (${budgetRule.savings}%)`} spent={savingsContributions} budget={savingsTarget} color="bg-secondary" />
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">End-of-Month Projections</h2>
                <p className="text-gray-400 mb-6">Based on your spending so far, here's an estimate of where you'll be by the end of the month.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProjectionCard title="Projected Needs Spending" projectedAmount={projectionData.needs} budgetAmount={needsBudget} settings={settings} />
                    <ProjectionCard title="Projected Wants Spending" projectedAmount={projectionData.wants} budgetAmount={wantsBudget} settings={settings} />
                    <ProjectionCard title="Projected Savings" projectedAmount={projectionData.savings} budgetAmount={savingsTarget} settings={settings} isSavings={true} />
                </div>
            </div>

        </div>
    );
};

export default BudgetView;
