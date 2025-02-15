import CustomText from "@/components/CustomText";
import { Fonts } from "@/constants/Fonts";
import { useTheme } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define the different report types that users can choose from
const reportTypes = ["Bug Report", "Feedback", "Other"];

const HelpScreen = () => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  // State to hold report type, user details, and the report text
  const [selectedType, setSelectedType] = useState(reportTypes[0]); // Default to "Bug Report"
  const [userName, setUserName] = useState(""); // User's name
  const [userEmail, setUserEmail] = useState(""); // User's email
  const [reportText, setReportText] = useState(""); // Report description

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
    // The message includes the report type and description.
    const eventId = Sentry.captureMessage(
      `[${selectedType}] Report: ${reportText}`
    );

    // Build the user feedback object with the captured event ID
    const userFeedback: Sentry.UserFeedback = {
      event_id: eventId,
      name: userName,
      email: userEmail,
      comments: `Report Type: ${selectedType}\n\n${reportText}`,
    };

    // Send the user feedback to Sentry
    Sentry.captureUserFeedback(userFeedback);

    // Optionally, notify the user that their report was submitted
    Alert.alert(
      "Report Submitted",
      `Name: ${userName}\nEmail: ${userEmail}\nType: ${selectedType}`
    );

    // Clear the input fields after submission
    setUserName("");
    setUserEmail("");
    setReportText("");
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: top + 20 },
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Header */}
      <CustomText variant="h1" fontFamily={Fonts.Bold}>
        Help & Reports
      </CustomText>
      <CustomText
        variant="h5"
        fontFamily={Fonts.Medium}
        style={[styles.subTitle, { color: colors.gray[500] }]}
      >
        Please let us know your feedback or any issues you are facing.
      </CustomText>

      {/* Report Type Selection */}
      <View style={styles.reportTypeContainer}>
        {reportTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reportTypeButton,
              {
                // Highlight the selected report type using the primary color
                borderColor:
                  selectedType === type ? colors.primary : colors.border,
                backgroundColor:
                  selectedType === type ? colors.primary : "transparent",
              },
            ]}
            onPress={() => setSelectedType(type)}
          >
            <CustomText
              style={{
                // Change text color based on selection
                color: selectedType === type ? colors.background : colors.text,
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
          { color: colors.text, borderColor: colors.border },
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
          { color: colors.text, borderColor: colors.border },
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
          { color: colors.text, borderColor: colors.border },
        ]}
        placeholder="Describe your issue or feedback here..."
        placeholderTextColor={colors.gray[500]}
        value={reportText}
        onChangeText={setReportText}
        multiline
        textAlignVertical="top"
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <CustomText
          variant="h5"
          fontFamily={Fonts.Medium}
          style={styles.submitButtonText}
        >
          Submit Report
        </CustomText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  subTitle: {
    marginTop: 10,
  },
  reportTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  reportTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 5,
  },
  // Larger input style for report description
  textInput: {
    height: 150,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  // Smaller input style for name and email
  textInputSmall: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  submitButton: {
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "#fff",
  },
});
