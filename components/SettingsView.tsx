import React, { useState, useRef } from 'react';
import { Category, Settings, BudgetCategoryType, AppState, Bill } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import { ICON_MAP } from '../constants';

interface SettingsViewProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    appData: AppState;
    onImportData: (data: AppState) => void;
    onEraseAllData: () => void;
    bills: Bill[];
    onAddBill: (bill: Omit<Bill, 'id'>) => void;
    onDeleteBill: (id: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ categories, setCategories, settings, setSettings, appData, onImportData, onEraseAllData, bills, onAddBill, onDeleteBill }) => {
    
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<BudgetCategoryType>('WANTS');
    const [selectedIcon, setSelectedIcon] = useState<string>('ShoppingIcon');
    const [newBillName, setNewBillName] = useState('');
    const [newBillAmount, setNewBillAmount] = useState('');
    const [newBillDay, setNewBillDay] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name: newCategoryName,
            type: newCategoryType,
            icon: selectedIcon,
        };
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        setSelectedIcon('ShoppingIcon');
    };

    const handleDeleteCategory = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };

     const handleAddBill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBillName.trim() || !newBillAmount || !newBillDay) return;

        onAddBill({
            name: newBillName,
            amount: parseFloat(newBillAmount),
            dayOfMonth: parseInt(newBillDay, 10),
        });

        setNewBillName('');
        setNewBillAmount('');
        setNewBillDay('');
    };
    
    const handleExport = () => {
        const jsonString = JSON.stringify(appData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `fintrack_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        if (window.confirm('Are you sure you want to import data? This will overwrite all existing data.')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text !== 'string') throw new Error("File content is not readable text.");
                    const data = JSON.parse(text) as AppState;
                    onImportData(data);
                } catch (error) {
                    console.error("Failed to parse import file:", error);
                    alert("Error importing file. It might be corrupted or not a valid FinTrack AI backup.");
                }
            };
            reader.readAsText(file);
        }
        event.target.value = ''; 
    };

    const handleErase = () => {
        if (window.confirm('WARNING: This will permanently delete all your data. Are you absolutely sure you want to continue?')) {
            onEraseAllData();
        }
    }


    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="currency" className="block text-gray-400 mb-2">Currency</label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleSettingsChange}
                                    className="w-full bg-gray-700 p-3 rounded-lg"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="INR">INR - Indian Rupee</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="language" className="block text-gray-400 mb-2">Language</label>
                                <select
                                    id="language"
                                    name="language"
                                    value={settings.language}
                                    onChange={handleSettingsChange}
                                    className="w-full bg-gray-700 p-3 rounded-lg"
                                >
                                    <option value="en-US">English (US)</option>
                                    <option value="en-GB">English (UK)</option>
                                    <option value="de-DE">Deutsch</option>
                                    <option value="ja-JP">日本語</option>
                                    <option value="en-IN">English (India)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Manage Recurring Bills</h2>
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                           {bills.map(bill => (
                                <div key={bill.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{bill.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Intl.NumberFormat(settings.language, {style: 'currency', currency: settings.currency}).format(bill.amount)} on day {bill.dayOfMonth}
                                        </p>
                                    </div>
                                    <button onClick={() => onDeleteBill(bill.id)} className="p-2 hover:bg-gray-600 rounded-full">
                                        <TrashIcon className="w-5 h-5 text-accent-red" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddBill} className="flex flex-wrap items-end gap-4">
                            <div className="flex-grow min-w-[120px]">
                                <label className="block text-gray-400 mb-1 text-sm">Bill Name</label>
                                <input type="text" value={newBillName} onChange={(e) => setNewBillName(e.target.value)} className="w-full bg-gray-700 p-2 rounded-lg" placeholder="e.g. Netflix" required />
                            </div>
                            <div className="flex-grow">
                                <label className="block text-gray-400 mb-1 text-sm">Amount</label>
                                <input type="number" value={newBillAmount} onChange={(e) => setNewBillAmount(e.target.value)} className="w-full bg-gray-700 p-2 rounded-lg" placeholder="15.99" required />
                            </div>
                             <div className="flex-grow">
                                <label className="block text-gray-400 mb-1 text-sm">Day of Month</label>
                                <input type="number" min="1" max="31" value={newBillDay} onChange={(e) => setNewBillDay(e.target.value)} className="w-full bg-gray-700 p-2 rounded-lg" placeholder="28" required />
                            </div>
                            <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 h-10">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add</span>
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Data Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-white font-bold">
                            <button onClick={handleExport} className="bg-secondary hover:bg-green-600 py-3 px-4 rounded-lg transition-colors">
                                Export Data
                            </button>
                            <button onClick={handleImportClick} className="bg-accent-blue hover:bg-blue-600 py-3 px-4 rounded-lg transition-colors">
                                Import Data
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" aria-hidden="true" />
                            <button onClick={handleErase} className="bg-accent-red hover:bg-red-600 py-3 px-4 rounded-lg transition-colors">
                                Erase All Data
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                            Export your data as a JSON file for backup. Import a previously saved file to restore your data. Erasing data is permanent and cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                        {categories.map(category => {
                            const IconComponent = ICON_MAP[category.icon] || ICON_MAP['ShoppingIcon'];
                            return (
                                <div key={category.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                        <IconComponent />
                                        <span>{category.name}</span>
                                        <span className="text-xs bg-gray-600 px-2 py-1 rounded-full capitalize">{category.type.toLowerCase()}</span>
                                </div>
                                <button onClick={() => handleDeleteCategory(category.id)} className="p-2 hover:bg-gray-600 rounded-full">
                                        <TrashIcon className="w-5 h-5 text-accent-red" />
                                </button>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                        <div>
                        <label className="block text-gray-400 mb-2 text-sm">New Category Icon</label>
                        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 bg-gray-700 rounded-lg">
                            {Object.keys(ICON_MAP).map(iconKey => {
                            const Icon = ICON_MAP[iconKey];
                            return (
                                <button
                                type="button"
                                key={iconKey}
                                onClick={() => setSelectedIcon(iconKey)}
                                className={`flex items-center justify-center p-2 rounded-lg border-2 ${selectedIcon === iconKey ? 'border-primary bg-primary/20' : 'border-transparent bg-gray-600 hover:bg-gray-500'}`}
                                >
                                <Icon />
                                </button>
                            )
                            })}
                        </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-grow">
                                <label htmlFor="newCategoryName" className="block text-gray-400 mb-1 text-sm">New Category Name</label>
                                <input
                                    type="text"
                                    id="newCategoryName"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full bg-gray-700 p-2 rounded-lg"
                                    placeholder="e.g., Entertainment"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newCategoryType" className="block text-gray-400 mb-1 text-sm">Type</label>
                                <select
                                    id="newCategoryType"
                                    value={newCategoryType}
                                    onChange={(e) => setNewCategoryType(e.target.value as BudgetCategoryType)}
                                    className="w-full bg-gray-700 p-2 rounded-lg h-10"
                                >
                                    <option value="NEEDS">Needs</option>
                                    <option value="WANTS">Wants</option>
                                    <option value="SAVINGS">Savings</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 h-10">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;