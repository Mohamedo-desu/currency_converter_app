import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";

export default function useUpdates() {
  const { isUpdateAvailable } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync()
        .then(() => Updates.reloadAsync())
        .catch(() => {
          Alert.alert(
            "Update Error",
            "An error occurred while checking for updates.",
            [{ text: "OK" }]
          );
        });
    }
  }, [isUpdateAvailable]);
}
