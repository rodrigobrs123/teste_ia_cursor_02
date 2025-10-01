import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
}

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  password: string;
  password_confirmation: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // Set token in axios defaults
      authService.setToken(token);
      // Fetch user profile
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await authService.profile();
      if (response.data.success) {
        setCustomer(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      
      if (response.data.success) {
        const { customer: customerData, token: authToken } = response.data.data;
        setCustomer(customerData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        authService.setToken(authToken);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      
      if (response.data.success) {
        const { customer: customerData, token: authToken } = response.data.data;
        setCustomer(customerData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        authService.setToken(authToken);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    authService.removeToken();
  };

  const updateProfile = async (data: Partial<Customer>) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(data);
      
      if (response.data.success) {
        setCustomer(response.data.data);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    customer,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};