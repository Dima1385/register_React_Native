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
        'Вихід успішний',
        `Ви вийшли з облікового запису. До побачення, ${userName}!`,
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

  const goToProfile = () => {
    router.push('/profile');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={styles.loadingText}>Завантаження...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.titleText}>
            {user ? `Вітаємо, ${user.name}` : 'Ласкаво просимо'}
          </ThemedText>
          <HelloWave />
        </View>
        
        <View style={styles.descriptionContainer}>
          {user ? (
            <ThemedText style={styles.description}>
              Ви увійшли як {user.email}. Насолоджуйтесь користуванням нашим додатком!
            </ThemedText>
          ) : (
            <ThemedText style={styles.description}>
              Приєднуйтесь до нашої спільноти та відкрийте для себе всі можливості нашого додатку.
            </ThemedText>
          )}
        </View>
        
        {user && (
          <View style={styles.userButtonsContainer}>
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={goToProfile}
            >
              <ThemedText style={styles.buttonText}>МІЙ ПРОФІЛЬ</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLogout}
            >
              <ThemedText style={styles.buttonText}>ВИЙТИ</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {!user && (
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={goToRegister}
          >
            <ThemedText style={styles.buttonText}>СТВОРИТИ АКАУНТ</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.loginButton]}
            onPress={goToLogin}
          >
            <ThemedText style={styles.buttonText}>УВІЙТИ</ThemedText>
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
  userButtonsContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 16,
  },
  profileButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e53935', // Red for logout
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
