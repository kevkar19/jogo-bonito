import { Player, Team, TeamId, squadPlayers } from './types';

export type MatchEventKind =
  | 'goal'
  | 'yellowCard'
  | 'redCard'
  | 'fullTimeRegulation'
  | 'fullTimeExtraTime'
  | 'shootoutStart'
  | 'penaltyScored'
  | 'penaltyMissed';

export interface MatchEvent {
  /** Display label only - e.g. "23'", "90+4'", "Pen 3". Not used for sorting. */
  minuteLabel: string;
  /** Null for neutral commentary (full-time whistle, shootout intro) that isn't either side's event. */
  team: TeamId | null;
  kind: MatchEventKind;
  player: string | null;
  /** The narrative sentence shown in the commentary banner and the event log. */
  commentary: string;
}

export interface MatchResult {
  events: MatchEvent[];
  regulationScore: Record<TeamId, number>;
  /** Regulation + extra time goals - does not include the penalty shootout. */
  finalScore: Record<TeamId, number>;
  wentToExtraTime: boolean;
  wentToPenalties: boolean;
  penaltyScore: Record<TeamId, number> | null;
  /** Always decisive - a tie after extra time goes to penalties. */
  winner: TeamId;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

function squadAttackers(team: Team): Player[] {
  const players = squadPlayers(team.squad).filter((p) => p.position === 'ST' || p.position === 'CM');
  return players.length > 0 ? players : squadPlayers(team.squad);
}

function pickAssister(team: Team, excludeName: string): Player | null {
  const candidates = squadPlayers(team.squad).filter((p) => p.name !== excludeName);
  if (candidates.length === 0) return null;
  const midfielders = candidates.filter((p) => p.position === 'CM');
  return randomFrom(midfielders.length > 0 ? midfielders : candidates);
}

/** Outfield-first, GK-last kick order (with wraparound repeats for small squads). */
function penaltyOrder(team: Team): Player[] {
  const priority = (p: Player) => (p.position === 'ST' ? 0 : p.position === 'CM' ? 1 : p.position === 'DEF' ? 2 : 3);
  return [...squadPlayers(team.squad)].sort((a, b) => priority(a) - priority(b));
}

function penaltySuccessChance(player: Player): number {
  return clamp(0.6 + (player.overall - 65) / 150, 0.45, 0.93);
}

const GOAL_WITH_ASSIST = [
  (scorer: string, assister: string) => `${scorer} finishes off a slick team move, assisted by ${assister}!`,
  (scorer: string, assister: string) => `${scorer} taps in from close range after a pinpoint cross from ${assister}!`,
  (scorer: string, assister: string) => `${scorer} heads it home from a corner delivered by ${assister}!`,
  (scorer: string, assister: string) => `${scorer} smashes it home after a clever lay-off from ${assister}!`,
  (scorer: string, assister: string) => `${scorer} makes no mistake, tapping in ${assister}'s low driven cross!`,
];
const GOAL_SOLO = [
  (scorer: string) => `${scorer} scores an outside-the-box screamer!`,
  (scorer: string) => `${scorer} curls a brilliant free-kick into the top corner!`,
  (scorer: string) => `${scorer} finishes off a mazy solo run!`,
  (scorer: string) => `${scorer} slots home a cool, calm penalty!`,
  (scorer: string) => `${scorer} pounces on a defensive error to slot home!`,
  (scorer: string) => `${scorer} rifles a first-time volley into the roof of the net!`,
];
const YELLOW_TEMPLATES = [
  (p: string) => `${p} is booked for a late challenge.`,
  (p: string) => `${p} picks up a yellow card for dissent.`,
  (p: string) => `${p} goes into the book for a tactical foul.`,
];
const RED_TEMPLATES = [
  (p: string) => `${p} sees red after a reckless, studs-up challenge!`,
  (p: string) => `${p} is sent off for a second bookable offense!`,
];
const PENALTY_SCORED_TEMPLATES = [
  (p: string) => `${p} steps up... and slots it away coolly!`,
  (p: string) => `${p} sends the keeper the wrong way. Scores!`,
  (p: string) => `${p} smashes it straight down the middle. In!`,
];
const PENALTY_MISSED_TEMPLATES = [
  (p: string) => `${p} steps up... and blazes it over the bar!`,
  (p: string) => `${p}'s effort is saved by the keeper!`,
  (p: string) => `${p} strikes it wide. Heartbreak!`,
];

interface DraftEvent extends MatchEvent {
  sortKey: number;
}

function finalize(events: DraftEvent[]): MatchEvent[] {
  return events
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _sortKey, ...rest }) => rest);
}

