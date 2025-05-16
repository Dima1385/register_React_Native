import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5158/api';

axios.defaults.timeout = 10000; 

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout error - server took too long to respond');
    }
    return Promise.reject(error);
  }
);

export interface User {
  name: string;
  email: string;
  password: string;
}


const CURRENT_USER_KEY = '@auth_current_user';

export const registerUser = async (user: User): Promise<boolean> => {
  try {
    console.log('Sending registration request to:', `${API_URL}/Auth/register`);
    console.log('With data:', { name: user.name, email: user.email });
    
    const response = await axios.post(`${API_URL}/Auth/register`, user);
    
    if (response.data.success) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      
      await AsyncStorage.setItem(
        CURRENT_USER_KEY, 
        JSON.stringify({ name: user.name, email: user.email })
      );
      
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Error registering user:', error);
    
    // Check if this is a response error due to user already existing
    if (error.response && error.response.status === 400 && 
        error.response.data && error.response.data.success === false &&
        error.response.data.message && 
        error.response.data.message.includes('вже існує')) {
      console.log('User already exists error:', error.response.data.message);
      // This is a user already exists error - we'll handle it in the registration UI
    }
    
    return false;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Sending login request to:', `${API_URL}/Auth/login`);
    console.log('With email:', email);
    
    const response = await axios.post(`${API_URL}/Auth/login`, { email, password });
    
    if (response.data.success) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      
      const user = response.data.user;
      
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return { 
        name: user.name, 
        email: user.email,
        password: '' 
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJSON = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!userJSON) return null;
    
    const user = JSON.parse(userJSON);
    return { 
      name: user.name, 
      email: user.email,
      password: '' 
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const currentUser = await getCurrentUser();
    return currentUser ? [currentUser] : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const clearAllUsers = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}; 