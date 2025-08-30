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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

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

// Time constant for history retention (30 days in milliseconds)
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const HistoryScreen = () => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCleanupMessage, setShowCleanupMessage] = useState(false);

  // Handle Android back press to navigate back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push("/settings");
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  /**
   * Removes conversion records older than 30 days
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
        const recentHistory = parsedHistory.filter(
          ({ timestamp }) => now - timestamp <= THIRTY_DAYS_MS
        );

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

  const showError = (title: string, message: string) => {
    if (Platform.OS === "web") {
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
      if (
        window.confirm("Are you sure you want to clear all conversion history?")
      ) {
        await doClear();
      }
    } else {
      Alert.alert(
        "Clear History",
        "Are you sure you want to clear all conversion history?",
        [
          { text: "Delete", style: "destructive", onPress: doClear },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // Load on mount
  useEffect(() => {
    cleanupOldHistory(false);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

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
            {getCurrencySymbol(item.fromCurrency)}
            {item.amount}
          </CustomText>
          <CustomText
            variant="h5"
            fontWeight="bold"
            style={{ color: Colors.primary }}
          >
            {getCurrencySymbol(item.toCurrency)}
            {item.convertedAmount}
          </CustomText>
        </View>
      </View>
    ),
    [colors]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: bottom + 10 },
      ]}
    >
      <View style={[styles.header, { paddingTop: top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
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
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loadingContainer}
          />
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
            keyExtractor={(item) => item.timestamp.toString()}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
          />
        )}
      </View>
    </View>
  );
};

export default HistoryScreen;
