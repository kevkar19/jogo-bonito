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

/** How many of each position a squad needs - varies by formation. */
export type FormationRequirements = Record<Position, number>;

/** A squad's slots for one position, in fill order. Length is fixed per game (by formation). */
export type SquadSlots = Record<Position, (Player | null)[]>;

/** A human player's chosen icon avatar (id references an entry in AVATAR_OPTIONS). */
export type AvatarId = string;

export interface Team {
  name: string;
  budget: number;
  squad: SquadSlots;
  avatar: AvatarId;
}

export type BiddingMode = 'auction' | 'draft' | 'sealed';
export type EndMode = 'ovr' | 'matchSim';
export type FormationId = 'classic' | 'balanced' | 'attack' | 'total';

export interface GameConfig {
  startingBudget: number;
  bidIncrement: number;
  team1Name: string;
  team2Name: string;
  team1Avatar: AvatarId;
  team2Avatar: AvatarId;
  /** When true, hide every numeric overall rating until the Final Results screen. */
  hideRatings: boolean;
  biddingMode: BiddingMode;
  endMode: EndMode;
  formation: FormationId;
  /** Seconds allowed per bidding decision, or null for no timer. */
  timerSeconds: number | null;
}

export type TeamId = 1 | 2;

export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  CM: 'Central Midfielder',
  ST: 'Striker',
};

export interface FormationOption {
  label: string;
  description: string;
  requirements: FormationRequirements;
}

/**
 * Squad-size presets. Real formation numbers (4-3-3 etc.) don't map cleanly
 * onto this game's four broad position buckets, so these are flavored as
 * squad-building styles instead, scaled to stay well within the curated
 * Icon roster's size per position.
 */
export const FORMATIONS: Record<FormationId, FormationOption> = {
  classic: {
    label: 'Classic',
    description: '1 GK, 1 DEF, 2 CM, 1 ST - 5 players, quick games',
    requirements: { GK: 1, DEF: 1, CM: 2, ST: 1 },
  },
  balanced: {
    label: 'Balanced',
    description: '1 GK, 2 DEF, 2 CM, 1 ST - 6 players, solid backline',
    requirements: { GK: 1, DEF: 2, CM: 2, ST: 1 },
  },
  attack: {
    label: 'Total Attack',
    description: '1 GK, 1 DEF, 2 CM, 2 ST - 6 players, goals galore',
    requirements: { GK: 1, DEF: 1, CM: 2, ST: 2 },
  },
  total: {
    label: 'Total Football',
    description: '1 GK, 2 DEF, 3 CM, 2 ST - 8 players, the full experience',
    requirements: { GK: 1, DEF: 2, CM: 3, ST: 2 },
  },
};

export function emptySquad(requirements: FormationRequirements): SquadSlots {
  const squad = {} as SquadSlots;
  (Object.keys(requirements) as Position[]).forEach((position) => {
    squad[position] = new Array(requirements[position]).fill(null);
  });
  return squad;
}

/** Open slots remaining for a position in a squad. */
export function openSlotsForPosition(squad: SquadSlots, position: Position): number {
  return squad[position].filter((p) => p === null).length;
}

export function isSquadFull(squad: SquadSlots): boolean {
  return (Object.keys(squad) as Position[]).every((position) =>
    squad[position].every((p) => p !== null)
  );
}

export function squadTotalOverall(squad: SquadSlots): number {
  return squadPlayers(squad).reduce((sum, p) => sum + p.overall, 0);
}

export function squadPlayers(squad: SquadSlots): Player[] {
  return (Object.keys(squad) as Position[]).flatMap((position) =>
    squad[position].filter((p): p is Player => p !== null)
  );
}

/** Assigns a won player into the first open slot for their position. Returns a new squad. */
export function assignToSquad(squad: SquadSlots, player: Player): SquadSlots {
  const slots = squad[player.position];
  const openIndex = slots.findIndex((p) => p === null);
  if (openIndex === -1) return squad; // shouldn't happen - caller checks eligibility first
  const newSlots = [...slots];
  newSlots[openIndex] = player;
  return { ...squad, [player.position]: newSlots };
}
