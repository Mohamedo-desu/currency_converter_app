import * as Device from "expo-device";

export const getDeviceInfo = () => {
  return {
    deviceName: Device.deviceName || "Unknown",
    deviceType: Device.deviceType || "Unknown",
    modelName: Device.modelName || "Unknown",
    brand: Device.brand || "Unknown",
    manufacturer: Device.manufacturer || "Unknown",
    osName: Device.osName || "Unknown",
    osVersion: Device.osVersion || "Unknown",
  };
};