function addGoalEvents(
  out: DraftEvent[],
  teamId: TeamId,
  team: Team,
  count: number,
  minMinute: number,
  maxMinute: number
) {
  for (let i = 0; i < count; i++) {
    const minute = randInt(minMinute, maxMinute);
    const scorer = randomFrom(squadAttackers(team));
    const assister = Math.random() < 0.65 ? pickAssister(team, scorer.name) : null;
    const commentary = assister
      ? randomFrom(GOAL_WITH_ASSIST)(scorer.name, assister.name)
      : randomFrom(GOAL_SOLO)(scorer.name);
    out.push({
      sortKey: minute,
      minuteLabel: `${minute}'`,
      team: teamId,
      kind: 'goal',
      player: scorer.name,
      commentary,
    });
  }
}

function addCardEvents(
  out: DraftEvent[],
  teamA: Team,
  teamB: Team,
  minMinute: number,
  maxMinute: number,
  fewer = false
) {
  const r = Math.random();
  const numCards = r < (fewer ? 0.6 : 0.35) ? 0 : r < 0.7 ? 1 : r < 0.9 ? 2 : 3;
  for (let i = 0; i < numCards; i++) {
    const teamId: TeamId = Math.random() < 0.5 ? 1 : 2;
    const team = teamId === 1 ? teamA : teamB;
    const player = randomFrom(squadPlayers(team.squad));
    const minute = randInt(minMinute, maxMinute);
    const isRed = Math.random() < 0.12;
    out.push({
      sortKey: minute,
      minuteLabel: `${minute}'`,
      team: teamId,
      kind: isRed ? 'redCard' : 'yellowCard',
      player: player.name,
      commentary: isRed ? randomFrom(RED_TEMPLATES)(player.name) : randomFrom(YELLOW_TEMPLATES)(player.name),
    });
  }
}

function fullTimeMarker(
  score: Record<TeamId, number>,
  tied: boolean,
  phase: 'regulation' | 'extraTime'
): DraftEvent {
  const stoppage = randInt(1, 6);
  const baseMinute = phase === 'regulation' ? 90 : 120;
  const commentary =
    phase === 'regulation'
      ? tied
        ? `Full-time in normal time: it finishes level at ${score[1]}-${score[2]}. We're heading to extra time!`
        : `Full-time! The match finishes ${score[1]}-${score[2]}.`
      : tied
        ? `Extra time is over and it's still level at ${score[1]}-${score[2]}. This one's going to penalties!`
        : `Extra time is over! The match finishes ${score[1]}-${score[2]}.`;
  return {
    sortKey: baseMinute + stoppage / 100,
    minuteLabel: `${baseMinute}+${stoppage}'`,
    team: null,
    kind: phase === 'regulation' ? 'fullTimeRegulation' : 'fullTimeExtraTime',
    player: null,
    commentary,
  };
}

/**
 * Straightforward best-of-5-then-sudden-death shootout - no early stopping
 * once a side is mathematically safe, since that's a minor realism detail
 * not worth the extra branching for a bonus mode's flavor text.
 */
function simulateShootout(teamA: Team, teamB: Team): { events: MatchEvent[]; score: Record<TeamId, number> } {
  const events: DraftEvent[] = [
    {
      sortKey: 0,
      minuteLabel: 'PENS',
      team: null,
      kind: 'shootoutStart',
      player: null,
      commentary: "It's penalties! Sudden drama to decide the winner.",
    },
  ];

  const orders: Record<TeamId, Player[]> = { 1: penaltyOrder(teamA), 2: penaltyOrder(teamB) };
  const score: Record<TeamId, number> = { 1: 0, 2: 0 };
  let sortKey = 1;

  const takeRound = (round: number) => {
    ([1, 2] as TeamId[]).forEach((teamId) => {
      const order = orders[teamId];
      const kicker = order[round % order.length];
      const scored = Math.random() < penaltySuccessChance(kicker);
      if (scored) score[teamId] += 1;
      events.push({
        sortKey: sortKey++,
        minuteLabel: `Pen ${round + 1}`,
        team: teamId,
        kind: scored ? 'penaltyScored' : 'penaltyMissed',
        player: kicker.name,
        commentary: scored
          ? randomFrom(PENALTY_SCORED_TEMPLATES)(kicker.name)
          : randomFrom(PENALTY_MISSED_TEMPLATES)(kicker.name),
      });
    });
  };

  for (let round = 0; round < 5; round++) takeRound(round);
  let round = 5;
  while (score[1] === score[2]) {
    takeRound(round);
    round++;
  }

  return { events: finalize(events), score };
}

