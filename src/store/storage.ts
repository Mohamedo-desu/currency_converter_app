import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: "my-app-storage",
  encryptionKey: "my-encryption-key",
});

export const mmkvStorage = {
  setItem: (key: string, value: string) => storage.set(key, value),
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: string) => storage.delete(key),
  clearAll: () => storage.clearAll(),
};

export const saveSecurely = (
  keyValuePairs: { key: string; value: string }[]
) => {
  try {
    for (const pair of keyValuePairs) {
      if (pair.key && pair.value !== undefined) {
        storage.set(pair.key, pair.value);
      }
    }
  } catch (error) {
    console.error("Error saving values securely:", error);
  }
};

export const getStoredValues = (keys: string[]) => {
  const values: any = {};

  try {
    for (const key of keys) {
      values[key] = storage.getString(key);
    }
  } catch (error) {
    console.error("Error retrieving stored values:", error);
  }

  return values;
};

export const deleteStoredValues = (keys: string[]) => {
  try {
    for (const key of keys) {
      storage.delete(key);
    }
  } catch (error) {
    console.error("Error deleting stored values:", error);
  }
};
