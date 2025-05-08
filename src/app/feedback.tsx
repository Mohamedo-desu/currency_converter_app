import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

const FeedbackScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter your feedback");
      return;
    }

    // Here you would typically send the feedback to your backend
    // For now, we'll just show a success message
    Alert.alert(
      "Thank You!",
      "Your feedback has been submitted successfully.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={RFValue(24)}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <CustomText variant="h4" fontFamily={Fonts.Bold}>
          Feedback
        </CustomText>
        <View style={{ width: RFValue(24) }} />
      </View>

      {/* Feedback Form */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomText variant="h6" style={[styles.label, { color: colors.text }]}>
          Your Feedback
        </CustomText>
        <TextInput
          style={[
            styles.input,
            styles.feedbackInput,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Tell us what you think..."
          placeholderTextColor={colors.gray[400]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={feedback}
          onChangeText={setFeedback}
        />

        <CustomText variant="h6" style={[styles.label, { color: colors.text }]}>
          Your Email (Optional)
        </CustomText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={colors.gray[400]}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: Colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <CustomText
            variant="h6"
            fontFamily={Fonts.Medium}
            style={{ color: Colors.white }}
          >
            Submit Feedback
          </CustomText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    marginBottom: 20,
    fontSize: RFValue(16),
  },
  feedbackInput: {
    height: RFValue(150),
  },
  submitButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 30,
  },
});
