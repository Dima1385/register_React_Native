import React, { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, duration, onHide]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      default:
        return styles.infoToast;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return styles.successText;
      case 'error':
        return styles.errorText;
      default:
        return styles.infoText;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓ ';
      case 'error':
        return '✗ ';
      default:
        return 'ℹ ';
    }
  };

  // Web-specific accessibility properties to avoid aria-hidden issues
  const accessibilityProps = Platform.OS === 'web' ? {
    accessibilityLiveRegion: 'polite' as 'polite',
    role: 'alert',
    focusable: false, // Prevent focusing on this element
  } : {};

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
      {...accessibilityProps}
    >
      <Text style={[styles.text, getTextStyle()]}>{getIcon()}{message}</Text>
    </Animated.View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#F44336',
  },
  infoToast: {
    backgroundColor: '#2196F3',
  },
  successText: {
    color: 'white',
  },
  errorText: {
    color: 'white',
  },
  infoText: {
    color: 'white',
  },
}); 