// Capstone projects: A school's grades.
import { makeTopic, mc, qShort, query, snippet } from '../_builders.mjs'
import { SCHOOL_DB } from '../capstone-db.mjs'

const MARKS_FROM = 'FROM enrolments e\nJOIN students s ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id\nJOIN assessments a ON a.course_id = e.course_id\nLEFT JOIN results r ON r.assessment_id = a.id AND r.student_id = e.student_id\nGROUP BY e.student_id, e.course_id, c.title, s.name'
const MARKS_CTE = 'WITH marks AS (\n  SELECT c.title AS course, s.name, e.student_id,\n         SUM(COALESCE(r.score, 0) * a.weight) / 100.0 AS mark\n  ' + MARKS_FROM.replace(/\n/g, '\n  ') + '\n)\n'
const MARKS = 'SELECT c.title AS course, s.name,\n       ROUND(SUM(COALESCE(r.score, 0) * a.weight) / 100.0, 1) AS mark\n' + MARKS_FROM + '\nORDER BY course, mark DESC, s.name;'
const GRADE = "CASE WHEN mark >= 80 THEN 'A' WHEN mark >= 65 THEN 'B' WHEN mark >= 50 THEN 'C' ELSE 'F' END"

export default makeTopic({
  id: 'school_grades',
  title: "A school's grades",
  database: SCHOOL_DB,
  paragraphs: [
    "A school wants its term's marks worked out. Students are enrolled on `courses`; each course has `assessments`, each with a `weight` (a course's weights add up to 100) and a due date; `results` holds each student's `score` out of 100.",
    "One rule matters more than any other here: **work that wasn't handed in has no row in results**, and it counts as 0. A plain join from results would quietly skip it and make the student look better. So start from what should exist, every enrolled student with every assessment of their course, and LEFT JOIN the results onto that:",
    '```\n' + MARKS + '\n```',
    "The course mark is the weighted sum: each score times its weight, added up, divided by 100. Multiplying whole numbers first and dividing by `100.0` at the end keeps it exact, so two students on the same marks really do tie.",
    "Grades are bands of the mark: A from 80, B from 65, C from 50, F below that.",
  ],
  sandboxCode: MARKS,
  sandboxSnippets: [
    snippet('Course marks', MARKS),
    snippet('What should exist', 'SELECT s.name, a.title\nFROM enrolments e\nJOIN students s ON s.id = e.student_id\nJOIN assessments a ON a.course_id = e.course_id\nORDER BY s.name, a.due_on;'),
  ],
  readMore: { label: 'SQLite: SELECT and joins', url: 'https://www.sqlite.org/lang_select.html', source: 'SQLite documentation' },
  challenges: [
    query('easy', 'Class lists', {
      prompt: 'Show every enrolment as the course title (`course`) and the student\'s name (`student`). Sort by course, then student.',
      hint: 'Join enrolments to courses and students.',
      solution: 'SELECT c.title AS course, s.name AS student\nFROM enrolments e\nJOIN courses c ON c.id = e.course_id\nJOIN students s ON s.id = e.student_id\nORDER BY course, student;',
    }),
    query('easy', 'Class sizes', {
      prompt: "Show every course's `title`, `teacher` and number of `students` (0 if none). Most students first, then by title.",
      hint: 'LEFT JOIN enrolments and `COUNT(e.student_id)`.',
      solution: 'SELECT c.title, c.teacher, COUNT(e.student_id) AS students\nFROM courses c\nLEFT JOIN enrolments e ON e.course_id = c.id\nGROUP BY c.id, c.title, c.teacher\nORDER BY students DESC, c.title;',
    }),
    query('easy', 'How each assessment went', {
      prompt: "For each assessment, show the course title (`course`), the assessment's title (`assessment`), how many handed it in (`handed_in`) and their average score (`average`, 1 decimal). In course order, then by due date.",
      hint: 'Join results to assessments and courses; group by assessment. Sorting by `a.due_on` is fine even though it isn\'t shown.',
      solution: 'SELECT c.title AS course, a.title AS assessment, COUNT(r.score) AS handed_in,\n       ROUND(AVG(r.score), 1) AS average\nFROM assessments a\nJOIN courses c ON c.id = a.course_id\nJOIN results r ON r.assessment_id = a.id\nGROUP BY a.id, c.title, a.title, a.due_on\nORDER BY course, a.due_on;',
    }),
    query('medium', 'Missing work', {
      prompt: "List the work that wasn't handed in: the student's `name`, the course title (`course`) and the assessment title (`assessment`). Sort by name, course, then assessment.",
      hint: 'Every enrolled student with every assessment of their course, `WHERE NOT EXISTS` a matching result.',
      solution: 'SELECT s.name, c.title AS course, a.title AS assessment\nFROM enrolments e\nJOIN students s ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id\nJOIN assessments a ON a.course_id = e.course_id\nWHERE NOT EXISTS (\n  SELECT 1 FROM results r WHERE r.assessment_id = a.id AND r.student_id = e.student_id\n)\nORDER BY s.name, course, assessment;',
    }),
    query('medium', 'Course marks', {
      prompt: "Show each student's mark on each course they take: `course`, `name` and `mark` (weighted, with missing work as 0, 1 decimal). Sort by course, then highest mark, then name.",
      hint: 'The lesson\'s example.',
      solution: MARKS,
    }),
    query('medium', 'Letter grades', {
      prompt: "The same, with a `grade` beside each mark: `A` from 80, `B` from 65, `C` from 50, `F` below. Columns `course`, `name`, `mark`, `grade`. Sort by course, then highest mark, then name.",
      hint: 'Work the marks out in a CTE, then a CASE on the mark.',
      solution: MARKS_CTE + 'SELECT course, name, ROUND(mark, 1) AS mark,\n       ' + GRADE + ' AS grade\nFROM marks\nORDER BY course, mark DESC, name;',
    }),
    query('hard', 'Class rank', {
      prompt: "Show each student's `place` on each course (RANK by mark, highest first; equal marks share a place): `course`, `name`, `mark` (1 decimal), `place`. Sort by course, then place, then name.",
      hint: '`RANK() OVER (PARTITION BY course ORDER BY mark DESC)` on the marks CTE.',
      solution: MARKS_CTE + 'SELECT course, name, ROUND(mark, 1) AS mark,\n       RANK() OVER (PARTITION BY course ORDER BY mark DESC) AS place\nFROM marks\nORDER BY course, place, name;',
    }),
    query('hard', 'Grade table', {
      prompt: "For each course with students, show `course` and how many students got each grade, as columns `a`, `b`, `c` and `f`. Sort by course.",
      hint: "Marks in a CTE, then `COUNT(*) FILTER (WHERE mark >= 80) AS a` and so on.",
      solution: MARKS_CTE + 'SELECT course,\n       COUNT(*) FILTER (WHERE mark >= 80) AS a,\n       COUNT(*) FILTER (WHERE mark >= 65 AND mark < 80) AS b,\n       COUNT(*) FILTER (WHERE mark >= 50 AND mark < 65) AS c,\n       COUNT(*) FILTER (WHERE mark < 50) AS f\nFROM marks\nGROUP BY course\nORDER BY course;',
    }),
    query('expert', 'Progress', {
      prompt: "For each student and course with at least two results, show `name`, `course`, the score of their earliest handed-in assessment (`first_score`), of their latest (`last_score`) and the `change`. Biggest rise first, then by name, then course.",
      hint: 'Number each student\'s results on a course both ways by due date (ROW_NUMBER), count them with `COUNT(*) OVER (…)`, then pick the first and last with `MAX(CASE WHEN … THEN score END)`.',
      solution: 'WITH r AS (\n  SELECT s.name, c.title AS course, res.score,\n         ROW_NUMBER() OVER (PARTITION BY res.student_id, a.course_id ORDER BY a.due_on) AS first_no,\n         ROW_NUMBER() OVER (PARTITION BY res.student_id, a.course_id ORDER BY a.due_on DESC) AS last_no,\n         COUNT(*) OVER (PARTITION BY res.student_id, a.course_id) AS handed_in\n  FROM results res\n  JOIN assessments a ON a.id = res.assessment_id\n  JOIN students s ON s.id = res.student_id\n  JOIN courses c ON c.id = a.course_id\n)\nSELECT name, course,\n       MAX(CASE WHEN first_no = 1 THEN score END) AS first_score,\n       MAX(CASE WHEN last_no = 1 THEN score END) AS last_score,\n       MAX(CASE WHEN last_no = 1 THEN score END) - MAX(CASE WHEN first_no = 1 THEN score END) AS change\nFROM r\nWHERE handed_in >= 2\nGROUP BY name, course\nORDER BY change DESC, name, course;',
    }),
    query('expert', 'Report cards', {
      prompt: "Show one row per student with courses: `name`, number of `courses`, their `average` course mark (1 decimal), and their best course (`best_course`: highest mark, the first title alphabetically on a tie). Highest average first, then by name.",
      hint: 'Marks CTE, then ROW_NUMBER per student by mark DESC, course; group by student and pick the best with `MAX(CASE WHEN n = 1 THEN course END)`.',
      solution: MARKS_CTE + ', ranked AS (\n  SELECT student_id, name, course, mark,\n         ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY mark DESC, course) AS n\n  FROM marks\n)\nSELECT name, COUNT(*) AS courses, ROUND(AVG(mark), 1) AS average,\n       MAX(CASE WHEN n = 1 THEN course END) AS best_course\nFROM ranked\nGROUP BY student_id, name\nORDER BY average DESC, name;',
    }),
  ],
  questions: [
    mc('Why start the marks from enrolments and assessments, not from results?', ['Work not handed in has no result row, and must still count as 0', 'results has no scores', 'It is faster', 'results can\'t be joined'], 0,
      'Start from what should exist, then LEFT JOIN what does.'),
    mc('Why does the LEFT JOIN to results match on both assessment and student?', ['It doesn\'t need to', 'To sort the rows', 'So each enrolled student gets only their own result for each assessment', 'Because results has no id'], 2,
      'Matching on the assessment alone would bring in everyone\'s scores.'),
    mc('What does `COALESCE(r.score, 0)` do for missing work?', ['Skips it in SUM', 'Counts it as a score of 0', 'Gives an error', 'Removes the row'], 1,
      'A missing hand-in is worth nothing.'),
    mc('Why multiply whole numbers first and divide by 100.0 at the end?', ['Whole-number sums are exact, so equal marks really tie', 'It is shorter', '100.0 is required', 'To round the mark'], 0,
      'Decimal steps like 0.3 * 88 can leave tiny rounding differences.'),
    qShort('Which aggregate keyword limits COUNT(*) to some rows, as in counting the A grades?', 'FILTER',
      '`COUNT(*) FILTER (WHERE mark >= 80)`.'),
    mc('Which finds work not handed in?', ['WHERE score IS NULL in results', 'COUNT(score) = 0', 'NOT EXISTS a result for that student and assessment', 'WHERE score = 0'], 2,
      'There is no row to find a NULL in.'),
    mc('Two students both have 88.0 on Maths. With RANK, what is the next student\'s place?', ['1', '4', '2', '3'], 3,
      'RANK skips after a tie.'),
    mc('Why ORDER BY mark DESC, course for the best course?', ['ROW_NUMBER needs two columns', 'So a tie between two courses always picks the same one', 'To skip NULLs', 'To sort the result'], 1,
      'ROW_NUMBER needs an order that doesn\'t tie.'),
    mc('Why can\'t the SELECT list use the alias `last_score` to work out `change`?', ['An alias can\'t be used elsewhere in the same SELECT list', 'Aliases are case-sensitive', 'change is a keyword', 'MAX can\'t be subtracted'], 0,
      'Repeat the expression, or use a CTE.'),
    mc('`COUNT(*) OVER (PARTITION BY student_id, course_id)` gives…', ['The number of students', 'A running count', 'An error', 'How many results that student has on that course, on each of their rows'], 3,
      'A window keeps every row.'),
  ],
})
