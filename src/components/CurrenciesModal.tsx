import CustomText from "@/components/CustomText";
import { Fonts } from "@/constants/Fonts";
import React from "react";
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { StyleSheet } from "react-native-unistyles";

interface CurrenciesModalProps {
  visible: boolean;
  onClose: () => void;
  currencies: { code: string; name: string; flag: string }[];
  onCurrenciesSelect: (currencies: {
    code: string;
    name: string;
    flag: string;
  }) => void;
}

const CurrenciesModal: React.FC<CurrenciesModalProps> = ({
  visible,
  onClose,
  currencies,
  onCurrenciesSelect,
}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      transparent
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.currenciesList}>
              {currencies.map((currencies) => (
                <TouchableOpacity
                  key={currencies.code}
                  style={styles.currenciesOption}
                  onPress={() => onCurrenciesSelect(currencies)}
                  activeOpacity={0.8}
                >
                  <CountryFlag
                    isoCode={currencies.flag}
                    size={RFValue(20)}
                    style={styles.flagIcon}
                  />
                  {/* Display the flag */}
                  <CustomText
                    fontFamily={Fonts.Regular}
                    style={styles.currenciesText}
                  >
                    {currencies.name}
                    {" - "}
                    <CustomText style={styles.currenciesCode}>
                      ({currencies.code})
                    </CustomText>
                  </CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default CurrenciesModal;

const styles = StyleSheet.create((theme) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.Colors.background,
    borderRadius: theme.border.xs,
    width: "80%",
    padding: 20,
    elevation: 5,
    maxHeight: "70%",
  },
  currenciesList: {
    gap: 15,
  },
  currenciesOption: {
    paddingVertical: theme.margins.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    alignSelf: "center",
  },
  currenciesText: {
    fontSize: RFValue(14),
    textAlign: "center",
  },
  currenciesCode: {
    fontSize: RFValue(14),
    color: theme.Colors.primary,
  },
  flagIcon: {},
}));
