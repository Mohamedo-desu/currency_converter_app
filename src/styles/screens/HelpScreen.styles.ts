import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
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
    paddingHorizontal: Spacing.screenPadding,
  },
  formContainer: {
    paddingVertical: Spacing.cardPadding,
    padding: Spacing.cardPadding,
    borderRadius: Spacing.inputBorderRadius,
    ...(Platform.OS === "web" && {
      maxWidth: 500,
      marginHorizontal: "auto",
      width: "100%",
    }),
    gap: Spacing.gap.lg,
    marginBottom: Spacing.margin.lg,
  },
  subTitle: {
    marginTop: Spacing.sm,
  },
  reportTypeContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  reportTypeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.inputBorderRadius,
    borderWidth: 1,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  // Larger input style for report description
  textInput: {
    height: 150,
    borderRadius: Spacing.inputBorderRadius,
    padding: Spacing.sm,
  },
  // Smaller input style for name and email
  textInputSmall: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    padding: Spacing.inputPadding,
    borderRadius: Spacing.inputBorderRadius,
    ...(Platform.OS === "web" && {
      minWidth: 200,
    }),
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.inputPadding,
    borderRadius: Spacing.inputBorderRadius,
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.inputHeight,
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.body,
  },
  feedbackListContainer: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  feedbackCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.inputPadding,
    borderRadius: Spacing.inputBorderRadius,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackTypeLabel: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.inputBorderRadius,
    borderWidth: 1,
  },
});