/**
 * How much a rating-strength gap skews expected goals. Larger = more upsets.
 * Tuned so a clearly stronger squad wins roughly 65% of the time rather than
 * being a near-lock - football is not that predictable.
 */
const RATING_GAP_DIVISOR = 65;

/**
 * Simulates a full match between two drafted squads: each side's attack
 * rating (CM + ST average) against the opponent's defense rating (GK + DEF
 * average) sets an expected-goals value driving a Poisson-style random goal
 * count, plus a scattering of card incidents for flavor. A tie after 90
 * minutes goes to extra time (goals scaled down for tighter, tenser football)
 * and, if still level, a penalty shootout - this end mode always crowns a
 * decisive winner rather than accepting a draw.
 */
export function simulateMatch(teamA: Team, teamB: Team): MatchResult {
  const xgA = clamp(1.4 + (attackStrength(teamA) - defenseStrength(teamB)) / RATING_GAP_DIVISOR, 0.25, 4.5);
  const xgB = clamp(1.4 + (attackStrength(teamB) - defenseStrength(teamA)) / RATING_GAP_DIVISOR, 0.25, 4.5);

  const regGoalsA = randomGoals(xgA);
  const regGoalsB = randomGoals(xgB);
  const regulationScore: Record<TeamId, number> = { 1: regGoalsA, 2: regGoalsB };

  const regDraft: DraftEvent[] = [];
  addGoalEvents(regDraft, 1, teamA, regGoalsA, 1, 90);
  addGoalEvents(regDraft, 2, teamB, regGoalsB, 1, 90);
  addCardEvents(regDraft, teamA, teamB, 1, 90);

  const tiedAfterReg = regGoalsA === regGoalsB;
  const events: MatchEvent[] = [...finalize(regDraft), fullTimeMarker(regulationScore, tiedAfterReg, 'regulation')];

  let finalScore = regulationScore;
  let wentToExtraTime = false;
  let wentToPenalties = false;
  let penaltyScore: Record<TeamId, number> | null = null;
  let winner: TeamId;

  if (!tiedAfterReg) {
    winner = regGoalsA > regGoalsB ? 1 : 2;
  } else {
    wentToExtraTime = true;
    const etXgA = Math.max(0.05, xgA * 0.35);
    const etXgB = Math.max(0.05, xgB * 0.35);
    const etGoalsA = randomGoals(etXgA);
    const etGoalsB = randomGoals(etXgB);

    const etDraft: DraftEvent[] = [];
    addGoalEvents(etDraft, 1, teamA, etGoalsA, 91, 120);
    addGoalEvents(etDraft, 2, teamB, etGoalsB, 91, 120);
    addCardEvents(etDraft, teamA, teamB, 91, 120, true);

    finalScore = { 1: regGoalsA + etGoalsA, 2: regGoalsB + etGoalsB };
    const tiedAfterEt = finalScore[1] === finalScore[2];
    events.push(...finalize(etDraft), fullTimeMarker(finalScore, tiedAfterEt, 'extraTime'));

    if (!tiedAfterEt) {
      winner = finalScore[1] > finalScore[2] ? 1 : 2;
    } else {
      wentToPenalties = true;
      const shootout = simulateShootout(teamA, teamB);
      events.push(...shootout.events);
      penaltyScore = shootout.score;
      winner = shootout.score[1] > shootout.score[2] ? 1 : 2;
    }
  }

  return { events, regulationScore, finalScore, wentToExtraTime, wentToPenalties, penaltyScore, winner };
}
