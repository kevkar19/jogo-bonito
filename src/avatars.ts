import Ionicons from '@expo/vector-icons/build/Ionicons';
import { AvatarId, Position } from './types';

export interface AvatarOption {
  id: AvatarId;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

/** Small preset list of icon avatars human players choose from during setup. */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'flame', icon: 'flame', color: '#e0483e' },
  { id: 'flash', icon: 'flash', color: '#f2b705' },
  { id: 'star', icon: 'star', color: '#e6a817' },
  { id: 'shield', icon: 'shield', color: '#2f7de1' },
  { id: 'rocket', icon: 'rocket', color: '#8e44ad' },
  { id: 'diamond', icon: 'diamond', color: '#17a589' },
  { id: 'paw', icon: 'paw', color: '#a0522d' },
  { id: 'skull', icon: 'skull', color: '#4a4a4a' },
];

export function getAvatarOption(id: AvatarId): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? AVATAR_OPTIONS[0];
}

/** Generic silhouette-style icon + color used for a generated soccer player's card, by position. */
export const POSITION_AVATAR: Record<Position, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  GK: { icon: 'hand-left', color: '#e6a817' },
  DEF: { icon: 'shield', color: '#2f7de1' },
  CM: { icon: 'compass', color: '#17a589' },
  ST: { icon: 'football', color: '#e0483e' },
};

