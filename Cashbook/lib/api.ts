import { axiosInstance } from './axios';

export interface Transaction {
  _id: string;
  type: 'income' | 'expense' | 'investment';
  amount: number;
  description?: string;
  transactionDate: string;
  paymentMode: 'cash' | 'bank';
  category: {
    _id: string;
    name: string;
    subCategory: string;
  };
}

export interface CreateTransactionData {
  type: 'income' | 'expense' | 'investment';
  amount: number;
  description?: string;
  transactionDate: string;
  paymentMode: 'cash' | 'bank';
  category: string;
}

export interface TransactionFilters {
  from?: string;
  to?: string;
  type?: 'income' | 'expense' | 'investment';
  categoryId?: string;
  sort?: 'asc' | 'desc';
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  subCategory: 'need' | 'want' | 'investment';
  monthlyBudgets: Array<{
    month: number;
    year: number;
    amount: number;
  }>;
}

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense' | 'investment';
  subCategory: 'need' | 'want' | 'investment';
}

export const transactionApi = {
  getTransactions: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await axiosInstance.get(`/transactions?${params.toString()}`);
    return response.data.data;
  },

  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await axiosInstance.post('/transactions', data);
    return response.data.data;
  },

  updateTransaction: async (id: string, data: Partial<CreateTransactionData>): Promise<Transaction> => {
    const response = await axiosInstance.patch(`/transactions/${id}`, data);
    return response.data.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/transactions/${id}`);
  },
};

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/categories');
    return response.data.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await axiosInstance.post('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>): Promise<Category> => {
    const response = await axiosInstance.patch(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    currency = 'INR'
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password,
      currency,
    });
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data;
  },
};

