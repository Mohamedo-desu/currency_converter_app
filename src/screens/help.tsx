import AuthHeader from "@/components/AuthHeader";
import CustomText from "@/components/CustomText";
import { Fonts } from "@/constants/Fonts";
import { getStoredValues, saveSecurely } from "@/store/storage";
import { styles } from "@/styles/screens/HelpScreen.styles";
import { ThemeContext } from "@/theme/CustomThemeProvider";
import { Navigate } from "@/types/AuthHeader.types";

import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define the different report types that users can choose from
const reportTypes = ["Bug Report", "Feedback", "Other"];

// Define a type for feedback
interface Feedback {
  type: string;
  name: string;
  email: string;
  text: string;
  timestamp: number;
}

const HelpScreen = ({ navigate }: { navigate: Navigate }) => {
  const { colors } = useContext(ThemeContext);
  const { top, bottom } = useSafeAreaInsets();

  // State to hold report type, user details, and the report text
  const [selectedType, setSelectedType] = useState(reportTypes[0]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [reportText, setReportText] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Helper to show alerts differently on web vs native
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Load feedbacks from local storage
  useEffect(() => {
    const stored = getStoredValues(["userFeedbacks"]);
    if (stored.userFeedbacks) {
      setFeedbacks(JSON.parse(stored.userFeedbacks));
    }
  }, []);

  // Save feedback locally
  const saveFeedbackLocally = (feedback: Feedback) => {
    const stored = getStoredValues(["userFeedbacks"]);
    const existing: Feedback[] = stored.userFeedbacks
      ? JSON.parse(stored.userFeedbacks)
      : [];
    const updated = [feedback, ...existing];
    saveSecurely([{ key: "userFeedbacks", value: JSON.stringify(updated) }]);
    setFeedbacks(updated);
  };

  // Handle form submission for the report
  const handleSubmit = () => {
    // Validate inputs
    if (userName.trim().length === 0) {
      showAlert("Error", "Please enter your name.");
      return;
    }
    if (userEmail.trim().length === 0) {
      showAlert("Error", "Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(userEmail)) {
      showAlert("Error", "Please enter a valid email address.");
      return;
    }
    if (reportText.trim().length === 0) {
      showAlert("Error", "Please enter a description for your report.");
      return;
    }

    // // Capture Sentry event & feedback
    // const eventId = Sentry.captureMessage(
    //   `[${selectedType}] Report from ${userName} <${userEmail}>: ${reportText}`
    // );
    // Sentry.captureFeedback({
    //   name: userName,
    //   email: userEmail,
    //   message: `Report Type: ${selectedType}\n\n${reportText}`,
    //   associatedEventId: eventId,
    // });

    // Save locally
    saveFeedbackLocally({
      type: selectedType,
      name: userName,
      email: userEmail,
      text: reportText,
      timestamp: Date.now(),
    });

    // Notify user
    showAlert(
      "Report Submitted",
      `Thank you, ${userName}! Your ${selectedType.toLowerCase()} has been submitted.`
    );

    // Clear inputs
    setUserName("");
    setUserEmail("");
    setReportText("");
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      enableAutomaticScroll
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: top + 10, paddingBottom: bottom + 10 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <AuthHeader
        title="Help & Reports"
        description="Please let us know your feedback or any issues you are facing."
        Navigate={navigate}
      />

      {/* Report Type Selection */}
      <View style={styles.reportTypeContainer}>
        {reportTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reportTypeButton,
              {
                borderColor:
                  selectedType === type ? colors.primary : colors.gray[400],
                backgroundColor:
                  selectedType === type ? colors.primary : "transparent",
              },
            ]}
            onPress={() => setSelectedType(type)}
          >
            <CustomText
              style={{ color: selectedType === type ? "#fff" : colors.text }}
            >
              {type}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inputs */}
      <TextInput
        style={[
          styles.textInputSmall,
          { color: colors.text, borderColor: colors.gray[200] },
        ]}
        placeholder="Your Name"
        placeholderTextColor={colors.gray[500]}
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={[
          styles.textInputSmall,
          { color: colors.text, borderColor: colors.gray[200] },
        ]}
        placeholder="Your Email"
        placeholderTextColor={colors.gray[500]}
        value={userEmail}
        onChangeText={setUserEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[
          styles.textInput,
          { color: colors.text, borderColor: colors.gray[200] },
        ]}
        placeholder="Describe your issue or feedback here..."
        placeholderTextColor={colors.gray[500]}
        value={reportText}
        onChangeText={setReportText}
        multiline
        textAlignVertical="top"
        maxLength={500}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <CustomText
          variant="h6"
          fontFamily={Fonts.Medium}
          style={styles.submitButtonText}
        >
          Submit Report
        </CustomText>
      </TouchableOpacity>

      {/* Feedback List */}
      <View
        style={[styles.feedbackListContainer, { marginBottom: bottom + 20 }]}
      >
        <CustomText
          variant="h5"
          fontFamily={Fonts.Bold}
          style={{ marginBottom: 10 }}
        >
          Your Submitted Feedback
        </CustomText>
        {feedbacks.length === 0 ? (
          <CustomText style={{ color: colors.gray[400] }}>
            No feedback submitted yet.
          </CustomText>
        ) : (
          feedbacks.map((fb, idx) => (
            <View
              key={idx}
              style={[styles.feedbackCard, { backgroundColor: colors.card }]}
            >
              <CustomText
                variant="h6"
                fontFamily={Fonts.Medium}
                style={styles.feedbackCardTitle}
              >
                {fb.type}
              </CustomText>
              <CustomText style={styles.feedbackCardText}>{fb.text}</CustomText>
              <CustomText
                style={[styles.feedbackCardMeta, { color: colors.gray[400] }]}
              >
                {fb.name} • {fb.email}
              </CustomText>
              <CustomText
                style={[
                  styles.feedbackCardTimestamp,
                  { color: colors.gray[400] },
                ]}
              >
                {new Date(fb.timestamp).toLocaleString()}
              </CustomText>
            </View>
          ))
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default HelpScreen;
