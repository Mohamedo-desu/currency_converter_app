import { Alert, Platform, Share } from "react-native";

/**
 * Utility functions for sharing app content with deeplinks
 */

/**
 * Share the app with deeplink
 * @param downloadUrl App download URL from app store
 */
export const shareApp = async (downloadUrl: string) => {
  const webUrl = "https://convertly.expo.app";
  const deepLink = "convertly://";

  const message = `Check out this awesome Currency Converter app! Convert between any currencies with ease.\n🔗 Quick access: ${webUrl}\n📲 Download: ${downloadUrl}`;

  try {
    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({
          title: "Currency Converter",
          text: message,
          url: webUrl,
        });
      } else {
        // Fallback for browsers without native share
        await navigator.clipboard.writeText(message);
        Alert.alert("Copied!", "App details copied to clipboard.");
      }
    } else {
      await Share.share({
        message,
        title: "Currency Converter",
        url: webUrl, // Use web URL for better compatibility
      });
    }
  } catch (error) {
    console.error("Error sharing app:", error);
  }
};

/**
 * Share a specific screen deeplink
 * @param screen Screen name (settings, history, help)
 * @param downloadUrl App download URL
 */
export const shareScreen = async (screen: string, downloadUrl: string) => {
  const deepLink = `convertly://${screen}`;
  const webUrl = "https://convertly.expo.app";

  const screenNames: Record<string, string> = {
    settings: "Settings",
    history: "Conversion History",
    help: "Help & Support",
  };

  const screenName = screenNames[screen] || screen;
  const message = `Check out the ${screenName} in Currency Converter app!\n🔗 Direct link: ${deepLink}\n🌐 Try online: ${webUrl}\n📲 Download: ${downloadUrl}`;

  try {
    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({
          title: `Currency Converter - ${screenName}`,
          text: message,
          url: webUrl,
        });
      } else {
        await navigator.clipboard.writeText(message);
        Alert.alert("Copied!", `${screenName} link copied to clipboard.`);
      }
    } else {
      await Share.share({
        message,
        title: `Currency Converter - ${screenName}`,
        url: deepLink,
      });
    }
  } catch (error) {
    console.error(`Error sharing ${screen} screen:`, error);
  }
};

/**
 * Generate deeplink for specific conversion
 * @param fromCurrency Source currency code
 * @param toCurrency Target currency code
 * @param amount Amount to convert (optional)
 * @returns Deeplink URL string
 */
export const generateConversionDeepLink = (
  fromCurrency: string,
  toCurrency: string,
  amount?: string
): string => {
  const params = new URLSearchParams({
    from: fromCurrency,
    to: toCurrency,
    ...(amount && { amount }),
  });

  return `convertly://convert?${params.toString()}`;
};

/**
 * Share a conversion with deeplink
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @param amount Original amount
 * @param convertedAmount Converted amount
 * @param exchangeRate Exchange rate
 * @param downloadUrl App download URL
 */
export const shareConversion = async (
  fromCurrency: { code: string; name: string },
  toCurrency: { code: string; name: string },
  amount: string,
  convertedAmount: string,
  exchangeRate: number,
  downloadUrl: string
) => {
  const webUrlWithParams = `https://convertly.expo.app?from=${fromCurrency.code}&to=${toCurrency.code}&amount=${amount}`;
  const deepLink = generateConversionDeepLink(
    fromCurrency.code,
    toCurrency.code,
    amount
  );

  const formattedRate = exchangeRate.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

  const message = `💱 Currency Conversion\n\n${amount} ${fromCurrency.code} = ${convertedAmount} ${toCurrency.code}\n\nExchange Rate: 1 ${fromCurrency.code} = ${formattedRate} ${toCurrency.code}\n\nCalculated with Currency Converter app\n🔗 Open this conversion: ${webUrlWithParams}\n📲 Download: ${downloadUrl}`;

  try {
    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({
          title: "Currency Conversion Result",
          text: message,
          url: webUrlWithParams,
        });
      } else {
        await navigator.clipboard.writeText(message);
        Alert.alert("Copied!", "Conversion details copied to clipboard.");
      }
    } else {
      await Share.share({
        message,
        title: "Currency Conversion Result",
        url: webUrlWithParams, // Use web URL that will redirect to app
      });
    }
  } catch (error) {
    console.error("Error sharing conversion:", error);
  }
};
