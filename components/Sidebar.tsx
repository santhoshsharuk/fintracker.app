import React from 'react';
import { View } from '../types';
import { DashboardIcon, TransactionsIcon, BudgetIcon, TargetIcon, ReportsIcon, SettingsIcon } from './Icons';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    const navItems = [
        { view: View.DASHBOARD, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
        { view: View.TRANSACTIONS, label: 'Transactions', icon: <TransactionsIcon className="w-6 h-6" /> },
        { view: View.BUDGET, label: 'Budget', icon: <BudgetIcon className="w-6 h-6" /> },
        { view: View.GOALS, label: 'Goals', icon: <TargetIcon className="w-6 h-6" /> },
        { view: View.REPORTS, label: 'Reports', icon: <ReportsIcon className="w-6 h-6" /> },
        { view: View.SETTINGS, label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
    ];

    return (
        <aside className="w-64 bg-gray-800 text-gray-200 p-4 flex flex-col">
            <div className="text-2xl font-bold mb-10 text-center text-primary">FinTrack AI</div>
            <nav className="flex flex-col space-y-2 flex-grow">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => setView(item.view)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                            currentView === item.view 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-700'
                        }`}
                    >
                        {item.icon}
                        <span className="font-semibold">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;