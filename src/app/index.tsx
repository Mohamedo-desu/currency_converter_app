import CurrenciesModal from "@/components/CurrenciesModal";
import CurrencySelector from "@/components/CurrencySelector";
import CustomText from "@/components/CustomText";
import PrivacyTerms from "@/components/PrivacyTerms";
import SwapButton from "@/components/SwapButton";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { getStoredValues, saveSecurely } from "@/store/storage";
import { ThemeContext } from "@/theme/CustomThemeProvider";
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

// Base URL for fetching exchange rates; uses environment variable for API key
const API_URL = `https://v6.exchangerate-api.com/v6/${process.env.EXPO_PUBLIC_RATES_API_URL}/latest/`;

// Define a type for Currency objects
interface Currency {
  code: string;
  name: string;
  flag: string;
}

// Helper function to format numbers with commas and fixed two decimal places
const formatNumber = (num: number): string =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CurrencyConverterScreen = () => {
  const { colors } = useTheme(); // Get theme colors from navigation theme
  const { setTheme } = useContext(ThemeContext); // Get theme setter from custom theme provider

  // State management for currencies, amounts, exchange rates, and modal visibility
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState<string>(""); // User-entered amount
  const [convertedAmount, setConvertedAmount] = useState<string>(""); // Result after conversion
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Controls currency modal visibility
  const [isSelectingFrom, setIsSelectingFrom] = useState<boolean>(true); // Flag to know if we're selecting "from" or "to" currency

  // Load stored data on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Retrieve stored values from secure storage
        const storedData = getStoredValues([
          "currencies",
          "exchangeRates",
          "lastFromCurrency",
          "lastToCurrency",
          "lastAmount",
        ]);

        // If currencies are stored, parse and set them
        if (storedData.currencies) {
          const parsedCurrencies: Currency[] = JSON.parse(
            storedData.currencies
          );
          setCurrencies(parsedCurrencies);

          // Set the "from" currency based on stored value, fallback to first currency if not found
          setFromCurrency(
            parsedCurrencies.find(
              (c) => c.code === storedData.lastFromCurrency
            ) ||
              parsedCurrencies[0] ||
              null
          );

          // Set the "to" currency based on stored value, fallback to second currency if not found
          setToCurrency(
            parsedCurrencies.find(
              (c) => c.code === storedData.lastToCurrency
            ) || null
          );
        }

        // Set stored exchange rates if available
        if (storedData.exchangeRates) {
          setExchangeRates(JSON.parse(storedData.exchangeRates));
        }

        // Set the last entered amount if available
        if (storedData.lastAmount) {
          setAmount(storedData.lastAmount);
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      }
    };

    // Load stored data and then fetch the latest currencies
    loadStoredData();
    fetchCurrencies();
  }, []);

  // Fetch the list of available currencies from the API
  const fetchCurrencies = useCallback(async () => {
    try {
      // Fetch exchange rates using a default base currency (USD)
      const response = await fetch(`${API_URL}USD`);
      const data = await response.json();

      if (data.result === "success") {
        // Map fetched conversion_rates into an array of Currency objects
        const availableCurrencies: Currency[] = Object.keys(
          data.conversion_rates
        ).map((code) => ({
          code,
          name: code, // You can customize this to a more descriptive name if needed
          flag: code.slice(0, 2), // Simple flag representation
        }));

        // Update the currencies state
        setCurrencies(availableCurrencies);

        // Retrieve stored "from" and "to" currency codes
        const storedData = getStoredValues([
          "lastFromCurrency",
          "lastToCurrency",
        ]);

        // Set "from" currency; fallback to USD if stored value not found
        setFromCurrency(
          availableCurrencies.find(
            (c) => c.code === storedData.lastFromCurrency
          ) ||
            availableCurrencies.find((c) => c.code === "USD") ||
            null
        );

        // Set "to" currency; fallback to KES if stored value not found
        setToCurrency(
          availableCurrencies.find(
            (c) => c.code === storedData.lastToCurrency
          ) ||
            availableCurrencies.find((c) => c.code === "KES") ||
            null
        );

        // Cache the currencies list in secure storage
        saveSecurely([
          { key: "currencies", value: JSON.stringify(availableCurrencies) },
        ]);
      } else {
        Alert.alert("Error", "Failed to fetch available currencies.");
      }
    } catch (error) {
      //Alert.alert("Network Error", "Check your internet connection.");
    }
  }, []);

  // Fetch the latest exchange rates for the selected "from" currency
  const fetchExchangeRates = useCallback(async () => {
    if (!fromCurrency) return;
    try {
      const response = await fetch(`${API_URL}${fromCurrency.code}`);
      const data = await response.json();

      if (data.result === "success") {
        // Update exchange rates state and save to secure storage
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
      //Alert.alert("Network Error", "Check your internet connection.");
    }
  }, [fromCurrency]);

  // Trigger fetching of exchange rates when the "from" currency changes
  useEffect(() => {
    if (fromCurrency) {
      fetchExchangeRates();
    }
  }, [fromCurrency, fetchExchangeRates]);

  // Handle currency selection from the modal
  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (isSelectingFrom) {
        // Update "from" currency and save it to storage
        setFromCurrency(currency);
        saveSecurely([{ key: "lastFromCurrency", value: currency.code }]);
      } else {
        // Update "to" currency and save it to storage
        setToCurrency(currency);
        saveSecurely([{ key: "lastToCurrency", value: currency.code }]);
      }
      // Close the modal after selection
      setIsModalVisible(false);
    },
    [isSelectingFrom]
  );

  // Convert the entered amount using the fetched exchange rates
  const handleConvert = useCallback(() => {
    // Validate user input
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }
    if (!toCurrency) {
      Alert.alert("Currency Error", "Please select a target currency.");
      return;
    }
    // Calculate conversion using the appropriate exchange rate
    const rate = exchangeRates[toCurrency.code] || 1;
    const rawConverted = Number(amount) * rate;
    const formattedConverted = formatNumber(rawConverted);
    setConvertedAmount(formattedConverted);

    // Save the latest entered amount and converted result in secure storage
    saveSecurely([
      { key: "lastAmount", value: amount },
      { key: "lastConvertedAmount", value: formattedConverted },
    ]);
  }, [amount, exchangeRates, toCurrency]);

  // Automatically re-calculate conversion when the amount, target currency, or exchange rates update
  useEffect(() => {
    if (amount && toCurrency && Object.keys(exchangeRates).length > 0) {
      handleConvert();
    }
  }, [amount, toCurrency, exchangeRates, handleConvert]);

  // Toggle the theme between dark and light modes
  const handleThemeToggle = useCallback(() => {
    setTheme((prevTheme: string) => (prevTheme === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // Swap the "from" and "to" currencies and clear the converted amount
  const swapCurrencies = useCallback(() => {
    if (!fromCurrency || !toCurrency) return;
    const newFrom = toCurrency;
    const newTo = fromCurrency;
    setFromCurrency(newFrom);
    setToCurrency(newTo);

    // Persist the swapped currencies to storage
    saveSecurely([
      { key: "lastFromCurrency", value: newFrom.code },
      { key: "lastToCurrency", value: newTo.code },
    ]);

    // Clear the converted amount as the conversion direction has changed
    setConvertedAmount("");
  }, [fromCurrency, toCurrency]);

  // Memoize the display string for the converted amount
  const convertedDisplay = useMemo(
    () => (convertedAmount ? `${convertedAmount} ${toCurrency?.code}` : ""),
    [convertedAmount, toCurrency]
  );

  // Memoize the indicative exchange rate display string
  const exchangeRateDisplay = useMemo(() => {
    if (fromCurrency && toCurrency) {
      const rate = exchangeRates[toCurrency.code] || 1;
      return `1 ${fromCurrency.code} = ${rate} ${toCurrency.code}`;
    }
    return "";
  }, [fromCurrency, toCurrency, exchangeRates]);

  // Get safe area insets for proper layout
  const { top } = useSafeAreaInsets();

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
      {/* Header with theme toggle button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleThemeToggle}
          activeOpacity={0.8}
          hitSlop={20}
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

      {/* Card container for currency selectors */}
      <View style={[styles.card, { backgroundColor: colors.gray[200] }]}>
        {/* "From" currency selector with user input for the amount */}
        <CurrencySelector
          label={"Amount"}
          onPress={() => {
            setIsSelectingFrom(true);
            setIsModalVisible(true);
          }}
          placeholder="Enter Amount"
          currency={fromCurrency}
          value={amount}
          onChangeText={setAmount}
        />

        {/* Button to swap currencies */}
        <SwapButton onPress={swapCurrencies} />

        {/* "To" currency selector showing the converted amount (read-only) */}
        <CurrencySelector
          label={"Converted Amount"}
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

      {/* Button to manually trigger conversion */}
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

      {/* Display of the indicative exchange rate */}
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

      {/* Privacy and terms section */}
      <PrivacyTerms />

      {/* Modal for selecting a currency */}
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

// Stylesheet for component styling
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
