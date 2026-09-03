import { Player, Position, SQUAD_REQUIREMENTS } from './types';

const FIRST_NAMES = [
  'Marco', 'Diego', 'Kwame', 'Lucas', 'Noah', 'Yusuf', 'Mateo', 'Kenji',
  'Liam', 'Rafael', 'Tomas', 'Idris', 'Owen', 'Jamal', 'Enzo', 'Hugo',
  'Felix', 'Amir', 'Bruno', 'Milo', 'Theo', 'Nico', 'Kai', 'Dario',
  'Sami', 'Leo', 'Axel', 'Rio', 'Vince', 'Zane',
];

const LAST_NAMES = [
  'Almeida', 'Okafor', 'Bergman', 'Rossi', 'Novak', 'Diallo', 'Fischer',
  'Bakker', 'Tanaka', 'Moreau', 'Haddad', 'Larsson', 'Costa', 'Weber',
  'Adeyemi', 'Petrov', 'Sato', 'Reyes', 'Kovac', 'Dubois', 'Farrell',
  'Kimura', 'Osei', 'Vidal', 'Hansen', 'Brunner', 'Mendes', 'Talbot',
  'Ekwueme', 'Fontaine',
];

/**
 * Curated real-world players ("Icons") - a mix of retired legends and modern-era
 * stars, bucketed into this game's four positions with realistic ratings.
 */
const ICONS: Record<Position, { name: string; overall: number }[]> = {
  GK: [
    { name: 'Lev Yashin', overall: 90 },
    { name: 'Gianluigi Buffon', overall: 91 },
    { name: 'Iker Casillas', overall: 89 },
    { name: 'Peter Schmeichel', overall: 88 },
    { name: 'Manuel Neuer', overall: 91 },
    { name: 'Thibaut Courtois', overall: 90 },
    { name: 'Alisson Becker', overall: 90 },
    { name: 'Ederson', overall: 88 },
    { name: 'David de Gea', overall: 89 },
    { name: 'Petr Cech', overall: 90 },
    { name: 'Marc-Andre ter Stegen', overall: 89 },
    { name: 'Jordan Pickford', overall: 85 },
  ],
  DEF: [
    { name: 'Franz Beckenbauer', overall: 93 },
    { name: 'Paolo Maldini', overall: 94 },
    { name: 'Fabio Cannavaro', overall: 90 },
    { name: 'Bobby Moore', overall: 89 },
    { name: 'Sergio Ramos', overall: 92 },
    { name: 'Virgil van Dijk', overall: 92 },
    { name: 'Marcelo', overall: 89 },
    { name: 'Dani Alves', overall: 88 },
    { name: 'Thiago Silva', overall: 89 },
    { name: 'Kalidou Koulibaly', overall: 88 },
    { name: 'Trent Alexander-Arnold', overall: 87 },
    { name: 'Andrew Robertson', overall: 87 },
    { name: 'Ruben Dias', overall: 88 },
    { name: 'Kyle Walker', overall: 86 },
    { name: 'Vincent Kompany', overall: 90 },
    { name: 'Gerard Pique', overall: 90 },
    { name: 'Carles Puyol', overall: 91 },
    { name: 'William Saliba', overall: 86 },
    { name: 'Harry Maguire', overall: 83 },
    { name: 'John Arne Riise', overall: 85 },
  ],
  CM: [
    { name: 'Zinedine Zidane', overall: 96 },
    { name: 'Johan Cruyff', overall: 96 },
    { name: 'Diego Maradona', overall: 97 },
    { name: 'Xavi Hernandez', overall: 91 },
    { name: 'Andrea Pirlo', overall: 90 },
    { name: 'Kevin De Bruyne', overall: 93 },
    { name: 'Luka Modric', overall: 92 },
    { name: 'Andres Iniesta', overall: 93 },
    { name: 'Toni Kroos', overall: 90 },
    { name: "N'Golo Kante", overall: 89 },
    { name: 'Frenkie de Jong', overall: 86 },
    { name: 'Bruno Fernandes', overall: 87 },
    { name: 'Paul Pogba', overall: 87 },
    { name: 'Kaka', overall: 90 },
    { name: 'Ronaldinho', overall: 93 },
    { name: 'Steven Gerrard', overall: 90 },
    { name: 'Jordan Henderson', overall: 85 },
    { name: 'Fabinho', overall: 86 },
    { name: 'Thiago Alcantara', overall: 87 },
    { name: 'David Silva', overall: 91 },
    { name: 'Yaya Toure', overall: 90 },
    { name: 'Rodri', overall: 91 },
    { name: 'Bernardo Silva', overall: 89 },
    { name: 'Sergio Busquets', overall: 90 },
    { name: 'Pedri', overall: 88 },
    { name: 'Declan Rice', overall: 87 },
    { name: 'Joshua Kimmich', overall: 90 },
    { name: 'Sam', overall: 99 },
  ],
  ST: [
    { name: 'Pele', overall: 98 },
    { name: 'Ronaldo Nazario', overall: 96 },
    { name: 'Marco van Basten', overall: 93 },
    { name: 'Gerd Muller', overall: 92 },
    { name: 'Eusebio', overall: 91 },
    { name: 'Lionel Messi', overall: 98 },
    { name: 'Cristiano Ronaldo', overall: 97 },
    { name: 'Neymar Jr', overall: 92 },
    { name: 'Mohamed Salah', overall: 91 },
    { name: 'Sadio Mane', overall: 89 },
    { name: 'Romelu Lukaku', overall: 87 },
    { name: 'Robert Lewandowski', overall: 93 },
    { name: 'Erling Haaland', overall: 91 },
    { name: 'Kylian Mbappe', overall: 93 },
    { name: 'Harry Kane', overall: 90 },
    { name: 'Luis Suarez', overall: 92 },
    { name: 'Sergio Aguero', overall: 93 },
    { name: 'Roberto Firmino', overall: 87 },
    { name: 'Riyad Mahrez', overall: 86 },
    { name: 'Antoine Griezmann', overall: 90 },
    { name: 'Bukayo Saka', overall: 88 },
    { name: 'Son Heung-min', overall: 89 },
    { name: 'Cole Palmer', overall: 87 },
    { name: 'Marcus Rashford', overall: 85 },
    { name: 'Ian Rush', overall: 92 },
    { name: 'Kevin Karengera', overall: 100 },
  ],
};

