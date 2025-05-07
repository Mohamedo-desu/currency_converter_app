import { Theme } from "@react-navigation/native";

declare module "@react-navigation/native" {
  export interface CustomTheme extends Theme {
    colors: Theme["colors"] & {
      gray: {
        500: string;
        400: string;
        300: string;
        200: string;
        100: string;
        50: string;
      };
    };
  }

  export function useTheme(): CustomTheme;
}
