import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  name: string;
  email: string;
  password: string;
}

const USERS_STORAGE_KEY = '@auth_users';
const CURRENT_USER_KEY = '@auth_current_user';

export const registerUser = async (user: User): Promise<boolean> => {
  try {
    // Get existing users
    const existingUsers = await getUsers();
    
    // Check if user already exists
    const userExists = existingUsers.some(
      (existingUser) => existingUser.email.toLowerCase() === user.email.toLowerCase()
    );
    
    if (userExists) {
      return false;
    }
    
    // Add new user
    const newUsers = [...existingUsers, user];
    
    // Save users
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    
    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const users = await getUsers();
    
    // Find user by email and password
    const user = users.find(
      (user) => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.password === password
    );
    
    if (user) {
      // Save current logged in user
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJSON = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJSON ? JSON.parse(userJSON) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersJSON = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return usersJSON ? JSON.parse(usersJSON) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// For testing purposes
export const clearAllUsers = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USERS_STORAGE_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}; 