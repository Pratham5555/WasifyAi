import { Colors } from '../theme';
import type { WasteCategory } from '../types';

export interface CategoryInfo {
  emoji: string;
  color: string;
  bgColor: string;
  label: string;
  recyclable: boolean;
  hazardous: boolean;
}

export const CATEGORY_INFO: Record<WasteCategory, CategoryInfo> = {
  Plastic: {
    emoji: '🧴',
    color: Colors.plastic,
    bgColor: '#0D3B52',
    label: 'Plastic',
    recyclable: true,
    hazardous: false,
  },
  Cardboard: {
    emoji: '📦',
    color: Colors.cardboard,
    bgColor: '#52350D',
    label: 'Cardboard',
    recyclable: true,
    hazardous: false,
  },
  Glass: {
    emoji: '🍶',
    color: Colors.glass,
    bgColor: '#0D3D38',
    label: 'Glass',
    recyclable: true,
    hazardous: false,
  },
  Metal: {
    emoji: '🥫',
    color: Colors.metal,
    bgColor: '#2A3540',
    label: 'Metal',
    recyclable: true,
    hazardous: false,
  },
  Paper: {
    emoji: '📄',
    color: Colors.paper,
    bgColor: '#3D3D3D',
    label: 'Paper',
    recyclable: true,
    hazardous: false,
  },
  Organic: {
    emoji: '🌿',
    color: Colors.organic,
    bgColor: '#1A3D1C',
    label: 'Organic',
    recyclable: false,
    hazardous: false,
  },
  'E-Waste': {
    emoji: '💻',
    color: Colors.eWaste,
    bgColor: '#3A1A52',
    label: 'E-Waste',
    recyclable: true,
    hazardous: true,
  },
  Textile: {
    emoji: '👕',
    color: Colors.textile,
    bgColor: '#52103A',
    label: 'Textile',
    recyclable: true,
    hazardous: false,
  },
  Medical: {
    emoji: '💊',
    color: Colors.medical,
    bgColor: '#521010',
    label: 'Medical',
    recyclable: false,
    hazardous: true,
  },
  Battery: {
    emoji: '🔋',
    color: Colors.battery,
    bgColor: '#524010',
    label: 'Battery',
    recyclable: true,
    hazardous: true,
  },
  Styrofoam: {
    emoji: '☁️',
    color: Colors.styrofoam,
    bgColor: '#3D3D3D',
    label: 'Styrofoam',
    recyclable: false,
    hazardous: false,
  },
  'General Trash': {
    emoji: '🗑️',
    color: Colors.generalTrash,
    bgColor: '#1A2730',
    label: 'General Trash',
    recyclable: false,
    hazardous: false,
  },
};

export function getCategoryInfo(category: string): CategoryInfo {
  return CATEGORY_INFO[category as WasteCategory] || CATEGORY_INFO['General Trash'];
}

export function getPointsForCategory(category: string): number {
  const hazardous = ['E-Waste', 'Battery', 'Medical'];
  const medium = ['Glass', 'Metal', 'Textile'];
  if (hazardous.includes(category)) return 25;
  if (medium.includes(category)) return 12;
  if (category === 'General Trash') return 5;
  return 10;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getStreakMessage(days: number): string {
  if (days === 0) return 'Start your streak today!';
  if (days === 1) return '1 day streak 🌱';
  if (days < 7) return `${days} day streak 🔥`;
  if (days < 30) return `${days} day streak ⚡`;
  return `${days} day streak 🌟`;
}
