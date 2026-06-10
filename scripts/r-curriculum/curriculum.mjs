import { topic } from './helpers.mjs'

export const sections = [
  {
    sectionId: 'introduction',
    filename: 'introduction.json',
    title: 'Introduction to R',
    topics: [
      topic('what_is_r', 'What is R', {
        introTitle: 'Welcome to R',
        lead: 'R is a language and environment for statistical computing and graphics, widely used in academia, research, and industry.',
        sandbox: 'print("Hello from R!")\nprint(R.version.string)',
        readMore: {
          label: 'About R',
          url: 'https://www.r-project.org/about.html',
          source: 'R Project',
        },
        mcqPrompt: 'R is primarily designed for:',
        mcqChoices: [
          { id: 'a', label: 'Statistical computing and data analysis' },
          { id: 'b', label: 'Operating system kernels only' },
          { id: 'c', label: 'GPU shader programming only' },
        ],
        shortAnswer: 'print',
      }),
      topic('r_vs_other_languages', 'R vs Python and Other Languages', {
        sandbox: '# R excels at statistics; Python excels at general software\nprint("Compare tools to the task")',
        needles: ['print'],
        mcqPrompt: 'R is often compared to Python because both are used for:',
        mcqChoices: [
          { id: 'a', label: 'Data science and analysis' },
          { id: 'b', label: 'Only mobile app UI' },
          { id: 'c', label: 'Only firmware' },
        ],
        shortAnswer: 'data',
      }),
      topic('installing_r', 'Installing R', {
        sandbox: '# After install, verify in the console:\nR.version.string',
        needles: ['R.version'],
        shortPrompt: 'Which function shows the installed R version string?',
        shortAnswer: 'R.version.string',
      }),
      topic('rstudio_positron', 'RStudio and Positron', {
        sandbox: '# IDE features: scripts, console, environment, plots\nprint("Use an IDE for productivity")',
        mcqPrompt: 'An R IDE typically provides:',
        mcqChoices: [
          { id: 'a', label: 'Script editor, console, and variable panes' },
          { id: 'b', label: 'Only a web browser' },
          { id: 'c', label: 'Only a file manager' },
        ],
      }),
      topic('r_console', 'The R Console', {
        sandbox: '2 + 2\nprint("Interactive REPL")',
        needles: ['print'],
        shortAnswer: 'console',
        shortPrompt: 'What do we call the interactive window where you type R commands?',
      }),
      topic('r_scripts', 'R Scripts', {
        sandbox: '# Save reusable work in .R files\nmessage <- "From a script"\nprint(message)',
        needles: ['print', '<-'],
        regex: '<-\\s*',
      }),
      topic('first_commands', 'Your First R Commands', {
        sandbox: 'print("Hello, world!")\nx <- 10\nprint(x)',
        needles: ['print', '<-'],
      }),
      topic('help_system', 'The Help System', {
        sandbox: '?print\nhelp(sum)',
        needles: ['help', '?'],
        shortPrompt: 'Which prefix opens help for a function in the console?',
        shortAnswer: '?',
      }),
      topic('r_packages_overview', 'Packages Overview', {
        sandbox: '# install.packages("ggplot2")  # run once\n# library(ggplot2)\nprint("Packages extend R")',
        needles: ['library', 'install.packages'],
        shortAnswer: 'library',
      }),
      topic('r_community_resources', 'Community and Learning Resources', {
        sandbox: 'print("CRAN, RStudio Community, Stack Overflow, R-bloggers")',
        mcqPrompt: 'CRAN is:',
        mcqChoices: [
          { id: 'a', label: 'The Comprehensive R Archive Network' },
          { id: 'b', label: 'A graphics device' },
          { id: 'c', label: 'A type of data frame' },
        ],
      }),
      topic('r_use_cases', 'Common Use Cases for R', {
        sandbox: 'print(c("statistics", "visualization", "bioinformatics", "reports"))',
        needles: ['c(', 'print'],
      }),
      topic('workspace_environment', 'Workspace and Environment', {
        sandbox: 'x <- 42\nls()\nprint(x)',
        needles: ['ls', '<-'],
        shortAnswer: 'ls',
        shortPrompt: 'Which function lists objects in the workspace?',
      }),
    ],
  },
  {
    sectionId: 'basic_syntax',
    filename: 'basic_syntax.json',
    title: 'Basic Syntax and Operators',
    topics: [
      topic('assignment_operators', 'Assignment Operators', {
        sandbox: 'x <- 5\ny = 10\nprint(x + y)',
        needles: ['<-'],
        regex: '<-\\s*\\d+',
        shortAnswer: '<-',
      }),
      topic('numeric_types', 'Numeric and Integer Types', {
        sandbox: 'a <- 3.14\nb <- 42L\nprint(typeof(a))\nprint(typeof(b))',
        needles: ['typeof', 'L'],
        shortAnswer: 'numeric',
      }),
      topic('character_strings', 'Character Strings', {
        sandbox: 'name <- "Alice"\ngreeting <- paste("Hello,", name)\nprint(greeting)',
        needles: ['paste', '"'],
        shortAnswer: 'character',
      }),
      topic('logical_values', 'Logical Values', {
        sandbox: 'flag <- TRUE\nprint(flag)\nprint(!flag)',
        needles: ['TRUE', 'print'],
        shortAnswer: 'TRUE',
      }),
      topic('arithmetic_operators', 'Arithmetic Operators', {
        sandbox: 'print(10 + 3)\nprint(2 ^ 10)\nprint(20 %% 3)',
        needles: ['+', '^'],
        shortAnswer: '+',
      }),
      topic('comparison_operators', 'Comparison Operators', {
        sandbox: 'x <- 5\nprint(x == 5)\nprint(x >= 4)',
        needles: ['==', '>='],
        shortAnswer: '==',
      }),
      topic('logical_operators', 'Logical Operators', {
        sandbox: 'a <- TRUE\nb <- FALSE\nprint(a & b)\nprint(a | b)',
        needles: ['&', '|'],
        shortAnswer: '&',
      }),
      topic('operator_precedence', 'Operator Precedence', {
        sandbox: 'print(2 + 3 * 4)\nprint((2 + 3) * 4)',
        needles: ['print', '*'],
        mcqPrompt: 'In R, which binds tighter: * or +?',
        mcqChoices: [
          { id: 'a', label: 'Multiplication (*)' },
          { id: 'b', label: 'Addition (+)' },
          { id: 'c', label: 'They are equal' },
        ],
      }),
      topic('comments', 'Comments', {
        sandbox: '# This is a comment\nx <- 1  # inline comment\nprint(x)',
        needles: ['#'],
        shortAnswer: '#',
      }),
      topic('naming_conventions', 'Naming Conventions', {
        sandbox: 'my_variable <- 10\nprint(my_variable)',
        needles: ['my_variable', '<-'],
        regex: '[a-z_]+\\s*<-',
      }),
      topic('type_coercion', 'Type Coercion', {
        sandbox: 'print(as.numeric("42"))\nprint(as.character(42))',
        needles: ['as.numeric', 'as.character'],
        shortAnswer: 'as.numeric',
      }),
      topic('missing_values_na', 'Missing Values (NA)', {
        sandbox: 'x <- c(1, NA, 3)\nprint(is.na(x))\nprint(sum(x, na.rm = TRUE))',
        needles: ['NA', 'is.na'],
        shortAnswer: 'NA',
      }),
      topic('infinity_nan', 'Infinity and NaN', {
        sandbox: 'print(1 / 0)\nprint(0 / 0)\nprint(is.nan(0/0))',
        needles: ['Inf', 'NaN', 'is.nan'],
        shortAnswer: 'Inf',
      }),
      topic('special_values_null', 'NULL and Special Values', {
        sandbox: 'empty <- NULL\nprint(is.null(empty))',
        needles: ['NULL', 'is.null'],
        shortAnswer: 'NULL',
      }),
    ],
  },
  {
    sectionId: 'data_structures',
    filename: 'data_structures.json',
    title: 'Data Structures',
    topics: [
      topic('atomic_vectors', 'Atomic Vectors', {
        sandbox: 'nums <- c(1, 2, 3)\nprint(typeof(nums))',
        needles: ['c(', 'typeof'],
      }),
      topic('creating_vectors', 'Creating Vectors', {
        sandbox: 'v <- c(10, 20, 30)\nprint(length(v))',
        needles: ['c(', 'length'],
        shortAnswer: 'c',
      }),
      topic('vector_indexing', 'Vector Indexing', {
        sandbox: 'v <- c("a", "b", "c", "d")\nprint(v[2])\nprint(v[c(1, 3)])',
        needles: ['v[', 'c('],
      }),
      topic('vector_recycling', 'Vector Recycling', {
        sandbox: 'print(c(1, 2, 3) + c(10, 20))',
        needles: ['c(', '+'],
        mcqPrompt: 'Recycling in R means:',
        mcqChoices: [
          { id: 'a', label: 'Shorter vectors repeat to match longer ones' },
          { id: 'b', label: 'All vectors must be equal length always' },
          { id: 'c', label: 'Vectors cannot be combined' },
        ],
      }),
      topic('matrices', 'Matrices', {
        sandbox: 'm <- matrix(1:6, nrow = 2)\nprint(m)',
        needles: ['matrix'],
        shortAnswer: 'matrix',
      }),
      topic('matrix_operations', 'Matrix Operations', {
        sandbox: 'A <- matrix(1:4, 2)\nB <- matrix(5:8, 2)\nprint(A %*% B)',
        needles: ['matrix', '%*%'],
        shortAnswer: '%*%',
      }),
      topic('arrays', 'Arrays', {
        sandbox: 'arr <- array(1:8, dim = c(2, 2, 2))\nprint(dim(arr))',
        needles: ['array', 'dim'],
        shortAnswer: 'array',
      }),
      topic('lists', 'Lists', {
        sandbox: 'person <- list(name = "Ada", age = 36)\nprint(person$name)',
        needles: ['list(', '$'],
        shortAnswer: 'list',
      }),
      topic('list_indexing', 'List Indexing', {
        sandbox: 'L <- list(a = 1, b = 2)\nprint(L[[1]])\nprint(L$b)',
        needles: ['L[[', '$'],
      }),
      topic('factors', 'Factors', {
        sandbox: 'sizes <- factor(c("small", "large", "medium"))\nprint(levels(sizes))',
        needles: ['factor', 'levels'],
        shortAnswer: 'factor',
      }),
      topic('data_frames', 'Data Frames', {
        sandbox: 'df <- data.frame(x = 1:3, y = letters[1:3])\nprint(df)',
        needles: ['data.frame'],
        shortAnswer: 'data.frame',
      }),
      topic('data_frame_indexing', 'Data Frame Indexing', {
        sandbox: 'df <- data.frame(a = 1:3, b = 4:6)\nprint(df$a)\nprint(df[2, ])',
        needles: ['df$', 'df['],
      }),
      topic('tibbles_intro', 'Tibbles Introduction', {
        sandbox: 'library(tibble)\ntbl <- tibble(x = 1:3, name = c("a", "b", "c"))\nprint(tbl)',
        needles: ['tibble'],
        shortAnswer: 'tibble',
      }),
      topic('attributes', 'Object Attributes', {
        sandbox: 'v <- 1:3\nattr(v, "label") <- "count"\nprint(attr(v, "label"))',
        needles: ['attr('],
        shortAnswer: 'attr',
      }),
      topic('structure_inspection', 'Inspecting Structure', {
        sandbox: 'df <- data.frame(x = 1:3, y = c("a", "b", "c"))\nstr(df)\nsummary(df)',
        needles: ['str(', 'summary'],
        shortAnswer: 'str',
      }),
    ],
  },
  {
    sectionId: 'functions_and_control_flow',
    filename: 'functions_and_control_flow.json',
    title: 'Functions and Control Flow',
    topics: [
      topic('writing_functions', 'Writing Functions', {
        sandbox: 'square <- function(x) {\n  x * x\n}\nprint(square(5))',
        needles: ['function'],
        shortAnswer: 'function',
      }),
      topic('function_arguments', 'Function Arguments', {
        sandbox: 'add <- function(a, b) a + b\nprint(add(2, 3))',
        needles: ['function', 'add('],
      }),
      topic('return_values', 'Return Values', {
        sandbox: 'double <- function(x) {\n  return(x * 2)\n}\nprint(double(4))',
        needles: ['return'],
        shortAnswer: 'return',
      }),
      topic('default_arguments', 'Default Arguments', {
        sandbox: 'greet <- function(name = "world") paste("Hello", name)\nprint(greet())',
        needles: ['function', '='],
      }),
      topic('if_else', 'if and else', {
        sandbox: 'x <- 5\nif (x > 0) {\n  print("positive")\n} else {\n  print("non-positive")\n}',
        needles: ['if (', 'else'],
        shortAnswer: 'if',
      }),
      topic('ifelse_vectorized', 'Vectorized ifelse', {
        sandbox: 'x <- c(-1, 0, 2)\nprint(ifelse(x > 0, "pos", "non-pos"))',
        needles: ['ifelse'],
        shortAnswer: 'ifelse',
      }),
      topic('for_loops', 'for Loops', {
        sandbox: 'total <- 0\nfor (i in 1:5) total <- total + i\nprint(total)',
        needles: ['for (', 'in '],
        shortAnswer: 'for',
      }),
      topic('while_loops', 'while Loops', {
        sandbox: 'n <- 1\nwhile (n < 10) n <- n * 2\nprint(n)',
        needles: ['while ('],
        shortAnswer: 'while',
      }),
      topic('repeat_break_next', 'repeat, break, and next', {
        sandbox: 'for (i in 1:10) {\n  if (i == 3) next\n  if (i == 8) break\n  print(i)\n}',
        needles: ['break', 'next'],
        shortAnswer: 'break',
      }),
      topic('switch_function', 'switch Function', {
        sandbox: 'day <- 2\nlabel <- switch(day, "Mon", "Tue", "Wed")\nprint(label)',
        needles: ['switch'],
        shortAnswer: 'switch',
      }),
      topic('vectorization', 'Vectorization', {
        sandbox: 'x <- 1:5\nprint(x * 2)\nprint(sqrt(x))',
        needles: ['sqrt', '*'],
        mcqPrompt: 'Vectorization in R means:',
        mcqChoices: [
          { id: 'a', label: 'Operations apply element-wise without explicit loops' },
          { id: 'b', label: 'Only scalars are allowed' },
          { id: 'c', label: 'All code must use for loops' },
        ],
      }),
      topic('apply_family_intro', 'apply Family Introduction', {
        sandbox: 'm <- matrix(1:6, 2)\nprint(apply(m, 1, sum))',
        needles: ['apply'],
        shortAnswer: 'apply',
      }),
      topic('anonymous_functions', 'Anonymous Functions', {
        sandbox: 'square <- function(x) x^2\nprint(sapply(1:3, square))',
        needles: ['function', 'sapply'],
      }),
      topic('scope_environments', 'Scope and Environments', {
        sandbox: 'f <- function() {\n  local_x <- 10\n  local_x\n}\nprint(f())',
        needles: ['function', '<-'],
        mcqPrompt: 'Variables created inside a function are typically:',
        mcqChoices: [
          { id: 'a', label: 'Local to that function call' },
          { id: 'b', label: 'Always global' },
          { id: 'c', label: 'Invalid in R' },
        ],
      }),
    ],
  },
  {
    sectionId: 'data_frames',
    filename: 'data_frames.json',
    title: 'Working with Data Frames and Tibbles',
    topics: [
      topic('creating_data_frames', 'Creating Data Frames', {
        sandbox: 'df <- data.frame(id = 1:3, value = c(10, 20, 30))\nprint(nrow(df))',
        needles: ['data.frame', 'nrow'],
      }),
      topic('reading_structure', 'Reading Structure', {
        sandbox: 'str(mtcars)\nhead(mtcars, 3)',
        needles: ['str(', 'head'],
        shortAnswer: 'head',
      }),
      topic('selecting_columns', 'Selecting Columns', {
        sandbox: 'library(dplyr)\nmtcars %>% select(mpg, cyl)',
        needles: ['select', '%>%'],
        shortAnswer: 'select',
      }),
      topic('filtering_rows', 'Filtering Rows', {
        sandbox: 'library(dplyr)\nmtcars %>% filter(mpg > 20)',
        needles: ['filter', '%>%'],
        shortAnswer: 'filter',
      }),
      topic('adding_columns', 'Adding Columns', {
        sandbox: 'library(dplyr)\nmtcars %>% mutate(kpl = mpg * 0.425)',
        needles: ['mutate'],
        shortAnswer: 'mutate',
      }),
      topic('modifying_columns', 'Modifying Columns', {
        sandbox: 'library(dplyr)\nmtcars %>% mutate(mpg = round(mpg, 1))',
        needles: ['mutate', 'round'],
      }),
      topic('arranging_sorting', 'Arranging and Sorting', {
        sandbox: 'library(dplyr)\nmtcars %>% arrange(desc(mpg))',
        needles: ['arrange', 'desc'],
        shortAnswer: 'arrange',
      }),
      topic('distinct_unique', 'Distinct and Unique Values', {
        sandbox: 'library(dplyr)\nmtcars %>% distinct(cyl)\nprint(unique(mtcars$cyl))',
        needles: ['distinct', 'unique'],
        shortAnswer: 'distinct',
      }),
      topic('joins_basics', 'Joins Basics', {
        sandbox: 'library(dplyr)\nleft_join(data.frame(id = 1:2, a = c("x", "y")),\n              data.frame(id = 1:2, b = c(10, 20)), by = "id")',
        needles: ['left_join', 'by'],
        shortAnswer: 'left_join',
      }),
      topic('bind_rows_cols', 'bind_rows and bind_cols', {
        sandbox: 'library(dplyr)\nbind_rows(data.frame(x = 1), data.frame(x = 2))',
        needles: ['bind_rows'],
        shortAnswer: 'bind_rows',
      }),
      topic('tibble_vs_dataframe', 'Tibble vs Data Frame', {
        sandbox: 'library(tibble)\ntbl <- as_tibble(mtcars)\nprint(class(tbl))',
        needles: ['as_tibble', 'tibble'],
        shortAnswer: 'tibble',
      }),
      topic('column_types', 'Column Types', {
        sandbox: 'library(readr)\nparse_guess(c("1", "2", "3"))',
        needles: ['parse_'],
        shortAnswer: 'parse',
      }),
      topic('rename_columns', 'Renaming Columns', {
        sandbox: 'library(dplyr)\nmtcars %>% rename(miles_per_gallon = mpg)',
        needles: ['rename'],
        shortAnswer: 'rename',
      }),
      topic('slice_sample', 'slice and sample', {
        sandbox: 'library(dplyr)\nmtcars %>% slice(1:5)\nmtcars %>% slice_sample(n = 3)',
        needles: ['slice', 'slice_sample'],
        shortAnswer: 'slice',
      }),
    ],
  },
  {
    sectionId: 'data_import_export',
    filename: 'data_import_export.json',
    title: 'Data Import and Export',
    topics: [
      topic('working_directory', 'Working Directory', {
        sandbox: 'print(getwd())\n# setwd("/path/to/project")',
        needles: ['getwd'],
        shortAnswer: 'getwd',
      }),
      topic('file_paths', 'File Paths', {
        sandbox: 'library(here)\nhere("data", "sample.csv")',
        needles: ['here('],
        shortAnswer: 'here',
      }),
      topic('read_csv', 'Reading CSV with readr', {
        sandbox: 'library(readr)\n# df <- read_csv("data.csv")\nprint("Use read_csv for tidy import")',
        needles: ['read_csv'],
        shortAnswer: 'read_csv',
      }),
      topic('read_delimited', 'Reading Delimited Files', {
        sandbox: 'library(readr)\n# read_delim("file.tsv", delim = "\\t")',
        needles: ['read_delim', 'delim'],
        shortAnswer: 'read_delim',
      }),
      topic('read_excel', 'Reading Excel Files', {
        sandbox: 'library(readxl)\n# df <- read_excel("data.xlsx", sheet = 1)',
        needles: ['read_excel'],
        shortAnswer: 'read_excel',
      }),
      topic('read_json', 'Reading JSON', {
        sandbox: 'library(jsonlite)\n# fromJSON("data.json")',
        needles: ['fromJSON'],
        shortAnswer: 'fromJSON',
      }),
      topic('read_rds_rda', 'Reading RDS and RData', {
        sandbox: '# obj <- readRDS("model.rds")\n# load("workspace.RData")',
        needles: ['readRDS', 'load'],
        shortAnswer: 'readRDS',
      }),
      topic('write_csv', 'Writing CSV', {
        sandbox: 'library(readr)\n# write_csv(df, "out.csv")',
        needles: ['write_csv'],
        shortAnswer: 'write_csv',
      }),
      topic('write_rds', 'Writing RDS', {
        sandbox: '# saveRDS(df, "df.rds")',
        needles: ['saveRDS'],
        shortAnswer: 'saveRDS',
      }),
      topic('encoding_issues', 'Encoding Issues', {
        sandbox: 'library(readr)\n# read_csv("file.csv", locale = locale(encoding = "UTF-8"))',
        needles: ['locale', 'encoding'],
        shortAnswer: 'encoding',
      }),
      topic('column_type_parsing', 'Column Type Parsing', {
        sandbox: 'library(readr)\n# read_csv("file.csv", col_types = cols(id = col_integer()))',
        needles: ['col_types', 'cols'],
        shortAnswer: 'col_types',
      }),
      topic('import_pitfalls', 'Common Import Pitfalls', {
        sandbox: 'print(c("wrong delimiter", "headers", "NA strings", "encoding"))',
        mcqPrompt: 'A common CSV import issue is:',
        mcqChoices: [
          { id: 'a', label: 'Wrong delimiter or column types' },
          { id: 'b', label: 'R cannot read text files' },
          { id: 'c', label: 'Files must be binary only' },
        ],
      }),
      topic('web_data_import', 'Importing Web Data', {
        sandbox: 'url <- "https://example.com/data.csv"\n# read_csv(url)',
        needles: ['read_csv', 'url'],
      }),
      topic('database_connections_intro', 'Database Connections Intro', {
        sandbox: 'library(DBI)\n# con <- dbConnect(RSQLite::SQLite(), "db.sqlite")',
        needles: ['dbConnect', 'DBI'],
        shortAnswer: 'dbConnect',
      }),
    ],
  },
  {
    sectionId: 'data_cleaning',
    filename: 'data_cleaning.json',
    title: 'Data Cleaning with tidyverse',
    topics: [
      topic('tidyverse_philosophy', 'Tidyverse Philosophy', {
        sandbox: 'library(tidyverse)\nprint("Tidy data: each variable is a column, each observation a row")',
        needles: ['tidyverse', 'library'],
        shortAnswer: 'tidyverse',
      }),
      topic('dplyr_filter', 'filter', {
        sandbox: 'library(dplyr)\nstarwars %>% filter(species == "Human")',
        needles: ['filter', '%>%'],
      }),
      topic('dplyr_select', 'select', {
        sandbox: 'library(dplyr)\nstarwars %>% select(name, height, mass)',
        needles: ['select'],
      }),
      topic('dplyr_mutate', 'mutate', {
        sandbox: 'library(dplyr)\nstarwars %>% mutate(bmi = mass / ((height/100)^2))',
        needles: ['mutate'],
      }),
      topic('dplyr_summarize', 'summarize', {
        sandbox: 'library(dplyr)\nstarwars %>% summarize(avg_height = mean(height, na.rm = TRUE))',
        needles: ['summarize', 'mean'],
      }),
      topic('dplyr_group_by', 'group_by', {
        sandbox: 'library(dplyr)\nstarwars %>% group_by(species) %>% summarize(n = n())',
        needles: ['group_by', 'summarize'],
        shortAnswer: 'group_by',
      }),
      topic('dplyr_pipes', 'Pipes (%>%)', {
        sandbox: 'library(dplyr)\nstarwars %>% filter(height > 180) %>% select(name, height)',
        needles: ['%>%'],
        shortAnswer: '%>%',
      }),
      topic('tidyr_pivot_longer', 'pivot_longer', {
        sandbox: 'library(tidyr)\n# pivot_longer(df, cols = -id, names_to = "key", values_to = "value")',
        needles: ['pivot_longer'],
        shortAnswer: 'pivot_longer',
      }),
      topic('tidyr_pivot_wider', 'pivot_wider', {
        sandbox: 'library(tidyr)\n# pivot_wider(df, names_from = key, values_from = value)',
        needles: ['pivot_wider'],
        shortAnswer: 'pivot_wider',
      }),
      topic('tidyr_separate_unite', 'separate and unite', {
        sandbox: 'library(tidyr)\n# separate(col, into = c("a", "b"), sep = "-")',
        needles: ['separate', 'unite'],
        shortAnswer: 'separate',
      }),
      topic('handling_na', 'Handling NA Values', {
        sandbox: 'x <- c(1, NA, 3)\nprint(sum(x, na.rm = TRUE))\nprint(is.na(x))',
        needles: ['na.rm', 'is.na'],
        shortAnswer: 'na.rm',
      }),
      topic('replace_na', 'replace_na', {
        sandbox: 'library(tidyr)\n# replace_na(df, list(value = 0))',
        needles: ['replace_na'],
        shortAnswer: 'replace_na',
      }),
      topic('duplicate_rows', 'Duplicate Rows', {
        sandbox: 'library(dplyr)\n# df %>% distinct()\nprint(duplicated(c(1, 2, 2, 3)))',
        needles: ['distinct', 'duplicated'],
        shortAnswer: 'distinct',
      }),
      topic('data_validation', 'Data Validation', {
        sandbox: 'library(dplyr)\nstarwars %>% filter(height > 0, mass > 0)',
        needles: ['filter', '>'],
      }),
      topic('cleaning_workflow', 'Cleaning Workflow', {
        sandbox: '# 1 import 2 inspect 3 clean 4 validate 5 analyze\nprint("Document each step")',
        mcqPrompt: 'A good cleaning workflow starts with:',
        mcqChoices: [
          { id: 'a', label: 'Inspecting raw data before transforming' },
          { id: 'b', label: 'Deleting all NA values blindly' },
          { id: 'c', label: 'Plotting before reading files' },
        ],
      }),
    ],
  },
  {
    sectionId: 'visualization',
    filename: 'visualization.json',
    title: 'Data Visualization with ggplot2',
    topics: [
      topic('grammar_of_graphics', 'Grammar of Graphics', {
        sandbox: 'library(ggplot2)\nprint("Data + aesthetics + geoms + scales + theme")',
        needles: ['ggplot2'],
        shortAnswer: 'ggplot2',
      }),
      topic('ggplot_basics', 'ggplot Basics', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(x = wt, y = mpg)) + geom_point()',
        needles: ['ggplot', 'geom_point'],
      }),
      topic('aesthetics_mapping', 'Aesthetics Mapping', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(x = wt, y = mpg, color = factor(cyl))) + geom_point()',
        needles: ['aes(', 'color'],
        shortAnswer: 'aes',
      }),
      topic('geoms_scatter', 'Scatter Plots', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + geom_point()',
        needles: ['geom_point'],
        shortAnswer: 'geom_point',
      }),
      topic('geoms_bar', 'Bar Charts', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(factor(cyl))) + geom_bar()',
        needles: ['geom_bar'],
        shortAnswer: 'geom_bar',
      }),
      topic('geoms_histogram', 'Histograms', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(mpg)) + geom_histogram(bins = 10)',
        needles: ['geom_histogram'],
        shortAnswer: 'geom_histogram',
      }),
      topic('geoms_boxplot', 'Boxplots', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(factor(cyl), mpg)) + geom_boxplot()',
        needles: ['geom_boxplot'],
        shortAnswer: 'geom_boxplot',
      }),
      topic('geoms_line', 'Line Charts', {
        sandbox: 'library(ggplot2)\nggplot(economics, aes(date, unemploy)) + geom_line()',
        needles: ['geom_line'],
        shortAnswer: 'geom_line',
      }),
      topic('facets', 'Facets', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + geom_point() + facet_wrap(~ cyl)',
        needles: ['facet_wrap'],
        shortAnswer: 'facet_wrap',
      }),
      topic('scales', 'Scales', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + geom_point() + scale_x_continuous(limits = c(1, 6))',
        needles: ['scale_'],
        shortAnswer: 'scale',
      }),
      topic('themes', 'Themes', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + geom_point() + theme_minimal()',
        needles: ['theme_minimal'],
        shortAnswer: 'theme',
      }),
      topic('labels_titles', 'Labels and Titles', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + geom_point() + labs(title = "MPG vs weight")',
        needles: ['labs('],
        shortAnswer: 'labs',
      }),
      topic('color_palettes', 'Color Palettes', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg, color = factor(cyl))) + geom_point() + scale_color_brewer(palette = "Set1")',
        needles: ['scale_color'],
      }),
      topic('saving_plots', 'Saving Plots', {
        sandbox: 'library(ggplot2)\np <- ggplot(mtcars, aes(wt, mpg)) + geom_point()\n# ggsave("plot.png", p, width = 6, height = 4)',
        needles: ['ggsave'],
        shortAnswer: 'ggsave',
      }),
      topic('chart_selection', 'Choosing Chart Types', {
        sandbox: 'print(c("scatter: relationship", "bar: counts", "line: trend", "box: distribution"))',
        mcqPrompt: 'A boxplot is best for:',
        mcqChoices: [
          { id: 'a', label: 'Showing distribution across groups' },
          { id: 'b', label: 'Showing geographic maps only' },
          { id: 'c', label: 'Replacing all tables' },
        ],
      }),
    ],
  },
  {
    sectionId: 'eda',
    filename: 'eda.json',
    title: 'Exploratory Data Analysis',
    topics: [
      topic('eda_mindset', 'EDA Mindset', {
        sandbox: 'print("Ask questions, visualize, iterate before modeling")',
        mcqPrompt: 'EDA primarily helps you:',
        mcqChoices: [
          { id: 'a', label: 'Understand data before formal modeling' },
          { id: 'b', label: 'Skip data quality checks' },
          { id: 'c', label: 'Replace documentation' },
        ],
      }),
      topic('summary_statistics', 'Summary Statistics', {
        sandbox: 'summary(mtcars$mpg)\nprint(mean(mtcars$mpg))',
        needles: ['summary', 'mean'],
      }),
      topic('distribution_analysis', 'Distribution Analysis', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(mpg)) + geom_histogram()',
        needles: ['geom_histogram'],
      }),
      topic('correlation_analysis', 'Correlation Analysis', {
        sandbox: 'cor(mtcars[, c("mpg", "wt", "hp")], use = "complete.obs")',
        needles: ['cor('],
        shortAnswer: 'cor',
      }),
      topic('outlier_detection', 'Outlier Detection', {
        sandbox: 'boxplot.stats(mtcars$mpg)$out',
        needles: ['boxplot.stats'],
        shortAnswer: 'boxplot',
      }),
      topic('missing_data_patterns', 'Missing Data Patterns', {
        sandbox: 'colSums(is.na(airquality))',
        needles: ['is.na', 'colSums'],
      }),
      topic('categorical_exploration', 'Categorical Exploration', {
        sandbox: 'library(dplyr)\nmtcars %>% count(cyl)',
        needles: ['count'],
        shortAnswer: 'count',
      }),
      topic('bivariate_analysis', 'Bivariate Analysis', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(wt, mpg)) + geom_point() + geom_smooth(method = "lm")',
        needles: ['geom_point', 'geom_smooth'],
      }),
      topic('group_comparisons', 'Group Comparisons', {
        sandbox: 'library(dplyr)\nmtcars %>% group_by(cyl) %>% summarize(avg_mpg = mean(mpg))',
        needles: ['group_by', 'summarize'],
      }),
      topic('skimr_overview', 'skimr Overview', {
        sandbox: 'library(skimr)\nskim(mtcars)',
        needles: ['skim'],
        shortAnswer: 'skim',
      }),
      topic('eda_with_dplyr', 'EDA with dplyr', {
        sandbox: 'library(dplyr)\nmtcars %>% group_by(cyl) %>% summarize(m = mean(mpg), sd = sd(mpg))',
        needles: ['group_by', 'summarize'],
      }),
      topic('eda_with_ggplot', 'EDA with ggplot2', {
        sandbox: 'library(ggplot2)\nggplot(mtcars, aes(factor(cyl), mpg)) + geom_boxplot()',
        needles: ['ggplot', 'geom_boxplot'],
      }),
      topic('eda_report_structure', 'EDA Report Structure', {
        sandbox: 'print(c("overview", "quality", "distributions", "relationships", "next steps"))',
        mcqPrompt: 'An EDA report should include:',
        mcqChoices: [
          { id: 'a', label: 'Data overview, quality checks, and key patterns' },
          { id: 'b', label: 'Only final model coefficients' },
          { id: 'c', label: 'Only raw CSV bytes' },
        ],
      }),
      topic('eda_pitfalls', 'Common EDA Pitfalls', {
        sandbox: 'print(c("confirmation bias", "ignoring NA", "overplotting small n"))',
        mcqPrompt: 'A common EDA mistake is:',
        mcqChoices: [
          { id: 'a', label: 'Only looking for patterns you expect' },
          { id: 'b', label: 'Checking missing values' },
          { id: 'c', label: 'Plotting distributions' },
        ],
        mcqCorrect: 'a',
      }),
    ],
  },
  {
    sectionId: 'statistics',
    filename: 'statistics.json',
    title: 'Descriptive and Inferential Statistics',
    topics: [
      topic('descriptive_stats', 'Descriptive Statistics', {
        sandbox: 'x <- mtcars$mpg\nprint(c(mean = mean(x), sd = sd(x), median = median(x)))',
        needles: ['mean', 'sd', 'median'],
      }),
      topic('measures_central_tendency', 'Central Tendency', {
        sandbox: 'x <- c(2, 4, 4, 4, 5, 5, 7, 9)\nprint(mean(x))\nprint(median(x))',
        needles: ['mean', 'median'],
      }),
      topic('measures_spread', 'Measures of Spread', {
        sandbox: 'x <- mtcars$mpg\nprint(sd(x))\nprint(IQR(x))',
        needles: ['sd(', 'IQR'],
        shortAnswer: 'sd',
      }),
      topic('frequency_tables', 'Frequency Tables', {
        sandbox: 'table(mtcars$cyl)\nprop.table(table(mtcars$cyl))',
        needles: ['table', 'prop.table'],
        shortAnswer: 'table',
      }),
      topic('probability_basics', 'Probability Basics', {
        sandbox: 'print(dbinom(3, size = 10, prob = 0.5))',
        needles: ['dbinom'],
        shortAnswer: 'dbinom',
      }),
      topic('sampling_distributions', 'Sampling Distributions', {
        sandbox: 'set.seed(1)\nsamples <- replicate(1000, mean(sample(mtcars$mpg, 10)))\nprint(mean(samples))',
        needles: ['sample', 'replicate'],
      }),
      topic('confidence_intervals', 'Confidence Intervals', {
        sandbox: 't.test(mtcars$mpg)$conf.int',
        needles: ['t.test', 'conf.int'],
        shortAnswer: 't.test',
      }),
      topic('hypothesis_testing', 'Hypothesis Testing', {
        sandbox: 't.test(mtcars$mpg, mu = 20)',
        needles: ['t.test'],
        mcqPrompt: 'A p-value measures evidence against:',
        mcqChoices: [
          { id: 'a', label: 'The null hypothesis' },
          { id: 'b', label: 'The sample size' },
          { id: 'c', label: 'The graph title' },
        ],
      }),
      topic('t_test', 't-Test', {
        sandbox: 't.test(mpg ~ am, data = mtcars)',
        needles: ['t.test', '~'],
        shortAnswer: 't.test',
      }),
      topic('chi_square_test', 'Chi-Square Test', {
        sandbox: 'chisq.test(table(mtcars$cyl, mtcars$am))',
        needles: ['chisq.test'],
        shortAnswer: 'chisq.test',
      }),
      topic('anova', 'ANOVA', {
        sandbox: 'aov(mpg ~ factor(cyl), data = mtcars)',
        needles: ['aov'],
        shortAnswer: 'aov',
      }),
      topic('p_values_interpretation', 'Interpreting p-Values', {
        sandbox: 'result <- t.test(mtcars$mpg, mu = 20)\nprint(result$p.value)',
        needles: ['p.value'],
        mcqPrompt: 'A small p-value suggests:',
        mcqChoices: [
          { id: 'a', label: 'Data are inconsistent with the null hypothesis' },
          { id: 'b', label: 'The null is certainly true' },
          { id: 'c', label: 'Effect size is always large' },
        ],
      }),
      topic('effect_sizes', 'Effect Sizes', {
        sandbox: 'library(effectsize)\n# cohens_d(mpg ~ am, data = mtcars)',
        needles: ['effectsize'],
        shortAnswer: 'effect',
      }),
      topic('nonparametric_tests', 'Nonparametric Tests', {
        sandbox: 'wilcox.test(mpg ~ am, data = mtcars)',
        needles: ['wilcox.test'],
        shortAnswer: 'wilcox.test',
      }),
    ],
  },
  {
    sectionId: 'regression',
    filename: 'regression.json',
    title: 'Linear Models and Regression',
    topics: [
      topic('linear_regression_concepts', 'Linear Regression Concepts', {
        sandbox: 'print("Model continuous outcome with predictors: y ~ x1 + x2")',
        mcqPrompt: 'Linear regression models:',
        mcqChoices: [
          { id: 'a', label: 'A continuous response from predictors' },
          { id: 'b', label: 'Only categorical labels with trees only' },
          { id: 'c', label: 'File system paths' },
        ],
      }),
      topic('simple_lm', 'Simple Linear Regression', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nsummary(fit)',
        needles: ['lm(', 'summary'],
      }),
      topic('multiple_regression', 'Multiple Regression', {
        sandbox: 'fit <- lm(mpg ~ wt + hp + cyl, data = mtcars)\nsummary(fit)',
        needles: ['lm(', '~'],
      }),
      topic('lm_function', 'The lm Function', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nprint(coef(fit))',
        needles: ['lm(', 'coef'],
        shortAnswer: 'lm',
      }),
      topic('model_summary', 'Model Summary', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nsummary(fit)',
        needles: ['summary(fit)'],
        shortAnswer: 'summary',
      }),
      topic('coefficients_interpretation', 'Interpreting Coefficients', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nprint(coef(fit)["wt"])',
        needles: ['coef'],
        mcqPrompt: 'A slope coefficient means:',
        mcqChoices: [
          { id: 'a', label: 'Average change in y per one-unit increase in x' },
          { id: 'b', label: 'The p-value of the dataset' },
          { id: 'c', label: 'The file name of the model' },
        ],
      }),
      topic('r_squared', 'R-squared', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nprint(summary(fit)$r.squared)',
        needles: ['r.squared'],
        shortAnswer: 'r.squared',
      }),
      topic('residual_analysis', 'Residual Analysis', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nplot(fit, which = 1)',
        needles: ['plot(fit'],
      }),
      topic('model_diagnostics', 'Model Diagnostics', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\nshapiro.test(residuals(fit))',
        needles: ['residuals', 'shapiro.test'],
      }),
      topic('prediction', 'Making Predictions', {
        sandbox: 'fit <- lm(mpg ~ wt, data = mtcars)\npredict(fit, newdata = data.frame(wt = 3))',
        needles: ['predict'],
        shortAnswer: 'predict',
      }),
      topic('categorical_predictors', 'Categorical Predictors', {
        sandbox: 'fit <- lm(mpg ~ factor(cyl), data = mtcars)\nsummary(fit)',
        needles: ['factor(', 'lm('],
      }),
      topic('interaction_terms', 'Interaction Terms', {
        sandbox: 'fit <- lm(mpg ~ wt * factor(cyl), data = mtcars)\nsummary(fit)',
        needles: ['*', 'lm('],
        shortAnswer: '*',
      }),
      topic('logistic_regression_intro', 'Logistic Regression Intro', {
        sandbox: 'fit <- glm(am ~ wt, data = mtcars, family = binomial)\nsummary(fit)',
        needles: ['glm', 'binomial'],
        shortAnswer: 'glm',
      }),
      topic('model_selection', 'Model Selection', {
        sandbox: 'fit1 <- lm(mpg ~ wt, data = mtcars)\nfit2 <- lm(mpg ~ wt + hp, data = mtcars)\nAIC(fit1, fit2)',
        needles: ['AIC'],
        shortAnswer: 'AIC',
      }),
    ],
  },
  {
    sectionId: 'strings_dates_factors',
    filename: 'strings_dates_factors.json',
    title: 'String, Date, and Factor Handling',
    topics: [
      topic('stringr_basics', 'stringr Basics', {
        sandbox: 'library(stringr)\nstr_length(c("R", "tidyverse"))',
        needles: ['stringr', 'str_'],
        shortAnswer: 'stringr',
      }),
      topic('str_detect', 'str_detect', {
        sandbox: 'library(stringr)\nstr_detect(c("abc", "xyz"), "a")',
        needles: ['str_detect'],
        shortAnswer: 'str_detect',
      }),
      topic('str_replace', 'str_replace', {
        sandbox: 'library(stringr)\nstr_replace("hello world", "world", "R")',
        needles: ['str_replace'],
        shortAnswer: 'str_replace',
      }),
      topic('str_extract', 'str_extract', {
        sandbox: 'library(stringr)\nstr_extract("id:42", "\\\\d+")',
        needles: ['str_extract'],
        shortAnswer: 'str_extract',
      }),
      topic('str_split', 'str_split', {
        sandbox: 'library(stringr)\nstr_split("a,b,c", ",")',
        needles: ['str_split'],
        shortAnswer: 'str_split',
      }),
      topic('str_trim_pad', 'str_trim and str_pad', {
        sandbox: 'library(stringr)\nstr_trim("  R  ")\nstr_pad("7", 3, pad = "0")',
        needles: ['str_trim', 'str_pad'],
      }),
      topic('regex_in_r', 'Regular Expressions in R', {
        sandbox: 'library(stringr)\nstr_detect("test@mail.com", "@[A-Za-z]+\\\\.")',
        needles: ['str_detect'],
        shortAnswer: 'regex',
      }),
      topic('lubridate_dates', 'Dates with lubridate', {
        sandbox: 'library(lubridate)\nymd("2024-06-10")',
        needles: ['lubridate', 'ymd'],
        shortAnswer: 'ymd',
      }),
      topic('lubridate_parsing', 'Parsing Dates', {
        sandbox: 'library(lubridate)\nparse_date_time("06/10/2024", orders = "mdy")',
        needles: ['parse_date_time'],
        shortAnswer: 'parse_date_time',
      }),
      topic('date_arithmetic', 'Date Arithmetic', {
        sandbox: 'library(lubridate)\nstart <- ymd("2024-01-01")\nstart + days(30)',
        needles: ['days('],
        shortAnswer: 'days',
      }),
      topic('factor_basics', 'Factor Basics', {
        sandbox: 'f <- factor(c("low", "high", "medium"))\nprint(levels(f))',
        needles: ['factor', 'levels'],
      }),
      topic('factor_levels', 'Factor Levels', {
        sandbox: 'f <- factor(c("b", "a", "c"), levels = c("a", "b", "c"))\nprint(f)',
        needles: ['levels ='],
      }),
      topic('releveling_factors', 'Releveling Factors', {
        sandbox: 'library(forcats)\nf <- factor(c("low", "high"))\nf_releveled <- fct_relevel(f, "high")',
        needles: ['fct_relevel'],
        shortAnswer: 'fct_relevel',
      }),
      topic('forcats_package', 'forcats Package', {
        sandbox: 'library(forcats)\nf <- factor(c("b", "a", "b", "c"))\nfct_infreq(f)',
        needles: ['forcats', 'fct_'],
        shortAnswer: 'forcats',
      }),
    ],
  },
  {
    sectionId: 'programming_practices',
    filename: 'programming_practices.json',
    title: 'Programming Best Practices in R',
    topics: [
      topic('vectorization_deep_dive', 'Vectorization Deep Dive', {
        sandbox: 'x <- 1:1e6\nsystem.time(x * 2)',
        needles: ['system.time', '*'],
        mcqPrompt: 'Vectorized code is usually faster because:',
        mcqChoices: [
          { id: 'a', label: 'It avoids R-level loops for many operations' },
          { id: 'b', label: 'It disables C code' },
          { id: 'c', label: 'It requires more copies always' },
        ],
      }),
      topic('apply_functions', 'apply, lapply, sapply', {
        sandbox: 'lapply(list(a = 1:3, b = 4:6), sum)',
        needles: ['lapply'],
        shortAnswer: 'lapply',
      }),
      topic('purrr_map', 'purrr and map', {
        sandbox: 'library(purrr)\nmap(list(1:3, 4:6), sum)',
        needles: ['purrr', 'map('],
        shortAnswer: 'map',
      }),
      topic('error_handling', 'Error Handling', {
        sandbox: 'result <- try(log("a"))\nprint(inherits(result, "try-error"))',
        needles: ['try('],
        shortAnswer: 'try',
      }),
      topic('trycatch', 'tryCatch', {
        sandbox: 'tryCatch(log("a"), error = function(e) NA)',
        needles: ['tryCatch', 'error'],
        shortAnswer: 'tryCatch',
      }),
      topic('debugging_basics', 'Debugging Basics', {
        sandbox: 'f <- function(x) x + 1\n# debug(f)\nprint(f(2))',
        needles: ['function', 'debug'],
        shortAnswer: 'debug',
      }),
      topic('browser_traceback', 'browser and traceback', {
        sandbox: 'f <- function() stop("boom")\n# try(f()); traceback()',
        needles: ['traceback', 'stop'],
        shortAnswer: 'traceback',
      }),
      topic('profiling_performance', 'Profiling and Performance', {
        sandbox: 'Rprof("profile.out")\nx <- 1:1e5; sum(x^2)\nRprof(NULL)',
        needles: ['Rprof'],
        shortAnswer: 'Rprof',
      }),
      topic('code_style_guide', 'Code Style Guide', {
        sandbox: '# Use <- for assignment; snake_case names; spaces around operators\nx <- 1 + 2',
        needles: ['<-'],
        mcqPrompt: 'The tidyverse style guide recommends:',
        mcqChoices: [
          { id: 'a', label: 'Consistent naming and spacing' },
          { id: 'b', label: 'No comments ever' },
          { id: 'c', label: 'All caps variable names only' },
        ],
      }),
      topic('roxygen_documentation', 'roxygen2 Documentation', {
        sandbox: "#' Add two numbers\n#' @param a numeric\n#' @param b numeric\nadd <- function(a, b) a + b",
        needles: ["#'", '@param'],
        shortAnswer: 'roxygen',
      }),
      topic('testing_intro', 'Testing Intro (testthat)', {
        sandbox: 'library(testthat)\nexpect_equal(2 + 2, 4)',
        needles: ['testthat', 'expect_equal'],
        shortAnswer: 'testthat',
      }),
      topic('functional_programming', 'Functional Programming Patterns', {
        sandbox: 'library(purrr)\nmap_dbl(1:5, ~ .x ^ 2)',
        needles: ['map_dbl', '~'],
      }),
      topic('avoiding_common_pitfalls', 'Avoiding Common Pitfalls', {
        sandbox: 'print(c("growing vectors in loops", "forgetting stringsAsFactors history", "partial matching"))',
        mcqPrompt: 'A common R pitfall is:',
        mcqChoices: [
          { id: 'a', label: 'Growing vectors in a loop instead of preallocating' },
          { id: 'b', label: 'Using data frames' },
          { id: 'c', label: 'Using functions' },
        ],
      }),
      topic('memory_management', 'Memory Management Basics', {
        sandbox: 'big <- rnorm(1e6)\nrm(big)\ngc()',
        needles: ['rm(', 'gc('],
        shortAnswer: 'gc',
      }),
    ],
  },
  {
    sectionId: 'reproducible_research',
    filename: 'reproducible_research.json',
    title: 'Reproducible Research',
    topics: [
      topic('reproducibility_concepts', 'Reproducibility Concepts', {
        sandbox: 'print("Same data + code + environment => same results")',
        mcqPrompt: 'Reproducible research means:',
        mcqChoices: [
          { id: 'a', label: 'Others can recreate your results from your materials' },
          { id: 'b', label: 'Results change each run by design' },
          { id: 'c', label: 'Code is never shared' },
        ],
      }),
      topic('rmarkdown_basics', 'R Markdown Basics', {
        sandbox: '# Title\n# Output: html_document\nprint("Knit .Rmd to reports")',
        needles: ['R Markdown', 'html_document'],
        shortAnswer: 'Rmd',
      }),
      topic('rmd_structure', 'RMD Document Structure', {
        sandbox: '---\ntitle: "Report"\noutput: html_document\n---\n\n## Section\n\nText and ```{r} chunks```.',
        needles: ['---', 'output:'],
      }),
      topic('code_chunks', 'Code Chunks', {
        sandbox: '# ```{r setup, message=FALSE}\n# library(tidyverse)\n# ```',
        needles: ['```{r'],
        shortAnswer: 'chunk',
      }),
      topic('inline_code', 'Inline Code', {
        sandbox: '# The mean mpg is `r mean(mtcars$mpg)`.',
        needles: ['`r '],
        shortAnswer: 'inline',
      }),
      topic('knitting_documents', 'Knitting Documents', {
        sandbox: '# rmarkdown::render("report.Rmd")',
        needles: ['render'],
        shortAnswer: 'render',
      }),
      topic('output_formats', 'Output Formats', {
        sandbox: 'print(c("html_document", "pdf_document", "word_document"))',
        mcqPrompt: 'Which is a common R Markdown output format?',
        mcqChoices: [
          { id: 'a', label: 'html_document' },
          { id: 'b', label: 'exe_binary' },
          { id: 'c', label: 'gpu_shader' },
        ],
        mcqCorrect: 'a',
      }),
      topic('quarto_intro', 'Quarto Introduction', {
        sandbox: '# Quarto (.qmd) extends literate programming for many formats\nprint("Quarto for reports and websites")',
        needles: ['Quarto'],
        shortAnswer: 'Quarto',
      }),
      topic('citations_bibliography', 'Citations and Bibliography', {
        sandbox: '# bibliography: refs.bib\n# citation keys in text: [@smith2020]',
        needles: ['bibliography', '@'],
      }),
      topic('parameterized_reports', 'Parameterized Reports', {
        sandbox: '# params:\n#   region: "EU"\n# params$region in R chunks',
        needles: ['params'],
        shortAnswer: 'params',
      }),
      topic('git_for_r_projects', 'Git for R Projects', {
        sandbox: 'print("Version control tracks code, data references, and report changes")',
        mcqPrompt: 'Git helps R projects by:',
        mcqChoices: [
          { id: 'a', label: 'Tracking changes and collaborating safely' },
          { id: 'b', label: 'Replacing all packages' },
          { id: 'c', label: 'Running lm() automatically' },
        ],
      }),
      topic('renv_packages', 'renv for Package Management', {
        sandbox: 'library(renv)\n# renv::init() captures project library',
        needles: ['renv'],
        shortAnswer: 'renv',
      }),
      topic('project_organization', 'Project Organization', {
        sandbox: 'print(c("data/", "R/", "outputs/", "reports/", "README.md"))',
        mcqPrompt: 'A typical R project separates:',
        mcqChoices: [
          { id: 'a', label: 'Data, scripts, outputs, and docs' },
          { id: 'b', label: 'Only binary blobs with no structure' },
          { id: 'c', label: 'Everything in one unnamed script' },
        ],
      }),
      topic('publishing_reports', 'Publishing Reports', {
        sandbox: '# Render to HTML/PDF and share via GitHub Pages or Posit Connect',
        needles: ['HTML', 'PDF'],
      }),
    ],
  },
  {
    sectionId: 'packages_projects',
    filename: 'packages_projects.json',
    title: 'Packages, Projects, and Next Steps',
    topics: [
      topic('installing_packages', 'Installing Packages', {
        sandbox: '# install.packages("dplyr")',
        needles: ['install.packages'],
        shortAnswer: 'install.packages',
      }),
      topic('loading_packages', 'Loading Packages', {
        sandbox: 'library(dplyr)\nprint("Attach package namespace")',
        needles: ['library('],
        shortAnswer: 'library',
      }),
      topic('cran_vs_bioconductor', 'CRAN vs Bioconductor', {
        sandbox: 'print(c("CRAN: general packages", "Bioconductor: bioinformatics"))',
        mcqPrompt: 'Bioconductor specializes in:',
        mcqChoices: [
          { id: 'a', label: 'Bioinformatics and genomics workflows' },
          { id: 'b', label: 'Operating system drivers' },
          { id: 'c', label: 'Spreadsheet UI design' },
        ],
      }),
      topic('package_versioning', 'Package Versioning', {
        sandbox: 'packageVersion("dplyr")\n# renv::snapshot() for projects',
        needles: ['packageVersion'],
        shortAnswer: 'packageVersion',
      }),
      topic('r_projects', 'R Projects', {
        sandbox: '# Create .Rproj for isolated working directory and settings',
        needles: ['.Rproj'],
        shortAnswer: 'Rproj',
      }),
      topic('here_package', 'The here Package', {
        sandbox: 'library(here)\nhere("data", "file.csv")',
        needles: ['here('],
        shortAnswer: 'here',
      }),
      topic('creating_packages_intro', 'Creating Packages Intro', {
        sandbox: '# usethis::create_package("mypackage")',
        needles: ['create_package'],
        shortAnswer: 'package',
      }),
      topic('devtools_usethis', 'devtools and usethis', {
        sandbox: 'library(usethis)\n# edit_r_profile()',
        needles: ['usethis'],
        shortAnswer: 'usethis',
      }),
      topic('specialization_paths', 'Specialization Paths', {
        sandbox: 'print(c("tidyverse", "biostats", "spatial", "Shiny", "ML"))',
        mcqPrompt: 'After fundamentals, many R learners specialize in:',
        mcqChoices: [
          { id: 'a', label: 'Domain-specific analysis (bio, econ, spatial, etc.)' },
          { id: 'b', label: 'Only syntax with no applications' },
          { id: 'c', label: 'Removing all packages' },
        ],
      }),
      topic('shiny_intro', 'Shiny Introduction', {
        sandbox: 'library(shiny)\n# runApp() launches interactive apps',
        needles: ['shiny'],
        shortAnswer: 'shiny',
      }),
      topic('spatial_analysis_intro', 'Spatial Analysis Intro', {
        sandbox: 'library(sf)\n# st_read("map.geojson")',
        needles: ['sf'],
        shortAnswer: 'sf',
      }),
      topic('time_series_intro', 'Time Series Intro', {
        sandbox: 'ts <- ts(rnorm(24), frequency = 12)\nprint(ts)',
        needles: ['ts('],
        shortAnswer: 'ts',
      }),
      topic('machine_learning_intro', 'Machine Learning Intro', {
        sandbox: 'library(tidymodels)\nprint("Modeling with tidy ML workflows")',
        needles: ['tidymodels'],
        shortAnswer: 'tidymodels',
      }),
      topic('staying_current', 'Staying Current in R', {
        sandbox: 'print(c("R Weekly", "RStudio/Posit blog", "CRAN updates", "conferences"))',
        mcqPrompt: 'To stay current in R you should:',
        mcqChoices: [
          { id: 'a', label: 'Follow community news and package updates' },
          { id: 'b', label: 'Never update packages' },
          { id: 'c', label: 'Ignore release notes' },
        ],
      }),
    ],
  },
]
