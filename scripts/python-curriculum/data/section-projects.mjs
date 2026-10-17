import { makeProject, ch, qMcq, qShort, pyVar, pyOut, includes } from './_builders.mjs'
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

const modulesEasy = makeProject('easy', {
  id: 'greet_module',
  title: 'Greeting module',
  paragraphs: [
    'Split a tiny greeting program into `greet(name)` and a main block that calls it twice.',
    'Practice functions, imports conceptually, and the `if __name__ == "__main__"` pattern.',
  ],
  sandboxCode: 'def greet(name):\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))\n    print(greet("Python"))',
  challenges: [
    ch('easy', 'greet function', 'Define `greet` returning a string with the name.', includes('def greet'), { starterCode: 'def greet(name):\n    return ' }),
    ch('medium', 'Return greeting', 'Return `"Hello, Ada!"` when called with `"Ada"`.', pyVar('msg', 'msg == "Hello, Ada!"', 'msg = greet("Ada")'), { starterCode: 'def greet(name):\n    return f"Hello, {name}!"' }),
    ch('medium', 'main guard', 'Use `if __name__ == "__main__":`.', includes('__name__'), { starterCode: 'if __name__ == "__main__":\n    pass' }),
    ch('hard', 'Call twice', 'Call greet twice in main.', includes('greet('), { starterCode: 'if __name__ == "__main__":\n    ' }),
    ch('hard', 'Print results', 'Print both greetings.', pyOut('Hello, World!\nHello, Python!'), { starterCode: '' }),
    ch('expert', 'Separate logic', 'Keep greet pure (return only).', includes('return'), { starterCode: 'def greet(name):\n    return f"Hi, {name}"' }),
  ],
  questions: [
    qMcq('Functions group:', [{ id: 'a', label: 'Reusable logic' }, { id: 'b', label: 'Only comments' }, { id: 'c', label: 'Hardware' }], 'a'),
    qShort('Main guard checks:', '__name__'),
    qMcq('return sends value to:', [{ id: 'a', label: 'Caller' }, { id: 'b', label: 'Internet' }, { id: 'c', label: 'GPU' }], 'a'),
    qShort('Module files end with:', '.py'),
    qMcq('Splitting code helps:', [{ id: 'a', label: 'Organization' }, { id: 'b', label: 'Deleting data' }, { id: 'c', label: 'Compilation only' }], 'a'),
    qShort('Call a function with:', 'parentheses'),
  ],
})

const fileHandlingEasy = makeProject('easy', {
  id: 'line_counter',
  title: 'Line counter',
  paragraphs: [
    'Read a multi-line string, split it into lines, and count how many lines are non-empty.',
    'Practice string splitting and basic file-content processing.',
  ],
  sandboxCode: 'text = "alpha\\nbeta\\n\\ngamma"\nlines = text.splitlines()\nnon_empty = [line for line in lines if line.strip()]\nprint(len(non_empty))',
  challenges: [
    ch('easy', 'splitlines', 'Split `text` into lines.', pyVar('lines', 'len(lines) == 4', 'text="a\\nb\\n\\nc"\nlines=text.splitlines()')),
    ch('medium', 'strip blank', 'Detect empty line after strip.', pyVar('blank', 'blank == True', 'blank = len("   ".strip()) == 0')),
    ch('medium', 'Count non-empty', 'Count lines with text.', pyVar('n', 'n == 3', 'text="a\\nb\\n\\nc"\nn=0')),
    ch('hard', 'List comprehension', 'Build filtered list.', pyVar('kept', 'len(kept) == 2', 'kept=[line for line in ["a","","b"] if line.strip()]')),
    ch('hard', 'Print count', 'Print the final count.', pyOut('3'), { starterCode: 'print(3)' }),
    ch('expert', 'Handle whitespace', 'Strip before checking emptiness.', includes('strip'), { starterCode: 'line = "  hi  "\n' }),
  ],
  questions: [
    qMcq('splitlines breaks on:', [{ id: 'a', label: 'Line breaks' }, { id: 'b', label: 'Commas only' }, { id: 'c', label: 'Spaces only' }], 'a'),
    qShort('strip removes:', 'edges'),
    qMcq('Empty line after strip has length:', [{ id: 'a', label: '0' }, { id: 'b', label: '1 always' }, { id: 'c', label: '10' }], 'a'),
    qShort('Read file text into a:', 'string'),
    qMcq('Counting lines is useful for:', [{ id: 'a', label: 'Logs and diaries' }, { id: 'b', label: 'GPU drivers' }, { id: 'c', label: 'CSS' }], 'a'),
    qShort('Filter with:', 'comprehension'),
  ],
})

