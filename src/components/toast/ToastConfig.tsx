import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import React from "react";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";
import { BaseToast, ToastProps } from "react-native-toast-message";

export default {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.success,
        backgroundColor: Colors.lightGray[100],
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: moderateScale(16) }}
      text1Style={{
        color: Colors.success,
        fontSize: RFValue(14),
        fontFamily: Fonts.Bold,
      }}
      text2Style={{
        color: Colors.darkGray[400],
        fontSize: RFValue(15),
        fontFamily: Fonts.Regular,
      }}
    />
  ),
  error: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.error,
        backgroundColor: Colors.lightGray[100],
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: moderateScale(16) }}
      text1Style={{
        color: Colors.error,
        fontSize: RFValue(14),
        fontFamily: Fonts.Bold,
      }}
      text2Style={{
        color: Colors.darkGray[400],
        fontSize: RFValue(14),
        fontFamily: Fonts.Regular,
      }}
    />
  ),
  warning: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.warning,
        backgroundColor: Colors.lightGray[100],
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: moderateScale(16) }}
      text1Style={{
        color: Colors.warning,
        fontSize: RFValue(14),
        fontFamily: Fonts.Bold,
      }}
      text2Style={{
        color: Colors.darkGray[400],
        fontSize: RFValue(15),
        fontFamily: Fonts.Regular,
      }}
    />
  ),
  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.primary,
        backgroundColor: Colors.lightGray[100],
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: moderateScale(16) }}
      text1Style={{
        color: Colors.primary,
        fontSize: RFValue(14),
        fontFamily: Fonts.Bold,
      }}
      text2Style={{
        color: Colors.darkGray[400],
        fontSize: RFValue(15),
        fontFamily: Fonts.Regular,
      }}
    />
  ),
};
