
import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    onUpdateTransaction: (transaction: Transaction) => void;
    categories: Category[];
    existingTransaction: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAddTransaction, onUpdateTransaction, categories, existingTransaction }) => {
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (existingTransaction) {
            setType(existingTransaction.type);
            setAmount(existingTransaction.amount.toString());
            setCategoryId(existingTransaction.categoryId);
            setDate(new Date(existingTransaction.date).toISOString().split('T')[0]);
            setDescription(existingTransaction.description);
        } else {
            // Reset form
            setType('EXPENSE');
            setAmount('');
            setCategoryId('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
        }
    }, [existingTransaction, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionData = {
            type,
            amount: parseFloat(amount),
            categoryId,
            date: new Date(date).toISOString(),
            description,
        };
        if (existingTransaction) {
            onUpdateTransaction({ ...transactionData, id: existingTransaction.id });
        } else {
            onAddTransaction(transactionData);
        }
        onClose();
    };

    const incomeCategories = categories.filter(c => c.name === 'Salary' || c.name === 'Gift'); // Example logic
    const expenseCategories = categories.filter(c => !incomeCategories.map(ic => ic.id).includes(c.id));
    const relevantCategories = type === 'INCOME' ? incomeCategories : expenseCategories;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{existingTransaction ? 'Edit' : 'Add'} Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex mb-4">
                        <button type="button" onClick={() => setType('EXPENSE')} className={`w-1/2 p-3 font-semibold rounded-l-lg ${type === 'EXPENSE' ? 'bg-primary text-white' : 'bg-gray-700'}`}>Expense</button>
                        <button type="button" onClick={() => setType('INCOME')} className={`w-1/2 p-3 font-semibold rounded-r-lg ${type === 'INCOME' ? 'bg-secondary text-white' : 'bg-gray-700'}`}>Income</button>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-gray-400 mb-2">Amount</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg" required />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {relevantCategories.map(cat => (
                                <button type="button" key={cat.id} onClick={() => setCategoryId(cat.id)} className={`flex flex-col items-center p-2 rounded-lg border-2 ${categoryId === cat.id ? 'border-primary bg-primary/20' : 'border-transparent bg-gray-700 hover:bg-gray-600'}`}>
                                    {cat.icon}
                                    <span className="text-xs mt-1">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="date" className="block text-gray-400 mb-2">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg" required />
                        </div>
                        <div>
                             <label htmlFor="description" className="block text-gray-400 mb-2">Description</label>
                            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg" placeholder="e.g., Coffee" />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={onClose} className="bg-gray-600 py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg">{existingTransaction ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
