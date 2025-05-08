import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  card: {
    paddingVertical: moderateScale(15),
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
  },
  exchangeRateContainer: {
    marginTop: 30,
    gap: 10,
  },
  helpLinkContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 10,
  },
});
