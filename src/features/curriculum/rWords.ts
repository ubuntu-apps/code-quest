/** R's reserved words, for colouring and suggestions. */
export const R_KEYWORDS = ['if', 'else', 'for', 'in', 'while', 'repeat', 'function', 'return', 'next', 'break']

/** Values R writes as words. */
export const R_CONSTANTS = ['TRUE', 'FALSE', 'NULL', 'NA', 'NaN', 'Inf', 'NA_integer_', 'NA_real_', 'NA_character_']

/** Functions the course uses, offered as suggestions while typing. */
export const R_FUNCTIONS = [
  'abs', 'aggregate', 'all', 'any', 'apply', 'as.character', 'as.Date', 'as.data.frame', 'as.integer', 'as.logical',
  'as.numeric', 'as.vector', 'c', 'cat', 'cbind', 'ceiling', 'chisq.test', 'class', 'coef', 'colMeans', 'colnames',
  'colSums', 'complete.cases', 'cor', 'cumsum', 'cut', 'data.frame', 'diff', 'dim', 'do.call', 'duplicated', 'factor',
  'floor', 'format', 'function', 'grepl', 'gsub', 'head', 'identical', 'ifelse', 'intersect', 'is.na', 'IQR',
  'lapply', 'length', 'levels', 'list', 'lm', 'match', 'matrix', 'max', 'mean', 'median', 'merge', 'min', 'names',
  'nchar', 'ncol', 'nrow', 'order', 'paste', 'paste0', 'pnorm', 'predict', 'print', 'prop.table', 'qnorm',
  'quantile', 'rbind', 'read.csv', 'rep', 'reshape', 'residuals', 'rev', 'rnorm', 'round', 'rowMeans', 'rowSums',
  'runif', 'sample', 'sapply', 'sd', 'seq', 'seq_along', 'set.seed', 'setdiff', 'sort', 'split', 'sprintf', 'sqrt',
  'stop', 'stopifnot', 'str', 'strsplit', 'sub', 'subset', 'substr', 'sum', 'summary', 'table', 'tail', 'tapply',
  't.test', 'tolower', 'toupper', 'trimws', 'tryCatch', 'union', 'unique', 'unname', 'var', 'warning', 'weekdays',
  'which', 'which.max', 'which.min', 'write.csv', 'xtabs',
]
