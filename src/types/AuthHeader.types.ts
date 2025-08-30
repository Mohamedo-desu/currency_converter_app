import { Ionicons } from "@expo/vector-icons";

// These types are now unused as we're using Expo Router navigation
// but keeping them for potential future use

export type Screen = "Converter" | "Settings" | "History" | "Help";
export type Navigate = (screen: Screen) => void;

export interface AuthHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  Navigate: Navigate;
}

export interface IconProps {
  onPress: () => void;
  color?: string;
}
export interface IconWithNameProps {
  onPress: () => void;
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
}
