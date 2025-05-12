import * as Updates from "expo-updates";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Alert, Platform, AlertButton as RNAlertButton } from "react-native";

// Constants
const DEBOUNCE_TIME = 2000; // 2 seconds debounce

// Types
interface UpdateContextType {
  isChecking: boolean;
  isUpdating: boolean;
  checkForUpdates: () => Promise<void>;
  lastChecked: Date | null;
}

// Context
const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

// Alert helper with consistent button handling
const showAlert = (
  title: string,
  message: string,
  onPress?: () => void,
  showCancel = false
) => {
  if (Platform.OS === "web") {
    const shouldProceed = window.confirm(`${title}: ${message}`);
    if (shouldProceed && onPress) onPress();
  } else {
    const buttons: RNAlertButton[] = [
      {
        text: showCancel ? "Later" : "OK",
        style: "cancel",
      },
    ];

    if (showCancel) {
      buttons.unshift({
        text: "Update Now",
        onPress,
        style: "default",
      });
    } else if (onPress) {
      buttons[0].onPress = onPress;
    }

    Alert.alert(title, message, buttons);
  }
};

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const lastCheckTime = useRef<number>(0);

  // Update handling
  const handleUpdate = useCallback(async () => {
    try {
      setIsUpdating(true);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Update failed:", error);
      showAlert(
        "Update Failed",
        "Failed to download the update. Please try again later."
      );
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Main update check function
  const checkForUpdates = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isChecking || isUpdating) {
      console.log("Update check skipped: Another check is in progress");
      return;
    }

    // Debounce check
    const now = Date.now();
    if (now - lastCheckTime.current < DEBOUNCE_TIME) {
      console.log("Update check skipped: Debounced");
      return;
    }
    lastCheckTime.current = now;

    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();
      setLastChecked(new Date());

      if (update.isAvailable) {
        showAlert(
          "Update Available",
          "A new version is available. Would you like to update now?",
          handleUpdate,
          true
        );
      } else {
        showAlert("No Updates", "You are using the latest version.");
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      showAlert(
        "Error",
        "Failed to check for updates. Please try again later."
      );
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, isUpdating, handleUpdate]);

  return (
    <UpdateContext.Provider
      value={{
        isChecking,
        isUpdating,
        checkForUpdates,
        lastChecked,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error("useUpdate must be used within an UpdateProvider");
  }
  return context;
};
