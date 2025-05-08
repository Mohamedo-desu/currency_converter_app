import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
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

// Import reusable service functions
import {
  Currency,
  fetchCurrencies,
  fetchGlobalExchangeRates,
  registerBackgroundTask,
} from "@/services/currencyService";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/**
 * Formats a number to a string with 2 decimal places
 * @param num - The number to format
 * @returns Formatted string with 2 decimal places
 */
const formatNumber = (num: number): string =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const AnimatedView = Animated.createAnimatedComponent(View);

// Debounce delay for conversion calculations (ms)
const DEBOUNCE_DELAY = 500;

const CurrencyConverterScreen = () => {
  const { colors } = useTheme();
  const { setTheme } = useContext(ThemeContext);
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  // State management for currencies and conversion
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
  const conversionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  /**
   * Loads previously stored currency preferences and exchange rates
   */
  useEffect(() => {
    try {
      const storedData = getStoredValues([
        "currencies",
        "exchangeRates",
        "lastFromCurrency",
        "lastToCurrency",
        "lastAmount",
      ]);

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

      if (storedData.exchangeRates) {
        setExchangeRates(JSON.parse(storedData.exchangeRates));
      }

      if (storedData.lastAmount) {
        setAmount(storedData.lastAmount);
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  }, []);

  /**
   * Fetches latest currency data and exchange rates on mount
   */
  useEffect(() => {
    (async () => {
      const fetchedCurrencies = await fetchCurrencies();
      if (fetchedCurrencies) {
        setCurrencies(fetchedCurrencies);
      }
      const rates = await fetchGlobalExchangeRates();
      if (rates) {
        setExchangeRates(rates);
      }
    })();
  }, []);

  // Register background task for data updates
  useEffect(() => {
    registerBackgroundTask();
  }, []);

  /**
   * Performs currency conversion with debouncing
   * Updates conversion history and stored values
   */
  const handleConvert = useCallback(() => {
    if (!amount || isNaN(Number(amount.replace(/,/g, "")))) {
      setConvertedAmount("");
      return;
    }
    if (!fromCurrency || !toCurrency) {
      setConvertedAmount("");
      return;
    }
    const fromRate = exchangeRates[fromCurrency.code];
    const toRate = exchangeRates[toCurrency.code];
    if (!fromRate || !toRate) {
      setConvertedAmount("");
      return;
    }

    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    conversionTimeoutRef.current = setTimeout(() => {
      const numericAmount = Number(amount.replace(/,/g, ""));
      const conversionRate = toRate / fromRate;
      const rawConverted = numericAmount * conversionRate;
      const formattedConverted = formatNumber(rawConverted);
      setConvertedAmount(formattedConverted);

      // Update conversion history
      const storedHistory = getStoredValues(["conversionHistory"]);
      const history = storedHistory.conversionHistory
        ? JSON.parse(storedHistory.conversionHistory)
        : [];

      const newHistoryItem = {
        fromCurrency: fromCurrency.code,
        toCurrency: toCurrency.code,
        fromFlag: fromCurrency.flag,
        toFlag: toCurrency.flag,
        amount: amount,
        convertedAmount: formattedConverted,
        timestamp: Date.now(),
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 50);

      saveSecurely([
        { key: "lastAmount", value: amount },
        { key: "lastConvertedAmount", value: formattedConverted },
        { key: "conversionHistory", value: JSON.stringify(updatedHistory) },
      ]);
    }, DEBOUNCE_DELAY);
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (conversionTimeoutRef.current) {
        clearTimeout(conversionTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Triggers conversion when dependencies change
   */
  useEffect(() => {
    if (
      amount &&
      fromCurrency &&
      toCurrency &&
      Object.keys(exchangeRates).length > 0
    ) {
      handleConvert();
    } else {
      setConvertedAmount("");
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, handleConvert]);

  /**
   * Handles currency selection from modal
   * @param currency - Selected currency object
   */
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

  /**
   * Swaps source and target currencies
   */
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
  }, [fromCurrency, toCurrency]);

  /**
   * Memoized display string for converted amount
   */
  const convertedDisplay = useMemo(
    () => (convertedAmount ? `${convertedAmount} ${toCurrency?.code}` : ""),
    [convertedAmount, toCurrency]
  );

  /**
   * Memoized display string for current exchange rate
   */
  const exchangeRateDisplay = useMemo(() => {
    if (fromCurrency && toCurrency) {
      const fromRate = exchangeRates[fromCurrency.code];
      const toRate = exchangeRates[toCurrency.code];
      if (fromRate && toRate) {
        const conversionRate = toRate / fromRate;
        return `1 ${fromCurrency.code} = ${conversionRate.toFixed(2)} ${
          toCurrency.code
        }`;
      }
    }
    return "";
  }, [fromCurrency, toCurrency, exchangeRates]);

  const handleAmountChange = useCallback((input: string) => {
    // Remove all non-numeric and non-decimal characters
    const sanitized = input.replace(/[^\d.]/g, "");
    // Only allow one decimal point
    const parts = sanitized.split(".");
    let value = parts[0];
    if (parts.length > 1) {
      value += "." + parts[1].slice(0, 2); // Limit to 2 decimal places
    }
    // Format if not empty and not just a decimal point
    if (value && value !== ".") {
      const num = Number(value);
      if (!isNaN(num)) {
        setAmount(formatNumber(num));
        return;
      }
    }
    setAmount(value);
  }, []);

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: top + 10, paddingBottom: bottom + 10 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Theme toggle and settings header */}
      <AnimatedView
        entering={FadeInDown.delay(150).springify()}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            setTheme((prev: string) => (prev === "dark" ? "light" : "dark"))
          }
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="color-palette-outline"
            size={RFValue(22)}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="settings-outline"
            size={RFValue(20)}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </AnimatedView>

      {/* App title and description */}
      <AnimatedView
        entering={FadeInDown.delay(300).springify()}
        style={styles.textContainer}
      >
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
      </AnimatedView>

      {/* Currency conversion card */}
      <AnimatedView
        entering={FadeInDown.delay(450).springify()}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <CurrencySelector
          label="Amount"
          onPress={() => {
            setIsSelectingFrom(true);
            setIsModalVisible(true);
          }}
          placeholder="Enter Amount"
          currency={fromCurrency}
          value={amount}
          onChangeText={handleAmountChange}
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
      </AnimatedView>

      {/* Exchange rate display */}
      <AnimatedView
        entering={FadeInDown.delay(600).springify()}
        style={styles.exchangeRateContainer}
      >
        <CustomText variant="h6" style={{ color: colors.gray[400] }}>
          Indicative Exchange Rate
        </CustomText>
        {exchangeRateDisplay && (
          <CustomText variant="h5" fontFamily={Fonts.Medium}>
            {exchangeRateDisplay}
          </CustomText>
        )}
      </AnimatedView>

      <PrivacyTerms />

      {/* Currency selection modal */}
      <CurrenciesModal
        visible={isModalVisible}
        currencies={currencies}
        onClose={() => setIsModalVisible(false)}
        onCurrenciesSelect={handleCurrencySelect}
      />
    </KeyboardAwareScrollView>
  );
};

export default CurrencyConverterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  card: {
    paddingVertical: moderateScale(15),
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
  },
  exchangeRateContainer: {
    marginTop: 30,
    gap: 10,
  },
});
