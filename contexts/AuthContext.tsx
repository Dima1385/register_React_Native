import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, loginUser as loginUserService, registerUser as registerUserService, logoutUser as logoutUserService } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (email: string, password: string) => Promise<User | null>;
  registerUser: (user: User) => Promise<boolean>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const loginUser = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loggedInUser = await loginUserService(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (newUser: User): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await registerUserService(newUser);
      return success;
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logoutUserService();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        loginUser, 
        registerUser, 
        logoutUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 