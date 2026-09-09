import React, { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, secureTextEntry, ...rest }: TextFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
        {label}
      </Text>
      <View className="justify-center">
        <TextInput
          placeholderTextColor="#9ca3af"
          className={`bg-white dark:bg-surface-cardDark border border-gray-200 dark:border-gray-700 rounded-card px-4 py-3 text-base text-surface-dark dark:text-white ${
            isPassword ? "pr-12" : ""
          }`}
          secureTextEntry={isPassword && !isVisible}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setIsVisible((prev) => !prev)}
            hitSlop={8}
            className="absolute right-3"
          >
            <Text style={{ fontSize: 18 }}>{isVisible ? "🙈" : "👁️"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-accent-coral text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
