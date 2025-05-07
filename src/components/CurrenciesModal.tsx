import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { useTheme } from "@react-navigation/native";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";

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
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter currencies based on the search term
  const filteredCurrencies = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return currencies.filter(
      (currency) =>
        currency.name.toLowerCase().includes(lowerSearchTerm) ||
        currency.code.toLowerCase().includes(lowerSearchTerm)
    );
  }, [currencies, searchTerm]);

  // Memoized render item callback for FlashList
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
          <View
            style={[styles.modalContainer, { backgroundColor: colors.card }]}
          >
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    borderColor: colors.gray[200],
                    color: colors.text,
                  },
                ]}
                placeholder="Search currency"
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm && (
                <TouchableOpacity
                  onPress={() => setSearchTerm("")}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={RFValue(20)}
                    color={colors.gray[400]}
                  />
                </TouchableOpacity>
              )}
            </View>

            <LegendList
              data={filteredCurrencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.code}
              contentContainerStyle={styles.currenciesList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default memo(CurrenciesModal);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 10,
    width: "95%",
    padding: 20,
    elevation: 5,
    maxHeight: "70%",
    overflow: "hidden",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 15,
  },
  searchInput: {
    height: moderateScale(50),
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -RFValue(10) }],
  },

  currenciesList: {
    paddingBottom: 50,
    flexGrow: 1,
  },
  currenciesOption: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },
  currenciesText: {
    fontSize: RFValue(14),
    textAlign: "center",
  },
  currenciesCode: {
    fontSize: RFValue(14),
    color: Colors.primary,
  },
  flagIcon: {},
});
