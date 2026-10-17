import { makeProject } from './_builders.mjs'
import { projectsTopics } from './projects.mjs'
import aboutMeCard from './fundamentals/project-about-me.mjs'
import unitConverter from './fundamentals/project-unit-converter.mjs'
import receiptCalculator from './fundamentals/project-receipt.mjs'
import guessTheNumber from './control-flow/project-guess-the-number.mjs'
import quizGame from './control-flow/project-quiz-game.mjs'
import primeFinder from './control-flow/project-prime-finder.mjs'
import gradeBook from './data-structures/project-grade-book.mjs'
import wordCounter from './data-structures/project-word-counter.mjs'
import inventoryTracker from './data-structures/project-inventory-tracker.mjs'
import textTools from './functions/project-text-tools.mjs'
import passwordChecker from './functions/project-password-checker.mjs'
import bankAccounts from './functions/project-bank-accounts.mjs'
import safeCalculator from './error-handling/project-safe-calculator.mjs'
import signupForm from './error-handling/project-signup-form.mjs'
import dataImporter from './error-handling/project-data-importer.mjs'
import notesKeeper from './file-handling/project-notes-keeper.mjs'
import logAnalyser from './file-handling/project-log-analyser.mjs'
import savedTodo from './file-handling/project-saved-todo.mjs'
import diceRoller from './modules/project-dice-roller.mjs'
import habitTracker from './modules/project-habit-tracker.mjs'
import shopPackage from './modules/project-shop-package.mjs'
import playlist from './oop/project-playlist.mjs'
import parkingGarage from './oop/project-parking-garage.mjs'
import monsterBattle from './oop/project-monster-battle.mjs'

function projectSource(id) {
  const topic = projectsTopics.find((t) => t.id === id)
  if (!topic) throw new Error(`Unknown project source: ${id}`)
  return topic
}

function fromExisting(sourceId, difficulty, id, maxChallenges = 6, maxQuestions = 6, sandboxSnippets) {
  const src = projectSource(sourceId)
  return makeProject(difficulty, {
    id,
    title: src.title,
    paragraphs: src.paragraphs,
    sandboxCode: src.sandboxCode,
    sandboxSnippets,
    challenges: src.challengeSpecs.slice(0, maxChallenges),
    questions: src.questionSpecs.slice(0, maxQuestions),
  })
}

/** @type {Record<string, import('./_builders.mjs').[]>} */
export const SECTION_PROJECTS = {
  fundamentals: [aboutMeCard, unitConverter, receiptCalculator],
  control_flow: [guessTheNumber, quizGame, primeFinder],
  data_structures: [gradeBook, wordCounter, inventoryTracker],
  functions: [textTools, passwordChecker, bankAccounts],
  modules_and_packages: [diceRoller, habitTracker, shopPackage],
  file_handling: [notesKeeper, logAnalyser, savedTodo],
  error_handling: [safeCalculator, signupForm, dataImporter],
  object_oriented: [playlist, parkingGarage, monsterBattle],
  data_and_apis: [
    fromExisting('weather_cli', 'easy', 'proj_data_apis_weather_cli'),
    fromExisting('expense_tracker', 'medium', 'proj_data_apis_expense_tracker'),
    fromExisting('web_scraper_basics', 'hard', 'proj_data_apis_web_scraper'),
  ],
}

export function sectionProjectsFor(sectionId) {
  return SECTION_PROJECTS[sectionId] ?? []
}
