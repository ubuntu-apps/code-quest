// The JavaScript course: quests in order. A quest with no stages yet is listed as "Coming soon".
// Each quest has about ten stages, then easy, medium and hard side quests.
//  1. First steps: first program; values and console.log; let and const; numbers and arithmetic;
//     Math; strings; template literals; string methods; types and conversion; true/false.
//  2. Decisions and loops   3. Arrays and objects   4. Functions   5. Working with lists
//  6. Errors and debugging  7. Classes  8. Asynchronous JavaScript  9. Text, data and modules
// 10. Capstone projects.
import { firstStepsTopics } from './first-steps.mjs'

export const COURSE = [
  { sectionId: 'first_steps', title: 'First steps', filename: 'first_steps.json', topics: firstStepsTopics },
  { sectionId: 'decisions_loops', title: 'Decisions and loops', filename: 'decisions_loops.json', topics: [] },
  { sectionId: 'arrays_objects', title: 'Arrays and objects', filename: 'arrays_objects.json', topics: [] },
  { sectionId: 'functions', title: 'Functions', filename: 'functions.json', topics: [] },
  { sectionId: 'working_with_lists', title: 'Working with lists', filename: 'working_with_lists.json', topics: [] },
  { sectionId: 'errors_debugging', title: 'Errors and debugging', filename: 'errors_debugging.json', topics: [] },
  { sectionId: 'classes', title: 'Classes', filename: 'classes.json', topics: [] },
  { sectionId: 'async', title: 'Asynchronous JavaScript', filename: 'async.json', topics: [] },
  { sectionId: 'text_data_modules', title: 'Text, data and modules', filename: 'text_data_modules.json', topics: [] },
  { sectionId: 'projects', title: 'Capstone projects', filename: 'projects.json', topics: [] },
]
