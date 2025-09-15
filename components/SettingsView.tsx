import React, { useState } from 'react';
import { Category, Settings, BudgetCategoryType } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import { ICON_MAP } from '../constants';

interface SettingsViewProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ categories, setCategories, settings, setSettings }) => {
    
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<BudgetCategoryType>('WANTS');
    const [selectedIcon, setSelectedIcon] = useState<string>('ShoppingIcon');

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
        // In a real app, you might prevent deleting categories that are in use.
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Settings</h1>

            <div className="bg-gray-800 p-6 rounded-lg mb-8">
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
                <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
                <div className="space-y-4 mb-6">
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
    );
};

export default SettingsView;