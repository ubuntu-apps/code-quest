/** Hint and solution text for Python Fundamentals challenges (by topic id, in challenge order). */
export const FUNDAMENTALS_HELP = {
  what_is_python: [
    {
      hint: 'Use print() with your name inside quotes.',
      solution: 'print("Alex")',
    },
    {
      hint: 'print() can display numbers without quotes.',
      solution: 'print(100)',
    },
    {
      hint: 'Call print() twice — once for each line.',
      solution: 'print("Line 1")\nprint("Line 2")',
    },
    {
      hint: 'Put the exact sentence in quotes inside print().',
      solution: 'print("I am learning Python.")',
    },
    {
      hint: 'You can print an expression like 6 * 7 inside print().',
      solution: 'print(6 * 7)',
    },
    {
      hint: 'Pass two arguments to print(); Python adds a space between them.',
      solution: 'print("Hello", "World")',
    },
    {
      hint: 'Use ** for exponentiation in Python.',
      solution: 'print(2 ** 10)',
    },
    {
      hint: 'print() accepts multiple arguments; mix text and numbers in one call.',
      solution: 'print("The answer is", 42)',
    },
    {
      hint: 'Use three separate print() calls for three lines.',
      solution: 'print("Alex")\nprint(12)\nprint("Ready to code!")',
    },
    {
      hint: 'Put the exact text in quotes inside print().',
      solution: 'print("Score: 95/100")',
    },
  ],
  print_command: [
    {
      hint: 'Pass the exact text as a string to print().',
      solution: 'print("Hello, CodeQuest!")',
    },
    {
      hint: 'Print the variable x after it is assigned.',
      solution: 'print(x)',
    },
    {
      hint: 'True is a boolean literal you can print directly.',
      solution: 'print(True)',
    },
    {
      hint: 'Use the sep keyword argument to join items with commas.',
      solution: 'print("a", "b", "c", sep=",")',
    },
    {
      hint: 'Print the result of subtracting 6 from 15.',
      solution: 'print(15 - 6)',
    },
    {
      hint: 'Print both variables in one print() call with default spacing.',
      solution: 'print(first, last)',
    },
    {
      hint: 'Use end="" on the first print so the next output continues on the same line.',
      solution: 'print("Loading", end="")\nprint("...")',
    },
    {
      hint: 'Use an f-string to embed the score variable.',
      solution: 'print(f"Score: {score}")',
    },
    {
      hint: 'Use two print() calls for two separate lines.',
      solution: 'print("First")\nprint("Second")',
    },
    {
      hint: 'Use repr() inside print() to show quotes around the string.',
      solution: 'print(repr(s))',
    },
  ],
  variables: [
    {
      hint: 'Assign 42 to the variable answer with =.',
      solution: 'answer = 42',
    },
    {
      hint: 'Assign the string hello to greeting using quotes.',
      solution: 'greeting = "hello"',
    },
    {
      hint: 'Set is_ready to the boolean literal True.',
      solution: 'is_ready = True',
    },
    {
      hint: 'Reassign n to 2 with a single assignment statement.',
      solution: 'n = 2',
    },
    {
      hint: 'Add 1 to count using count = count + 1.',
      solution: 'count = count + 1',
    },
    {
      hint: 'Use a temporary variable to hold a while swapping a and b.',
      solution: 'temp = a\na = b\nb = temp',
    },
    {
      hint: 'Assign both x and y in one line using comma separation.',
      solution: 'x, y = 10, 20',
    },
    {
      hint: 'Use snake_case for the variable name total_score.',
      solution: 'total_score = 100',
    },
    {
      hint: 'Chain assignment sets every name to the same value.',
      solution: 'a = b = c = 0',
    },
    {
      hint: 'Compute total as price plus tax: price * tax_rate.',
      solution: 'total = price + price * tax_rate',
    },
  ],
  operators: [
    {
      hint: 'Write a simple addition expression with 10 and 5.',
      solution: '10 + 5',
    },
    {
      hint: 'Use < to compare 7 and 3.',
      solution: '7 < 3',
    },
    {
      hint: 'The modulo operator % returns the remainder.',
      solution: '10 % 3',
    },
    {
      hint: 'Use // for floor (integer) division.',
      solution: 'q = 17 // 5',
    },
    {
      hint: 'Use ** to raise 2 to the 8th power.',
      solution: 'p = 2 ** 8',
    },
    {
      hint: 'Evaluate True and False and store the result.',
      solution: 'result = True and False',
    },
    {
      hint: 'Python allows chained comparisons like 1 < 2 < 3.',
      solution: 'ok = 1 < 2 < 3',
    },
    {
      hint: 'Use += to add to x in place.',
      solution: 'x += 3',
    },
    {
      hint: 'Multiplication happens before addition: 3 * 4 first, then + 2.',
      solution: 'val = 2 + 3 * 4',
    },
    {
      hint: 'not True evaluates to False.',
      solution: 'flag = not True',
    },
  ],
  data_types: [
    {
      hint: 'Assign an integer literal 7 to n.',
      solution: 'n = 7',
    },
    {
      hint: 'Assign a decimal number 3.5 to x.',
      solution: 'x = 3.5',
    },
    {
      hint: 'Assign the string "ok" to s using quotes.',
      solution: 's = "ok"',
    },
    {
      hint: 'Call type() on v and store the result in t.',
      solution: 't = type(v)',
    },
    {
      hint: 'None is Python\'s null value.',
      solution: 'data = None',
    },
    {
      hint: 'Comparisons return booleans; wrap 5 > 2 in parentheses if you like.',
      solution: 'ok = 5 > 2',
    },
    {
      hint: 'isinstance(value, type) checks whether a value is of a given type.',
      solution: 'flag = isinstance(3.0, float)',
    },
    {
      hint: 'A list can hold values of different types.',
      solution: 'mix = [1, "a", True]',
    },
    {
      hint: 'Use type() on the expression 2 ** 3.',
      solution: 't = type(2 ** 3)',
    },
    {
      hint: 'Division with / always produces a float in Python 3.',
      solution: 'r = 7 / 2',
    },
  ],
  strings: [
    {
      hint: 'Assign the string cat to pet using quotes.',
      solution: 'pet = "cat"',
    },
    {
      hint: 'Use + to concatenate two strings.',
      solution: 'msg = "Hello" + "!"',
    },
    {
      hint: 'len() returns the number of characters in a string.',
      solution: 'n = len(s)',
    },
    {
      hint: 'Call .upper() on the string to uppercase it.',
      solution: 'loud = "hi".upper()',
    },
    {
      hint: 'Index 0 is the first character of a string.',
      solution: 'first = word[0]',
    },
    {
      hint: 'Prefix the string with f to embed n inside braces.',
      solution: 'line = f"Count: {n}"',
    },
    {
      hint: 'strip() removes leading and trailing whitespace.',
      solution: 't = "  hi  ".strip()',
    },
    {
      hint: 'replace(old, new) swaps characters in a string.',
      solution: 'out = "cat".replace("a", "o")',
    },
    {
      hint: 'Index -1 is the last character of a string.',
      solution: 'last = "Python"[-1]',
    },
    {
      hint: 'split() with default whitespace breaks a string into a list of words.',
      solution: 'parts = "a b c".split()',
    },
  ],
  input_output: [
    {
      hint: 'Use print() with the exact prompt text in quotes.',
      solution: 'print("Enter name:")',
    },
    {
      hint: 'int() converts a numeric string to an integer.',
      solution: 'n = int("12")',
    },
    {
      hint: 'input() reads text from the user and needs a prompt string.',
      solution: 'name = input("Name? ")',
    },
    {
      hint: 'float() converts a string to a floating-point number.',
      solution: 'x = float("3.5")',
    },
    {
      hint: 'Combine the greeting and name in one print() call.',
      solution: 'print("Hello, Kim!")',
    },
    {
      hint: 'Pass raw to int() to convert the string to a number.',
      solution: 'n = int(raw)',
    },
    {
      hint: 'Convert both strings to int, add them, and print with a label.',
      solution: 'print(f"Result: {int(\'7\') + int(\'8\')}")',
    },
    {
      hint: 'Strip whitespace from raw before converting to int.',
      solution: 'val = int(raw.strip())',
    },
    {
      hint: 'Print a and b on separate lines with two print() calls.',
      solution: 'print(a)\nprint(b)',
    },
    {
      hint: 'input() always returns a string — store that fact in note.',
      solution: 'note = "str"',
    },
  ],
  comments_style: [
    {
      hint: 'Comments start with # and are ignored by Python.',
      solution: '# learning python',
    },
    {
      hint: 'Add # and a short note after the assignment on the same line.',
      solution: 'x = 1  # start',
    },
    {
      hint: 'A docstring is a triple-quoted string right after def.',
      solution: 'def add(a, b):\n    """add two"""\n    return a + b',
    },
    {
      hint: 'Use snake_case for variable names per PEP 8.',
      solution: 'user_name = "a"',
    },
    {
      hint: 'PEP 8 recommends spaces around = in assignments.',
      solution: 'y = 2',
    },
    {
      hint: 'Each comment line starts with #.',
      solution: '# step 1\n# step 2',
    },
    {
      hint: 'Function names use lowercase with underscores.',
      solution: 'def calculate_total():\n    pass',
    },
    {
      hint: 'Choose a descriptive name instead of a single letter.',
      solution: 'item_count = 3',
    },
    {
      hint: 'Define a function with a triple-quoted docstring.',
      solution: 'def fn():\n    """help"""\n    pass',
    },
    {
      hint: 'PEP 8 is Python\'s style guide — store its name in style.',
      solution: 'style = "pep8"',
    },
  ],
  type_conversion: [
    {
      hint: 'int() converts a numeric string to an integer.',
      solution: 'n = int("8")',
    },
    {
      hint: 'str() converts a number to its text form.',
      solution: 's = str(99)',
    },
    {
      hint: 'float() converts a string to a decimal number.',
      solution: 'x = float("2.5")',
    },
    {
      hint: 'bool(0) is False because 0 is falsy.',
      solution: 'f = bool(0)',
    },
    {
      hint: 'Convert to int first, then to str.',
      solution: 's = str(int("7"))',
    },
    {
      hint: 'int() truncates toward zero, so 3.9 becomes 3.',
      solution: 'n = int(3.9)',
    },
    {
      hint: 'An empty string is falsy; a non-empty string is truthy.',
      solution: 'empty = bool("")\nhas = bool("a")',
    },
    {
      hint: 'round() returns the nearest integer (banker\'s rounding for .5).',
      solution: 'r = round(3.6)',
    },
    {
      hint: 'Pass base 16 as the second argument to int() for hex strings.',
      solution: 'n = int("ff", 16)',
    },
    {
      hint: 'str(True) produces the text "True".',
      solution: 's = str(True)',
    },
  ],
  numbers_math: [
    {
      hint: 'abs() returns the absolute value of a number.',
      solution: 'n = abs(-7)',
    },
    {
      hint: 'round() rounds a float to the nearest integer.',
      solution: 'r = round(4.6)',
    },
    {
      hint: 'max() returns the largest of the values you pass in.',
      solution: 'm = max(1, 9, 3)',
    },
    {
      hint: 'pow(base, exp) raises base to the power of exp.',
      solution: 'p = pow(2, 5)',
    },
    {
      hint: 'Import math and call math.sqrt() on 25.',
      solution: 'import math\nr = math.sqrt(25)',
    },
    {
      hint: 'divmod(a, b) returns quotient and remainder as a tuple.',
      solution: 'q, rem = divmod(17, 5)',
    },
    {
      hint: 'sum() adds all numbers in an iterable.',
      solution: 's = sum([1, 2, 3, 4])',
    },
    {
      hint: 'Float arithmetic can produce tiny rounding differences from 0.3.',
      solution: 'x = 0.1 + 0.2',
    },
    {
      hint: 'math.floor() rounds down to the nearest integer.',
      solution: 'import math\nn = math.floor(3.9)',
    },
    {
      hint: 'Append j to a number to create a complex literal.',
      solution: 'z = 2 + 3j',
    },
  ],
}

/** @param {string} topicId @param {number} index */
export function helpFor(topicId, index) {
  const items = FUNDAMENTALS_HELP[topicId]
  if (!items?.[index]) {
    throw new Error(`Missing help for ${topicId} challenge index ${index}`)
  }
  return items[index]
}
