import { getStoredValues, saveSecurely } from "@/store/storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

// Constants
const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;
const API_KEY = process.env.EXPO_PUBLIC_RATES_API_URL;
const BASE_CURRENCY = "USD";
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;
const CODES_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;

// Define a type for currency objects
export interface Currency {
  code: string;
  name: string;
  flag: string;
}

/**
 * Fetch the list of available currencies from the API and save them for offline use.
 */
export const fetchCurrencies = async (): Promise<Currency[] | null> => {
  try {
    const response = await fetch(CODES_API_URL);
    const data = await response.json();

    if (data.result === "success") {
      const availableCurrencies: Currency[] = data.supported_codes.map(
        ([code, name]: [string, string]) => ({
          code,
          name,
          flag: code.slice(0, 2),
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
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return null;
  }
};

/**
 * Fetch global exchange rates (relative to BASE_CURRENCY) from the API and cache them.
 */
export const fetchGlobalExchangeRates = async (): Promise<Record<
  string,
  number
> | null> => {
  try {
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
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
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

// --- Background Fetch Task ---

const BACKGROUND_FETCH_TASK = "background-fetch-task";

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await updateDataIfStale();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background fetch failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background fetch task.
 */
export const registerBackgroundFetch = async (): Promise<void> => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error("Failed to register background fetch task", error);
  }
};

/**
 * Unregister the background fetch task.
 */
export const unregisterBackgroundFetch = async (): Promise<void> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  } catch (error) {
    console.error("Failed to unregister background fetch task", error);
  }
};
