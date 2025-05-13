import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import React, { FC, ReactNode } from "react";
import { Text, TextStyle } from "react-native";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "h7"
  | "body"
  | "small"
  | "tiny";

type FontWeight = keyof typeof Typography.fontWeight;

interface CustomTextProps {
  variant?: Variant;
  fontWeight?: FontWeight;
  fontSize?: number;
  children?: ReactNode;
  numberOfLines?: number;
  style?: TextStyle | TextStyle[];
  onLayout?: (event: any) => void;
}

const CustomText: FC<CustomTextProps> = ({
  variant = "body",
  fontWeight = "regular",
  fontSize,
  style,
  children,
  numberOfLines,
  onLayout,
  ...props
}) => {
  const { colors } = useTheme();

  const computedFontSize = fontSize || Typography.fontSize[variant];
  const computedLineHeight = Typography.lineHeight[variant];
  const computedFontWeight = Typography.fontWeight[fontWeight];

  return (
    <Text
      onLayout={onLayout}
      style={[
        {
          fontSize: computedFontSize,
          lineHeight: computedLineHeight,
          color: colors.text,
          fontWeight: computedFontWeight,
        },
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
