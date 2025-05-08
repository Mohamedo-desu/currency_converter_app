import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { FC } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";

import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";

const HEADER_ICON_SIZE = RFValue(12);

interface Currency {
  code: string;
  flag: string;
}

interface CurrencySelectorProps
  extends Pick<
    TextInputProps,
    "value" | "onChangeText" | "editable" | "placeholder"
  > {
  label: string;
  currency: Currency | null;
  onPress: () => void;
}

const CurrencySelector: FC<CurrencySelectorProps> = ({
  editable = true,
  label,
  value,
  onChangeText,
  currency,
  onPress,
  placeholder,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.amountContainer}>
      <CustomText
        fontFamily={Fonts.Medium}
        style={[styles.label, { color: colors.gray[400] }]}
      >
        {label}
      </CustomText>
      <View style={styles.headerCurrencyContainer}>
        <TouchableOpacity
          onPress={onPress}
          style={styles.headerCurrency}
          activeOpacity={0.8}
        >
          {currency?.flag && (
            <CountryFlag
              isoCode={currency.flag}
              size={HEADER_ICON_SIZE}
              style={styles.flagIcon}
            />
          )}
          <CustomText
            fontFamily={Fonts.Medium}
            style={{ color: colors.primary }}
            variant="h6"
          >
            {currency?.code || "Select"}
          </CustomText>
          <AntDesign
            name="down"
            size={HEADER_ICON_SIZE}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.gray[200] },
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.gray[300]}
            keyboardType="numeric"
            cursorColor={colors.primary}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            maxLength={20}
          />
          {editable && value && (
            <TouchableOpacity
              onPress={() => onChangeText?.("")}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={RFValue(20)}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CurrencySelector;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: RFValue(16),
    padding: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: RFValue(13),
  },
  amountContainer: {},
  flagIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(25),
    overflow: "hidden",
    marginRight: 10,
  },
  headerCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerCurrencyContainer: {
    marginTop: 15,
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    position: "absolute",
    right: 10,
  },
});
