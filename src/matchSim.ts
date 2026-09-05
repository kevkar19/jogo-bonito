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

function weightedRandom<T>(items: T[], weightFn: (item: T) => number): T {
  const weights = items.map(weightFn);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * A random minute in range that hasn't been used yet this phase - two
 * separate incidents landing on the exact same minute reads as a rendering
 * duplicate even though it isn't one, so each phase's incidents (goals and
 * cards together) get distinct minutes.
 */
function uniqueMinute(used: Set<number>, min: number, max: number): number {
  for (let attempt = 0; attempt < 50; attempt++) {
    const minute = randInt(min, max);
    if (!used.has(minute)) {
      used.add(minute);
      return minute;
    }
  }
  // Range exhausted (shouldn't happen at this game's event volume) - fall
  // back to a duplicate rather than looping forever.
  const minute = randInt(min, max);
  used.add(minute);
  return minute;
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

function pickAssisterFrom(candidates: Player[]): Player {
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

/**
 * Real-world reputations for a handful of the curated Icons, layered on top
 * of the base simulation: some players are simply more likely to be the one
 * who scores (or takes a rash swing at an opponent) than a plain rating
 * number would suggest.
 */
interface RivalryTrait {
  opponentName: string;
  extraRedBias: number;
  line: (opponentName: string, player: string) => string;
}

interface PlayerTraits {
  /** Multiplier on being the player selected for a card incident. */
  cardProneness?: number;
  /** Multiplier on a card (once this player is picked) being a straight red. */
  redCardBias?: number;
  /** Multiplier on being picked as a goal's scorer - higher for prolific finishers. */
  scoringWeight?: number;
  specialGoalChance?: number;
  specialGoalLines?: ((scorer: string) => string)[];
  specialRedChance?: number;
  specialRedLines?: ((player: string) => string)[];
  rivalry?: RivalryTrait;
}

const PLAYER_TRAITS: Record<string, PlayerTraits> = {
  'Sergio Ramos': {
    cardProneness: 4,
    redCardBias: 2.5,
    rivalry: {
      opponentName: 'Lionel Messi',
      extraRedBias: 2.2,
      line: (opponent, player) =>
        `${player} scythes down ${opponent} with a reckless, studs-up tackle - the two have history! Red card, no hesitation from the referee.`,
    },
  },
  'Zinedine Zidane': {
    cardProneness: 1.6,
    redCardBias: 2.2,
    specialRedChance: 0.6,
    specialRedLines: [
      (p) => `${p} snaps after a war of words and headbutts his marker square in the chest! Straight red - scenes reminiscent of 2006!`,
    ],
  },
  'Diego Maradona': {
    scoringWeight: 1.3,
    specialGoalChance: 0.18,
    specialGoalLines: [
      (p) => `${p} rises above the keeper and punches the ball into the net with his fist! The referee doesn't spot it - the Hand of God strikes again!`,
    ],
  },
  'Luis Suarez': {
    cardProneness: 1.7,
    redCardBias: 1.6,
    specialRedChance: 0.45,
    specialRedLines: [
      (p) => `${p} throws himself in front of the ball and palms it away off the line! Last man - it's a straight red, but he's denied a certain goal! Shades of South Africa 2010!`,
      (p) => `${p} appears to catch an opponent's shoulder with his teeth in a coming-together! Total chaos - red card shown!`,
    ],
  },
  'Kylian Mbappe': { scoringWeight: 1.9 },
  'Lionel Messi': { scoringWeight: 1.7 },
  'Cristiano Ronaldo': { scoringWeight: 1.7 },
  'Erling Haaland': { scoringWeight: 1.6 },
  'Pele': { scoringWeight: 1.4 },
  'Ronaldo Nazario': { scoringWeight: 1.4 },
};

function traitsFor(name: string): PlayerTraits {
  return PLAYER_TRAITS[name] ?? {};
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

interface SentOff {
  name: string;
  minute: number;
}

function finalize(events: DraftEvent[]): MatchEvent[] {
  return events
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _sortKey, ...rest }) => rest);
}

function earliestRedCard(cards: DraftEvent[], teamId: TeamId): number | null {
  const reds = cards.filter((c) => c.kind === 'redCard' && c.team === teamId);
  if (reds.length === 0) return null;
  return Math.min(...reds.map((c) => c.sortKey));
}

/**
 * A red card hurts the sent-off side's remaining attack and helps the
 * opponent's - more so the earlier it happens, since more of the match is
 * played a man down. This is what actually makes reds cost a team the game,
 * on top of losing that player as a scorer/assister/penalty taker.
 */
function applyRedCardAdjustment(
  baseXg: number,
  ownRedMinute: number | null,
  oppRedMinute: number | null,
  phaseStart: number,
  phaseEnd: number
): number {
  const span = phaseEnd - phaseStart;
  let xg = baseXg;
  if (ownRedMinute !== null) {
    const remainingFraction = clamp((phaseEnd - ownRedMinute) / span, 0, 1);
    xg *= 1 - 0.4 * remainingFraction;
  }
  if (oppRedMinute !== null) {
    const remainingFraction = clamp((phaseEnd - oppRedMinute) / span, 0, 1);
    xg *= 1 + 0.35 * remainingFraction;
  }
  return Math.max(0.1, xg);
}

function addGoalEvents(
  out: DraftEvent[],
  teamId: TeamId,
  team: Team,
  count: number,
  minMinute: number,
  maxMinute: number,
  usedMinutes: Set<number>,
  sentOff: SentOff[]
) {
  for (let i = 0; i < count; i++) {
    const minute = uniqueMinute(usedMinutes, minMinute, maxMinute);
    const isAvailable = (p: Player) => !sentOff.some((s) => s.name === p.name && s.minute < minute);

    let eligible = squadAttackers(team).filter(isAvailable);
    if (eligible.length === 0) eligible = squadPlayers(team.squad).filter(isAvailable);
    if (eligible.length === 0) eligible = squadAttackers(team); // pathological fallback, shouldn't occur

    const scorer = weightedRandom(eligible, (p) => traitsFor(p.name).scoringWeight ?? 1);
    const scorerTraits = traitsFor(scorer.name);

    let commentary: string;
    if (scorerTraits.specialGoalLines && Math.random() < (scorerTraits.specialGoalChance ?? 0)) {
      commentary = randomFrom(scorerTraits.specialGoalLines)(scorer.name);
    } else {
      const assistCandidates = squadPlayers(team.squad).filter((p) => p.name !== scorer.name && isAvailable(p));
      const assister = Math.random() < 0.65 && assistCandidates.length > 0 ? pickAssisterFrom(assistCandidates) : null;
      commentary = assister
        ? randomFrom(GOAL_WITH_ASSIST)(scorer.name, assister.name)
        : randomFrom(GOAL_SOLO)(scorer.name);
    }

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
  usedMinutes: Set<number>,
  fewer = false
) {
  const r = Math.random();
  const numCards = r < (fewer ? 0.6 : 0.35) ? 0 : r < 0.7 ? 1 : r < 0.9 ? 2 : 3;
  if (numCards === 0) return;

  const candidates: { teamId: TeamId; player: Player }[] = [
    ...squadPlayers(teamA.squad).map((player) => ({ teamId: 1 as TeamId, player })),
    ...squadPlayers(teamB.squad).map((player) => ({ teamId: 2 as TeamId, player })),
  ];
  const sentOffSoFar = new Set<string>();

  for (let i = 0; i < numCards; i++) {
    const available = candidates.filter((c) => !sentOffSoFar.has(c.player.name));
    if (available.length === 0) break;

    const { teamId, player } = weightedRandom(available, (c) => traitsFor(c.player.name).cardProneness ?? 1);
    const opponentSquad = teamId === 1 ? teamB : teamA;
    const traits = traitsFor(player.name);

    let redChance = 0.12 * (traits.redCardBias ?? 1);
    let rivalryTriggered = false;
    if (traits.rivalry && squadPlayers(opponentSquad.squad).some((p) => p.name === traits.rivalry!.opponentName)) {
      redChance *= traits.rivalry.extraRedBias;
      rivalryTriggered = true;
    }

    const isRed = Math.random() < clamp(redChance, 0, 0.85);

    let commentary: string;
    if (isRed && rivalryTriggered && Math.random() < 0.8) {
      commentary = traits.rivalry!.line(traits.rivalry!.opponentName, player.name);
    } else if (isRed && traits.specialRedLines && Math.random() < (traits.specialRedChance ?? 0)) {
      commentary = randomFrom(traits.specialRedLines)(player.name);
    } else {
      commentary = isRed ? randomFrom(RED_TEMPLATES)(player.name) : randomFrom(YELLOW_TEMPLATES)(player.name);
    }

    if (isRed) sentOffSoFar.add(player.name);

    const minute = uniqueMinute(usedMinutes, minMinute, maxMinute);
    out.push({
      sortKey: minute,
      minuteLabel: `${minute}'`,
      team: teamId,
      kind: isRed ? 'redCard' : 'yellowCard',
      player: player.name,
      commentary,
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
 * not worth the extra branching for a bonus mode's flavor text. Anyone sent
 * off earlier in the match (regulation or extra time) is excluded from the
 * kicker order entirely.
 */
function simulateShootout(
  teamA: Team,
  teamB: Team,
  excludeA: Set<string>,
  excludeB: Set<string>
): { events: MatchEvent[]; score: Record<TeamId, number> } {
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

  const fullOrderA = penaltyOrder(teamA);
  const fullOrderB = penaltyOrder(teamB);
  const orders: Record<TeamId, Player[]> = {
    1: fullOrderA.filter((p) => !excludeA.has(p.name)),
    2: fullOrderB.filter((p) => !excludeB.has(p.name)),
  };
  // Safety net: if somehow everyone's excluded, fall back to the full squad.
  if (orders[1].length === 0) orders[1] = fullOrderA;
  if (orders[2].length === 0) orders[2] = fullOrderB;

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
 * average) sets a baseline expected-goals value, adjusted for any red cards
 * along the way (a sent-off player can never score, assist, or take a
 * penalty again, and their side's remaining attack drops while the
 * opponent's rises). A handful of curated Icons carry real-world reputations
 * on top of that - see PLAYER_TRAITS. A tie after 90 minutes goes to extra
 * time (goals scaled down for tighter, tenser football) and, if still level,
 * a penalty shootout - this end mode always crowns a decisive winner rather
 * than accepting a draw.
 */
export function simulateMatch(teamA: Team, teamB: Team): MatchResult {
  const baseXgA = clamp(1.4 + (attackStrength(teamA) - defenseStrength(teamB)) / RATING_GAP_DIVISOR, 0.25, 4.5);
  const baseXgB = clamp(1.4 + (attackStrength(teamB) - defenseStrength(teamA)) / RATING_GAP_DIVISOR, 0.25, 4.5);

  // Cards are decided before goals so a red card's timing can affect both
  // sides' remaining expected goals and exclude the sent-off player.
  const regMinutes = new Set<number>();
  const regCards: DraftEvent[] = [];
  addCardEvents(regCards, teamA, teamB, 1, 90, regMinutes);

  const regRedA = earliestRedCard(regCards, 1);
  const regRedB = earliestRedCard(regCards, 2);

  const xgA = applyRedCardAdjustment(baseXgA, regRedA, regRedB, 1, 90);
  const xgB = applyRedCardAdjustment(baseXgB, regRedB, regRedA, 1, 90);

  const regGoalsA = randomGoals(xgA);
  const regGoalsB = randomGoals(xgB);

  const sentOffA: SentOff[] = regCards
    .filter((c) => c.kind === 'redCard' && c.team === 1)
    .map((c) => ({ name: c.player!, minute: c.sortKey }));
  const sentOffB: SentOff[] = regCards
    .filter((c) => c.kind === 'redCard' && c.team === 2)
    .map((c) => ({ name: c.player!, minute: c.sortKey }));

  const regGoalDraft: DraftEvent[] = [];
  addGoalEvents(regGoalDraft, 1, teamA, regGoalsA, 1, 90, regMinutes, sentOffA);
  addGoalEvents(regGoalDraft, 2, teamB, regGoalsB, 1, 90, regMinutes, sentOffB);

  const regulationScore: Record<TeamId, number> = { 1: regGoalsA, 2: regGoalsB };
  const tiedAfterReg = regGoalsA === regGoalsB;
  const events: MatchEvent[] = [
    ...finalize([...regCards, ...regGoalDraft]),
    fullTimeMarker(regulationScore, tiedAfterReg, 'regulation'),
  ];

  let finalScore = regulationScore;
  let wentToExtraTime = false;
  let wentToPenalties = false;
  let penaltyScore: Record<TeamId, number> | null = null;
  let winner: TeamId;

  if (!tiedAfterReg) {
    winner = regGoalsA > regGoalsB ? 1 : 2;
  } else {
    wentToExtraTime = true;

    const etMinutes = new Set<number>();
    const etCards: DraftEvent[] = [];
    addCardEvents(etCards, teamA, teamB, 91, 120, etMinutes, true);

    const etRedA = earliestRedCard(etCards, 1);
    const etRedB = earliestRedCard(etCards, 2);
    // A regulation red means the whole of extra time is played down a man.
    const ownRedForA = regRedA !== null ? 91 : etRedA;
    const ownRedForB = regRedB !== null ? 91 : etRedB;
    const oppRedForA = regRedB !== null ? 91 : etRedB;
    const oppRedForB = regRedA !== null ? 91 : etRedA;

    const etXgA = applyRedCardAdjustment(Math.max(0.05, baseXgA * 0.35), ownRedForA, oppRedForA, 91, 120);
    const etXgB = applyRedCardAdjustment(Math.max(0.05, baseXgB * 0.35), ownRedForB, oppRedForB, 91, 120);
    const etGoalsA = randomGoals(etXgA);
    const etGoalsB = randomGoals(etXgB);

    const sentOffAThroughEt: SentOff[] = [
      ...sentOffA,
      ...etCards.filter((c) => c.kind === 'redCard' && c.team === 1).map((c) => ({ name: c.player!, minute: c.sortKey })),
    ];
    const sentOffBThroughEt: SentOff[] = [
      ...sentOffB,
      ...etCards.filter((c) => c.kind === 'redCard' && c.team === 2).map((c) => ({ name: c.player!, minute: c.sortKey })),
    ];

    const etGoalDraft: DraftEvent[] = [];
    addGoalEvents(etGoalDraft, 1, teamA, etGoalsA, 91, 120, etMinutes, sentOffAThroughEt);
    addGoalEvents(etGoalDraft, 2, teamB, etGoalsB, 91, 120, etMinutes, sentOffBThroughEt);

    finalScore = { 1: regGoalsA + etGoalsA, 2: regGoalsB + etGoalsB };
    const tiedAfterEt = finalScore[1] === finalScore[2];
    events.push(...finalize([...etCards, ...etGoalDraft]), fullTimeMarker(finalScore, tiedAfterEt, 'extraTime'));

    if (!tiedAfterEt) {
      winner = finalScore[1] > finalScore[2] ? 1 : 2;
    } else {
      wentToPenalties = true;
      const shootout = simulateShootout(
        teamA,
        teamB,
        new Set(sentOffAThroughEt.map((s) => s.name)),
        new Set(sentOffBThroughEt.map((s) => s.name))
      );
      events.push(...shootout.events);
      penaltyScore = shootout.score;
      winner = shootout.score[1] > shootout.score[2] ? 1 : 2;
    }
  }

  return { events, regulationScore, finalScore, wentToExtraTime, wentToPenalties, penaltyScore, winner };
}
