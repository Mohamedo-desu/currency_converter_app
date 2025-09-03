import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/screens/HistoryScreen.styles";
import { Ionicons } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Represents a single currency conversion record
 */
interface ConversionHistory {
  id: string;
  deviceId: string;
  deviceInfo?: any;
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
 * Grouped conversions by device ID
 */
interface DeviceConversions {
  deviceId: string;
  deviceInfo?: any;
  conversions: ConversionHistory[];
}

const AdminConversionsScreen = () => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [deviceGroups, setDeviceGroups] = useState<DeviceConversions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
   * Fetch all conversions from backend and group by device ID
   */
  const fetchAllConversions = async () => {
    setIsLoading(true);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/conversions/all?limit=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversions");
      }

      const data = await response.json();

      if (data.success && data.conversions) {
        // Group conversions by device ID
        const grouped = data.conversions.reduce(
          (
            acc: { [key: string]: ConversionHistory[] },
            conversion: ConversionHistory
          ) => {
            const deviceId = conversion.deviceId;
            if (!acc[deviceId]) {
              acc[deviceId] = [];
            }
            acc[deviceId].push(conversion);
            return acc;
          },
          {}
        );

        // Convert to array format and sort by most recent conversion
        const deviceGroups: DeviceConversions[] = Object.keys(grouped)
          .map((deviceId) => {
            const conversions = grouped[deviceId].sort(
              (a: ConversionHistory, b: ConversionHistory) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            return {
              deviceId,
              deviceInfo: conversions[0]?.deviceInfo || null,
              conversions,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.conversions[0]?.timestamp || 0).getTime() -
              new Date(a.conversions[0]?.timestamp || 0).getTime()
          );

        setDeviceGroups(deviceGroups);
      }
    } catch (error) {
      console.error("Error fetching conversions:", error);
      showError("Error", "Failed to load conversions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(deviceGroups[0]);

  const showError = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchAllConversions();
  }, []);

  const renderDeviceGroup = useCallback(
    ({ item }: { item: DeviceConversions }) => {
      return (
        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            style={[
              styles.historyItem,
              {
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
              },
            ]}
            onPress={() =>
              router.push(`/device-conversions?deviceId=${item.deviceId}`)
            }
            activeOpacity={0.8}
          >
            <View style={styles.historyHeader}>
              <View style={{ flex: 1 }}>
                <CustomText
                  variant="h5"
                  fontWeight="bold"
                  style={{ color: colors.text }}
                >
                  Device: {item.deviceInfo?.deviceName}
                </CustomText>
                <CustomText
                  variant="h6"
                  style={{ color: colors.gray[400], marginTop: 2 }}
                >
                  {item.conversions.length} conversions
                </CustomText>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CustomText
                  variant="h6"
                  style={{ color: colors.gray[400], marginRight: 8 }}
                >
                  View Details
                </CustomText>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.gray[400]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
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
          <CustomText variant="h5" fontWeight="bold">
            All Conversions
          </CustomText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={fetchAllConversions}
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
        ) : deviceGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="analytics-outline"
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
              No conversions found
            </CustomText>
          </View>
        ) : (
          <FlatList
            data={deviceGroups}
            renderItem={renderDeviceGroup}
            keyExtractor={(item) => item.deviceId}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          />
        )}
      </View>
    </View>
  );
};

export default AdminConversionsScreen;