/**
 * Chance that any freshly generated player is swapped for an unused Icon of
 * the same position. Kept high (not 100%) since every Icon has a real photo
 * and the position pools are large (12-28 each) relative to the 2-4 needed
 * per game - a small residual chance still leaves room for a fictional
 * "filler" player without making them a common sight.
 */
const ICON_CHANCE = 0.9;

let usedNames: Set<string>;
let usedIconNames: Set<string>;
let idCounter: number;

/** Resets per-game generator state. Must be called once at the start of each game. */
export function resetGenerator() {
  usedNames = new Set();
  usedIconNames = new Set();
  idCounter = 0;
}

function randomName(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${first} ${last}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  // Pool exhausted (unlikely with only 10 players) - allow a duplicate.
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${
    LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  }`;
}

/** Approximately normal rating via Box-Muller, mean 65, stddev 11, clamped to 1-99. */
function randomOverall(): number {
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const rating = Math.round(65 + z * 11);
  return Math.min(99, Math.max(1, rating));
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextId(): string {
  idCounter += 1;
  return `p${idCounter}`;
}

function tryPullIcon(position: Position): Player | null {
  if (Math.random() > ICON_CHANCE) return null;
  const candidates = ICONS[position].filter((c) => !usedIconNames.has(c.name));
  if (candidates.length === 0) return null;
  const icon = candidates[Math.floor(Math.random() * candidates.length)];
  usedIconNames.add(icon.name);
  return {
    id: nextId(),
    name: icon.name,
    position,
    overall: icon.overall,
    isIcon: true,
  };
}

function makeRandomPlayer(position: Position): Player {
  return {
    id: nextId(),
    name: randomName(),
    position,
    overall: randomOverall(),
    isIcon: false,
  };
}

function makePlayer(position: Position): Player {
  return tryPullIcon(position) ?? makeRandomPlayer(position);
}

/**
 * Builds the fixed auction pool for one game: exactly enough players of each
 * position for both squads to fill completely (2 GK, 2 DEF, 4 CM, 2 ST),
 * shuffled into a random auction order. Resets generator state for a new game.
 */
export function generatePlayerPool(): Player[] {
  resetGenerator();
  const pool: Player[] = [];
  (Object.keys(SQUAD_REQUIREMENTS) as Position[]).forEach((position) => {
    const countNeeded = SQUAD_REQUIREMENTS[position] * 2; // both squads
    for (let i = 0; i < countNeeded; i++) {
      pool.push(makePlayer(position));
    }
  });
  return shuffle(pool);
}

/** Generates one fresh replacement player of the given position (e.g. after a double-pass skip). */
export function generateReplacementPlayer(position: Position): Player {
  return makePlayer(position);
}
