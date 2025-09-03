import CurrenciesModal from "@/components/CurrenciesModal";
import CurrencySelector from "@/components/CurrencySelector";
import CustomText from "@/components/CustomText";
import PrivacyTerms from "@/components/PrivacyTerms";
import SwapButton from "@/components/SwapButton";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { useConversionBatching } from "@/hooks/useConversionBatching";
import { useVersion } from "@/hooks/useVersion";
import { getStoredValues, saveSecurely } from "@/store/storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  BackHandler,
  Keyboard,
  Platform,
  Share,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import reusable service functions
import AdminLoginModal from "@/components/AdminLoginModal";
import { Spacing } from "@/constants/Spacing";
import {
  Currency,
  fetchCurrencies,
  fetchGlobalExchangeRates,
  registerBackgroundTask,
} from "@/services/currencyService";
import { styles } from "@/styles/screens/CurrencyConverterScreen.styles";
import { PushTokenManager } from "@/utils/pushTokenManager";
import {
  GestureEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/**
 * Formats a number to a string with 3 decimal places
 * @param num - The number to format
 * @returns Formatted string with 3 decimal places
 */
const formatNumber = (num: number): string =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

// Debounce delay for conversion calculations (ms)
const DEBOUNCE_DELAY = 500;

const CurrencyConverterScreen = () => {
  const { colors, toggleTheme } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { getCachedDownloadUrl, currentVersion } = useVersion();
  const { addConversion } = useConversionBatching();
  const [lastBackPress, setLastBackPress] = useState(0);

  // Get deeplink parameters (only processed once)
  const searchParams = useLocalSearchParams<{
    fromCurrency?: string;
    toCurrency?: string;
    amount?: string;
  }>();

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
  const [secretSequence, setSecretSequence] = useState<string[]>([]);

  const [isAdminModalVisible, setIsAdminModalVisible] =
    useState<boolean>(false);

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
   * Handle deeplink parameters once when currencies are available
   */
  useEffect(() => {
    if (currencies.length === 0) return;

    // Process deeplink parameters only once
    if (searchParams.fromCurrency) {
      const foundCurrency = currencies.find(
        (c) => c.code.toLowerCase() === searchParams.fromCurrency?.toLowerCase()
      );
      if (foundCurrency) {
        setFromCurrency(foundCurrency);
      }
    }

    if (searchParams.toCurrency) {
      const foundCurrency = currencies.find(
        (c) => c.code.toLowerCase() === searchParams.toCurrency?.toLowerCase()
      );
      if (foundCurrency) {
        setToCurrency(foundCurrency);
      }
    }

    if (searchParams.amount) {
      setAmount(searchParams.amount);
    }
  }, [currencies.length]); // Only depend on currencies.length to run once when loaded

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

    conversionTimeoutRef.current = setTimeout(async () => {
      const numericAmount = Number(amount.replace(/,/g, ""));
      const conversionRate = toRate / fromRate;
      const rawConverted = numericAmount * conversionRate;
      const formattedAmount = formatNumber(numericAmount);
      const formattedConverted = formatNumber(rawConverted);
      setConvertedAmount(formattedConverted);

      const { deviceId, deviceInfo } =
        await PushTokenManager.initializeDeviceTracking();

      // Add conversion to batch queue instead of logging
      addConversion({
        deviceId,
        deviceInfo,
        fromCurrency: fromCurrency.code,
        toCurrency: toCurrency.code,
        originalAmount: numericAmount,
        convertedAmount: rawConverted,
        exchangeRate: conversionRate,
        fromRate,
        toRate,
        fromFlag: fromCurrency.flag,
        toFlag: toCurrency.flag,
        formattedAmount,
        formattedConverted,
        timestamp: new Date().toISOString(),
      });

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
        amount: formattedAmount,
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
    () =>
      convertedAmount
        ? `${toCurrency?.symbol || toCurrency?.code} ${convertedAmount}`
        : "",
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
        return `${fromCurrency.symbol || fromCurrency.code} 1 =  ${
          toCurrency.symbol || toCurrency.code
        } ${conversionRate.toFixed(3)}`;
      }
    }
    return "";
  }, [fromCurrency, toCurrency, exchangeRates]);

  const showAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      if (onPress) onPress();
    } else {
      Alert.alert(title, message, [
        {
          text: "OK",
          onPress,
        },
      ]);
    }
  };

  const handleAmountChange = useCallback(
    (input: string) => {
      // Check if currencies are selected
      if (!fromCurrency || !toCurrency) {
        Keyboard.dismiss();
        showAlert(
          "Select Currencies",
          "Please select both source and target currencies before entering an amount.",
          () => {
            // Open currency selection modal
            setIsSelectingFrom(!fromCurrency);
            setIsModalVisible(true);
          }
        );

        return;
      }

      // Remove any non-numeric characters except decimal point
      let sanitizedInput = input.replace(/[^0-9.]/g, "");

      // Prevent multiple decimal points
      const decimalCount = (sanitizedInput.match(/\./g) || []).length;
      if (decimalCount > 1) {
        // Keep only the first decimal point
        const parts = sanitizedInput.split(".");
        sanitizedInput = parts[0] + "." + parts.slice(1).join("");
      }

      // Limit to 3 decimal places
      if (sanitizedInput.includes(".")) {
        const [whole, decimal] = sanitizedInput.split(".");
        if (decimal && decimal.length > 3) {
          sanitizedInput = `${whole}.${decimal.slice(0, 3)}`;
        }
      }

      // Prevent leading zeros unless it's a decimal number
      if (
        sanitizedInput.startsWith("0") &&
        sanitizedInput.length > 1 &&
        !sanitizedInput.startsWith("0.")
      ) {
        sanitizedInput = sanitizedInput.slice(1);
      }

      setAmount(sanitizedInput);
    },
    [fromCurrency, toCurrency]
  );

  const handleShare = async () => {
    // Check if there's a conversion to share
    const hasConversion =
      amount && convertedAmount && fromCurrency && toCurrency;

    const webUrl = "https://convertly.expo.app";
    // Get cached download URL or use fallback
    const downloadUrl = await getCachedDownloadUrl();

    if (hasConversion) {
      // Share conversion
      const exchangeRate =
        exchangeRates[toCurrency.code] / exchangeRates[fromCurrency.code];
      const formattedRate = exchangeRate.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });

      const message = `💱 Currency Conversion\n\n${amount} ${fromCurrency.code} = ${convertedAmount} ${toCurrency.code}\n\nExchange Rate: 1 ${fromCurrency.code} = ${formattedRate} ${toCurrency.code}\n\nCalculated with Currency Converter app\n🌐 Try online: ${webUrl}\n📲 Download: ${downloadUrl}`;

      if (Platform.OS === "web") {
        navigator
          .share({
            title: "Currency Conversion Result",
            text: message,
          })
          .catch(() => {
            // Fallback for browsers that don't support navigator.share
            navigator.clipboard
              .writeText(message)
              .then(() => {
                Alert.alert(
                  "Copied!",
                  "Conversion details copied to clipboard."
                );
              })
              .catch(() => {
                Alert.alert("Share", message);
              });
          });
      } else {
        Share.share({
          message,
          title: "Currency Conversion Result",
          url: webUrl, // Use deep link for mobile sharing
        }).catch((error) => {
          console.error("Error sharing conversion:", error);
        });
      }
    } else {
      // Share app
      const message = `Check out this awesome Currency Converter app! Convert between any currencies with ease.\n🌐 Try online: ${webUrl}\n📲 Download: ${downloadUrl}`;

      if (Platform.OS === "web") {
        navigator.share({
          title: "Currency Converter",
          text: message,
          url: webUrl,
        });
      } else {
        Share.share({
          message,
          title: "Currency Converter",
          url: webUrl, // Use deep link for mobile sharing
        });
      }
    }
  };
  // Add back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const currentTime = new Date().getTime();
        if (currentTime - lastBackPress < 2000) {
          // If pressed within 2 seconds, exit the app
          BackHandler.exitApp();
          return true;
        }
        // Show toast message and update last press time
        if (Platform.OS === "android") {
          ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
        }
        setLastBackPress(currentTime);
        return true; // Prevent default behavior
      }
    );

    // Cleanup listener on unmount
    return () => backHandler.remove();
  }, [lastBackPress]);

  const handleGesture = ({
    nativeEvent,
  }: GestureEvent<PanGestureHandlerEventPayload>) => {
    if (nativeEvent.state === State.END) {
      const { translationX, translationY } = nativeEvent;
      let direction: string = "";

      if (Math.abs(translationX) > Math.abs(translationY)) {
        direction = translationX > 0 ? "right" : "left";
      } else {
        direction = translationY > 0 ? "down" : "up";
      }

      const newSecretSequence = [...secretSequence, direction].slice(-5);
      setSecretSequence(newSecretSequence);

      if (newSecretSequence.join(" ") === "up up down left right") {
        setSecretSequence([]);
        setIsAdminModalVisible(true);
      }
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          hitSlop={10}
        >
          <Ionicons
            name="color-palette-outline"
            size={Spacing.iconSize}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            hitSlop={10}
          >
            <Ionicons
              name="share-social-outline"
              size={Spacing.iconSize}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            activeOpacity={0.8}
            hitSlop={10}
          >
            <Ionicons
              name="settings-outline"
              size={Spacing.iconSize}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* App title and description */}
      <View style={styles.textContainer}>
        <CustomText variant="h1" fontWeight="bold">
          Currency Converter
        </CustomText>
        <CustomText
          variant="h6"
          fontWeight="medium"
          style={{ color: colors.gray[400] }}
        >
          Convert between any currencies
        </CustomText>
      </View>

      {/* Currency conversion card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
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
          placeholder="0.000"
          onPress={() => {
            setIsSelectingFrom(false);
            setIsModalVisible(true);
          }}
          currency={toCurrency}
          value={convertedDisplay}
          editable={false}
        />
      </View>

      {/* Exchange rate display */}
      <View style={styles.exchangeRateContainer}>
        <CustomText
          variant="h6"
          fontWeight="medium"
          style={{ color: colors.gray[400] }}
        >
          Indicative Exchange Rate
        </CustomText>
        {exchangeRateDisplay ? (
          <CustomText variant="h5" fontWeight="medium">
            {exchangeRateDisplay}
          </CustomText>
        ) : (
          <CustomText
            variant="h6"
            fontWeight="medium"
            style={{ color: colors.gray[400] }}
          >
            N/A
          </CustomText>
        )}
      </View>
      <PanGestureHandler onHandlerStateChange={handleGesture}>
        <View style={{ width: "100%", flex: 1 }} />
      </PanGestureHandler>
      <PrivacyTerms currentVersion={currentVersion} />

      {/* Currency selection modal */}
      <CurrenciesModal
        visible={isModalVisible}
        currencies={currencies}
        onClose={() => setIsModalVisible(false)}
        onCurrenciesSelect={handleCurrencySelect}
      />
      <AdminLoginModal
        visible={isAdminModalVisible}
        onClose={() => setIsAdminModalVisible(false)}
      />
    </KeyboardAwareScrollView>
  );
};

export default CurrencyConverterScreen;
