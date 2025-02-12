import BreakerText from "@/components/BreakerText";
import CurrenciesModal from "@/components/CurrenciesModal";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { ThemeContext } from "@/theme/CustomThemeProvider";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useContext, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from "react-native-unistyles";

const HEADER_ICON_SIZE = RFValue(12);

const CurrencyConverterScreen = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  // Updated list of popular currencies
  const currencies = useMemo(
    () => [
      { code: "USD", name: "United States Dollar", flag: "US" },
      { code: "EUR", name: "Euro", flag: "EU" },
      { code: "GBP", name: "British Pound", flag: "GB" },
      { code: "INR", name: "Indian Rupee", flag: "IN" },
      { code: "AUD", name: "Australian Dollar", flag: "AU" },
      { code: "CAD", name: "Canadian Dollar", flag: "CA" },
      { code: "CHF", name: "Swiss Franc", flag: "CH" },
      { code: "CNY", name: "Chinese Yuan", flag: "CN" },
      { code: "JPY", name: "Japanese Yen", flag: "JP" },
      { code: "BRL", name: "Brazilian Real", flag: "BR" },
      { code: "MXN", name: "Mexican Peso", flag: "MX" },
      { code: "RUB", name: "Russian Ruble", flag: "RU" },
      { code: "ZAR", name: "South African Rand", flag: "ZA" },
      { code: "SGD", name: "Singapore Dollar", flag: "SG" },
    ],
    []
  );

  const [currenciesModalVisible, setCurrenciesModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setCurrenciesModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleThemeToggle}
          activeOpacity={0.8}
          hitSlop={20}
        >
          <Ionicons
            name="color-palette"
            size={RFValue(30)}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.textContainer}>
        <CustomText variant="h1" fontFamily={Fonts.Bold}>
          Currency Converter
        </CustomText>
        <CustomText variant="h5" fontFamily={Fonts.Medium}>
          Easily convert currencies
        </CustomText>
      </View>

      <View style={styles.card}>
        <View style={styles.amountContainer}>
          <CustomText
            variant="h5"
            fontFamily={Fonts.Medium}
            style={styles.cardTitle}
          >
            Amount
          </CustomText>
          <View style={styles.headerCurrencyContainer}>
            <TouchableOpacity
              onPress={() => setCurrenciesModalVisible(true)}
              activeOpacity={0.8}
              style={styles.headerCurrency}
            >
              <CountryFlag
                isoCode={selectedCurrency.flag}
                size={HEADER_ICON_SIZE}
                style={styles.flagIcon}
              />
              <CustomText
                fontFamily={Fonts.Medium}
                style={styles.headerText}
                variant="h5"
              >
                {selectedCurrency.code}
              </CustomText>
              <AntDesign
                name="down"
                size={HEADER_ICON_SIZE}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="$0.00"
              keyboardType="numeric"
              numberOfLines={1}
            />
          </View>
        </View>

        <BreakerText />

        <View style={styles.convertedAmountContainer}>
          <CustomText
            variant="h5"
            fontFamily={Fonts.Medium}
            style={styles.cardTitle}
          >
            Converted Amount
          </CustomText>
          <View style={styles.headerCurrencyContainer}>
            <TouchableOpacity
              onPress={() => setCurrenciesModalVisible(true)}
              activeOpacity={0.8}
              style={styles.headerCurrency}
            >
              <CountryFlag
                isoCode={selectedCurrency.flag}
                size={HEADER_ICON_SIZE}
                style={styles.flagIcon}
              />
              <CustomText
                fontFamily={Fonts.Medium}
                style={styles.headerText}
                variant="h5"
              >
                {selectedCurrency.code}
              </CustomText>
              <AntDesign
                name="down"
                size={HEADER_ICON_SIZE}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="$0.00"
              keyboardType="numeric"
              numberOfLines={1}
              editable={false}
            />
          </View>
        </View>
      </View>

      <CurrenciesModal
        currencies={currencies}
        visible={currenciesModalVisible}
        onClose={() => setCurrenciesModalVisible(false)}
        onCurrenciesSelect={handleCurrencySelect}
      />
    </View>
  );
};

export default CurrencyConverterScreen;

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.Colors.background,
    paddingVertical: rt.insets.top,
    paddingHorizontal: 20,
  },
  header: {
    alignSelf: "flex-end",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: theme.Colors.gray[200],
    paddingVertical: moderateScale(20),
    borderRadius: theme.border.md,
    marginTop: 30,
    padding: 20,
  },
  cardTitle: {
    color: theme.Colors.gray[400],
  },
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
    gap: 10,
  },
  headerText: {
    color: theme.Colors.primary,
  },
  headerCurrencyContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: RFValue(16),
    color: theme.Colors.primary,
    backgroundColor: theme.Colors.gray[300],
    padding: 15,
    marginLeft: 20,
    borderRadius: theme.border.xs,
  },
  amountContainer: {},
  convertedAmountContainer: {},
}));
