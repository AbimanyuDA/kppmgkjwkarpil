export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  eventName: string;
  date: string;
  createdBy: string;
  createdByUser?: User;
  status: "pending" | "approved" | "rejected";
  noteUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  timestamp: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  pendingTransactions: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateTransactionRequest {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  eventName: string;
  date: string;
  noteUrl?: string;
}

export interface UpdateTransactionStatusRequest {
  status: "approved" | "rejected";
  rejectionReason?: string;
}
