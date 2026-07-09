import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * Cross-platform alert utility.
 * Uses window.alert/confirm on web, and Alert.alert on native.
 */
export const showPlatformAlert = (
  title: string,
  message: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      // Find the positive action button
      const confirmButton = buttons.find(b => b.style === 'destructive' || (b.text !== 'Batal' && b.text !== 'Cancel'));
      
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && confirmButton && confirmButton.onPress) {
        confirmButton.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      if (buttons && buttons.length > 0 && buttons[0].onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
