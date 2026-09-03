import { RatingTier } from './types';

export const colors = {
  bg: '#071a12',
  surface: '#132c21',
  surfaceAlt: '#1c3a2b',
  pitch: '#0f5132',
  text: '#eef7f1',
  textMuted: '#9fb8ac',
  textInverse: '#ffffff',
  accent: '#ffcc33',
  team1: '#4b93f5',
  team2: '#f15c50',
  border: '#2a4c3c',
  success: '#2fbf5a',
  disabled: '#5c7268',
};

export const TIER_COLORS: Record<RatingTier, string> = {
  Common: '#8fa89b',
  Rare: '#4b93f5',
  Elite: '#a566d9',
  Legendary: '#d4af37',
};

/** Bold condensed display font, loaded via expo-font in App.tsx. Used for
 * headlines, player names, and big numbers - not body text. */
export const fonts = {
  display: 'Anton_400Regular',
};
