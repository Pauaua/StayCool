import React from "react";
import { Image, Pressable, View } from "react-native";

interface StarToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

// Toggle ancho con sol/luna en vez del típico pulgar circular. Usa el
// moradito de la paleta de la app como color de "activado".
export function StarToggle({ value, onValueChange }: StarToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={{ width: 72, height: 36 }}
      className={`rounded-full justify-center px-1.5 ${
        value ? "bg-pastel-purple" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <View style={{ alignItems: value ? "flex-end" : "flex-start" }}>
        <View
          className="w-7 h-7 rounded-full bg-white items-center justify-center shadow-sm"
          style={{ overflow: "visible" }}
        >
          <Image
            source={value ? require("../../../assets/images/solazo.png") : require("../../../assets/images/lunita.png")}
            style={{ width: 34, height: 34 }}
            resizeMode="contain"
          />
        </View>
      </View>
    </Pressable>
  );
}
