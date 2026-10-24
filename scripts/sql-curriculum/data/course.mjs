/**
 * The SQL course: its sections in order, each with its lessons in teaching order.
 * Lessons run on SQLite in the browser (through the Python runtime's sqlite3 module).
 *
 * `topics` is filled in as a section is written; sections without topics are the plan for
 * later and are left out of the course until they have lessons. Section and topic ids are
 * stable (they key learners' progress and URLs), so renaming only changes a title.
 *
 * Plan (lessons per section):
 *  1. Querying a table: your first query; choosing columns; filtering with WHERE; AND, OR
 *     and NOT; IN and BETWEEN; matching text with LIKE; missing values (NULL); sorting with
 *     ORDER BY; LIMIT and DISTINCT; calculated columns. Projects: library report, pet
 *     clinic, shop stock check.
 *  2. Functions and expressions: text functions; numbers and rounding; CASE; handling
 *     NULL (COALESCE, IFNULL, NULLIF); dates and times; types and CAST.
 *  3. Summarising data: COUNT; SUM, AVG, MIN and MAX; GROUP BY; grouping by several
 *     columns; HAVING; COUNT(DISTINCT) and GROUP_CONCAT; totals with conditions.
 *  4. Joining tables: keys and relationships; INNER JOIN; table aliases; LEFT JOIN;
 *     finding rows with no match; joining three tables; self-joins; many-to-many.
 *  5. Subqueries and sets: subqueries that return one value; IN and EXISTS; correlated
 *     subqueries; subqueries in FROM; UNION, INTERSECT and EXCEPT; WITH (common table
 *     expressions).
 *  6. Changing data: INSERT; adding many rows and INSERT … SELECT; UPDATE; DELETE;
 *     transactions; upserts (ON CONFLICT); RETURNING.
 *  7. Designing tables: CREATE TABLE and types; keys; NOT NULL, DEFAULT, UNIQUE and CHECK;
 *     foreign keys; ALTER and DROP; splitting data into tables (normalisation); indexes.
 *  8. Window functions: OVER; ROW_NUMBER, RANK and DENSE_RANK; PARTITION BY; running
 *     totals; LAG and LEAD; moving averages; the top rows in each group.
 *  9. Advanced queries: views; recursive WITH; turning rows into columns; JSON in SQLite;
 *     reading a query plan; NULL and other traps.
 * 10. Capstone projects: analysing a shop's orders, a school's grades and a library's loans.
 */
import { queryingTopics } from './querying.mjs'
import { queryingProjects } from './querying-projects.mjs'
import { expressionsTopics } from './expressions.mjs'
import { expressionsProjects } from './expressions-projects.mjs'
import { aggregationTopics } from './aggregation.mjs'
import { aggregationProjects } from './aggregation-projects.mjs'
import { joinsTopics } from './joins.mjs'
import { joinsProjects } from './joins-projects.mjs'
import { subqueriesTopics } from './subqueries.mjs'
import { subqueriesProjects } from './subqueries-projects.mjs'

export const COURSE = [
  { sectionId: 'querying', filename: 'querying.json', title: 'Querying a table', topics: [...queryingTopics, ...queryingProjects] },
  { sectionId: 'expressions', filename: 'expressions.json', title: 'Functions and expressions', topics: [...expressionsTopics, ...expressionsProjects] },
  { sectionId: 'aggregation', filename: 'aggregation.json', title: 'Summarising data', topics: [...aggregationTopics, ...aggregationProjects] },
  { sectionId: 'joins', filename: 'joins.json', title: 'Joining tables', topics: [...joinsTopics, ...joinsProjects] },
  { sectionId: 'subqueries', filename: 'subqueries.json', title: 'Subqueries and sets', topics: [...subqueriesTopics, ...subqueriesProjects] },
  { sectionId: 'modifying_data', filename: 'modifying_data.json', title: 'Changing data', topics: [] },
  { sectionId: 'schema_design', filename: 'schema_design.json', title: 'Designing tables', topics: [] },
  { sectionId: 'window_functions', filename: 'window_functions.json', title: 'Window functions', topics: [] },
  { sectionId: 'advanced', filename: 'advanced.json', title: 'Advanced queries', topics: [] },
  { sectionId: 'projects', filename: 'projects.json', title: 'Capstone projects', topics: [] },
]
