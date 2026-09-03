export type Position = 'GK' | 'DEF' | 'CM' | 'ST';

export interface Player {
  id: string;
  name: string;
  position: Position;
  overall: number;
  /** True for curated real-world retired players ("Icons"), as opposed to generated ones. */
  isIcon: boolean;
}

export type RatingTier = 'Common' | 'Rare' | 'Elite' | 'Legendary';

/** Rating-based status tier, independent of whether the player is an Icon. */
export function getRatingTier(overall: number): RatingTier {
  if (overall >= 90) return 'Legendary';
  if (overall >= 75) return 'Elite';
  if (overall >= 60) return 'Rare';
  return 'Common';
}

export interface SquadSlots {
  GK: Player | null;
  DEF: Player | null;
  CM: [Player | null, Player | null];
  ST: Player | null;
}

/** A human player's chosen icon avatar (id references an entry in AVATAR_OPTIONS). */
export type AvatarId = string;

export interface Team {
  name: string;
  budget: number;
  squad: SquadSlots;
  avatar: AvatarId;
}

export interface GameConfig {
  startingBudget: number;
  bidIncrement: number;
  team1Name: string;
  team2Name: string;
  team1Avatar: AvatarId;
  team2Avatar: AvatarId;
  /** When true, hide every numeric overall rating until the Final Results screen. */
  hideRatings: boolean;
}

export type TeamId = 1 | 2;

export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  CM: 'Central Midfielder',
  ST: 'Striker',
};

/** How many of each position are needed per squad. */
export const SQUAD_REQUIREMENTS: Record<Position, number> = {
  GK: 1,
  DEF: 1,
  CM: 2,
  ST: 1,
};

export function emptySquad(): SquadSlots {
  return { GK: null, DEF: null, CM: [null, null], ST: null };
}

/** Open slots remaining for a position in a squad (0, 1, or 2 for CM). */
export function openSlotsForPosition(squad: SquadSlots, position: Position): number {
  if (position === 'CM') {
    return squad.CM.filter((p) => p === null).length;
  }
  return squad[position] === null ? 1 : 0;
}

export function isSquadFull(squad: SquadSlots): boolean {
  return (
    squad.GK !== null &&
    squad.DEF !== null &&
    squad.ST !== null &&
    squad.CM[0] !== null &&
    squad.CM[1] !== null
  );
}

export function squadTotalOverall(squad: SquadSlots): number {
  const players = [squad.GK, squad.DEF, squad.CM[0], squad.CM[1], squad.ST];
  return players.reduce((sum, p) => sum + (p?.overall ?? 0), 0);
}

export function squadPlayers(squad: SquadSlots): Player[] {
  return [squad.GK, squad.DEF, squad.CM[0], squad.CM[1], squad.ST].filter(
    (p): p is Player => p !== null
  );
}

/** Assigns a won player into the first open slot for their position. Returns a new squad. */
export function assignToSquad(squad: SquadSlots, player: Player): SquadSlots {
  if (player.position === 'CM') {
    const cmIndex = squad.CM[0] === null ? 0 : 1;
    const newCM: [Player | null, Player | null] = [...squad.CM];
    newCM[cmIndex] = player;
    return { ...squad, CM: newCM };
  }
  return { ...squad, [player.position]: player };
}
