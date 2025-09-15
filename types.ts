// FIX: Removed self-import of AppState which caused a conflict.

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

export enum NotificationType {
    BILL_DUE = 'BILL_DUE',
    BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
    GOAL_MILESTONE = 'GOAL_MILESTONE',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string; // ISO string
    isRead: boolean;
}

export interface Bill {
    id: string;
    name: string;
    amount: number;
    dayOfMonth: number; // 1-31
}

export interface Category {
    id: string;
    name: string;
    icon: string; // Changed from React.ReactNode to string
    type: BudgetCategoryType;
}

export interface Transaction {
    id:string;
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

export interface AppState {
    transactions: Transaction[];
    goals: Goal[];
    categories: Category[];
    budgetRule: BudgetRule;
    settings: Settings;
    notifications: Notification[];
    bills: Bill[];
}