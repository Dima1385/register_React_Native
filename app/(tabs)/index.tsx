import { useEffect, useState } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, logoutUser, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      const userName = user?.name;
      await logoutUser();
      
      // Show logout success message
      Alert.alert(
        'Logged Out Successfully',
        `You have been logged out from your account. Come back soon, ${userName}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const goToRegister = () => {
    router.push('/register');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.titleText}>
            {user ? `Welcome, ${user.name}` : 'Welcome'}
          </ThemedText>
          <HelloWave />
        </View>
        
        <View style={styles.descriptionContainer}>
          {user ? (
            <ThemedText style={styles.description}>
              You are logged in as {user.email}. Enjoy using our app!
            </ThemedText>
          ) : (
            <ThemedText style={styles.description}>
              Join our community and experience the best features our app has to offer.
            </ThemedText>
          )}
        </View>
        
        {user && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLogout}
          >
            <ThemedText style={styles.buttonText}>LOGOUT</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      {!user && (
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={goToRegister}
          >
            <ThemedText style={styles.buttonText}>CREATE ACCOUNT</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.loginButton]}
            onPress={goToLogin}
          >
            <ThemedText style={styles.buttonText}>SIGN IN</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#333333', // Dark gray background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for dark background
  },
  descriptionContainer: {
    marginBottom: 48,
    width: '100%',
    maxWidth: 320,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#CCCCCC', // Light gray text for dark background
  },
  actionButton: {
    width: '100%',
    maxWidth: 280,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    width: '100%',
    padding: 20,
  },
  authButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#4D5166',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});
