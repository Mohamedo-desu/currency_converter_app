import { Colors } from "@/constants/Colors";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === "web" && {
      maxWidth: 500,
      marginHorizontal: "auto",
      width: "100%",
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  subTitle: {
    marginTop: 10,
  },
  reportTypeContainer: {
    flexDirection: "row",
    marginVertical: 20,
    gap: 10,
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
    color: Colors.white,
  },
  feedbackListContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  feedbackCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  feedbackCardTitle: {
    // for CustomText variant h6, fontFamily Medium
  },
  feedbackCardText: {
    marginTop: 4,
  },
  feedbackCardMeta: {
    color: "#BDBDBD",
    fontSize: 12,
    marginTop: 4,
  },
  feedbackCardTimestamp: {
    color: "#BDBDBD",
    fontSize: 12,
  },
});
