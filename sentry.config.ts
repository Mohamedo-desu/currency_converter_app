import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";

// Define your navigation integration
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

export const sentryConfig = {
  enableAutoSessionTracking: true,
  attachStacktrace: true,
  attachScreenshot: true,
  enableAutoPerformanceTracing: true,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  dsn: "https://105027801e0105036ed28d0d15cb3d72@o4507503716794368.ingest.us.sentry.io/4509944158420992",
  sendDefaultPii: true,
  // Configure Session Replay
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
      enableExperimentalViewRenderer: true,
      enableFastViewRendering: true,
    }),

    Sentry.feedbackIntegration(),
    navigationIntegration,
  ],
  spotlight: __DEV__,
};
