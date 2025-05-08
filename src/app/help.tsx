import AuthHeader from "@/components/AuthHeader";
import CustomText from "@/components/CustomText";
import { Fonts } from "@/constants/Fonts";
import { getStoredValues, saveSecurely } from "@/store/storage";
import { styles } from "@/styles/screens/HelpScreen.styles";
import { useTheme } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import React, { useEffect, useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";
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

const HelpScreen = () => {
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  // State to hold report type, user details, and the report text
  const [selectedType, setSelectedType] = useState(reportTypes[0]); // Default to "Bug Report"
  const [userName, setUserName] = useState(""); // User's name
  const [userEmail, setUserEmail] = useState(""); // User's email
  const [reportText, setReportText] = useState(""); // Report description
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

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
    const feedbacks: Feedback[] = stored.userFeedbacks
      ? JSON.parse(stored.userFeedbacks)
      : [];
    const updated = [feedback, ...feedbacks];
    saveSecurely([{ key: "userFeedbacks", value: JSON.stringify(updated) }]);
    setFeedbacks(updated);
  };

  // Handle form submission for the report
  const handleSubmit = () => {
    // Validate that the user has entered their name
    if (userName.trim().length === 0) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }
    // Validate that the user has entered their email address
    if (userEmail.trim().length === 0) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    // Validate that the email format is correct (simple regex check)
    if (!/\S+@\S+\.\S+/.test(userEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    // Validate that the user has entered a report description
    if (reportText.trim().length === 0) {
      Alert.alert("Error", "Please enter a description for your report.");
      return;
    }

    // Capture a Sentry event to generate an actual event ID.
    // The message includes the report type, user info, and description.
    const eventId = Sentry.captureMessage(
      `[${selectedType}] Report from ${userName} <${userEmail}>: ${reportText}`
    );

    // Build the user feedback object with the captured event ID
    Sentry.captureFeedback({
      name: userName,
      email: userEmail,
      message: `Report Type: ${selectedType}\n\n${reportText}`,
      associatedEventId: eventId,
    });

    // Save feedback locally for user reference
    saveFeedbackLocally({
      type: selectedType,
      name: userName,
      email: userEmail,
      text: reportText,
      timestamp: Date.now(),
    });

    // Notify the user that their report was submitted
    Alert.alert(
      "Report Submitted",
      `Thank you, ${userName}! Your ${selectedType.toLowerCase()} has been submitted.`
    );

    // Clear the input fields after submission
    setUserName("");
    setUserEmail("");
    setReportText("");
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      enableAutomaticScroll={true}
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
              style={{
                color: selectedType === type ? "#fff" : colors.text,
              }}
            >
              {type}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      {/* User Name Input */}
      <TextInput
        style={[
          styles.textInputSmall,
          { color: colors.text, borderColor: colors.gray[200] },
        ]}
        placeholder="Your Name"
        placeholderTextColor={colors.gray[500]}
        value={userName}
        onChangeText={setUserName}
        autoCorrect={false}
      />

      {/* User Email Input */}
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
        autoCorrect={false}
      />

      {/* Report Description Input */}
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
        textBreakStrategy="highQuality"
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
