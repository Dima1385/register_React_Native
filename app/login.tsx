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
    // Clear previous errors
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

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    // If there are errors, set them and return
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      // Attempt to login user
      const user = await loginUser(email, password);
      setIsLoading(false);

      if (user) {
        // Login successful
        Alert.alert(
          'Login Successful! 🎉',
          `Welcome back, ${user.name}! You have successfully logged into your account.`,
          [
            { 
              text: 'Continue',
              onPress: () => router.push('/'),
              style: 'default'
            },
          ],
          { cancelable: false }
        );
      } else {
        // Invalid credentials
        Alert.alert(
          'Login Failed',
          'The email or password you entered is incorrect. Please try again.',
          [{ text: 'OK' }]
        );
        setErrors({
          ...newErrors,
          general: 'Invalid email or password',
        });
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Login Error',
        'There was a problem connecting to the service. Please try again later.',
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
            <ThemedText style={[styles.tabText, styles.activeTabText]}>SIGN IN</ThemedText>
            <View style={styles.activeTabIndicator} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tab}
            onPress={goBackToHome}
          >
            <ThemedText style={styles.tabText}>BACK TO HOME</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Form content */}
        <View style={styles.formContainer}>
          {errors.general ? (
            <ThemedText style={styles.generalError}>{errors.general}</ThemedText>
          ) : null}

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>USERNAME</ThemedText>
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
            <ThemedText style={styles.inputLabel}>PASSWORD</ThemedText>
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
              {keepSignedIn ? "YES" : "NO"}
            </ThemedText>
            <ThemedText style={styles.keepSignedInText}>KEEP ME SIGNED IN</ThemedText>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#1a73e8" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
              <ThemedText style={styles.signInButtonText}>SIGN IN</ThemedText>
            </TouchableOpacity>
          )}

          <View style={styles.separator} />

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <ThemedText style={styles.forgotPasswordText}>Forgot your password?</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333', // Dark gray background
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