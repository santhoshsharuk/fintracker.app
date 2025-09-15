import React from 'react';
import { Transaction, Goal, Category, BudgetRule, Bill } from './types';
import * as Icons from './components/Icons';

export const ICON_MAP: { [key: string]: React.FC<{className?: string}> } = {
    SalaryIcon: Icons.SalaryIcon,
    GroceriesIcon: Icons.GroceriesIcon,
    TransportIcon: Icons.TransportIcon,
    BillsIcon: Icons.BillsIcon,
    ShoppingIcon: Icons.ShoppingIcon,
    RestaurantIcon: Icons.RestaurantIcon,
    SavingsIcon: Icons.SavingsIcon,
    GiftIcon: Icons.GiftIcon,
    TargetIcon: Icons.TargetIcon,
};


// FIX: Replaced JSX syntax with React.createElement as this is a .ts file, not a .tsx file, which was causing parsing errors.
export const MOCK_CATEGORIES: Category[] = [
    { id: 'cat1', name: 'Salary', icon: 'SalaryIcon', type: 'SAVINGS' },
    { id: 'cat2', name: 'Groceries', icon: 'GroceriesIcon', type: 'NEEDS' },
    { id: 'cat3', name: 'Transport', icon: 'TransportIcon', type: 'NEEDS' },
    { id: 'cat4', name: 'Bills', icon: 'BillsIcon', type: 'NEEDS' },
    { id: 'cat5', name: 'Shopping', icon: 'ShoppingIcon', type: 'WANTS' },
    { id: 'cat6', name: 'Dining Out', icon: 'RestaurantIcon', type: 'WANTS' },
    { id: 'cat7', name: 'Savings', icon: 'SavingsIcon', type: 'SAVINGS' },
    { id: 'cat8', name: 'Gift', icon: 'GiftIcon', type: 'WANTS' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_GOALS: Goal[] = [];

export const MOCK_BILLS: Bill[] = [];

export const MOCK_BUDGET_RULES: BudgetRule[] = [
    { name: '50/30/20 Rule', needs: 50, wants: 30, savings: 20 },
    { name: '70/20/10 Rule', needs: 70, wants: 20, savings: 10 },
    { name: '80/20 Rule (Savings-focused)', needs: 80, wants: 0, savings: 20 },
];