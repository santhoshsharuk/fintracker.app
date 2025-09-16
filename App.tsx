import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import BudgetView from './components/BudgetView';
import GoalsView from './components/GoalsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import AddTransactionModal from './components/AddTransactionModal';
import NotificationCenter from './components/NotificationCenter';
import SplashScreen from './components/SplashScreen'; // Import SplashScreen
import { MenuIcon } from './components/Icons';

import { View, Transaction, Goal, BudgetRule, Category, Settings, AppState, Notification, Bill, NotificationType } from './types';
import { MOCK_CATEGORIES, MOCK_BUDGET_RULES } from './constants';

// Key for storing app data in localStorage
const LOCAL_STORAGE_KEY = 'finTrackAiData';

// Function to load state from localStorage or return defaults
const loadState = (): AppState => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return {
                transactions: [],
                goals: [],
                categories: MOCK_CATEGORIES,
                budgetRule: MOCK_BUDGET_RULES[0],
                settings: { currency: 'USD', language: 'en-US' },
                notifications: [],
                bills: []
            };
        }
        const savedState = JSON.parse(serializedState);
        // Ensure all keys exist, falling back to defaults if not
        return {
            transactions: savedState.transactions || [],
            goals: savedState.goals || [],
            categories: savedState.categories || MOCK_CATEGORIES,
            budgetRule: savedState.budgetRule || MOCK_BUDGET_RULES[0],
            settings: savedState.settings || { currency: 'USD', language: 'en-US' },
            notifications: savedState.notifications || [],
            bills: savedState.bills || []
        };
    } catch (error) {
        console.error("Error loading state from localStorage", error);
        // Return default state on error
        return {
            transactions: [],
            goals: [],
            categories: MOCK_CATEGORIES,
            budgetRule: MOCK_BUDGET_RULES[0],
            settings: { currency: 'USD', language: 'en-US' },
            notifications: [],
            bills: []
        };
    }
};


