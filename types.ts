export enum View {
    DASHBOARD = 'DASHBOARD',
    TRANSACTIONS = 'TRANSACTIONS',
    BUDGET = 'BUDGET',
    GOALS = 'GOALS',
    REPORTS = 'REPORTS',
    SETTINGS = 'SETTINGS'
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type BudgetCategoryType = 'NEEDS' | 'WANTS' | 'SAVINGS';

export interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    type: BudgetCategoryType;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    date: string; // ISO string format
    description: string;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // ISO string format
}

export interface BudgetRule {
    name: string;
    needs: number; // percentage
    wants: number; // percentage
    savings: number; // percentage
}

export interface Settings {
    currency: string;
    language: string;
}
