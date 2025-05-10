import { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logoutUser, isLoading } = useAuth();

  // Перенаправляємо неавторизованих користувачів на головну
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading]);

  const handleLogout = async () => {
    try {
      const userName = user?.name;
      await logoutUser();
      
      // Повідомлення про успішний вихід
      Alert.alert(
        'Вихід успішний',
        `Ви вийшли з облікового запису. До побачення, ${userName}!`,
        [{ 
          text: 'OK',
          onPress: () => router.replace('/')
        }]
      );
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={styles.loadingText}>Завантаження...</ThemedText>
      </View>
    );
  }

  if (!user) {
    return null; // Не показуємо нічого, так як useEffect перенаправить
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerText}>
            Особистий кабінет
          </ThemedText>
        </View>

        <View style={styles.contentContainer}>
          <ThemedText style={styles.welcomeText}>
            Ви успішно увійшли у свій акаунт!
          </ThemedText>
          
          <View style={styles.userInfoContainer}>
            <ThemedText style={styles.userInfoLabel}>Ім'я:</ThemedText>
            <ThemedText style={styles.userInfoValue}>{user.name}</ThemedText>
          </View>
          
          <View style={styles.userInfoContainer}>
            <ThemedText style={styles.userInfoLabel}>Електронна пошта:</ThemedText>
            <ThemedText style={styles.userInfoValue}>{user.email}</ThemedText>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <ThemedText style={styles.buttonText}>ВИЙТИ З АКАУНТУ</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => router.push('/')}
          >
            <ThemedText style={styles.buttonText}>НА ГОЛОВНУ</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#4B5166',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  headerContainer: {
    backgroundColor: '#3A4054',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5D6180',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  userInfoLabel: {
    fontSize: 16,
    color: '#A9ADC1',
    width: '40%',
  },
  userInfoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#e53935',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  homeButton: {
    backgroundColor: '#1a73e8',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
}); 