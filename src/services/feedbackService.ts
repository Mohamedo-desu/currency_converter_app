import { getDeviceId } from "@/utils/deviceId";
import { getDeviceInfo as getDetailedDeviceInfo } from "@/utils/deviceInfo";
import { Platform } from "react-native";

// Define feedback types
export type FeedbackType = "Bug Report" | "Feedback" | "Other";

// Define feedback interface
export interface Feedback {
  type: FeedbackType;
  name: string;
  email: string;
  text: string;
  timestamp: number;
  platform: string;
  version?: string;
  deviceId?: string;
  deviceInfo?: any;
}

// API endpoint - ensure it ends with /api/feedback
const API_ENDPOINT = process.env.EXPO_PUBLIC_BACKEND_URL + "/api/feedback";

// Remote feedback submission
export const submitFeedback = async (feedback: Feedback): Promise<boolean> => {
  try {
    // Add deviceId and deviceInfo before submitting
    const deviceId = await getDeviceId();
    const deviceInfo = getDetailedDeviceInfo();

    const enhancedFeedback = {
      ...feedback,
      deviceId,
      deviceInfo,
    };

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(enhancedFeedback),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server response:", errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData}`
      );
    }

    await response.json();
    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
};

// Get device information (legacy function for backward compatibility)
export const getDeviceInfo = (): string => {
  const platform = Platform.OS;
  const version = Platform.Version;
  return `${platform} ${version}`;
};
