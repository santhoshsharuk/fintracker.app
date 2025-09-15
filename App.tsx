import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import BudgetView from './components/BudgetView';
import GoalsView from './components/GoalsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import AddTransactionModal from './components/AddTransactionModal';

import { View, Transaction, Goal, BudgetRule, Category, Settings } from './types';
import { MOCK_CATEGORIES, MOCK_BUDGET_RULES } from './constants';

// Key for storing app data in localStorage
const LOCAL_STORAGE_KEY = 'finTrackAiData';

// Function to load state from localStorage or return defaults
const loadState = () => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return {
                transactions: [],
                goals: [],
                categories: MOCK_CATEGORIES,
                budgetRule: MOCK_BUDGET_RULES[0],
                settings: { currency: 'USD', language: 'en-US' }
            };
        }
        const savedState = JSON.parse(serializedState);
        // Ensure all keys exist, falling back to defaults if not
        return {
            transactions: savedState.transactions || [],
            goals: savedState.goals || [],
            categories: savedState.categories || MOCK_CATEGORIES,
            budgetRule: savedState.budgetRule || MOCK_BUDGET_RULES[0],
            settings: savedState.settings || { currency: 'USD', language: 'en-US' }
        };
    } catch (error) {
        console.error("Error loading state from localStorage", error);
        // Return default state on error
        return {
            transactions: [],
            goals: [],
            categories: MOCK_CATEGORIES,
            budgetRule: MOCK_BUDGET_RULES[0],
            settings: { currency: 'USD', language: 'en-US' }
        };
    }
};


const App: React.FC = () => {
    const initialState = loadState();
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [transactions, setTransactions] = useState<Transaction[]>(initialState.transactions);
    const [goals, setGoals] = useState<Goal[]>(initialState.goals);
    const [categories, setCategories] = useState<Category[]>(initialState.categories);
    const [budgetRule, setBudgetRule] = useState<BudgetRule>(initialState.budgetRule);
    const [settings, setSettings] = useState<Settings>(initialState.settings);

    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToSave = {
                transactions,
                goals,
                categories,
                budgetRule,
                settings
            };
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
        } catch (error) {
            console.error("Error saving state to localStorage", error);
        }
    }, [transactions, goals, categories, budgetRule, settings]);


    const balance = useMemo(() => {
        return transactions.reduce((acc, t) => {
            return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
        }, 0);
    }, [transactions]);
    
    const totalIncome = useMemo(() => {
        return transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: `txn-${Date.now()}` };
        setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };
    
    const handleAddGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
        const newGoal = { ...goal, id: `goal-${Date.now()}`, currentAmount: 0 };
        setGoals(prev => [...prev, newGoal]);
    };

    const openAddTransactionModal = () => {
        setEditingTransaction(null);
        setTransactionModalOpen(true);
    };

    const openEditTransactionModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setTransactionModalOpen(true);
    };
    
    // Placeholder for add goal modal
    const handleAddGoalClick = () => {
        // This would open a goal modal. For now, we'll just show an alert.
        alert("Functionality to add a goal from the dashboard will be implemented here!");
    };


    const renderView = () => {
        switch (view) {
            case View.DASHBOARD:
                return <DashboardView 
                            transactions={transactions} 
                            goals={goals}
                            balance={balance}
                            budgetRule={budgetRule}
                            categories={categories}
                            settings={settings}
                            onAddTransactionClick={openAddTransactionModal}
                            onAddGoalClick={handleAddGoalClick}
                        />;
            case View.TRANSACTIONS:
                return <TransactionsView 
                            transactions={transactions} 
                            categories={categories} 
                            settings={settings} 
                            onEditTransaction={openEditTransactionModal} 
                            onDeleteTransaction={handleDeleteTransaction}
                        />;
            case View.BUDGET:
                return <BudgetView 
                            transactions={transactions} 
                            budgetRule={budgetRule} 
                            setBudgetRule={setBudgetRule}
                            totalIncome={totalIncome}
                            categories={categories}
                            settings={settings}
                        />;
            case View.GOALS:
                return <GoalsView 
                            goals={goals} 
                            onAddGoal={handleAddGoal} 
                            transactions={transactions} 
                            settings={settings}
                        />;
            case View.REPORTS:
                return <ReportsView 
                            transactions={transactions} 
                            categories={categories}
                            settings={settings}
                        />;
            case View.SETTINGS:
                return <SettingsView 
                            categories={categories} 
                            setCategories={setCategories}
                            settings={settings}
                            setSettings={setSettings}
                        />;
            default:
                return <DashboardView 
                            transactions={transactions} 
                            goals={goals}
                            balance={balance}
                            budgetRule={budgetRule}
                            categories={categories}
                            settings={settings}
                            onAddTransactionClick={openAddTransactionModal}
                            onAddGoalClick={handleAddGoalClick}
                        />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar currentView={view} setView={setView} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
            <AddTransactionModal 
                isOpen={isTransactionModalOpen}
                onClose={() => setTransactionModalOpen(false)}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                categories={categories}
                existingTransaction={editingTransaction}
            />
        </div>
    );
};

export default App;