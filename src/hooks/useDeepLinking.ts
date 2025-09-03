import * as Linking from "expo-linking";
import { router, useSegments } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

export interface DeepLinkParams {
  screen?: string;
  from?: string;
  to?: string;
  amount?: string;
  admin?: string;
}

/**
 * Custom hook to handle deeplinks in the currency converter app
 * Prevents infinite navigation loops and handles performance efficiently
 */
export const useDeepLinking = () => {
  const hasProcessedInitialUrl = useRef(false);
  const currentSegments = useSegments();
  const isAppReady = useRef(false);

  // Mark app as ready after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      isAppReady.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDeepLink = useCallback(
    (url: string) => {
      if (!isAppReady.current) {
        // Queue the deeplink for later processing
        setTimeout(() => handleDeepLink(url), 500);
        return;
      }

      try {
        const parsedUrl = Linking.parse(url);
        const { hostname, path, queryParams } = parsedUrl;

        // Prevent navigation loops by checking current route
        const currentRoute = currentSegments.join("/") || "index";

        switch (hostname) {
          case "convert":
            if (currentRoute !== "index") {
              handleConvertNavigation(queryParams as DeepLinkParams);
            } else {
              // Already on conversion screen, just update params via global state or event
              handleConvertParams(queryParams as DeepLinkParams);
            }
            break;
          case "settings":
            if (currentRoute !== "settings") {
              router.push("/settings");
            }
            break;
          case "history":
            if (currentRoute !== "history") {
              router.push("/history");
            }
            break;
          case "help":
            if (currentRoute !== "help") {
              router.push("/help");
            }
            break;
          case "admin":
            handleAdminNavigation(queryParams as DeepLinkParams, currentRoute);
            break;
          default:
            if (path) {
              handlePathBasedRouting(
                path,
                queryParams as DeepLinkParams,
                currentRoute
              );
            }
            break;
        }
      } catch (error) {
        console.error("❌ Error handling deeplink:", error);
      }
    },
    [currentSegments]
  );

  useEffect(() => {
    let subscription: any;

    const setupDeepLinking = async () => {
      // Handle deeplinks while app is running
      subscription = Linking.addEventListener("url", (event) => {
        handleDeepLink(event.url);
      });

      // Handle initial app launch from deeplink (only once)
      if (!hasProcessedInitialUrl.current) {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          hasProcessedInitialUrl.current = true;
          // Delay initial URL processing to ensure app is ready
          setTimeout(() => handleDeepLink(initialUrl), 1000);
        }
      }
    };

    setupDeepLinking();

    return () => {
      subscription?.remove();
    };
  }, [handleDeepLink]);

  const handleConvertNavigation = (params: DeepLinkParams) => {
    const { from, to, amount } = params;
    if (from || to || amount) {
      router.push({
        pathname: "/",
        params: {
          ...(from && { fromCurrency: from }),
          ...(to && { toCurrency: to }),
          ...(amount && { amount }),
        },
      });
    }
  };

  const handleConvertParams = (params: DeepLinkParams) => {
    // Emit event or use global state to update conversion params without navigation
    // This can be implemented with a custom event or context
  };

  const handleAdminNavigation = (
    params: DeepLinkParams,
    currentRoute: string
  ) => {
    const { screen } = params;
    const targetRoute = getAdminRoute(screen);

    if (targetRoute && currentRoute !== targetRoute) {
      router.push(targetRoute as any);
    }
  };

  const handlePathBasedRouting = (
    path: string,
    params: DeepLinkParams,
    currentRoute: string
  ) => {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    let targetRoute = "";

    switch (cleanPath) {
      case "convert":
        targetRoute = "index";
        break;
      case "settings":
        targetRoute = "settings";
        break;
      case "history":
        targetRoute = "history";
        break;
      case "help":
        targetRoute = "help";
        break;
      default:
        if (cleanPath.startsWith("admin/")) {
          const adminScreen = cleanPath.replace("admin/", "");
          targetRoute = getAdminRoute(adminScreen) || "";
        }
        break;
    }

    if (targetRoute && currentRoute !== targetRoute) {
      if (targetRoute === "index") {
        handleConvertNavigation(params);
      } else {
        router.push(`/${targetRoute}` as any);
      }
    }
  };

  const getAdminRoute = (screen?: string): string => {
    switch (screen) {
      case "conversions":
        return "admin-conversions";
      case "feedbacks":
        return "admin-feedbacks";
      case "device-conversions":
        return "device-conversions";
      case "device-feedbacks":
        return "device-feedbacks";
      default:
        return "";
    }
  };

  /**
   * Generate deeplink URL for sharing
   */
  const generateDeepLink = (
    screen: string,
    params?: Record<string, string>
  ) => {
    const baseUrl = "convertly://";
    const queryString = params
      ? "?" +
        Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&")
      : "";

    return `${baseUrl}${screen}${queryString}`;
  };

  /**
   * Generate conversion deeplink
   */
  const generateConversionDeepLink = (
    fromCurrency: string,
    toCurrency: string,
    amount?: string
  ) => {
    const params: Record<string, string> = {
      from: fromCurrency,
      to: toCurrency,
    };

    if (amount) {
      params.amount = amount;
    }

    return generateDeepLink("convert", params);
  };

  return {
    generateDeepLink,
    generateConversionDeepLink,
  };
};