const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true); // State for splash screen
    const initialState = loadState();
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [transactions, setTransactions] = useState<Transaction[]>(initialState.transactions);
    const [goals, setGoals] = useState<Goal[]>(initialState.goals);
    const [categories, setCategories] = useState<Category[]>(initialState.categories);
    const [budgetRule, setBudgetRule] = useState<BudgetRule>(initialState.budgetRule);
    const [settings, setSettings] = useState<Settings>(initialState.settings);
    const [notifications, setNotifications] = useState<Notification[]>(initialState.notifications);
    const [bills, setBills] = useState<Bill[]>(initialState.bills);

    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

    // Effect to hide splash screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500); // Show splash for 2.5 seconds
        return () => clearTimeout(timer);
    }, []);

    // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        if (isLoading) return; // Don't save initial default state during loading
        try {
            const stateToSave: AppState = {
                transactions,
                goals,
                categories,
                budgetRule,
                settings,
                notifications,
                bills
            };
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
        } catch (error) {
            console.error("Error saving state to localStorage", error);
        }
    }, [transactions, goals, categories, budgetRule, settings, notifications, bills, isLoading]);

    // Notification Generation Logic
    useEffect(() => {
        if (isLoading) return;
        const newNotifications: Notification[] = [];
        const now = new Date();
        const currentMonthYear = `${now.getFullYear()}-${now.getMonth()}`;

        // --- Bill Due Notifications ---
        bills.forEach(bill => {
            const dueDate = new Date(now.getFullYear(), now.getMonth(), bill.dayOfMonth);
            const timeDiff = dueDate.getTime() - now.getTime();
            const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysUntilDue > 0 && daysUntilDue <= 7) {
                const notificationExists = notifications.some(n =>
                    n.type === NotificationType.BILL_DUE &&
                    n.message.includes(bill.name) &&
                    n.timestamp.startsWith(currentMonthYear)
                );
                if (!notificationExists) {
                    newNotifications.push({
                        id: `notif-${Date.now()}-${bill.id}`,
                        type: NotificationType.BILL_DUE,
                        message: `Upcoming bill: ${bill.name} is due in ${daysUntilDue} days.`,
                        timestamp: new Date().toISOString(),
                        isRead: false
                    });
                }
            }
        });
        
        // --- Budget Overspending Notifications ---
        const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const needsBudget = totalIncome * (budgetRule.needs / 100);
        const wantsBudget = totalIncome * (budgetRule.wants / 100);
        
        let needsSpent = 0;
        let wantsSpent = 0;
        transactions.forEach(t => {
            if (t.type === 'EXPENSE') {
                const category = categoryMap.get(t.categoryId);
                if (category?.type === 'NEEDS') needsSpent += t.amount;
                if (category?.type === 'WANTS') wantsSpent += t.amount;
            }
        });
        
        if (needsBudget > 0 && needsSpent > needsBudget) {
            const notificationExists = notifications.some(n => n.type === NotificationType.BUDGET_EXCEEDED && n.message.includes('Needs') && n.timestamp.startsWith(currentMonthYear));
            if (!notificationExists) {
                newNotifications.push({
                    id: `notif-${Date.now()}-needs`,
                    type: NotificationType.BUDGET_EXCEEDED,
                    message: `You've exceeded your 'Needs' budget for this month.`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                });
            }
        }
        
        if (wantsBudget > 0 && wantsSpent > wantsBudget) {
             const notificationExists = notifications.some(n => n.type === NotificationType.BUDGET_EXCEEDED && n.message.includes('Wants') && n.timestamp.startsWith(currentMonthYear));
            if (!notificationExists) {
                newNotifications.push({
                    id: `notif-${Date.now()}-wants`,
                    type: NotificationType.BUDGET_EXCEEDED,
                    message: `You've exceeded your 'Wants' budget for this month.`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                });
            }
        }
        
        // --- Goal Milestone Notifications ---
        const totalSavings = transactions.filter(t => categoryMap.get(t.categoryId)?.type === 'SAVINGS' && t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
        
        goals.forEach(goal => {
            const currentProgress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const milestones = [50, 75, 90, 100];

            milestones.forEach(milestone => {
                if (currentProgress >= milestone) {
                    const notificationExists = notifications.some(n => n.type === NotificationType.GOAL_MILESTONE && n.message.includes(goal.name) && n.message.includes(`${milestone}%`));
                    if (!notificationExists) {
                        newNotifications.push({
                            id: `notif-${Date.now()}-${goal.id}-${milestone}`,
                            type: NotificationType.GOAL_MILESTONE,
                            message: `Congratulations! You've reached the ${milestone}% milestone for your goal: ${goal.name}.`,
                            timestamp: new Date().toISOString(),
                            isRead: false
                        });
                    }
                }
            });
        });

        if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }

    }, [transactions, goals, bills, budgetRule, categories, categoryMap, isLoading]);

    // Update goal progress when transactions change
     useEffect(() => {
        if (isLoading) return;
        const totalSavings = transactions
            .filter(t => categoryMap.get(t.categoryId)?.type === 'SAVINGS' && t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        if (goals.length > 0) {
            const savingsPerGoal = totalSavings / goals.length; // Simplified distribution
            setGoals(prevGoals => prevGoals.map(goal => ({
                ...goal,
                currentAmount: Math.min(savingsPerGoal, goal.targetAmount) // Simplified update
            })));
        }
    }, [transactions, categoryMap, goals.length, isLoading]);

    const balance = useMemo(() => {
        return transactions.reduce((acc, t) => {
            return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
        }, 0);
    }, [transactions]);
    
    const totalIncome = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'INCOME' &&
                       transactionDate.getFullYear() === currentYear &&
                       transactionDate.getMonth() === currentMonth;
            })
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
    
    const handleAddBill = (bill: Omit<Bill, 'id'>) => {
        const newBill = { ...bill, id: `bill-${Date.now()}`};
        setBills(prev => [...prev, newBill].sort((a,b) => a.dayOfMonth - b.dayOfMonth));
    }
    
    const handleDeleteBill = (id: string) => {
        setBills(prev => prev.filter(b => b.id !== id));
    }
    
    const handleMarkNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const openAddTransactionModal = () => {
        setEditingTransaction(null);
        setTransactionModalOpen(true);
    };

    const openEditTransactionModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setTransactionModalOpen(true);
    };
    
    const handleAddGoalClick = () => {
        alert("Functionality to add a goal from the dashboard will be implemented here!");
    };

    const handleEraseAllData = () => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            window.location.reload();
        } catch (error) {
            console.error("Error erasing data from localStorage", error);
            alert("Failed to erase data. Please check console for errors.");
        }
    };

    const handleImportData = (importedData: AppState) => {
         if (importedData && 'transactions' in importedData && 'goals' in importedData && 'categories' in importedData && 'budgetRule' in importedData && 'settings' in importedData) {
            setTransactions(importedData.transactions);
            setGoals(importedData.goals);
            setCategories(importedData.categories);
            setBudgetRule(importedData.budgetRule);
            setSettings(importedData.settings);
            setNotifications(importedData.notifications || []);
            setBills(importedData.bills || []);
            alert('Data imported successfully!');
        } else {
            alert('Invalid import file. The file is corrupted or not in the correct format.');
        }
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
                            appData={{ transactions, goals, categories, budgetRule, settings, notifications, bills }}
                            onImportData={handleImportData}
                            onEraseAllData={handleEraseAllData}
                            bills={bills}
                            onAddBill={handleAddBill}
                            onDeleteBill={handleDeleteBill}
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

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
                 <div className="flex justify-between items-center mb-4">
                    <button 
                        className="md:hidden p-2 bg-gray-800 rounded-lg"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex justify-end">
                       <NotificationCenter notifications={notifications} onMarkAsRead={handleMarkNotificationsAsRead} />
                    </div>
                 </div>
                {renderView()}
            </main>
             {isSidebarOpen && (
                 <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                 ></div>
            )}
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
