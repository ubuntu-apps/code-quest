import { makeProject, snippet, ch, qMcq, qShort, pyVar, pyOut, includes } from './_builders.mjs'
import { projectsTopics } from './projects.mjs'

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

const fundamentalsEasy = makeProject('easy', {
  id: 'about_me',
  title: 'About me script',
  paragraphs: [
    'Build a short program that stores your name and age in variables, then prints a friendly sentence with an f-string.',
    'Keep the output on one line so it is easy to test. Use clear variable names like `name` and `age`.',
  ],
  sandboxCode: 'name = "Alex"\nage = 12\nprint(f"Hi, I am {name} and I am {age} years old.")',
  sandboxSnippets: [
    snippet('Name variable', 'name = "Alex"'),
    snippet('Age variable', 'age = 12'),
    snippet('f-string greeting', 'name = "Sam"\nage = 9\nprint(f"Hi, I am {name} and I am {age} years old.")'),
    snippet('Add hobby', 'name = "Sam"\nage = 9\nhobby = "coding"\nprint(f"Hi, I am {name}, {age}, and I like {hobby}.")'),
  ],
  challenges: [
    ch('easy', 'Name variable', 'Set `name` to your first name as a string.', pyVar('name', 'isinstance(name, str) && len(name) > 0'), { starterCode: 'name = ' }),
    ch('easy', 'Age variable', 'Set `age` to a whole number.', pyVar('age', 'isinstance(age, int)'), { starterCode: 'age = ' }),
    ch('medium', 'Greeting sentence', 'Print a sentence that includes both name and age.', includes('print', 'name'), { starterCode: 'name = "Sam"\nage = 9\n' }),
    ch('medium', 'f-string', 'Use an f-string in your print call.', includes('f"'), { starterCode: 'name = "Sam"\nage = 9\nprint(' }),
    ch('hard', 'Extra detail', 'Add a third variable `hobby` and mention it in the output.', pyVar('hobby', 'isinstance(hobby, str)'), { starterCode: 'hobby = ' }),
    ch('hard', 'Full program', 'Print one line with name, age, and hobby.', includes('print'), { starterCode: '' }),
  ],
  questions: [
    qMcq('Variables store:', [{ id: 'a', label: 'Values' }, { id: 'b', label: 'Only comments' }, { id: 'c', label: 'CPU speed' }], 'a'),
    qShort('Display output with:', 'print'),
    qMcq('f-strings start with:', [{ id: 'a', label: 'f"' }, { id: 'b', label: 's"' }, { id: 'c', label: 'q"' }], 'a'),
    qShort('Age should be stored as a:', 'int'),
    qMcq('Clear variable names help:', [{ id: 'a', label: 'Readability' }, { id: 'b', label: 'Compilation only' }, { id: 'c', label: 'Deleting files' }], 'a'),
    qShort('Combine text and variables with:', 'f-string'),
  ],
})

const controlFlowHard = makeProject('hard', {
  id: 'fizzbuzz_mini',
  title: 'FizzBuzz mini',
  paragraphs: [
    'Print numbers 1–15, but replace multiples of 3 with `Fizz`, multiples of 5 with `Buzz`, and multiples of both with `FizzBuzz`.',
    'Use a for loop and if/elif branches. Collect results in a list, then print the list.',
  ],
  sandboxCode: 'out = []\nfor n in range(1, 16):\n    if n % 15 == 0:\n        out.append("FizzBuzz")\n    elif n % 3 == 0:\n        out.append("Fizz")\n    elif n % 5 == 0:\n        out.append("Buzz")\n    else:\n        out.append(str(n))\nprint(out)',
  challenges: [
    ch('easy', 'Loop range', 'Build `nums = list(range(1, 16))`.', pyVar('nums', 'len(nums) == 15'), { starterCode: 'nums = ' }),
    ch('medium', 'Divisible by 3', 'Set `fizz = True` when `9 % 3 == 0`.', pyVar('fizz', 'fizz == True'), { starterCode: 'fizz = ' }),
    ch('medium', 'Append Fizz', 'Append `"Fizz"` when n is 3.', pyVar('out', 'out == ["Fizz"]', 'out=[]\nn=3'), { starterCode: 'if n % 3 == 0:\n    out.append("Fizz")' }),
    ch('hard', 'FizzBuzz branch', 'For n=15 append `"FizzBuzz"`.', pyVar('label', 'label == "FizzBuzz"', 'label=""'), { starterCode: 'n=15\nif n%15==0:\n    label="FizzBuzz"' }),
    ch('hard', 'Build list', 'Produce 15 labels for 1..15.', pyVar('out', 'len(out) == 15', 'out=[]')),
    ch('expert', 'Print result', 'Print the full list.', includes('print'), { starterCode: 'out = ["1","2","Fizz"]\n' }),
  ],
  questions: [
    qMcq('FizzBuzz replaces multiples of:', [{ id: 'a', label: '3 and 5' }, { id: 'b', label: '2 only' }, { id: 'c', label: '7 only' }], 'a'),
    qShort('Loop 1 through 15 with:', 'range'),
    qMcq('elif runs when:', [{ id: 'a', label: 'Previous conditions were false' }, { id: 'b', label: 'Always' }, { id: 'c', label: 'Never' }], 'a'),
    qShort('Append adds to:', 'end of list'),
    qMcq('15 is multiple of:', [{ id: 'a', label: 'Both 3 and 5' }, { id: 'b', label: 'Neither' }, { id: 'c', label: 'Only 3' }], 'a'),
    qShort('Store labels in a:', 'list'),
  ],
})

