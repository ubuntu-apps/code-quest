// Text, data and modules: stages in order, then the easy, medium and hard side quests. Each lives in its own file under text-data-modules/.
import regexBasics from './text-data-modules/regex-basics.mjs'
import regexGroups from './text-data-modules/regex-groups.mjs'
import cleaningText from './text-data-modules/cleaning-text.mjs'
import jsonData from './text-data-modules/json-data.mjs'
import csvData from './text-data-modules/csv-data.mjs'
import dates from './text-data-modules/dates.mjs'
import formatting from './text-data-modules/formatting.mjs'
import modules from './text-data-modules/modules.mjs'
import organisingCode from './text-data-modules/organising-code.mjs'
import dataPipeline from './text-data-modules/data-pipeline.mjs'
import logReader from './text-data-modules/project-log-reader.mjs'
import contacts from './text-data-modules/project-contacts.mjs'
import invoice from './text-data-modules/project-invoice.mjs'

export const textDataModulesTopics = [regexBasics, regexGroups, cleaningText, jsonData, csvData, dates, formatting, modules, organisingCode, dataPipeline, logReader, contacts, invoice]
