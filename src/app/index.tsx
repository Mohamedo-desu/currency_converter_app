import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

import CurrenciesModal from "@/components/CurrenciesModal";
import CurrencySelector from "@/components/CurrencySelector";
import CustomText from "@/components/CustomText";
import PrivacyTerms from "@/components/PrivacyTerms";
import SwapButton from "@/components/SwapButton";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { getStoredValues, saveSecurely } from "@/store/storage";
import { ThemeContext } from "@/theme/CustomThemeProvider";

// Define a type for currency objects
interface Currency {
  code: string;
  name: string;
  flag: string;
}

// API Endpoints
const API_KEY = process.env.EXPO_PUBLIC_RATES_API_URL;
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;
const CODES_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;

// Helper function to format numbers
const formatNumber = (num: number): string =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// One day in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;

const CurrencyConverterScreen = () => {
  const { colors } = useTheme();
  const { setTheme } = useContext(ThemeContext);
  const { top } = useSafeAreaInsets();

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

  // Load stored data on mount
  useEffect(() => {
    try {
      const storedData = getStoredValues([
        "currencies",
        "exchangeRates",
        "lastCurrenciesFetch",
        "lastFromCurrency",
        "lastToCurrency",
        "lastAmount",
      ]);

      // Load stored currencies if available
      if (storedData.currencies) {
        const parsedCurrencies: Currency[] = JSON.parse(storedData.currencies);
        setCurrencies(parsedCurrencies);
        setFromCurrency(
          parsedCurrencies.find(
            (c) => c.code === storedData.lastFromCurrency
          ) ||
            parsedCurrencies.find((c) => c.code === "USD") ||
            null
        );
        setToCurrency(
          parsedCurrencies.find((c) => c.code === storedData.lastToCurrency) ||
            parsedCurrencies.find((c) => c.code === "KES") ||
            null
        );
      }

      // Load stored exchange rates
      if (storedData.exchangeRates) {
        setExchangeRates(JSON.parse(storedData.exchangeRates));
      }

      // Load last entered amount
      if (storedData.lastAmount) {
        setAmount(storedData.lastAmount);
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  }, []);
  // Fetch all available currencies from the codes endpoint
  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await fetch(CODES_API_URL);
      const data = await response.json();

      if (data.result === "success") {
        // Map supported_codes into Currency objects
        const availableCurrencies: Currency[] = data.supported_codes.map(
          ([code, name]: [string, string]) => ({
            code,
            name,
            flag: code.slice(0, 2), // Adjust if you wish to use actual flag images
          })
        );

        setCurrencies(availableCurrencies);

        // Retrieve stored selections for from/to currencies
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

        // Cache currencies for offline use
        saveSecurely([
          { key: "currencies", value: JSON.stringify(availableCurrencies) },
        ]);
      } else {
        Alert.alert("Error", "Failed to fetch available currencies.");
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  }, []);

  // Check if it's time to refresh currencies (once per day)
  useEffect(() => {
    const now = Date.now();
    const storedData = getStoredValues(["lastCurrenciesFetch"]);
    if (
      !storedData.lastCurrenciesFetch ||
      now - parseInt(storedData.lastCurrenciesFetch, 10) > ONE_DAY
    ) {
      fetchCurrencies();
      saveSecurely([{ key: "lastCurrenciesFetch", value: now.toString() }]);
    }
  }, [fetchCurrencies]);

  // Fetch exchange rates for the selected "from" currency
  const fetchExchangeRates = useCallback(async () => {
    if (!fromCurrency) return;
    try {
      const response = await fetch(`${EXCHANGE_API_URL}${fromCurrency.code}`);
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
      console.error("Error fetching exchange rates:", error);
    }
  }, [fromCurrency]);

  // Check if it's time to refresh exchange rates (once per day) whenever fromCurrency changes
  useEffect(() => {
    if (fromCurrency) {
      const now = Date.now();
      const storedData = getStoredValues(["lastExchangeRatesFetch"]);
      if (
        !storedData.lastExchangeRatesFetch ||
        now - parseInt(storedData.lastExchangeRatesFetch, 10) > ONE_DAY
      ) {
        fetchExchangeRates();
        saveSecurely([
          { key: "lastExchangeRatesFetch", value: now.toString() },
        ]);
      }
    }
  }, [fromCurrency, fetchExchangeRates]);

  // Handle currency selection from the modal
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

  // Convert the amount using current exchange rates
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
    saveSecurely([
      { key: "lastAmount", value: amount },
      { key: "lastConvertedAmount", value: formattedConverted },
    ]);
  }, [amount, exchangeRates, toCurrency]);

  // Auto convert when dependencies update
  useEffect(() => {
    if (amount && toCurrency && Object.keys(exchangeRates).length > 0) {
      handleConvert();
    }
  }, [amount, toCurrency, exchangeRates, handleConvert]);

  // Toggle theme mode
  const handleThemeToggle = useCallback(() => {
    setTheme((prev: string) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // Swap "from" and "to" currencies
  const swapCurrencies = useCallback(() => {
    if (!fromCurrency || !toCurrency) return;
    const newFrom = toCurrency;
    const newTo = fromCurrency;
    setFromCurrency(newFrom);
    setToCurrency(newTo);
    saveSecurely([
      { key: "lastFromCurrency", value: newFrom.code },
      { key: "lastToCurrency", value: newTo.code },
    ]);
    setConvertedAmount("");
  }, [fromCurrency, toCurrency]);

  // Memoize display strings
  const convertedDisplay = useMemo(
    () => (convertedAmount ? `${convertedAmount} ${toCurrency?.code}` : ""),
    [convertedAmount, toCurrency]
  );

  const exchangeRateDisplay = useMemo(() => {
    if (fromCurrency && toCurrency) {
      const rate = exchangeRates[toCurrency.code] || 1;
      return `1 ${fromCurrency.code} = ${rate} ${toCurrency.code}`;
    }
    return "";
  }, [fromCurrency, toCurrency, exchangeRates]);

  return (
    <ScrollView
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: top + 10 },
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header with theme toggle */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleThemeToggle}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="color-palette"
            size={RFValue(24)}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Title and subtitle */}
      <View style={styles.textContainer}>
        <CustomText variant="h1" fontFamily={Fonts.Bold}>
          Currency Converter
        </CustomText>
        <CustomText
          variant="h6"
          fontFamily={Fonts.Medium}
          style={{ color: colors.gray[400] }}
        >
          Convert between any currencies
        </CustomText>
      </View>

      {/* Card with currency selectors */}
      <View style={[styles.card, { backgroundColor: colors.gray[200] }]}>
        <CurrencySelector
          label="Amount"
          onPress={() => {
            setIsSelectingFrom(true);
            setIsModalVisible(true);
          }}
          placeholder="Enter Amount"
          currency={fromCurrency}
          value={amount}
          onChangeText={setAmount}
        />

        <SwapButton onPress={swapCurrencies} />

        <CurrencySelector
          label="Converted Amount"
          placeholder="0.00"
          onPress={() => {
            setIsSelectingFrom(false);
            setIsModalVisible(true);
          }}
          currency={toCurrency}
          value={convertedDisplay}
          editable={false}
        />
      </View>

      {/* Convert button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleConvert}
        activeOpacity={0.8}
      >
        <CustomText
          variant="h5"
          fontFamily={Fonts.Medium}
          style={{ color: Colors.white }}
        >
          Convert
        </CustomText>
      </TouchableOpacity>

      {/* Indicative exchange rate */}
      <View style={styles.exchangeRateContainer}>
        <CustomText variant="h6" style={{ color: colors.gray[400] }}>
          Indicative Exchange Rate
        </CustomText>
        {exchangeRateDisplay && (
          <CustomText variant="h5" fontFamily={Fonts.Medium}>
            {exchangeRateDisplay}
          </CustomText>
        )}
      </View>

      <PrivacyTerms />

      {/* Currency selection modal */}
      <CurrenciesModal
        visible={isModalVisible}
        currencies={currencies}
        onClose={() => setIsModalVisible(false)}
        onCurrenciesSelect={handleCurrencySelect}
      />
    </ScrollView>
  );
};

export default CurrencyConverterScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    paddingVertical: moderateScale(15),
    padding: 15,
    borderRadius: 15,
    marginTop: 30,
  },
  exchangeRateContainer: {
    marginTop: 30,
    gap: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 15,
    marginTop: 30,
  },
});
