import { Fonts } from "@/constants/Fonts";
import { useTheme } from "@react-navigation/native";
import React, { FC, ReactNode } from "react";
import { Platform, Text, TextStyle } from "react-native";

type Variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7";
type PlatformType = "android" | "ios" | "web";

interface CustomTextProps {
  variant?: Variant;
  fontFamily?: Fonts;
  fontSize?: number;
  children?: ReactNode;
  numberOfLines?: number;
  style?: TextStyle | TextStyle[];
  onLayout?: (event: any) => void;
}

const fontSizeMap: Record<Variant, Record<PlatformType, number>> = {
  h1: {
    android: 24,
    ios: 22,
    web: 28,
  },
  h2: {
    android: 22,
    ios: 20,
    web: 24,
  },
  h3: {
    android: 20,
    ios: 18,
    web: 20,
  },
  h4: {
    android: 18,
    ios: 16,
    web: 18,
  },
  h5: {
    android: 16,
    ios: 14,
    web: 16,
  },
  h6: {
    android: 12,
    ios: 10,
    web: 14,
  },
  h7: {
    android: 10,
    ios: 9,
    web: 12,
  },
};

const CustomText: FC<CustomTextProps> = ({
  variant,
  fontFamily = Fonts.Regular,
  fontSize,
  style,
  children,
  numberOfLines,
  onLayout,
  ...props
}) => {
  const { colors } = useTheme();
  const platform = Platform.OS as PlatformType;

  let computedFontSize: number = fontSize || 12;

  if (variant && fontSizeMap[variant]) {
    const defaultSize = fontSizeMap[variant][platform];
    computedFontSize = fontSize || defaultSize;
  }

  const fontFamilyStyle: TextStyle = {
    fontFamily,
    ...(Platform.OS === "web" && {
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }),
  };

  return (
    <Text
      onLayout={onLayout}
      style={[
        {
          fontSize: computedFontSize,
          color: colors.text,
        },
        fontFamilyStyle,
        style,
      ]}
      numberOfLines={numberOfLines !== undefined ? numberOfLines : undefined}
      adjustsFontSizeToFit={true}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;
