import React from 'react';
import { View } from '../types';
import { DashboardIcon, TransactionsIcon, BudgetIcon, TargetIcon, ReportsIcon, SettingsIcon, XIcon, ExternalLinkIcon } from './Icons';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
    const navItems = [
        { view: View.DASHBOARD, label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
        { view: View.TRANSACTIONS, label: 'Transactions', icon: <TransactionsIcon className="w-6 h-6" /> },
        { view: View.BUDGET, label: 'Budget', icon: <BudgetIcon className="w-6 h-6" /> },
        { view: View.GOALS, label: 'Goals', icon: <TargetIcon className="w-6 h-6" /> },
        { view: View.REPORTS, label: 'Reports', icon: <ReportsIcon className="w-6 h-6" /> },
        { view: View.SETTINGS, label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
    ];

    const handleNavigation = (view: View) => {
        setView(view);
        setIsOpen(false); // Close sidebar on navigation
    };

    return (
        <aside className={`w-64 bg-gray-800 text-gray-200 p-4 flex flex-col fixed md:relative h-full z-20 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="flex justify-between items-center mb-10">
              <div className="text-2xl font-bold text-primary">FinTrack</div>
              <button 
                className="md:hidden p-1"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                  <XIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2 flex-grow">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => handleNavigation(item.view)}
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
             <div className="mt-auto">
                <a
                    href="https://santhoshsharuk.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700"
                >
                    <ExternalLinkIcon className="w-6 h-6" />
                    <span className="font-semibold">More apps</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;