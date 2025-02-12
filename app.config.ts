import { ConfigContext, ExpoConfig } from "expo/config";

const EAS_PROJECT_ID = "50dacf76-66d8-4d6d-a927-46b153449f7a";
const PROJECT_SLUG = "convertly";
const OWNER = "mohamedo-desu";

// App production config
const APP_NAME = "Convertly";
const BUNDLE_IDENTIFIER = `com.mohamedodesu.${PROJECT_SLUG}`;
const PACKAGE_NAME = `com.mohamedodesu.${PROJECT_SLUG}`;
const ICON = "./assets/icons/iOS-Prod.png";
const ADAPTIVE_ICON = "./assets/icons/Android-Prod.png";
const SCHEME = PROJECT_SLUG;

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log("⚙️ Building app for environment:", process.env.APP_ENV);
  const { name, bundleIdentifier, icon, adaptiveIcon, packageName, scheme } =
    getDynamicAppConfig(
      (process.env.APP_ENV as "development" | "preview" | "production") ||
        "development"
    );

  return {
    ...config,
    name: name,
    version: "1.0.1",
    slug: PROJECT_SLUG,
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    icon: icon,
    scheme: scheme,
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: adaptiveIcon,
        backgroundColor: "#ffffff",
      },
      package: packageName,
      softwareKeyboardLayoutMode: "pan",
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
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/Android-Prod.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          organization: "mohamedo-apps-desu",
          project: PROJECT_SLUG,
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Okra-Bold.ttf",
            "./assets/fonts/Okra-ExtraBold.ttf",
            "./assets/fonts/Okra-Medium.ttf",
            "./assets/fonts/Okra-MediumLight.ttf",
            "./assets/fonts/Okra-Regular.ttf",
          ],
        },
      ],
      [
        "expo-quick-actions",
        {
          androidIcons: {
            help_icon: {
              foregroundImage: "",
              backgroundColor: "#069140",
            },
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
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
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: "./assets/icons/iOS-Prev.png",
      adaptiveIcon: "./assets/icons/Android-Prev.png",
      scheme: `${SCHEME}-prev`,
    };
  }

  return {
    name: `${APP_NAME} Development`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
    packageName: `${PACKAGE_NAME}.dev`,
    icon: "./assets/icons/iOS-Dev.png",
    adaptiveIcon: "./assets/icons/Android-Dev.png",
    scheme: `${SCHEME}-dev`,
  };
};