const oopEasy = makeProject('easy', {
  id: 'rectangle_class',
  title: 'Rectangle class',
  paragraphs: [
    'Model a rectangle with `width` and `height` attributes and an `area()` method.',
    'Create an instance and print its area.',
  ],
  sandboxCode: 'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    def area(self):\n        return self.width * self.height\n\nr = Rectangle(4, 5)\nprint(r.area())',
  challenges: [
    ch('easy', 'class keyword', 'Define `class Rectangle:`.', includes('class Rectangle'), { starterCode: 'class Rectangle:\n    pass' }),
    ch('medium', '__init__', 'Store width and height on self.', includes('def __init__'), { starterCode: 'class Rectangle:\n    def __init__(self, width, height):\n        ' }),
    ch('medium', 'area method', 'Return width * height.', pyVar('a', 'a == 20', 'class Rectangle:\n def __init__(self,w,h): self.width=w; self.height=h\n def area(self): return self.width*self.height\na=Rectangle(4,5).area()')),
    ch('hard', 'Create instance', 'Instantiate Rectangle(3, 3).', pyVar('r', 'r.area() == 9', 'class Rectangle:\n def __init__(self,w,h): self.width=w; self.height=h\n def area(self): return self.width*self.height\nr=Rectangle(3,3)')),
    ch('hard', 'Print area', 'Print the area of a rectangle.', pyOut('20'), { starterCode: 'print(20)' }),
    ch('expert', 'self parameter', 'Methods include self.', includes('self'), { starterCode: 'class Rectangle:\n    def area(self):\n        return 0' }),
  ],
  questions: [
    qMcq('class defines:', [{ id: 'a', label: 'A blueprint' }, { id: 'b', label: 'A file path' }, { id: 'c', label: 'A loop' }], 'a'),
    qShort('Constructor method:', '__init__'),
    qMcq('self refers to:', [{ id: 'a', label: 'The instance' }, { id: 'b', label: 'The module' }, { id: 'c', label: 'The CPU' }], 'a'),
    qShort('Area multiplies:', 'width and height'),
    qMcq('Methods are:', [{ id: 'a', label: 'Functions on objects' }, { id: 'b', label: 'Comments only' }, { id: 'c', label: 'Imports' }], 'a'),
    qShort('Create object with:', 'ClassName()'),
  ],
})

const oopMedium = makeProject('medium', {
  id: 'contact_card',
  title: 'Contact card',
  paragraphs: [
    'Build a `Contact` class with name, email, and a `label()` method returning a display string.',
    'Store multiple contacts in a list and print each label.',
  ],
  sandboxCode: 'class Contact:\n    def __init__(self, name, email):\n        self.name = name\n        self.email = email\n    def label(self):\n        return f"{self.name} <{self.email}>"\n\nbook = [Contact("Ana", "ana@mail.com")]\nfor c in book:\n    print(c.label())',
  challenges: [
    ch('easy', 'Contact class', 'Define class with name and email.', includes('class Contact'), { starterCode: 'class Contact:\n    def __init__(self, name, email):\n        pass' }),
    ch('medium', 'label method', 'Return formatted string.', pyVar('text', '"Ana" in text and "@" in text', 'class Contact:\n def __init__(self,n,e): self.name=n; self.email=e\n def label(self): return f"{self.name} <{self.email}>"\ntext=Contact("Ana","a@b").label()')),
    ch('medium', 'Contact list', 'Store two contacts.', pyVar('n', 'n == 2', 'book=[]\nbook.append(1)\nbook.append(2)\nn=len(book)')),
    ch('hard', 'Loop labels', 'Print each label.', includes('for'), { starterCode: 'book = []\n' }),
    ch('hard', 'Validate email', 'Check email contains @.', pyVar('ok', 'ok == True', 'ok = "@" in "a@b.c"')),
    ch('expert', 'repr style', 'label includes email in brackets.', includes('<'), { starterCode: 'text = "Ana <ana@mail.com>"\n' }),
  ],
  questions: [
    qMcq('Objects bundle:', [{ id: 'a', label: 'Data and behavior' }, { id: 'b', label: 'Only CSS' }, { id: 'c', label: 'Only RAM' }], 'a'),
    qShort('List stores many:', 'contacts'),
    qMcq('label() should return:', [{ id: 'a', label: 'Display string' }, { id: 'b', label: 'Nothing always' }, { id: 'c', label: 'Binary' }], 'a'),
    qShort('Email must contain:', '@'),
    qMcq('for loop visits:', [{ id: 'a', label: 'Each item' }, { id: 'b', label: 'Only first' }, { id: 'c', label: 'CPU' }], 'a'),
    qShort('Attributes live on:', 'self'),
  ],
})

