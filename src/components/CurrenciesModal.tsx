import CustomText from "@/components/CustomText";
import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/components/CurrenciesModal.styles";
import { Ionicons } from "@expo/vector-icons";
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

  const renderCurrencyItem = useCallback(
    ({ item }: { item: Currency }) => (
      <TouchableOpacity
        style={styles.currencyItem}
        onPress={() => handleCurrencySelect(item)}
      >
        <CountryFlag isoCode={item.flag} size={25} style={styles.flagIcon} />
        <View style={styles.currencyInfo}>
          <CustomText
            variant="h5"
            fontWeight="medium"
            style={{ color: colors.text }}
          >
            {item.code}
          </CustomText>
          <CustomText
            variant="h6"
            fontWeight="medium"
            style={{ color: colors.gray[400] }}
          >
            {item.name}
          </CustomText>
        </View>
      </TouchableOpacity>
    ),
    [colors, handleCurrencySelect]
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
                  fontWeight="bold"
                  style={{ color: colors.text }}
                >
                  Select Currency
                </CustomText>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Ionicons
                    name="close"
                    size={Spacing.iconSize}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.searchContainer,
                  { backgroundColor: colors.background },
                ]}
              >
                <Ionicons
                  name="search"
                  size={Spacing.iconSize}
                  color={colors.gray[400]}
                  style={styles.searchIcon}
                />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search currency"
                  style={[styles.searchInput, { color: colors.text }]}
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
                      size={Spacing.iconSize}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <FlatList
                data={filteredCurrencies}
                renderItem={renderCurrencyItem}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.currenciesList}
                keyboardShouldPersistTaps="handled"
                indicatorStyle="black"
                showsVerticalScrollIndicator={true}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CurrenciesModal;
