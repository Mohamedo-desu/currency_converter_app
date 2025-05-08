import * as Sentry from "@sentry/react-native";
import * as Updates from "expo-updates";

export function handleExpoUpdateMetadata() {
  const manifest = Updates.manifest;
  const metadata = "metadata" in manifest ? manifest.metadata : undefined;
  const extra = "extra" in manifest ? manifest.extra : undefined;
  const updateGroup =
    metadata && "updateGroup" in metadata ? metadata.updateGroup : undefined;

  const scope = Sentry.getGlobalScope();

  scope.setTag("expo-update-id", Updates.updateId);
  scope.setTag("expo-is-embedded-update", Updates.isEmbeddedLaunch);

  if (typeof updateGroup === "string") {
    scope.setTag("expo-update-group-id", updateGroup);

    const owner = extra?.expoClient?.owner ?? "[account]";
    const slug = extra?.expoClient?.slug ?? "[project]";
    scope.setTag(
      "expo-update-debug-url",
      `https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`
    );
  } else if (Updates.isEmbeddedLaunch) {
    scope.setTag(
      "expo-update-debug-url",
      "not applicable for embedded updates"
    );
  }
}
