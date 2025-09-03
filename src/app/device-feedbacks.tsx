import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/screens/HistoryScreen.styles";
import { Ionicons } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Represents a feedback record
 */
interface Feedback {
  id: string;
  deviceId: string;
  deviceInfo?: any;
  type: string;
  name: string;
  email: string;
  text: string;
  timestamp: number;
  platform: string;
  version?: string;
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

const DeviceFeedbacksScreen = () => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  const ITEMS_PER_PAGE = 50;

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
   * Fetch feedbacks for the specific device
   */
  const fetchDeviceFeedbacks = async (
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
        `${backendUrl}/api/feedback/device/${deviceId}?page=${pageNum}&limit=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch device feedbacks");
      }

      const data = await response.json();

      if (data.success && data.feedbacks) {
        if (append) {
          setFeedbacks((prev) => [...prev, ...data.feedbacks]);
        } else {
          setFeedbacks(data.feedbacks);
          setPage(1);

          // Extract device info from the first feedback if available
          if (data.feedbacks.length > 0 && data.feedbacks[0].deviceInfo) {
            setDeviceInfo({
              deviceId,
              ...data.feedbacks[0].deviceInfo,
            });
          } else {
            setDeviceInfo({ deviceId });
          }
        }

        // Update pagination state
        setTotalFeedbacks(
          data.pagination?.totalFeedbacks || data.feedbacks.length
        );
        setHasMore(data.pagination?.current < data.pagination?.total);
        if (append) {
          setPage(pageNum);
        }
      }
    } catch (error) {
      console.error("Error fetching device feedbacks:", error);
      showError("Error", "Failed to load device feedbacks. Please try again.");
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
      fetchDeviceFeedbacks(1, false);
    }
  }, [deviceId]);

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      fetchDeviceFeedbacks(nextPage, true);
    }
  };

  const refreshData = () => {
    setHasMore(true);
    fetchDeviceFeedbacks(1, false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // GitHub-style label colors for each type
  const labelColors = {
    "Bug Report": {
      background: "#d73a4a",
      text: "#ffffff",
    },
    Feedback: {
      background: "#0366d6",
      text: "#ffffff",
    },
    Other: {
      background: "#6f42c1",
      text: "#ffffff",
    },
  } as const;

  const renderFeedbackItem = useCallback(
    ({ item }: { item: Feedback }) => (
      <View
        style={[
          styles.historyItem,
          {
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          },
        ]}
      >
        {/* Header with type label and date */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View
            style={[
              {
                backgroundColor: `${
                  labelColors[item.type as keyof typeof labelColors]
                    ?.background || "#6f42c1"
                }20`,
                borderColor: `${
                  labelColors[item.type as keyof typeof labelColors]
                    ?.background || "#6f42c1"
                }40`,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              },
            ]}
          >
            <CustomText
              style={{
                color:
                  labelColors[item.type as keyof typeof labelColors]
                    ?.background || "#6f42c1",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {item.type}
            </CustomText>
          </View>
          <CustomText
            variant="h7"
            style={{
              color: colors.gray[400],
              fontSize: 12,
            }}
          >
            {formatDate(item.timestamp)}
          </CustomText>
        </View>

        {/* User Info */}
        <View style={{ marginBottom: 12 }}>
          <CustomText
            variant="h5"
            fontWeight="bold"
            style={{
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {item.name}
          </CustomText>
          <CustomText
            variant="h6"
            style={{
              color: colors.gray[400],
              fontSize: 14,
            }}
          >
            {item.email}
          </CustomText>
        </View>

        {/* Feedback Content */}
        <View style={{ marginBottom: 12 }}>
          <CustomText
            variant="h6"
            style={{
              color: colors.text,
              lineHeight: 22,
              fontSize: 15,
            }}
          >
            {item.text}
          </CustomText>
        </View>

        {/* Footer with platform info */}
        <View
          style={{
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: colors.gray[200],
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <CustomText
                variant="h7"
                style={{
                  color: colors.gray[500],
                  fontSize: 11,
                  fontWeight: "500",
                }}
              >
                {item.platform.toUpperCase()}
              </CustomText>
            </View>
            <CustomText
              variant="h7"
              style={{
                color: colors.gray[400],
                fontSize: 11,
              }}
            >
              v{item.version || "Unknown"}
            </CustomText>
          </View>

          {item.deviceInfo?.deviceName && (
            <CustomText
              variant="h7"
              style={{
                color: colors.gray[400],
                fontSize: 11,
                fontStyle: "italic",
              }}
            >
              {item.deviceInfo.deviceName}
            </CustomText>
          )}
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
              Total Feedbacks:
            </CustomText>
            <CustomText
              variant="h6"
              style={{ color: Colors.primary, fontWeight: "bold" }}
            >
              {totalFeedbacks}
            </CustomText>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <CustomText
          variant="h6"
          style={{ color: colors.gray[400], marginTop: 8 }}
        >
          Loading more feedbacks...
        </CustomText>
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
          <CustomText variant="h5" fontWeight="bold">
            Device Feedbacks
          </CustomText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={refreshData}
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
            data={feedbacks}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderDeviceInfo}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            removeClippedSubviews
            refreshing={isLoading}
            onRefresh={refreshData}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubbles-outline"
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
                  No feedbacks found for this device
                </CustomText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default DeviceFeedbacksScreen;
