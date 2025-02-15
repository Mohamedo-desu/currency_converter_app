import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { AntDesign } from "@expo/vector-icons";
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
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.gray[300] },
          ]}
          placeholder={placeholder}
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline
          maxLength={30}
        />
      </View>
    </View>
  );
};

export default CurrencySelector;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: RFValue(17),
    padding: 10,
    marginLeft: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: RFValue(14),
  },
  amountContainer: {},
  flagIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
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
    flexDirection: "row",
    alignItems: "center",
  },
});
