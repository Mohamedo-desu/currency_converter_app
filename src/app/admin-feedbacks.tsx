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
 * Device summary with feedback count
 */
interface DeviceFeedbackSummary {
  deviceId: string;
  deviceName: string;
  totalFeedbacks: number;
  userName: string;
}

const AdminFeedbacksScreen = () => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [deviceSummaries, setDeviceSummaries] = useState<
    DeviceFeedbackSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  const ITEMS_PER_PAGE = 20;

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
   * Fetch device summaries with feedback counts from backend
   */
  const fetchFeedbacks = async (
    page: number = 1,
    isLoadMore: boolean = false
  ) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/api/feedback/all?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch device summaries");
      }

      const data = await response.json();

      if (data.success && data.devices) {
        if (isLoadMore) {
          // Append new data for pagination
          setDeviceSummaries((prev) => [...prev, ...data.devices]);
        } else {
          // Replace data for initial load or refresh
          setDeviceSummaries(data.devices);
        }

        // Update pagination state
        setHasMoreData(data.pagination?.hasMore || false);
        setTotalFeedbacks(data.pagination?.totalDevices || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching device summaries:", error);
      showError("Error", "Failed to load device summaries. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const refreshData = () => {
    setCurrentPage(1);
    setHasMoreData(true);
    fetchFeedbacks(1, false);
  };

  const loadMoreData = () => {
    if (!isLoadingMore && hasMoreData) {
      fetchFeedbacks(currentPage + 1, true);
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
    fetchFeedbacks(1, false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={Colors.primary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <CustomText
          variant="h6"
          style={{ color: colors.gray[400], marginTop: 8 }}
        >
          Loading more devices...
        </CustomText>
      </View>
    );
  };

  const renderFeedbackItem = useCallback(
    ({ item }: { item: DeviceFeedbackSummary }) => {
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
              router.push(`/device-feedbacks?deviceId=${item.deviceId}`)
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
                  Device: {item.deviceName}
                </CustomText>
                <CustomText
                  variant="h6"
                  style={{ color: colors.gray[400], marginTop: 2 }}
                >
                  {item.totalFeedbacks} feedbacks • {item.userName}
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
            User Feedbacks ({totalFeedbacks})
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
        ) : deviceSummaries.length === 0 ? (
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
              No feedbacks found
            </CustomText>
          </View>
        ) : (
          <FlatList
            data={deviceSummaries}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.deviceId}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            refreshing={isLoading}
            onRefresh={refreshData}
          />
        )}
      </View>
    </View>
  );
};

export default AdminFeedbacksScreen;
