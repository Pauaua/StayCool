import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...rest }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#9ca3af"
        className="bg-white dark:bg-surface-cardDark border border-gray-200 dark:border-gray-700 rounded-card px-4 py-3 text-base text-surface-dark dark:text-white"
        {...rest}
      />
      {error ? <Text className="text-accent-coral text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
