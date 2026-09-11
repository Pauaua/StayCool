import React from "react";
import { Text, View } from "react-native";

// Parser de markdown mínimo, hecho a medida para el documento legal (no es
// un parser de markdown genérico): soporta encabezados (##/###), separador
// (---), listas ("- "), citas ("> ") y negrita ("**texto**") inline. No hay
// una librería de markdown instalada en el proyecto y este documento no
// necesita nada más elaborado que esto.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`${keyPrefix}-${i}`} className="font-bold">
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={`${keyPrefix}-${i}`}>{part}</Text>;
  });
}

export function MarkdownLite({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];

  function flushParagraph(key: string) {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ");
    blocks.push(
      <Text key={key} className="text-sm text-surface-dark dark:text-white mb-3" style={{ lineHeight: 20 }}>
        {renderInline(text, key)}
      </Text>
    );
    paragraphBuffer = [];
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const key = `l${index}`;

    if (line === "") {
      flushParagraph(key);
      return;
    }
    if (line === "---") {
      flushParagraph(key);
      blocks.push(
        <View key={key} style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 12 }} />
      );
      return;
    }
    if (line.startsWith("### ")) {
      flushParagraph(key);
      blocks.push(
        <Text key={key} className="text-base font-bold text-surface-dark dark:text-white mt-3 mb-1">
          {line.slice(4)}
        </Text>
      );
      return;
    }
    if (line.startsWith("## ")) {
      flushParagraph(key);
      blocks.push(
        <Text key={key} className="text-lg font-bold text-brand-500 mt-4 mb-2">
          {line.slice(3)}
        </Text>
      );
      return;
    }
    if (line.startsWith("> ")) {
      flushParagraph(key);
      blocks.push(
        <View
          key={key}
          className="mb-3"
          style={{ borderLeftWidth: 4, borderLeftColor: "#d1d5db", paddingLeft: 12 }}
        >
          <Text className="text-sm italic text-gray-500 dark:text-gray-400" style={{ lineHeight: 20 }}>
            {renderInline(line.slice(2), key)}
          </Text>
        </View>
      );
      return;
    }
    if (line.startsWith("- ")) {
      flushParagraph(key);
      blocks.push(
        <View key={key} className="flex-row mb-1.5 pl-1">
          <Text className="text-sm text-surface-dark dark:text-white mr-1.5">•</Text>
          <Text className="text-sm text-surface-dark dark:text-white flex-1" style={{ lineHeight: 20 }}>
            {renderInline(line.slice(2), key)}
          </Text>
        </View>
      );
      return;
    }

    paragraphBuffer.push(line);
  });
  flushParagraph("last");

  return <View>{blocks}</View>;
}
