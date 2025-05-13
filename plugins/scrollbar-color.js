const { withAndroidStyles } = require("@expo/config-plugins");

const withCustomScrollbar = (config) => {
  return withAndroidStyles(config, async (config) => {
    // Get the styles.xml file
    const styles = config.modResults.resources.style;

    // Find the AppTheme style
    const appTheme = styles.find((style) => style.$.name === "AppTheme");
    if (appTheme) {
      // Remove existing scrollbar style if it exists
      appTheme.item = appTheme.item.filter(
        (item) => item.$.name !== "android:scrollbarThumbVertical"
      );

      // Add our custom scrollbar style
      appTheme.item.push({
        $: {
          name: "android:scrollbarThumbVertical",
        },
        _: "@color/colorPrimary", // Using your app's primary color
      });
    }

    return config;
  });
};

module.exports = withCustomScrollbar;
