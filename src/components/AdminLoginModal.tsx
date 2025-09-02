import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomText from "./CustomText";

const AdminLoginModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      console.log({ email, password, response });

      const data = await response.json();
      console.log({ data });

      if (data.success) {
        // You can add logic here to close modal or set admin state
        onClose();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.modalContent, { backgroundColor: colors.primary }]}
            >
              <View style={styles.header}>
                <CustomText
                  variant="h4"
                  fontWeight="bold"
                  style={{ color: colors.text }}
                >
                  Admin Mode
                </CustomText>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Ionicons
                    name="close"
                    size={Spacing.iconSize}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.searchContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholderTextColor={colors.gray[400]}
                />
              </View>
              <View
                style={[
                  styles.searchContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholderTextColor={colors.gray[400]}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: colors.card,
                    justifyContent: "center",
                  },
                ]}
                activeOpacity={1}
                onPress={handleLogin}
                disabled={loading}
              >
                <CustomText style={{ color: colors.text }}>
                  {loading ? "Logging in..." : "Login"}
                </CustomText>
              </TouchableOpacity>
              {error ? (
                <CustomText style={{ color: "red", marginTop: 8 }}>
                  {error}
                </CustomText>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AdminLoginModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" && {
      maxWidth: 500,
      marginHorizontal: "auto",
      width: "100%",
    }),
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: Spacing.inputBorderRadius,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.body,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    backgroundColor: "transparent",
    paddingHorizontal: Spacing.inputPadding,
    height: Spacing.inputHeight,
    borderRadius: Spacing.inputBorderRadius,
    gap: Spacing.gap.xs,
  },
});
