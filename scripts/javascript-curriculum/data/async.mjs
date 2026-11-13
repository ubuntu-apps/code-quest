// Asynchronous JavaScript: stages in order, then the easy, medium and hard side quests. Each lives in its own file under async/.
import timers from './async/timers.mjs'
import promises from './async/promises.mjs'
import thenCatch from './async/then-catch.mjs'
import asyncAwait from './async/async-await.mjs'
import asyncErrors from './async/async-errors.mjs'
import promiseAll from './async/promise-all.mjs'
import raceSettled from './async/race-settled.mjs'
import awaitInLoops from './async/await-in-loops.mjs'
import fetchingData from './async/fetching-data.mjs'
import retryPatterns from './async/retry-patterns.mjs'
import kitchenTimer from './async/project-kitchen-timer.mjs'
import orderTracker from './async/project-order-tracker.mjs'
import weatherBoard from './async/project-weather-board.mjs'

export const asyncTopics = [timers, promises, thenCatch, asyncAwait, asyncErrors, promiseAll, raceSettled, awaitInLoops, fetchingData, retryPatterns, kitchenTimer, orderTracker, weatherBoard]
