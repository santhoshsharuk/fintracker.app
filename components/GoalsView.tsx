import React, { useState } from 'react';
import { Goal, Transaction, Settings } from '../types';
import { PlusIcon } from './Icons';

interface GoalsViewProps {
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    transactions: Transaction[];
    settings: Settings;
}

const AddGoalForm: React.FC<{ onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void; onCancel: () => void; }> = ({ onAddGoal, onCancel }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddGoal({ name, targetAmount: parseFloat(targetAmount), deadline });
        onCancel(); // Close form after submission
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Goal Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Target Amount</label>
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Deadline</label>
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md" />
                </div>
                <div className="flex space-x-2 md:col-start-4">
                    <button type="button" onClick={onCancel} className="w-full bg-gray-600 p-2 rounded-md">Cancel</button>
                    <button type="submit" className="w-full bg-primary p-2 rounded-md text-white font-semibold">Save Goal</button>
                </div>
            </form>
        </div>
    );
};

const GoalProgressCard: React.FC<{ goal: Goal; currentAmount: number; settings: Settings }> = ({ goal, currentAmount, settings }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(settings.language, {
            style: 'currency',
            currency: settings.currency,
        }).format(amount);
    };

    const progress = (currentAmount / goal.targetAmount) * 100;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-xl font-bold">{goal.name}</h3>
                    <p className="text-gray-400">{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</p>
                </div>
            </div>
            <div className="flex justify-between items-center text-lg mb-2">
                <span className="font-semibold text-secondary">{formatCurrency(currentAmount)}</span>
                <span className="text-gray-400">{formatCurrency(goal.targetAmount)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-secondary h-3 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, transactions, settings }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    // This is a simplified calculation. A real app might have dedicated 'goal contribution' transactions.
    // Here we just use overall savings transactions for all goals.
    const totalSaved = transactions
        .filter(t => t.type === 'EXPENSE' && t.categoryId === 'cat7') // Assuming cat7 is Savings
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold">Financial Goals</h1>
                {!showAddForm && (
                    <button onClick={() => setShowAddForm(true)} className="w-full md:w-auto flex items-center justify-center space-x-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Goal</span>
                    </button>
                )}
            </div>
            
            {showAddForm && <AddGoalForm onAddGoal={onAddGoal} onCancel={() => setShowAddForm(false)} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => (
                    // In this mock, we'll assign a portion of total savings to each goal for demonstration.
                    // This logic would be more complex in a real application.
                    <GoalProgressCard key={goal.id} goal={goal} settings={settings} currentAmount={Math.min(goal.currentAmount + totalSaved/goals.length, goal.targetAmount)}/>
                ))}
            </div>
        </div>
    );
};

export default GoalsView;