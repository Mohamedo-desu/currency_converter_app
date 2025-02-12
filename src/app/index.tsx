import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from "react-native-unistyles";

import BreakerText from "@/components/BreakerText";
import CurrenciesModal from "@/components/CurrenciesModal";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { getStoredValues, saveSecurely } from "@/store/storage";
import { ThemeContext } from "@/theme/CustomThemeProvider";

const HEADER_ICON_SIZE = RFValue(12);
const API_URL = `https://v6.exchangerate-api.com/v6/${process.env.EXPO_PUBLIC_RATES_API_URL}/latest/`;

interface Currency {
  code: string;
  name: string;
  flag: string;
}

/**
 * Formats a number to include thousand separators and two decimal places.
 * Example: 2500 becomes "2,500.00"
 */
const formatNumber = (num: number): string =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CurrencyConverterScreen = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  // State management
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<string>("");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSelectingFrom, setIsSelectingFrom] = useState<boolean>(true);

  // Combined storage loading for initial values
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedData = getStoredValues([
          "currencies",
          "exchangeRates",
          "lastFromCurrency",
          "lastToCurrency",
        ]);
        if (storedData.currencies) {
          const parsedCurrencies: Currency[] = JSON.parse(
            storedData.currencies
          );
          setCurrencies(parsedCurrencies);
          setFromCurrency(
            parsedCurrencies.find(
              (c) => c.code === storedData.lastFromCurrency
            ) ||
              parsedCurrencies[0] ||
              null
          );
          setToCurrency(
            parsedCurrencies.find(
              (c) => c.code === storedData.lastToCurrency
            ) ||
              parsedCurrencies[1] ||
              null
          );
        }
        if (storedData.exchangeRates) {
          setExchangeRates(JSON.parse(storedData.exchangeRates));
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      }
    };

    loadStoredData();
    fetchCurrencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch exchange rates when fromCurrency changes
  useEffect(() => {
    if (fromCurrency) {
      fetchExchangeRates();
    }
  }, [fromCurrency, fetchExchangeRates]);

  // Fetch available currencies and set defaults using stored values if available
  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}USD`);
      const data = await response.json();

      if (data.result === "success") {
        const availableCurrencies: Currency[] = Object.keys(
          data.conversion_rates
        ).map((code) => ({
          code,
          name: code,
          flag: code.slice(0, 2),
        }));

        setCurrencies(availableCurrencies);

        const storedData = getStoredValues([
          "lastFromCurrency",
          "lastToCurrency",
        ]);
        setFromCurrency(
          availableCurrencies.find(
            (c) => c.code === storedData.lastFromCurrency
          ) ||
            availableCurrencies.find((c) => c.code === "USD") ||
            null
        );
        setToCurrency(
          availableCurrencies.find(
            (c) => c.code === storedData.lastToCurrency
          ) ||
            availableCurrencies.find((c) => c.code === "KES") ||
            null
        );

        // Cache currencies in storage
        saveSecurely([
          { key: "currencies", value: JSON.stringify(availableCurrencies) },
        ]);
      } else {
        Alert.alert("Error", "Failed to fetch available currencies.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your internet connection.");
    }
  }, []);

  // Fetch exchange rates for the selected fromCurrency
  const fetchExchangeRates = useCallback(async () => {
    if (!fromCurrency) return;
    try {
      const response = await fetch(`${API_URL}${fromCurrency.code}`);
      const data = await response.json();

      if (data.result === "success") {
        setExchangeRates(data.conversion_rates);
        saveSecurely([
          {
            key: "exchangeRates",
            value: JSON.stringify(data.conversion_rates),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to fetch exchange rates.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your internet connection.");
    }
  }, [fromCurrency]);

  // Handle currency selection from modal
  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (isSelectingFrom) {
        setFromCurrency(currency);
        saveSecurely([{ key: "lastFromCurrency", value: currency.code }]);
      } else {
        setToCurrency(currency);
        saveSecurely([{ key: "lastToCurrency", value: currency.code }]);
      }
      setIsModalVisible(false);
    },
    [isSelectingFrom]
  );

  // Convert the entered amount and format the result with commas
  const handleConvert = useCallback(() => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }
    if (!toCurrency) {
      Alert.alert("Currency Error", "Please select a target currency.");
      return;
    }
    const rate = exchangeRates[toCurrency.code] || 1;
    const rawConverted = Number(amount) * rate;
    const formattedConverted = formatNumber(rawConverted);
    setConvertedAmount(formattedConverted);
  }, [amount, exchangeRates, toCurrency]);

  // Toggle the theme between dark and light
  const handleThemeToggle = useCallback(() => {
    setTheme((prevTheme: string) => (prevTheme === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // Swap the "from" and "to" currencies and clear the conversion
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount("");
  }, [fromCurrency, toCurrency]);

  // Memoize the converted amount display string
  const convertedDisplay = useMemo(
    () => (convertedAmount ? `${convertedAmount} ${toCurrency?.code}` : ""),
    [convertedAmount, toCurrency]
  );

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
          Convert between any currencies
        </CustomText>
      </View>

      <View style={styles.card}>
        {/* From Currency Selection */}
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
              onPress={() => {
                setIsSelectingFrom(true);
                setIsModalVisible(true);
              }}
              style={styles.headerCurrency}
            >
              {fromCurrency && (
                <CountryFlag
                  isoCode={fromCurrency.flag}
                  size={HEADER_ICON_SIZE}
                  style={styles.flagIcon}
                />
              )}
              <CustomText
                fontFamily={Fonts.Medium}
                style={styles.headerText}
                variant="h5"
              >
                {fromCurrency?.code || "Select"}
              </CustomText>
              <AntDesign
                name="down"
                size={HEADER_ICON_SIZE}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Swap Button */}
        <BreakerText onPress={swapCurrencies} />

        {/* To Currency Selection */}
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
              onPress={() => {
                setIsSelectingFrom(false);
                setIsModalVisible(true);
              }}
              style={styles.headerCurrency}
            >
              {toCurrency && (
                <CountryFlag
                  isoCode={toCurrency.flag}
                  size={HEADER_ICON_SIZE}
                  style={styles.flagIcon}
                />
              )}
              <CustomText
                fontFamily={Fonts.Medium}
                style={styles.headerText}
                variant="h5"
              >
                {toCurrency?.code || "Select"}
              </CustomText>
              <AntDesign
                name="down"
                size={HEADER_ICON_SIZE}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={convertedDisplay}
              editable={false}
            />
          </View>
        </View>
      </View>

      {/* Convert Button */}
      <TouchableOpacity style={styles.button} onPress={handleConvert}>
        <CustomText
          variant="h5"
          fontFamily={Fonts.Medium}
          style={{ color: Colors.white }}
        >
          Convert
        </CustomText>
      </TouchableOpacity>

      {/* Currency Selection Modal */}
      <CurrenciesModal
        visible={isModalVisible}
        currencies={currencies}
        onClose={() => setIsModalVisible(false)}
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
    paddingVertical: moderateScale(15),
    padding: 15,
    borderRadius: theme.border.md,
    marginTop: 30,
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
  convertedAmountContainer: {},
  button: {
    backgroundColor: theme.Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: theme.border.md,
    marginTop: 30,
  },
}));
