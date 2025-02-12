import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { AntDesign } from "@expo/vector-icons";
import React, { FC } from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from "react-native-unistyles";
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
  return (
    <View style={styles.amountContainer}>
      <CustomText
        variant="h5"
        fontFamily={Fonts.Medium}
        style={styles.cardTitle}
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
            style={styles.headerText}
            variant="h5"
          >
            {currency?.code || "Select"}
          </CustomText>
          <AntDesign
            name="down"
            size={HEADER_ICON_SIZE}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      </View>
    </View>
  );
};

export default CurrencySelector;

const styles = StyleSheet.create((theme) => ({
  input: {
    flex: 1,
    fontSize: RFValue(17),
    color: theme.Colors.typography,
    backgroundColor: theme.Colors.gray[300],
    padding: 10,
    marginLeft: 15,
    borderRadius: theme.border.xs,
  },
  amountContainer: {},
  flagIcon: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(25),
    overflow: "hidden",
    marginRight: 10,
  },
  headerCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerText: {
    color: theme.Colors.primary,
  },
  headerCurrencyContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: theme.Colors.gray[400],
  },
}));
