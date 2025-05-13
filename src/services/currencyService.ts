import { getStoredValues, saveSecurely } from "@/store/storage";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

// Constants
const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;
const API_KEY = process.env.EXPO_PUBLIC_RATES_API_URL;
const BASE_CURRENCY = "USD";
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;
const CODES_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Currency code to country code mapping
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  // Special cases
  ANG: "CW", // Netherlands Antillian Guilder -> Curaçao
  XCG: "CW", // Caribbean Guilder -> Curaçao
  EUR: "EU", // Euro -> European Union
  XCD: "AG", // East Caribbean Dollar -> Antigua and Barbuda
  XPF: "PF", // CFP Franc -> French Polynesia
  XAF: "CM", // Central African CFA franc -> Cameroon
  XOF: "SN", // West African CFA franc -> Senegal
  XDR: "IMF", // Special Drawing Rights -> IMF
  BTC: "BTC", // Bitcoin
  ETH: "ETH", // Ethereum
  GBP: "GB", // British Pound
  USD: "US", // US Dollar
  JPY: "JP", // Japanese Yen
  AUD: "AU", // Australian Dollar
  CAD: "CA", // Canadian Dollar
  CHF: "CH", // Swiss Franc
  CNY: "CN", // Chinese Yuan
  INR: "IN", // Indian Rupee
  NZD: "NZ", // New Zealand Dollar
  SGD: "SG", // Singapore Dollar
  ZAR: "ZA", // South African Rand
  RUB: "RU", // Russian Ruble
  BRL: "BR", // Brazilian Real
  MXN: "MX", // Mexican Peso
  HKD: "HK", // Hong Kong Dollar
  TWD: "TW", // Taiwan Dollar
  KRW: "KR", // South Korean Won
  SEK: "SE", // Swedish Krona
  NOK: "NO", // Norwegian Krone
  DKK: "DK", // Danish Krone
  PLN: "PL", // Polish Złoty
  TRY: "TR", // Turkish Lira
  ILS: "IL", // Israeli New Shekel
  SAR: "SA", // Saudi Riyal
  AED: "AE", // UAE Dirham
  THB: "TH", // Thai Baht
  MYR: "MY", // Malaysian Ringgit
  IDR: "ID", // Indonesian Rupiah
  PHP: "PH", // Philippine Peso
  VND: "VN", // Vietnamese Dong
  KWD: "KW", // Kuwaiti Dinar
  QAR: "QA", // Qatari Riyal
  BHD: "BH", // Bahraini Dinar
  OMR: "OM", // Omani Rial
  JOD: "JO", // Jordanian Dinar
  EGP: "EG", // Egyptian Pound
  PKR: "PK", // Pakistani Rupee
  BDT: "BD", // Bangladeshi Taka
  LKR: "LK", // Sri Lankan Rupee
  NPR: "NP", // Nepalese Rupee
  MMK: "MM", // Myanmar Kyat
  KHR: "KH", // Cambodian Riel
  LAK: "LA", // Lao Kip
  MNT: "MN", // Mongolian Tögrög
  KZT: "KZ", // Kazakhstani Tenge
  UZS: "UZ", // Uzbekistani Som
  TJS: "TJ", // Tajikistani Somoni
  TMT: "TM", // Turkmenistani Manat
  AZN: "AZ", // Azerbaijani Manat
  GEL: "GE", // Georgian Lari
  AMD: "AM", // Armenian Dram
  UAH: "UA", // Ukrainian Hryvnia
  BYN: "BY", // Belarusian Ruble
  MDL: "MD", // Moldovan Leu
  RON: "RO", // Romanian Leu
  BGN: "BG", // Bulgarian Lev
  HRK: "HR", // Croatian Kuna
  RSD: "RS", // Serbian Dinar
  MKD: "MK", // Macedonian Denar
  ALL: "AL", // Albanian Lek
  ISK: "IS", // Icelandic Króna
  CZK: "CZ", // Czech Koruna
  HUF: "HU", // Hungarian Forint
  SKK: "SK", // Slovak Koruna
  SIT: "SI", // Slovenian Tolar
  MTL: "MT", // Maltese Lira
  CYP: "CY", // Cypriot Pound
  EEK: "EE", // Estonian Kroon
  LVL: "LV", // Latvian Lats
  LTL: "LT", // Lithuanian Litas
  BAM: "BA", // Bosnia and Herzegovina Convertible Mark
};

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  XCG: "Cg", // Caribbean Guilder
  USD: "$", // US Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound
  JPY: "¥", // Japanese Yen
  // Add more currency symbols as needed
};

