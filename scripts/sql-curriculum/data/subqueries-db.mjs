/**
 * The database for "Subqueries and sets": a small music streaming service. Artists have
 * tracks, listeners play tracks and follow artists. Some listeners never played anything,
 * some tracks were never played and some follows don't match what people actually play,
 * so there is something to find with IN, EXISTS and the set operators.
 * Every artist, track and listener is invented.
 */
import { database, insert } from './databases.mjs'

const SCHEMA = `CREATE TABLE artists (
  id INTEGER PRIMARY KEY,
  name TEXT,
  genre TEXT,
  country TEXT
);
CREATE TABLE tracks (
  id INTEGER PRIMARY KEY,
  artist_id INTEGER,
  title TEXT,
  duration_s INTEGER,
  released TEXT
);
CREATE TABLE listeners (
  id INTEGER PRIMARY KEY,
  name TEXT,
  country TEXT,
  plan TEXT,
  joined TEXT
);
CREATE TABLE plays (
  id INTEGER PRIMARY KEY,
  listener_id INTEGER,
  track_id INTEGER,
  played_on TEXT
);
CREATE TABLE follows (
  listener_id INTEGER,
  artist_id INTEGER
);`

const A = ['id', 'name', 'genre', 'country']
const T = ['id', 'artist_id', 'title', 'duration_s', 'released']
const L = ['id', 'name', 'country', 'plan', 'joined']
const P = ['id', 'listener_id', 'track_id', 'played_on']
const F = ['listener_id', 'artist_id']

/** Plays as [listener_id, track_id, played_on], numbered from 1. */
function plays(rows) {
  return rows.map((row, i) => [i + 1, ...row])
}

const DATA = [
  insert('artists', A, [
    [1, 'Copper Owls', 'folk', 'Ireland'],
    [2, 'Nova Tide', 'electronic', 'Norway'],
    [3, 'Mila Sands', 'pop', 'Brazil'],
    [4, 'Brass Kites', 'jazz', 'USA'],
    [5, 'Lumen Drift', 'electronic', 'Japan'],
    [6, 'Red Fern Trio', 'jazz', 'Canada'],
    [7, 'Sora Vale', 'pop', 'South Korea'],
  ]),
  insert('tracks', T, [
    [1, 1, 'Harbour Lights', 214, '2023-03-10'],
    [2, 1, 'Salt and Stone', 248, '2023-03-10'],
    [3, 1, 'The Long Field', 302, '2025-06-01'],
    [4, 2, 'Pulse Line', 189, '2024-01-19'],
    [5, 2, 'Glass City', 256, '2024-01-19'],
    [6, 2, 'Night Ferry', 341, '2025-11-07'],
    [7, 3, 'Sunday Hearts', 176, '2022-09-02'],
    [8, 3, 'Paper Moons', 198, '2024-05-24'],
    [9, 3, 'Golden Hour Again', 205, '2026-02-14'],
    [10, 4, 'Blue Corner', 412, '2021-11-12'],
    [11, 4, 'Late Train', 365, '2021-11-12'],
    [12, 5, 'Static Bloom', 233, '2025-03-28'],
    [13, 5, 'Low Orbit', 287, '2026-07-04'],
    [14, 6, 'Maple Walk', 398, '2023-10-20'],
    [15, 6, 'Three Rivers', 451, '2023-10-20'],
    [16, 7, 'First Light', 191, '2026-09-18'],
  ]),
  insert('listeners', L, [
    [1, 'Ana Costa', 'Portugal', 'premium', '2024-02-11'],
    [2, 'Ben Adler', 'Germany', 'free', '2025-07-30'],
    [3, 'Chen Wei', 'China', 'premium', '2023-12-05'],
    [4, 'Dara Okoye', 'Nigeria', 'free', '2026-01-20'],
    [5, 'Emil Larsen', 'Denmark', 'premium', '2025-03-14'],
    [6, 'Fatima Zahra', 'Morocco', 'free', '2024-10-02'],
    [7, 'Gus Novak', 'Czechia', 'free', '2026-08-29'],
    [8, 'Hana Ito', 'Japan', 'premium', '2022-06-17'],
  ]),
  insert('plays', P, plays([
    [1, 1, '2026-09-01'], [3, 4, '2026-09-01'], [5, 10, '2026-09-02'], [2, 7, '2026-09-02'],
    [8, 12, '2026-09-03'], [1, 2, '2026-09-04'], [6, 7, '2026-09-05'], [3, 5, '2026-09-06'],
    [2, 7, '2026-09-07'], [8, 13, '2026-09-08'], [5, 11, '2026-09-09'], [1, 1, '2026-09-10'],
    [4, 8, '2026-09-12'], [3, 6, '2026-09-13'], [6, 8, '2026-09-14'], [8, 4, '2026-09-15'],
    [2, 8, '2026-09-16'], [5, 14, '2026-09-18'], [1, 3, '2026-09-19'], [3, 12, '2026-09-20'],
    [8, 5, '2026-09-22'], [2, 9, '2026-09-23'], [6, 3, '2026-09-24'], [4, 9, '2026-09-25'],
    [5, 15, '2026-09-26'], [1, 10, '2026-09-28'], [3, 13, '2026-09-29'], [8, 6, '2026-10-01'],
    [2, 7, '2026-10-02'], [5, 10, '2026-10-03'], [1, 14, '2026-10-05'], [6, 2, '2026-10-06'],
    [3, 12, '2026-10-08'], [8, 13, '2026-10-09'], [4, 7, '2026-10-11'], [2, 4, '2026-10-12'],
    [5, 1, '2026-10-14'], [1, 4, '2026-10-16'], [3, 5, '2026-10-18'], [8, 11, '2026-10-20'],
  ])),
  insert('follows', F, [
    [1, 1], [1, 4], [1, 3],
    [2, 3], [2, 7],
    [3, 2], [3, 5],
    [4, 3],
    [5, 4], [5, 6], [5, 1],
    [6, 1],
    [7, 3], [7, 2],
    [8, 5], [8, 2], [8, 6],
  ]),
].join('\n')

