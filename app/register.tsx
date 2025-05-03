import { useState } from 'react';
import { StyleSheet, TextInput, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const { registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // If there are errors, set them and return
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      // Register user
      const success = await registerUser({
        name,
        email,
        password,
      });

      setIsLoading(false);

      if (success) {
        // Registration successful
        Alert.alert(
          'Registration Successful! 🎉',
          `Congratulations, ${name}! Your account has been created successfully. You can now log in with your email and password.`,
          [
            { 
              text: 'Go to Home',
              onPress: () => router.push('/'),
              style: 'default'
            },
          ],
          { cancelable: false }
        );
      } else {
        // User already exists
        Alert.alert(
          'Registration Failed',
          'An account with this email already exists. Please use a different email or try logging in.',
          [
            { text: 'Try Again' },
            { 
              text: 'Go to Home', 
              onPress: () => router.push('/'),
              style: 'default'
            },
          ]
        );
        setErrors({
          ...newErrors,
          email: 'An account with this email already exists',
        });
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Registration Error',
        'There was a problem creating your account. Please try again later.',
        [{ text: 'OK' }]
      );
      console.error('Registration error:', error);
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
          <TouchableOpacity 
            style={styles.tab}
            onPress={goBackToHome}
          >
            <ThemedText style={styles.tabText}>BACK TO HOME</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <ThemedText style={[styles.tabText, styles.activeTabText]}>SIGN UP</ThemedText>
            <View style={styles.activeTabIndicator} />
          </TouchableOpacity>
        </View>

        {/* Form content */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>FULL NAME</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#A0A0A0"
            />
            {errors.name ? <ThemedText style={styles.errorText}>{errors.name}</ThemedText> : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>EMAIL</ThemedText>
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

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>CONFIRM PASSWORD</ThemedText>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#A0A0A0"
            />
            {errors.confirmPassword ? (
              <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
            ) : null}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#1a73e8" style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.signUpButton} onPress={handleRegister}>
              <ThemedText style={styles.signUpButtonText}>SIGN UP</ThemedText>
            </TouchableOpacity>
          )}
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
  signUpButton: {
    backgroundColor: '#1a73e8',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 10,
  },
}); 