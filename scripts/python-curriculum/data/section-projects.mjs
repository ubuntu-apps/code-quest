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
import movieRatings from './data-apis/project-movie-ratings.mjs'
import bookshopClient from './data-apis/project-bookshop-client.mjs'
import salesPipeline from './data-apis/project-sales-pipeline.mjs'

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
  data_and_apis: [movieRatings, bookshopClient, salesPipeline],
}

export function sectionProjectsFor(sectionId) {
  return SECTION_PROJECTS[sectionId] ?? []
}
