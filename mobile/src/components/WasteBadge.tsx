import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryInfo } from '../utils/wasteCategories';
import { BorderRadius, FontSize, FontWeight } from '../theme';

interface WasteBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export default function WasteBadge({ category, size = 'md', showEmoji = true }: WasteBadgeProps) {
  const info = getCategoryInfo(category);

  const sizeMap = {
    sm: { fontSize: FontSize.xs, padding: 4, paddingH: 8, emojiSize: 12 },
    md: { fontSize: FontSize.sm, padding: 6, paddingH: 12, emojiSize: 16 },
    lg: { fontSize: FontSize.md, padding: 8, paddingH: 16, emojiSize: 20 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: info.bgColor,
          borderColor: info.color,
          paddingVertical: sizeMap.padding,
          paddingHorizontal: sizeMap.paddingH,
        },
      ]}
    >
      {showEmoji && (
        <Text style={{ fontSize: sizeMap.emojiSize, marginRight: 4 }}>{info.emoji}</Text>
      )}
      <Text style={[styles.label, { color: info.color, fontSize: sizeMap.fontSize }]}>
        {category}
      </Text>
      {info.hazardous && (
        <Text style={{ fontSize: sizeMap.emojiSize - 2, marginLeft: 4 }}>⚠️</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: FontWeight.semibold,
  },
});
