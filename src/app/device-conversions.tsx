import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import { getCurrencySymbol } from "@/services/currencyService";
import { styles } from "@/styles/screens/HistoryScreen.styles";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
 * Represents a single currency conversion record
 */
interface ConversionHistory {
  id: string;
  deviceId: string;
  fromCurrency: string;
  toCurrency: string;
  fromFlag: string;
  toFlag: string;
  originalAmount: number;
  convertedAmount: number;
  formattedAmount: string;
  formattedConverted: string;
  exchangeRate: number;
  timestamp: string;
  createdAt: string;
}

/**
 * Device information
 */
interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  modelName?: string;
  brand?: string;
  manufacturer?: string;
  osName?: string;
  osVersion?: string;
  platform?: string;
}

const DeviceConversionsScreen = () => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();

  const [conversions, setConversions] = useState<ConversionHistory[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Handle Android back press to navigate back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  /**
   * Fetch conversions for the specific device
   */
  const fetchDeviceConversions = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/conversions/device/${deviceId}?page=${pageNum}&limit=50`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch device conversions");
      }

      const data = await response.json();

      if (data.success && data.conversions) {
        if (append) {
          setConversions((prev) => [...prev, ...data.conversions]);
        } else {
          setConversions(data.conversions);

          // Extract device info from the first conversion if available
          if (data.conversions.length > 0 && data.conversions[0].deviceInfo) {
            setDeviceInfo({
              deviceId,
              ...data.conversions[0].deviceInfo,
            });
          } else {
            setDeviceInfo({ deviceId });
          }
        }

        // Check if there are more pages
        const totalPages = data.pagination?.total || 1;
        setHasMore(pageNum < totalPages);
      }
    } catch (error) {
      console.error("Error fetching device conversions:", error);
      showError(
        "Error",
        "Failed to load device conversions. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const showError = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Load on mount
  useEffect(() => {
    if (deviceId) {
      fetchDeviceConversions(1, false);
    }
  }, [deviceId]);

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDeviceConversions(nextPage, true);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderConversionItem = useCallback(
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
            {item.formattedAmount}
          </CustomText>
          <CustomText
            variant="h5"
            fontWeight="bold"
            style={{ color: Colors.primary }}
          >
            {getCurrencySymbol(item.toCurrency)}
            {item.formattedConverted}
          </CustomText>
        </View>
      </View>
    ),
    [colors]
  );

  const renderDeviceInfo = () => {
    if (!deviceInfo) return null;

    return (
      <View
        style={[
          styles.historyItem,
          { backgroundColor: colors.card, marginBottom: 16 },
        ]}
      >
        <CustomText
          variant="h5"
          fontWeight="bold"
          style={{ color: colors.text, marginBottom: 12 }}
        >
          Device Information
        </CustomText>

        <View style={{ gap: 8 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <CustomText variant="h6" style={{ color: colors.gray[400] }}>
              Device ID:
            </CustomText>
            <CustomText
              variant="h6"
              style={{ color: colors.text, flex: 1, textAlign: "right" }}
              numberOfLines={1}
            >
              {deviceInfo.deviceId}
            </CustomText>
          </View>

          {deviceInfo.deviceName && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <CustomText variant="h6" style={{ color: colors.gray[400] }}>
                Device Name:
              </CustomText>
              <CustomText variant="h6" style={{ color: colors.text }}>
                {deviceInfo.deviceName}
              </CustomText>
            </View>
          )}

          {deviceInfo.brand && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <CustomText variant="h6" style={{ color: colors.gray[400] }}>
                Brand:
              </CustomText>
              <CustomText variant="h6" style={{ color: colors.text }}>
                {deviceInfo.brand}
              </CustomText>
            </View>
          )}

          {deviceInfo.modelName && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <CustomText variant="h6" style={{ color: colors.gray[400] }}>
                Model:
              </CustomText>
              <CustomText variant="h6" style={{ color: colors.text }}>
                {deviceInfo.modelName}
              </CustomText>
            </View>
          )}

          {deviceInfo.osName && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <CustomText variant="h6" style={{ color: colors.gray[400] }}>
                OS:
              </CustomText>
              <CustomText variant="h6" style={{ color: colors.text }}>
                {deviceInfo.osName} {deviceInfo.osVersion}
              </CustomText>
            </View>
          )}

          {deviceInfo.platform && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <CustomText variant="h6" style={{ color: colors.gray[400] }}>
                Platform:
              </CustomText>
              <CustomText variant="h6" style={{ color: colors.text }}>
                {deviceInfo.platform}
              </CustomText>
            </View>
          )}

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <CustomText variant="h6" style={{ color: colors.gray[400] }}>
              Total Conversions:
            </CustomText>
            <CustomText
              variant="h6"
              style={{ color: Colors.primary, fontWeight: "bold" }}
            >
              {conversions.length}
            </CustomText>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

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
            Device Details
          </CustomText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => fetchDeviceConversions(1, false)}
            activeOpacity={0.8}
            hitSlop={10}
          >
            <Ionicons
              name="refresh-outline"
              size={Spacing.iconSize}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loadingContainer}
          />
        ) : (
          <FlatList
            data={conversions}
            renderItem={renderConversionItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderDeviceInfo}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            removeClippedSubviews
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="phone-portrait-outline"
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
                  No conversions found for this device
                </CustomText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default DeviceConversionsScreen;
