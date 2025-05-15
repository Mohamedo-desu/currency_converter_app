import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import { getCurrencySymbol } from "@/services/currencyService";
import {
  deleteStoredValues,
  getStoredValues,
  saveSecurely,
} from "@/store/storage";
import { styles } from "@/styles/screens/HistoryScreen.styles";
import { Navigate } from "@/types/AuthHeader.types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Represents a single currency conversion record in the history
 */
interface ConversionHistory {
  fromCurrency: string;
  toCurrency: string;
  fromFlag: string;
  toFlag: string;
  amount: string;
  convertedAmount: string;
  timestamp: number;
}

// Time constant for history retention (3 days in milliseconds)
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const FLAG_SIZE = 20;

const HistoryScreen = ({ navigate }: { navigate: Navigate }) => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCleanupMessage, setShowCleanupMessage] = useState(false);

  // Add back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigate("Settings");
        return true; // Prevent default behavior (exit app)
      }
    );

    // Cleanup listener on unmount
    return () => backHandler.remove();
  }, [navigate]);

  /**
   * Removes conversion records older than 3 days
   * @param showMessage - Whether to display a success message after cleanup
   */
  const cleanupOldHistory = async (showMessage = true) => {
    setIsLoading(true);
    try {
      const storedHistory = getStoredValues(["conversionHistory"]);
      if (storedHistory.conversionHistory) {
        const parsedHistory: ConversionHistory[] = JSON.parse(
          storedHistory.conversionHistory
        );
        const now = Date.now();

        // Filter out entries older than 3 days
        const recentHistory = parsedHistory.filter(
          (item) => now - item.timestamp <= THREE_DAYS_MS
        );

        // Update storage if any entries were removed
        if (recentHistory.length !== parsedHistory.length) {
          if (recentHistory.length === 0) {
            deleteStoredValues(["conversionHistory"]);
          } else {
            saveSecurely([
              {
                key: "conversionHistory",
                value: JSON.stringify(recentHistory),
              },
            ]);
          }

          if (showMessage) {
            setShowCleanupMessage(true);
            setTimeout(() => setShowCleanupMessage(false), 3000);
          }
        }

        setHistory(recentHistory);
      }
    } catch (error) {
      console.error("Error cleaning up history:", error);
      showError("Error", "Failed to clean up history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the clear history action with confirmation dialog
   */

  const showError = (title: string, message: string) => {
    if (Platform.OS === "web") {
      // browser alert only shows the message
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const doClear = async () => {
    setIsLoading(true);
    try {
      deleteStoredValues(["conversionHistory"]);
      setHistory([]);
      setShowCleanupMessage(true);
      setTimeout(() => setShowCleanupMessage(false), 3000);
    } catch (error) {
      console.error("Error clearing history:", error);
      showError("Error", "Failed to clear history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to clear all conversion history?"
      );
      if (confirmed) {
        await doClear();
      }
    } else {
      Alert.alert(
        "Clear History",
        "Are you sure you want to clear all conversion history?",
        [
          {
            text: "Delete",
            style: "destructive",
            onPress: doClear,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  // Initialize history on component mount
  useEffect(() => {
    cleanupOldHistory(false);
  }, []);

  /**
   * Formats timestamp to local date string
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  /**
   * Renders a single history item with currency flags and conversion details
   */
  const renderHistoryItem = useCallback(
    ({ item }: { item: ConversionHistory }) => (
      <View style={[styles.historyItem, { backgroundColor: colors.card }]}>
        <View style={styles.historyHeader}>
          <View style={styles.currencyPair}>
            <View style={styles.flagContainer}>
              <CountryFlag
                isoCode={item.fromFlag}
                size={Spacing.flagIconSize}
                style={styles.flag}
              />
              <CountryFlag
                isoCode={item.toFlag}
                size={Spacing.flagIconSize}
                style={[styles.flag, styles.flagOverlap]}
              />
            </View>
            <View style={styles.currencyColumn}>
              <CustomText
                variant="h6"
                fontWeight="medium"
                style={{ color: colors.text }}
              >
                {getCurrencySymbol(item.fromCurrency)}
              </CustomText>
              <MaterialIcons
                name="arrow-right-alt"
                size={Typography.fontSize.h6}
                color={colors.text}
                style={{ marginHorizontal: Spacing.xs }}
              />
              <CustomText
                variant="h6"
                fontWeight="medium"
                style={{ color: colors.text }}
              >
                {getCurrencySymbol(item.toCurrency)}
              </CustomText>
            </View>
          </View>
          <CustomText variant="h7" style={{ color: colors.gray[400] }}>
            {formatDate(item.timestamp)}
          </CustomText>
        </View>
        <View style={styles.historyDetails}>
          <CustomText
            variant="h6"
            fontWeight="medium"
            style={{ color: colors.gray[400] }}
          >
            {item.amount} {getCurrencySymbol(item.fromCurrency)}
          </CustomText>
          <CustomText
            variant="h5"
            fontWeight="bold"
            style={{ color: Colors.primary }}
          >
            {item.convertedAmount} {getCurrencySymbol(item.toCurrency)}
          </CustomText>
        </View>
      </View>
    ),
    [colors, formatDate]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: bottom + 10 },
      ]}
    >
      {/* Navigation header with back button and clear history option */}
      <View style={[styles.header, { paddingTop: top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigate("Settings")}
            activeOpacity={0.8}
            hitSlop={10}
          >
            <Ionicons
              name="arrow-back"
              size={Spacing.iconSize}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <CustomText variant="h4" fontWeight="bold">
            History
          </CustomText>
        </View>
        <View style={styles.headerRight}>
          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              activeOpacity={0.8}
              hitSlop={10}
            >
              <Ionicons
                name="trash-outline"
                size={Spacing.iconSize}
                color={Colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Success message for history cleanup */}
      {showCleanupMessage && (
        <View style={[styles.cleanupMessage, { backgroundColor: colors.card }]}>
          <Ionicons
            name="checkmark-circle"
            size={Spacing.iconSize}
            color={Colors.primary}
          />
          <CustomText
            variant="h6"
            fontWeight="medium"
            style={{ color: colors.text, marginLeft: 8 }}
          >
            History cleaned up successfully
          </CustomText>
        </View>
      )}

      {/* Main content area with loading state, empty state, or history list */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="time-outline"
              size={Spacing.iconSize}
              color={colors.gray[400]}
            />
            <CustomText
              variant="h6"
              fontWeight="medium"
              style={{
                color: colors.gray[400],
                textAlign: "center",
                marginTop: 10,
              }}
            >
              No conversion history yet
            </CustomText>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.timestamp.toString()}
            removeClippedSubviews
          />
        )}
      </View>
    </View>
  );
};

export default HistoryScreen;
