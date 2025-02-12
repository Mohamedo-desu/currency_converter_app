import CustomText from "@/components/CustomText";
import { Fonts } from "@/constants/Fonts";
import React, { memo, useCallback } from "react";
import {
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { StyleSheet } from "react-native-unistyles";

interface Currency {
  code: string;
  name: string;
  flag: string;
}

interface CurrenciesModalProps {
  visible: boolean;
  onClose: () => void;
  currencies: Currency[];
  onCurrenciesSelect: (currency: Currency) => void;
}

const CurrenciesModal: React.FC<CurrenciesModalProps> = ({
  visible,
  onClose,
  currencies,
  onCurrenciesSelect,
}) => {
  // Memoized render item callback for FlatList
  const renderCurrencyItem = useCallback(
    ({ item }: { item: Currency }) => (
      <TouchableOpacity
        style={styles.currenciesOption}
        onPress={() => onCurrenciesSelect(item)}
        activeOpacity={0.8}
      >
        <CountryFlag
          isoCode={item.flag}
          size={RFValue(20)}
          style={styles.flagIcon}
        />
        <CustomText fontFamily={Fonts.Regular} style={styles.currenciesText}>
          {item.name} -{" "}
          <CustomText style={styles.currenciesCode}>({item.code})</CustomText>
        </CustomText>
      </TouchableOpacity>
    ),
    [onCurrenciesSelect]
  );

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
            <FlatList
              data={currencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.code}
              contentContainerStyle={styles.currenciesList}
            />
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default memo(CurrenciesModal);

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
