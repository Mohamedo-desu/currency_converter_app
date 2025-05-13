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
  AED: "AE", // UAE Dirham
  AFN: "AF", // Afghan Afghani
  ALL: "AL", // Albanian Lek
  AMD: "AM", // Armenian Dram
  ANG: "CW", // Netherlands Antillian Guilder
  AOA: "AO", // Angolan Kwanza
  ARS: "AR", // Argentine Peso
  AUD: "AU", // Australian Dollar
  AWG: "AW", // Aruban Florin
  AZN: "AZ", // Azerbaijani Manat
  BAM: "BA", // Bosnia and Herzegovina Mark
  BBD: "BB", // Barbados Dollar
  BDT: "BD", // Bangladeshi Taka
  BGN: "BG", // Bulgarian Lev
  BHD: "BH", // Bahraini Dinar
  BIF: "BI", // Burundian Franc
  BMD: "BM", // Bermudian Dollar
  BND: "BN", // Brunei Dollar
  BOB: "BO", // Bolivian Boliviano
  BRL: "BR", // Brazilian Real
  BSD: "BS", // Bahamian Dollar
  BTN: "BT", // Bhutanese Ngultrum
  BWP: "BW", // Botswana Pula
  BYN: "BY", // Belarusian Ruble
  BZD: "BZ", // Belize Dollar
  CAD: "CA", // Canadian Dollar
  CDF: "CD", // Congolese Franc
  CHF: "CH", // Swiss Franc
  CLP: "CL", // Chilean Peso
  CNY: "CN", // Chinese Renminbi
  COP: "CO", // Colombian Peso
  CRC: "CR", // Costa Rican Colon
  CUP: "CU", // Cuban Peso
  CVE: "CV", // Cape Verdean Escudo
  CZK: "CZ", // Czech Koruna
  DJF: "DJ", // Djiboutian Franc
  DKK: "DK", // Danish Krone
  DOP: "DO", // Dominican Peso
  DZD: "DZ", // Algerian Dinar
  EGP: "EG", // Egyptian Pound
  ERN: "ER", // Eritrean Nakfa
  ETB: "ET", // Ethiopian Birr
  EUR: "EU", // Euro
  FJD: "FJ", // Fiji Dollar
  FKP: "FK", // Falkland Islands Pound
  FOK: "FO", // Faroese Króna
  GBP: "GB", // Pound Sterling
  GEL: "GE", // Georgian Lari
  GGP: "GG", // Guernsey Pound
  GHS: "GH", // Ghanaian Cedi
  GIP: "GI", // Gibraltar Pound
  GMD: "GM", // Gambian Dalasi
  GNF: "GN", // Guinean Franc
  GTQ: "GT", // Guatemalan Quetzal
  GYD: "GY", // Guyanese Dollar
  HKD: "HK", // Hong Kong Dollar
  HNL: "HN", // Honduran Lempira
  HRK: "HR", // Croatian Kuna
  HTG: "HT", // Haitian Gourde
  HUF: "HU", // Hungarian Forint
  IDR: "ID", // Indonesian Rupiah
  ILS: "IL", // Israeli New Shekel
  IMP: "IM", // Manx Pound
  INR: "IN", // Indian Rupee
  IQD: "IQ", // Iraqi Dinar
  IRR: "IR", // Iranian Rial
  ISK: "IS", // Icelandic Króna
  JEP: "JE", // Jersey Pound
  JMD: "JM", // Jamaican Dollar
  JOD: "JO", // Jordanian Dinar
  JPY: "JP", // Japanese Yen
  KES: "KE", // Kenyan Shilling
  KGS: "KG", // Kyrgyzstani Som
  KHR: "KH", // Cambodian Riel
  KID: "KI", // Kiribati Dollar
  KMF: "KM", // Comorian Franc
  KRW: "KR", // South Korean Won
  KWD: "KW", // Kuwaiti Dinar
  KYD: "KY", // Cayman Islands Dollar
  KZT: "KZ", // Kazakhstani Tenge
  LAK: "LA", // Lao Kip
  LBP: "LB", // Lebanese Pound
  LKR: "LK", // Sri Lanka Rupee
  LRD: "LR", // Liberian Dollar
  LSL: "LS", // Lesotho Loti
  LYD: "LY", // Libyan Dinar
  MAD: "MA", // Moroccan Dirham
  MDL: "MD", // Moldovan Leu
  MGA: "MG", // Malagasy Ariary
  MKD: "MK", // Macedonian Denar
  MMK: "MM", // Burmese Kyat
  MNT: "MN", // Mongolian Tögrög
  MOP: "MO", // Macanese Pataca
  MRU: "MR", // Mauritanian Ouguiya
  MUR: "MU", // Mauritian Rupee
  MVR: "MV", // Maldivian Rufiyaa
  MWK: "MW", // Malawian Kwacha
  MXN: "MX", // Mexican Peso
  MYR: "MY", // Malaysian Ringgit
  MZN: "MZ", // Mozambican Metical
  NAD: "NA", // Namibian Dollar
  NGN: "NG", // Nigerian Naira
  NIO: "NI", // Nicaraguan Córdoba
  NOK: "NO", // Norwegian Krone
  NPR: "NP", // Nepalese Rupee
  NZD: "NZ", // New Zealand Dollar
  OMR: "OM", // Omani Rial
  PAB: "PA", // Panamanian Balboa
  PEN: "PE", // Peruvian Sol
  PGK: "PG", // Papua New Guinean Kina
  PHP: "PH", // Philippine Peso
  PKR: "PK", // Pakistani Rupee
  PLN: "PL", // Polish Złoty
  PYG: "PY", // Paraguayan Guaraní
  QAR: "QA", // Qatari Riyal
  RON: "RO", // Romanian Leu
  RSD: "RS", // Serbian Dinar
  RUB: "RU", // Russian Ruble
  RWF: "RW", // Rwandan Franc
  SAR: "SA", // Saudi Riyal
  SBD: "SB", // Solomon Islands Dollar
  SCR: "SC", // Seychellois Rupee
  SDG: "SD", // Sudanese Pound
  SEK: "SE", // Swedish Krona
  SGD: "SG", // Singapore Dollar
  SHP: "SH", // Saint Helena Pound
  SLE: "SL", // Sierra Leonean Leone
  SOS: "SO", // Somali Shilling
  SRD: "SR", // Surinamese Dollar
  SSP: "SS", // South Sudanese Pound
  STN: "ST", // São Tomé and Príncipe Dobra
  SYP: "SY", // Syrian Pound
  SZL: "SZ", // Eswatini Lilangeni
  THB: "TH", // Thai Baht
  TJS: "TJ", // Tajikistani Somoni
  TMT: "TM", // Turkmenistan Manat
  TND: "TN", // Tunisian Dinar
  TOP: "TO", // Tongan Paʻanga
  TRY: "TR", // Turkish Lira
  TTD: "TT", // Trinidad and Tobago Dollar
  TVD: "TV", // Tuvaluan Dollar
  TWD: "TW", // New Taiwan Dollar
  TZS: "TZ", // Tanzanian Shilling
  UAH: "UA", // Ukrainian Hryvnia
  UGX: "UG", // Ugandan Shilling
  USD: "US", // United States Dollar
  UYU: "UY", // Uruguayan Peso
  UZS: "UZ", // Uzbekistani So'm
  VES: "VE", // Venezuelan Bolívar Soberano
  VND: "VN", // Vietnamese Đồng
  VUV: "VU", // Vanuatu Vatu
  WST: "WS", // Samoan Tālā
  XAF: "CM", // Central African CFA Franc
  XCD: "AG", // East Caribbean Dollar
  XCG: "CW", // Caribbean Guilder -> Curaçao
  XDR: "IMF", // Special Drawing Rights
  XOF: "SN", // West African CFA franc
  XPF: "PF", // CFP Franc
  YER: "YE", // Yemeni Rial
  ZAR: "ZA", // South African Rand
  ZMW: "ZM", // Zambian Kwacha
  ZWL: "ZW", // Zimbabwean Dollar
};

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: "د.إ", // UAE Dirham
  AFN: "؋", // Afghan Afghani
  ALL: "L", // Albanian Lek
  AMD: "֏", // Armenian Dram
  ANG: "ƒ", // Netherlands Antillian Guilder
  AOA: "Kz", // Angolan Kwanza
  ARS: "$", // Argentine Peso
  AUD: "A$", // Australian Dollar
  AWG: "ƒ", // Aruban Florin
  AZN: "₼", // Azerbaijani Manat
  BAM: "KM", // Bosnia and Herzegovina Mark
  BBD: "$", // Barbados Dollar
  BDT: "৳", // Bangladeshi Taka
  BGN: "лв", // Bulgarian Lev
  BHD: ".د.ب", // Bahraini Dinar
  BIF: "FBu", // Burundian Franc
  BMD: "$", // Bermudian Dollar
  BND: "$", // Brunei Dollar
  BOB: "Bs.", // Bolivian Boliviano
  BRL: "R$", // Brazilian Real
  BSD: "$", // Bahamian Dollar
  BTN: "Nu.", // Bhutanese Ngultrum
  BWP: "P", // Botswana Pula
  BYN: "Br", // Belarusian Ruble
  BZD: "$", // Belize Dollar
  CAD: "C$", // Canadian Dollar
  CDF: "FC", // Congolese Franc
  CHF: "Fr", // Swiss Franc
  CLP: "$", // Chilean Peso
  CNY: "¥", // Chinese Renminbi
  COP: "$", // Colombian Peso
  CRC: "₡", // Costa Rican Colon
  CUP: "$", // Cuban Peso
  CVE: "$", // Cape Verdean Escudo
  CZK: "Kč", // Czech Koruna
  DJF: "Fdj", // Djiboutian Franc
  DKK: "kr", // Danish Krone
  DOP: "$", // Dominican Peso
  DZD: "د.ج", // Algerian Dinar
  EGP: "ج.م", // Egyptian Pound
  ERN: "Nfk", // Eritrean Nakfa
  ETB: "Br", // Ethiopian Birr
  EUR: "€", // Euro
  FJD: "$", // Fiji Dollar
  FKP: "£", // Falkland Islands Pound
  FOK: "kr", // Faroese Króna
  GBP: "£", // Pound Sterling
  GEL: "₾", // Georgian Lari
  GGP: "£", // Guernsey Pound
  GHS: "₵", // Ghanaian Cedi
  GIP: "£", // Gibraltar Pound
  GMD: "D", // Gambian Dalasi
  GNF: "FG", // Guinean Franc
  GTQ: "Q", // Guatemalan Quetzal
  GYD: "$", // Guyanese Dollar
  HKD: "HK$", // Hong Kong Dollar
  HNL: "L", // Honduran Lempira
  HRK: "kn", // Croatian Kuna
  HTG: "G", // Haitian Gourde
  HUF: "Ft", // Hungarian Forint
  IDR: "Rp", // Indonesian Rupiah
  ILS: "₪", // Israeli New Shekel
  IMP: "£", // Manx Pound
  INR: "₹", // Indian Rupee
  IQD: "ع.د", // Iraqi Dinar
  IRR: "﷼", // Iranian Rial
  ISK: "kr", // Icelandic Króna
  JEP: "£", // Jersey Pound
  JMD: "$", // Jamaican Dollar
  JOD: "د.ا", // Jordanian Dinar
  JPY: "¥", // Japanese Yen
  KES: "KSh", // Kenyan Shilling
  KGS: "с", // Kyrgyzstani Som
  KHR: "៛", // Cambodian Riel
  KID: "$", // Kiribati Dollar
  KMF: "CF", // Comorian Franc
  KRW: "₩", // South Korean Won
  KWD: "د.ك", // Kuwaiti Dinar
  KYD: "$", // Cayman Islands Dollar
  KZT: "₸", // Kazakhstani Tenge
  LAK: "₭", // Lao Kip
  LBP: "ل.ل", // Lebanese Pound
  LKR: "Rs", // Sri Lanka Rupee
  LRD: "$", // Liberian Dollar
  LSL: "L", // Lesotho Loti
  LYD: "ل.د", // Libyan Dinar
  MAD: "د.م.", // Moroccan Dirham
  MDL: "L", // Moldovan Leu
  MGA: "Ar", // Malagasy Ariary
  MKD: "ден", // Macedonian Denar
  MMK: "K", // Burmese Kyat
  MNT: "₮", // Mongolian Tögrög
  MOP: "MOP$", // Macanese Pataca
  MRU: "UM", // Mauritanian Ouguiya
  MUR: "₨", // Mauritian Rupee
  MVR: "Rf", // Maldivian Rufiyaa
  MWK: "MK", // Malawian Kwacha
  MXN: "Mex$", // Mexican Peso
  MYR: "RM", // Malaysian Ringgit
  MZN: "MT", // Mozambican Metical
  NAD: "$", // Namibian Dollar
  NGN: "₦", // Nigerian Naira
  NIO: "C$", // Nicaraguan Córdoba
  NOK: "kr", // Norwegian Krone
  NPR: "₨", // Nepalese Rupee
  NZD: "NZ$", // New Zealand Dollar
  OMR: "ر.ع.", // Omani Rial
  PAB: "B/.", // Panamanian Balboa
  PEN: "S/", // Peruvian Sol
  PGK: "K", // Papua New Guinean Kina
  PHP: "₱", // Philippine Peso
  PKR: "₨", // Pakistani Rupee
  PLN: "zł", // Polish Złoty
  PYG: "₲", // Paraguayan Guaraní
  QAR: "﷼", // Qatari Riyal
  RON: "lei", // Romanian Leu
  RSD: "дин.", // Serbian Dinar
  RUB: "₽", // Russian Ruble
  RWF: "RF", // Rwandan Franc
  SAR: "﷼", // Saudi Riyal
  SBD: "$", // Solomon Islands Dollar
  SCR: "₨", // Seychellois Rupee
  SDG: "ج.س.", // Sudanese Pound
  SEK: "kr", // Swedish Krona
  SGD: "S$", // Singapore Dollar
  SHP: "£", // Saint Helena Pound
  SLE: "Le", // Sierra Leonean Leone
  SOS: "Sh", // Somali Shilling
  SRD: "$", // Surinamese Dollar
  SSP: "£", // South Sudanese Pound
  STN: "Db", // São Tomé and Príncipe Dobra
  SYP: "£", // Syrian Pound
  SZL: "L", // Eswatini Lilangeni
  THB: "฿", // Thai Baht
  TJS: "ЅM", // Tajikistani Somoni
  TMT: "m", // Turkmenistan Manat
  TND: "د.ت", // Tunisian Dinar
  TOP: "T$", // Tongan Paʻanga
  TRY: "₺", // Turkish Lira
  TTD: "$", // Trinidad and Tobago Dollar
  TVD: "$", // Tuvaluan Dollar
  TWD: "NT$", // New Taiwan Dollar
  TZS: "TSh", // Tanzanian Shilling
  UAH: "₴", // Ukrainian Hryvnia
  UGX: "USh", // Ugandan Shilling
  USD: "$", // United States Dollar
  UYU: "$", // Uruguayan Peso
  UZS: "so'm", // Uzbekistani So'm
  VES: "Bs.", // Venezuelan Bolívar Soberano
  VND: "₫", // Vietnamese Đồng
  VUV: "VT", // Vanuatu Vatu
  WST: "T", // Samoan Tālā
  XAF: "FCFA", // Central African CFA Franc
  XCD: "EC$", // East Caribbean Dollar
  XDR: "XDR", // Special Drawing Rights
  XOF: "CFA", // West African CFA franc
  XPF: "₣", // CFP Franc
  YER: "﷼", // Yemeni Rial
  ZAR: "R", // South African Rand
  ZMW: "ZK", // Zambian Kwacha
  ZWL: "$", // Zimbabwean Dollar
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
export const getCurrencySymbol = (currencyCode: string): string => {
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