/**
 * Get country code for currency
 */
const getCountryCode = (currencyCode: string): string => {
  return CURRENCY_TO_COUNTRY[currencyCode] || currencyCode.slice(0, 2);
};

/**
 * Get currency symbol
 */
const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

// Define a type for currency objects
export interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol?: string;
}

/**
 * Helper function to implement exponential backoff retry
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) {
      console.error("Max retries reached:", error);
      return null;
    }
    console.log(`Retrying... ${retries} attempts left`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1, delay * 2);
  }
};

/**
 * Fetch the list of available currencies from the API and save them for offline use.
 */
export const fetchCurrencies = async (): Promise<Currency[] | null> => {
  return retryWithBackoff(async () => {
    const response = await fetch(CODES_API_URL);
    const data = await response.json();

    if (data.result === "success") {
      const availableCurrencies: Currency[] = data.supported_codes.map(
        ([code, name]: [string, string]) => ({
          code,
          name,
          flag: getCountryCode(code),
          symbol: getCurrencySymbol(code),
        })
      );
      // Cache currencies and update the last fetch timestamp.
      saveSecurely([
        { key: "currencies", value: JSON.stringify(availableCurrencies) },
        { key: "lastCurrenciesFetch", value: Date.now().toString() },
      ]);
      return availableCurrencies;
    }
    return null;
  });
};

/**
 * Fetch global exchange rates (relative to BASE_CURRENCY) from the API and cache them.
 */
export const fetchGlobalExchangeRates = async (): Promise<Record<
  string,
  number
> | null> => {
  return retryWithBackoff(async () => {
    const response = await fetch(`${EXCHANGE_API_URL}${BASE_CURRENCY}`);
    const data = await response.json();
    if (data.result === "success") {
      saveSecurely([
        { key: "exchangeRates", value: JSON.stringify(data.conversion_rates) },
        { key: "lastExchangeRatesFetch", value: Date.now().toString() },
      ]);
      return data.conversion_rates;
    }
    return null;
  });
};

/**
 * Check if currencies and exchange rates are stale. If so, fetch and update them.
 */
export const updateDataIfStale = async (): Promise<void> => {
  const now = Date.now();
  const storedData = getStoredValues([
    "lastCurrenciesFetch",
    "lastExchangeRatesFetch",
  ]);
  const lastCurrenciesFetch = storedData.lastCurrenciesFetch
    ? parseInt(storedData.lastCurrenciesFetch, 10)
    : 0;
  const lastExchangeRatesFetch = storedData.lastExchangeRatesFetch
    ? parseInt(storedData.lastExchangeRatesFetch, 10)
    : 0;

  if (now - lastCurrenciesFetch > THREE_DAYS) {
    await fetchCurrencies();
  }
  if (now - lastExchangeRatesFetch > THREE_DAYS) {
    await fetchGlobalExchangeRates();
  }
};

// --- Background Task ---

const BACKGROUND_TASK_NAME = "background-currency-update";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    await updateDataIfStale();
    return true; // Task completed successfully
  } catch (error) {
    console.error("Background task failed:", error);
    return false; // Task failed
  }
});

/**
 * Register the background task.
 */
export const registerBackgroundTask = async (): Promise<void> => {
  try {
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 60, // 1h
    });
  } catch (error) {
    console.error("Failed to register background task", error);
  }
};

/**
 * Unregister the background task.
 */
export const unregisterBackgroundTask = async (): Promise<void> => {
  try {
    await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME);
  } catch (error) {
    console.error("Failed to unregister background task", error);
  }
};
