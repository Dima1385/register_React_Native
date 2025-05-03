import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

type ButtonType = 'primary' | 'secondary';

type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  type?: ButtonType;
  disabled?: boolean;
};

export function ThemedButton({
  title,
  onPress,
  style,
  textStyle,
  type = 'primary',
  disabled = false,
}: ThemedButtonProps) {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const getBackgroundColor = () => {
    if (disabled) return isDark ? '#3A3A3C' : '#E5E5EA';
    
    if (type === 'primary') {
      return isDark ? '#0A84FF' : '#007AFF';
    } else {
      return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return isDark ? '#8E8E93' : '#AEAEB2';
    
    if (type === 'primary') {
      return '#FFFFFF';
    } else {
      return isDark ? '#0A84FF' : '#007AFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return isDark ? '#3A3A3C' : '#E5E5EA';
    
    if (type === 'secondary') {
      return 'transparent';
    } else {
      return 'transparent';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        type === 'secondary' && styles.secondaryButton,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
          },
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
  },
  secondaryButton: {
    borderWidth: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 