const oopHard = makeProject('hard', {
  id: 'bank_account',
  title: 'Bank account',
  paragraphs: [
    'Create a `BankAccount` class with deposit, withdraw, and balance methods.',
    'Prevent negative balance on withdraw and track transaction count.',
  ],
  sandboxCode: 'class BankAccount:\n    def __init__(self):\n        self.balance = 0\n        self.transactions = 0\n    def deposit(self, amount):\n        self.balance += amount\n        self.transactions += 1\n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount\n            self.transactions += 1\n\nacct = BankAccount()\nacct.deposit(100)\nacct.withdraw(30)\nprint(acct.balance, acct.transactions)',
  challenges: [
    ch('easy', 'Start balance', 'Initialize balance to 0.', pyVar('b', 'b == 0', 'b=0')),
    ch('medium', 'deposit', 'Add amount to balance.', pyVar('b', 'b == 50', 'b=0\namount=50\nb+=amount')),
    ch('medium', 'withdraw safe', 'Subtract only if enough funds.', pyVar('b', 'b == 20', 'b=50\namount=30\nif amount<=b: b-=amount')),
    ch('hard', 'transaction counter', 'Increment on each action.', pyVar('t', 't == 2', 't=0\nt+=1\nt+=1')),
    ch('hard', 'final balance', 'End with balance 70 after ops.', pyVar('b', 'b == 70', 'b=100\nb-=30')),
    ch('expert', 'Print summary', 'Print balance and transactions.', pyOut('70 2'), { starterCode: 'print(70, 2)' }),
  ],
  questions: [
    qMcq('Encapsulation hides:', [{ id: 'a', label: 'Internal state' }, { id: 'b', label: 'Python version' }, { id: 'c', label: 'Keyboard' }], 'a'),
    qShort('Prevent overdraft with:', 'if'),
    qMcq('Methods mutate:', [{ id: 'a', label: 'Object state' }, { id: 'b', label: 'Only globals' }, { id: 'c', label: 'HTML' }], 'a'),
    qShort('deposit should:', 'increase balance'),
    qMcq('withdraw checks:', [{ id: 'a', label: 'Enough balance' }, { id: 'b', label: 'Color theme' }, { id: 'c', label: 'File extension' }], 'a'),
    qShort('Track operations with a:', 'counter'),
  ],
})

/** @type {Record<string, import('./_builders.mjs').[]>} */
export const SECTION_PROJECTS = {
  fundamentals: [aboutMeCard, unitConverter, receiptCalculator],
  control_flow: [guessTheNumber, quizGame, primeFinder],
  data_structures: [gradeBook, wordCounter, inventoryTracker],
  functions: [textTools, passwordChecker, bankAccounts],
  modules_and_packages: [
    modulesEasy,
    fromExisting('capstone_planning', 'medium', 'proj_modules_capstone_planning'),
    fromExisting('contact_book', 'hard', 'proj_modules_contact_book'),
  ],
  file_handling: [
    fileHandlingEasy,
    fromExisting('todo_list', 'medium', 'proj_file_handling_todo_list'),
    fromExisting('contact_book', 'hard', 'proj_file_handling_contact_book'),
  ],
  error_handling: [safeCalculator, signupForm, dataImporter],
  object_oriented: [oopEasy, oopMedium, oopHard],
  data_and_apis: [
    fromExisting('weather_cli', 'easy', 'proj_data_apis_weather_cli'),
    fromExisting('expense_tracker', 'medium', 'proj_data_apis_expense_tracker'),
    fromExisting('web_scraper_basics', 'hard', 'proj_data_apis_web_scraper'),
  ],
}

export function sectionProjectsFor(sectionId) {
  return SECTION_PROJECTS[sectionId] ?? []
}