const dataStructuresEasy = makeProject('easy', {
  id: 'grade_book',
  title: 'Grade book',
  paragraphs: [
    'Store student names and scores in a list of dictionaries. Calculate the class average and find the highest score.',
    'Practice list iteration, dict fields, and simple aggregation.',
  ],
  sandboxCode: 'grades = [{"name": "Ana", "score": 88}, {"name": "Bo", "score": 92}]\nscores = [g["score"] for g in grades]\nprint(sum(scores) / len(scores))\nprint(max(scores))',
  challenges: [
    ch('easy', 'List of dicts', 'Create `grades` with one student dict.', pyVar('grades', 'len(grades) == 1'), { starterCode: 'grades = [{"name":"Ana","score":90}]' }),
    ch('medium', 'Extract scores', 'Build `scores` list from grades.', pyVar('scores', 'scores == [88, 92]', 'grades=[{"score":88},{"score":92}]\nscores=[]'), { starterCode: 'for g in grades:\n    scores.append(g["score"])' }),
    ch('medium', 'Average', 'Set `avg` to mean of [80, 90].', pyVar('avg', 'avg == 85'), { starterCode: 'avg = sum([80,90]) / 2' }),
    ch('hard', 'Max score', 'Set `top` to highest score in list.', pyVar('top', 'top == 92'), { starterCode: 'top = max([88, 92])' }),
    ch('hard', 'Count students', 'Set `n` to number of grade entries.', pyVar('n', 'n == 2'), { starterCode: 'n = len(grades)', }),
    ch('expert', 'Print average', 'Print the average with a label.', pyOut('85.0'), { starterCode: 'print(85.0)' }),
  ],
  questions: [
    qMcq('List of dicts stores:', [{ id: 'a', label: 'Many records' }, { id: 'b', label: 'Only one number' }, { id: 'c', label: 'Binary files' }], 'a'),
    qShort('Mean uses sum divided by:', 'count'),
    qMcq('max() returns:', [{ id: 'a', label: 'Largest value' }, { id: 'b', label: 'Smallest value' }, { id: 'c', label: 'Random value' }], 'a'),
    qShort('Access dict field with:', 'key'),
    qMcq('Comprehension can build:', [{ id: 'a', label: 'A new list' }, { id: 'b', label: 'A CPU' }, { id: 'c', label: 'An OS' }], 'a'),
    qShort('Each student record needs:', 'fields'),
  ],
})

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
  fundamentals: [
    fundamentalsEasy,
    fromExisting('unit_converter', 'medium', 'proj_fundamentals_unit_converter', 6, 6, [
      snippet('km to miles', 'KM_TO_MI = 0.621371\n\ndef km_to_miles(km):\n    return km * KM_TO_MI\n\nprint(km_to_miles(10))'),
      snippet('C to F', 'def c_to_f(c):\n    return c * 9/5 + 32\n\nprint(c_to_f(0))'),
      snippet('Convert value', 'km = 5\nmiles = km * 0.621371\nprint(f"{km} km = {miles:.2f} mi")'),
      snippet('Unit dict', 'factors = {"km": 1000, "m": 1}\nprint(factors["km"])'),
    ]),
    fromExisting('password_generator', 'hard', 'proj_fundamentals_password_generator', 6, 6, [
      snippet('Random char', 'import random\nimport string\nprint(random.choice(string.ascii_letters))'),
      snippet('Join chars', 'import random\nimport string\nchars = string.ascii_letters + string.digits\nprint("".join(random.choice(chars) for _ in range(8)))'),
      snippet('Password fn', 'import random\nimport string\n\ndef generate_password(n=12):\n    chars = string.ascii_letters + string.digits\n    return "".join(random.choice(chars) for _ in range(n))\n\nprint(generate_password(8))'),
      snippet('Length option', 'length = 12\nprint(f"Password length: {length}")'),
    ]),
  ],
  control_flow: [
    fromExisting('cli_guess_game', 'easy', 'proj_control_flow_guess_game'),
    fromExisting('quiz_app', 'medium', 'proj_control_flow_quiz_app'),
    controlFlowHard,
  ],
  data_structures: [
    dataStructuresEasy,
    fromExisting('quiz_app', 'medium', 'proj_data_structures_quiz_app'),
    fromExisting('todo_list', 'hard', 'proj_data_structures_todo_list'),
  ],
  functions: [
    fromExisting('unit_converter', 'easy', 'proj_functions_unit_converter'),
    fromExisting('password_generator', 'medium', 'proj_functions_password_generator'),
    fromExisting('expense_tracker', 'hard', 'proj_functions_expense_tracker'),
  ],
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
  error_handling: [
    fromExisting('cli_guess_game', 'easy', 'proj_error_handling_guess_game'),
    fromExisting('quiz_app', 'medium', 'proj_error_handling_quiz_app'),
    fromExisting('expense_tracker', 'hard', 'proj_error_handling_expense_tracker'),
  ],
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
