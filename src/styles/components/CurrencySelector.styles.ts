import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: RFValue(16),
    padding: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: RFValue(13),
  },
  amountContainer: {},
  flagIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(25),
    overflow: "hidden",
    marginRight: 10,
  },
  headerCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerCurrencyContainer: {
    marginTop: 15,
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    position: "absolute",
    right: 10,
  },
});
