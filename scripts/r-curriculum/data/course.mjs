// The R course: quests in order. A quest with no stages yet is listed as "Coming soon".
// Plan: first steps, vectors, types/text/factors, data frames, summarising, functions and
// control flow, cleaning data, statistics, then a Capstone quest. All data is invented.
import { firstStepsTopics } from './first-steps.mjs'
import { vectorsTopics } from './vectors.mjs'

export const COURSE = [
  { sectionId: 'first_steps', title: 'First steps in R', filename: 'first_steps.json', topics: firstStepsTopics },
  { sectionId: 'vectors', title: 'Vectors', filename: 'vectors.json', topics: vectorsTopics },
  { sectionId: 'types_text', title: 'Types, text and factors', filename: 'types_text.json', topics: [] },
  { sectionId: 'data_frames', title: 'Data frames', filename: 'data_frames.json', topics: [] },
  { sectionId: 'summarising', title: 'Summarising data', filename: 'summarising.json', topics: [] },
  { sectionId: 'functions', title: 'Functions and control flow', filename: 'functions.json', topics: [] },
  { sectionId: 'cleaning', title: 'Cleaning data', filename: 'cleaning.json', topics: [] },
  { sectionId: 'statistics', title: 'Statistics', filename: 'statistics.json', topics: [] },
  { sectionId: 'projects', title: 'Capstone quest', filename: 'projects.json', topics: [] },
]
