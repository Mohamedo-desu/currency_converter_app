import { ConfigContext, ExpoConfig } from "expo/config";

const EAS_PROJECT_ID = "50dacf76-66d8-4d6d-a927-46b153449f7a";
const PROJECT_SLUG = "convertly";
const OWNER = "mohamedo-desu";

// App production config
const APP_NAME = "Currency Converter";
const BUNDLE_IDENTIFIER = `com.mohamedodesu.${PROJECT_SLUG}`;
const PACKAGE_NAME = `com.mohamedodesu.${PROJECT_SLUG}`;
const ICON = "./assets/images/ios-prod.png";
const ADAPTIVE_ICON = "./assets/images/android-prod.png";
const SCHEME = PROJECT_SLUG;

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log("⚙️ Building app for environment:", process.env.APP_ENV);
  const { name, bundleIdentifier, icon, adaptiveIcon, packageName, scheme } =
    getDynamicAppConfig(
      (process.env.APP_ENV as "development" | "preview" | "production") ||
        "preview"
    );

  return {
    ...config,
    name: name,
    version: "3.0.0",
    slug: PROJECT_SLUG,
    orientation: "portrait",
    newArchEnabled: true,
    icon: icon,
    scheme: scheme,
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      icon: {
        dark: "./assets/images/ios-dark.png",
        light: "./assets/images/ios-prod.png",
        tinted: "./assets/images/ios-tinted.png",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: adaptiveIcon,
        backgroundColor: "#ffffff",
      },
      package: packageName,
      softwareKeyboardLayoutMode: "pan",
      edgeToEdgeEnabled: true,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: `${PROJECT_SLUG}.expo.app`,
              pathPrefix: "/",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/ios-prod.png",
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/splash-icon.png",
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "react-native-edge-to-edge",
        {
          android: {
            parentTheme: "Light",
            enforceNavigationBarContrast: false,
          },
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            usesCleartextTraffic: true,
          },
        },
      ],
      "expo-router",
      "expo-background-task",
      "expo-font",
      "./plugins/scrollbar-color.js",
      "./plugins/customize.js",
    ],
    experiments: {
      reactCanary: true,
      buildCacheProvider: "eas",
    },
    owner: OWNER,
  };
};

export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
      scheme: SCHEME,
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME}`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}`,
      packageName: `${PACKAGE_NAME}`,
      icon: ICON,
      adaptiveIcon: ADAPTIVE_ICON,
      scheme: `${SCHEME}`,
    };
  }

  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    icon: "./assets/images/ios-dev.png",
    adaptiveIcon: "./assets/images/android-dev.png",
    scheme: `${SCHEME}-dev`,
  };
};
