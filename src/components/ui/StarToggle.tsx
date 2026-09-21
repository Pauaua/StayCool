import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, useColorScheme } from "react-native";

interface StarToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const TRACK_WIDTH = 72;
const TRACK_HEIGHT = 36;
const PADDING = 6;
const THUMB = 28;
const TRAVEL = TRACK_WIDTH - PADDING * 2 - THUMB;

// Toggle ancho con sol/luna en vez del típico pulgar circular. El pulgar se
// desliza girando, el fondo cambia de color y el sol y la luna se funden uno
// en el otro. Usa el moradito de la paleta como color de "activado".
export function StarToggle({ value, onValueChange }: StarToggleProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scheme = useColorScheme();

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.back(1.6)),
      // El color del fondo no soporta el driver nativo, y un mismo Animated
      // no puede mezclar drivers.
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [scheme === "dark" ? "#374151" : "#e5e7eb", "#ecc6ff"],
  });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const sunOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const moonOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          paddingHorizontal: PADDING,
          justifyContent: "center",
          backgroundColor,
        }}
      >
        <Animated.View
          className="rounded-full bg-white items-center justify-center shadow-sm"
          style={{
            width: THUMB,
            height: THUMB,
            overflow: "visible",
            transform: [{ translateX }, { rotate }],
          }}
        >
          <Animated.Image
            source={require("../../../assets/images/lunita.png")}
            style={{ position: "absolute", width: 34, height: 34, opacity: moonOpacity }}
            resizeMode="contain"
          />
          <Animated.Image
            source={require("../../../assets/images/solazo.png")}
            style={{ position: "absolute", width: 34, height: 34, opacity: sunOpacity }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
