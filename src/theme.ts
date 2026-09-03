import { RatingTier } from './types';

export const colors = {
  bg: '#0b3d2e',
  surface: '#ffffff',
  surfaceAlt: '#f2f7f4',
  pitch: '#0f5132',
  text: '#0b1f17',
  textMuted: '#5b6b63',
  textInverse: '#ffffff',
  accent: '#ffcc33',
  team1: '#2f7de1',
  team2: '#e0483e',
  border: '#d8e3dd',
  success: '#1e8e3e',
  disabled: '#c9d3ce',
};

export const TIER_COLORS: Record<RatingTier, string> = {
  Common: '#7c8b83',
  Rare: '#2f7de1',
  Elite: '#8e44ad',
  Legendary: '#d4af37',
};
