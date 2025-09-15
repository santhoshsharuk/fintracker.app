import React from 'react';
import { Transaction, Goal, Category, BudgetRule } from './types';
import { GroceriesIcon, SalaryIcon, SavingsIcon, ShoppingIcon, TransportIcon, BillsIcon, TargetIcon, RestaurantIcon, GiftIcon } from './components/Icons';

// FIX: Replaced JSX syntax with React.createElement as this is a .ts file, not a .tsx file, which was causing parsing errors.
export const MOCK_CATEGORIES: Category[] = [
    { id: 'cat1', name: 'Salary', icon: React.createElement(SalaryIcon), type: 'SAVINGS' }, // Technically income, but for categorization, let's put it here.
    { id: 'cat2', name: 'Groceries', icon: React.createElement(GroceriesIcon), type: 'NEEDS' },
    { id: 'cat3', name: 'Transport', icon: React.createElement(TransportIcon), type: 'NEEDS' },
    { id: 'cat4', name: 'Bills', icon: React.createElement(BillsIcon), type: 'NEEDS' },
    { id: 'cat5', name: 'Shopping', icon: React.createElement(ShoppingIcon), type: 'WANTS' },
    { id: 'cat6', name: 'Dining Out', icon: React.createElement(RestaurantIcon), type: 'WANTS' },
    { id: 'cat7', name: 'Savings', icon: React.createElement(SavingsIcon), type: 'SAVINGS' },
    { id: 'cat8', name: 'Gift', icon: React.createElement(GiftIcon), type: 'WANTS' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_GOALS: Goal[] = [];

export const MOCK_BUDGET_RULES: BudgetRule[] = [
    { name: '50/30/20 Rule', needs: 50, wants: 30, savings: 20 },
    { name: '70/20/10 Rule', needs: 70, wants: 20, savings: 10 },
    { name: '80/20 Rule (Savings-focused)', needs: 80, wants: 0, savings: 20 },
];