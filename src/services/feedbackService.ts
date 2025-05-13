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
  deviceInfo?: string;
}

// API endpoint
const API_ENDPOINT = process.env.EXPO_PUBLIC_FEEDBACK_API_URL;

// Remote feedback submission
export const submitFeedback = async (feedback: Feedback): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Feedback submitted successfully:", data);
    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
};

// Get device information
export const getDeviceInfo = (): string => {
  const platform = Platform.OS;
  const version = Platform.Version;
  return `${platform} ${version}`;
};
