/**
 * The database for "Window functions": a pub quiz league. Players belong to teams and play
 * on quiz nights; `games` has one row per player per night with their points. Some scores
 * tie on purpose, so RANK, DENSE_RANK and ROW_NUMBER give different answers.
 * Every player and team is invented.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  name TEXT,
  team TEXT,
  joined TEXT
);
CREATE TABLE games (
  id INTEGER PRIMARY KEY,
  player_id INTEGER,
  played_on TEXT,
  points INTEGER
);`

const P = ['id', 'name', 'team', 'joined']
const G = ['id', 'player_id', 'played_on', 'points']

/** Games as { night: [[player_id, points], …] }, numbered in night order. */
function games(nights) {
  const rows = []
  for (const [night, scores] of Object.entries(nights)) {
    for (const [player, points] of scores) rows.push([rows.length + 1, player, night, points])
  }
  return rows
}

const DATA = [
  insert('players', P, [
    [1, 'Ada Brooks', 'Owls', '2025-01-10'],
    [2, 'Bilal Khan', 'Owls', '2025-03-04'],
    [3, 'Cora Diaz', 'Foxes', '2024-11-20'],
    [4, 'Dmitri Volkov', 'Foxes', '2025-06-15'],
    [5, 'Eve Mensah', 'Hares', '2026-01-08'],
    [6, 'Femi Ade', 'Hares', '2025-09-01'],
    [7, 'Greta Lind', 'Owls', '2026-05-20'],
    [8, 'Hiro Tanaka', 'Foxes', '2026-08-30'],
  ]),
  insert('games', G, games({
    '2026-09-03': [[1, 42], [2, 38], [3, 42], [4, 30], [5, 35], [6, 28]],
    '2026-09-10': [[1, 36], [2, 40], [3, 44], [5, 40], [6, 33], [7, 25]],
    '2026-09-17': [[1, 45], [3, 39], [4, 41], [5, 37], [6, 37], [7, 31], [8, 29]],
    '2026-09-24': [[2, 43], [3, 46], [4, 35], [5, 44], [7, 34], [8, 38]],
    '2026-10-01': [[1, 40], [2, 41], [3, 41], [4, 39], [6, 42], [8, 36]],
    '2026-10-08': [[1, 47], [2, 39], [3, 43], [5, 45], [6, 40], [7, 38], [8, 41]],
  })),
].join('\n')

const ALT_DATA = [
  insert('players', P, [
    [1, 'Iris Moon', 'Comets', '2025-02-02'],
    [2, 'Jalen Price', 'Comets', '2024-10-10'],
    [3, 'Kai Rivera', 'Meteors', '2025-07-07'],
    [4, 'Lea Novak', 'Meteors', '2026-03-03'],
    [5, 'Milo Grant', 'Comets', '2026-06-06'],
  ]),
  insert('games', G, games({
    '2026-09-05': [[1, 30], [2, 34], [3, 30], [4, 28]],
    '2026-09-12': [[1, 33], [3, 36], [4, 36], [5, 25]],
    '2026-09-19': [[2, 38], [3, 31], [4, 35], [5, 29]],
    '2026-09-26': [[1, 40], [2, 37], [3, 33], [5, 33]],
  })),
].join('\n')

export const WINDOWS_DB = database(SCHEMA, DATA, ALT_DATA)