const ALT_DATA = [
  insert('artists', A, [
    [1, 'Velvet Pines', 'folk', 'Scotland'],
    [2, 'Echo Garden', 'electronic', 'Germany'],
    [3, 'Rosa Lume', 'pop', 'Spain'],
    [4, 'Night Owl Quartet', 'jazz', 'France'],
    [5, 'Iron Meadow', 'rock', 'Australia'],
  ]),
  insert('tracks', T, [
    [1, 1, 'Highland Rain', 233, '2022-04-01'],
    [2, 1, 'Old Bridge', 282, '2024-08-15'],
    [3, 2, 'Signal Fade', 301, '2023-02-03'],
    [4, 2, 'Neon Rain', 198, '2025-12-12'],
    [5, 3, 'Salt Kiss', 187, '2024-06-21'],
    [6, 3, 'Summer Static', 215, '2026-05-30'],
    [7, 4, 'Smoke Rings', 388, '2020-10-10'],
    [8, 4, 'Rue Blanche', 450, '2020-10-10'],
    [9, 5, 'Red Dust', 264, '2025-09-09'],
    [10, 5, 'Back Roads', 241, '2026-03-03'],
    [11, 2, 'Afterglow', 356, '2026-08-01'],
  ]),
  insert('listeners', L, [
    [1, 'Ida Berg', 'Sweden', 'premium', '2023-05-05'],
    [2, 'Jonah Price', 'UK', 'free', '2025-11-11'],
    [3, 'Kemal Aydin', 'Turkey', 'premium', '2024-09-09'],
    [4, 'Lucia Ferri', 'Italy', 'free', '2026-04-04'],
    [5, 'Mo Rahman', 'Bangladesh', 'free', '2025-02-02'],
    [6, 'Nora Quinn', 'Ireland', 'premium', '2022-12-12'],
  ]),
  insert('plays', P, plays([
    [1, 1, '2026-09-02'], [2, 5, '2026-09-03'], [3, 3, '2026-09-05'], [6, 7, '2026-09-06'],
    [1, 2, '2026-09-08'], [2, 6, '2026-09-09'], [3, 4, '2026-09-11'], [6, 8, '2026-09-12'],
    [4, 6, '2026-09-14'], [1, 1, '2026-09-15'], [2, 5, '2026-09-17'], [6, 8, '2026-09-18'],
    [3, 3, '2026-09-20'], [1, 7, '2026-09-22'], [6, 2, '2026-09-24'], [2, 4, '2026-09-26'],
    [3, 9, '2026-09-29'], [4, 5, '2026-10-01'], [1, 9, '2026-10-04'], [6, 3, '2026-10-07'],
    [3, 10, '2026-10-10'], [6, 7, '2026-10-13'],
  ])),
  insert('follows', F, [
    [1, 1], [1, 4],
    [2, 3], [2, 5],
    [3, 2],
    [4, 3], [4, 4],
    [5, 1],
    [6, 4], [6, 2],
  ]),
].join('\n')

export const SUBQUERIES_DB = database(SCHEMA, DATA, ALT_DATA)
