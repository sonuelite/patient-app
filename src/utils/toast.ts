import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

export const showToast = (
  message: string,
  type: ToastType = 'success',
) => {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
  });
};