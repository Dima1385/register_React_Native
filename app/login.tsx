import { useState } from 'react';
import { StyleSheet, TextInput, Alert, ActivityIndicator, View, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {

    setErrors({
      email: '',
      password: '',
      general: '',
    });

    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };

    if (!email.trim()) {
      newErrors.email = 'Email обов\'язковий';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Введіть коректний email';
      isValid = false;
    }


    if (!password) {
      newErrors.password = 'Пароль обов\'язковий';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginUser(email, password);
      setIsLoading(false);

      if (user) {
        Alert.alert(
          'Успішний вхід! 🎉',
          `Вітаємо, ${user.name}! Вхід у систему успішний. Ви можете переглянути свій профіль і користуватися всіма функціями додатку.`,
          [
            { 
              text: 'Продовжити',
              onPress: () => router.push('/profile'),
              style: 'default'
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Помилка входу',
          'Невірна електронна пошта або пароль. Перевірте введені дані та спробуйте знову, або створіть новий обліковий запис.',
          [
            { 
              text: 'Спробувати ще раз',
              style: 'cancel'
            },
            {
              text: 'Зареєструватися',
              onPress: () => router.push('/register'),
              style: 'default'
            }
          ]
        );
        setErrors({
          ...newErrors,
          general: 'Невірна електронна пошта або пароль',
        });
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Помилка входу',
        'Виникла проблема під час з\'єднання з сервером. Будь ласка, перевірте підключення до інтернету та спробуйте пізніше.',
        [{ text: 'OK' }]
      );
      console.error('Login error:', error);
    }
  };

  const goBackToHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <ThemedText style={[styles.tabText, styles.activeTabText]}>УВІЙТИ</ThemedText>
            <View style={styles.activeTabIndicator} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tab}
            onPress={goBackToHome}
          >
            <ThemedText style={styles.tabText}>НАЗАД</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Form content */}
        <View style={styles.formContainer}>
          {errors.general ? (
            <ThemedText style={styles.generalError}>{errors.general}</ThemedText>
          ) : null}

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>ЕЛЕКТРОННА ПОШТА</ThemedText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0A0A0"
            />
            {errors.email ? <ThemedText style={styles.errorText}>{errors.email}</ThemedText> : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>ПАРОЛЬ</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#A0A0A0"
            />
            {errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            ) : null}
          </View>

          <View style={styles.switchContainer}>
            <Switch
              value={keepSignedIn}
              onValueChange={setKeepSignedIn}
              trackColor={{ false: '#767577', true: '#4D5773' }}
              thumbColor={keepSignedIn ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              style={styles.switch}
            />
            <ThemedText style={styles.switchLabel}>
              {keepSignedIn ? "ТАК" : "НІ"}
            </ThemedText>
            <ThemedText style={styles.keepSignedInText}>ЗАПАМ'ЯТАТИ МЕНЕ</ThemedText>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#1a73e8" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
              <ThemedText style={styles.signInButtonText}>УВІЙТИ</ThemedText>
            </TouchableOpacity>
          )}

          <View style={styles.separator} />

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <ThemedText style={styles.forgotPasswordText}>Забули пароль?</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#4B5166',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#5D6180',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#4B5166',
  },
  tabText: {
    color: '#A9ADC1',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#1a73e8',
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#A9ADC1',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#626685',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF7676',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  generalError: {
    color: '#FF7676',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  switchLabel: {
    color: '#A9ADC1',
    marginLeft: 6,
    fontSize: 12,
  },
  keepSignedInText: {
    color: '#A9ADC1',
    marginLeft: 10,
    fontSize: 12,
  },
  signInButton: {
    backgroundColor: '#1a73e8',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#5D6180',
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#A9ADC1',
    fontSize: 14,
  },
  loader: {
    marginVertical: 10,
  },
}); 