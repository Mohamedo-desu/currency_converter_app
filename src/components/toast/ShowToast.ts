import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

const TOAST_LENGTH = 3_000;

export const showToast = (
  type: "success" | "error" | "info" | "warning",
  text1: string,
  text2?: string
) => {
  Toast.show({
    type,
    text1,
    text2,
    visibilityTime: TOAST_LENGTH,
  });

  switch (type) {
    case "success":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case "error":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case "info":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case "warning":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    default:
      break;
  }
};
