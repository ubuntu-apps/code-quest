// Invented data shared by the reshaping stages.

/** Corner Café: drinks sold per day, as a matrix (drinks in rows, days in columns). */
export const SALES = `sales <- matrix(
  c(12, 8, 5, 15, 6, 7, 10, 9, 4, 18, 7, 8, 20, 11, 9),
  nrow = 3,
  dimnames = list(c("latte", "tea", "mocha"), c("Mon", "Tue", "Wed", "Thu", "Fri"))
)
`

/** Four students' scores on three tests, as a matrix. */
export const SCORES = `scores <- matrix(
  c(72, 65, 88, 54, 78, 70, 85, 61, 81, 68, 90, 59),
  nrow = 4,
  dimnames = list(c("Ana", "Ben", "Cy", "Dee"), c("t1", "t2", "t3"))
)
`

/** Monthly rainfall (mm) in three towns, one column per month: wide format. */
export const RAIN = `rain <- data.frame(
  town = c("Ashby", "Brook", "Corran"),
  jan = c(80, 65, 92),
  feb = c(60, 55, 71),
  mar = c(55, 48, 60)
)
`
