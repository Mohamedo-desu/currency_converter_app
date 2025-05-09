import CustomText from "@/components/CustomText";
import { Fonts } from "@/constants/Fonts";
import { styles } from "@/styles/components/CurrenciesModal.styles";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";

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

const CurrenciesModal = ({
  visible,
  onClose,
  currencies,
  onCurrenciesSelect,
}: CurrenciesModalProps) => {
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return currencies;
    const term = searchTerm.toLowerCase();
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(term) ||
        currency.name.toLowerCase().includes(term)
    );
  }, [currencies, searchTerm]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrenciesSelect(currency);
      setSearchTerm("");
    },
    [onCurrenciesSelect]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <View style={styles.header}>
                <CustomText
                  variant="h4"
                  fontFamily={Fonts.Bold}
                  style={{ color: colors.text }}
                >
                  Select Currency
                </CustomText>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.gray[400]}
                  style={styles.searchIcon}
                />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search currency"
                  style={[
                    styles.searchInput,
                    { color: colors.text, backgroundColor: colors.background },
                  ]}
                  placeholderTextColor={colors.gray[400]}
                />
                {searchTerm ? (
                  <TouchableOpacity
                    onPress={() => setSearchTerm("")}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <FlatList
                data={filteredCurrencies}
                renderItem={({ item }: { item: Currency }) => (
                  <TouchableOpacity
                    style={styles.currencyItem}
                    onPress={() => handleCurrencySelect(item)}
                  >
                    <CountryFlag
                      isoCode={item.flag}
                      size={20}
                      style={styles.flagIcon}
                    />
                    <View style={styles.currencyInfo}>
                      <CustomText
                        variant="h5"
                        fontFamily={Fonts.Medium}
                        style={{ color: colors.text }}
                      >
                        {item.code}
                      </CustomText>
                      <CustomText
                        variant="h6"
                        style={{ color: colors.gray[400] }}
                      >
                        {item.name}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.currenciesList}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CurrenciesModal;
