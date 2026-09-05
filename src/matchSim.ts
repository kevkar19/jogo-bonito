import { Team, TeamId, squadPlayers } from './types';

export interface MatchEvent {
  minute: number;
  team: TeamId;
  scorer: string;
}

export interface MatchResult {
  score: Record<TeamId, number>;
  events: MatchEvent[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function attackStrength(team: Team): number {
  const players = squadPlayers(team.squad).filter((p) => p.position === 'CM' || p.position === 'ST');
  if (players.length === 0) return 50;
  return players.reduce((sum, p) => sum + p.overall, 0) / players.length;
}

function defenseStrength(team: Team): number {
  const players = squadPlayers(team.squad).filter((p) => p.position === 'GK' || p.position === 'DEF');
  if (players.length === 0) return 50;
  return players.reduce((sum, p) => sum + p.overall, 0) / players.length;
}

/** Random non-negative integer goal count from an expected-goals value, via Knuth's Poisson algorithm. */
function randomGoals(xg: number): number {
  const l = Math.exp(-xg);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= Math.random();
  } while (p > l);
  return k - 1;
}

function pickScorer(team: Team): string {
  const attackers = squadPlayers(team.squad).filter((p) => p.position === 'ST' || p.position === 'CM');
  const pool = attackers.length > 0 ? attackers : squadPlayers(team.squad);
  if (pool.length === 0) return 'Unknown';
  return pool[Math.floor(Math.random() * pool.length)].name;
}

/**
 * Simulates a match between two drafted squads: each side's attack rating
 * (CM + ST average) against the opponent's defense rating (GK + DEF average)
 * sets an expected-goals value, which then drives a Poisson-style random
 * goal count. Purely for the "Match Simulation" end mode - an alternative,
 * more dramatic finish than a flat total-rating comparison.
 */
export function simulateMatch(teamA: Team, teamB: Team): MatchResult {
  const xgA = clamp(1.4 + (attackStrength(teamA) - defenseStrength(teamB)) / 12, 0.2, 5);
  const xgB = clamp(1.4 + (attackStrength(teamB) - defenseStrength(teamA)) / 12, 0.2, 5);

  const goalsA = randomGoals(xgA);
  const goalsB = randomGoals(xgB);

  const events: MatchEvent[] = [];
  for (let i = 0; i < goalsA; i++) {
    events.push({ minute: 1 + Math.floor(Math.random() * 90), team: 1, scorer: pickScorer(teamA) });
  }
  for (let i = 0; i < goalsB; i++) {
    events.push({ minute: 1 + Math.floor(Math.random() * 90), team: 2, scorer: pickScorer(teamB) });
  }
  events.sort((a, b) => a.minute - b.minute);

  return { score: { 1: goalsA, 2: goalsB }, events };
}

/** Null for a draw. */
export function matchWinner(result: MatchResult): TeamId | null {
  if (result.score[1] === result.score[2]) return null;
  return result.score[1] > result.score[2] ? 1 : 2;
}
