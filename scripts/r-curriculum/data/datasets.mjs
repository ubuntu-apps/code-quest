// Invented data shared by the data-frame quests. Each constant is R code that makes the
// data frame, ending with a newline, ready to use as a challenge's starter or setup.

/** Riverside Bikes: eight trips. */
export const TRIPS = `trips <- data.frame(
  id = 1:8,
  station = c("Park", "River", "Park", "Market", "River", "Park", "Market", "River"),
  minutes = c(12, 47, 30, 8, 55, 15, 22, 35),
  km = c(2.4, 9.4, 5.1, 1.2, 10.3, 2.9, 3.8, 6.0),
  member = c(TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE)
)
`

/** Corner Café: ten orders. */
export const ORDERS = `orders <- data.frame(
  order = 101:110,
  day = c("Mon", "Mon", "Tue", "Tue", "Tue", "Wed", "Wed", "Thu", "Fri", "Fri"),
  drink = c("latte", "tea", "mocha", "latte", "latte", "tea", "chai", "latte", "mocha", "tea"),
  size = c("M", "S", "L", "M", "S", "M", "L", "L", "M", "S"),
  price = c(3.4, 2.5, 4.2, 3.4, 2.9, 2.5, 3.8, 3.9, 4.2, 2.2)
)
`

/** Elm Street community garden: harvest by plot, with one missing weight. */
export const HARVEST = `harvest <- data.frame(
  plot = c("A", "A", "B", "B", "C", "C", "D", "D"),
  crop = c("tomatoes", "beans", "tomatoes", "kale", "beans", "kale", "tomatoes", "beans"),
  kg = c(12.4, 3.6, 9.8, NA, 4.1, 2.7, 14.2, 2.9),
  family = c("Silva", "Silva", "Okafor", "Okafor", "Li", "Li", "Mensah", "Mensah")
)
`

/** A class of twelve students: two tests and a group. */
export const CLASS = `class_results <- data.frame(
  student = c("Ana", "Ben", "Cy", "Dee", "Eli", "Fay", "Gus", "Hal", "Ivy", "Jo", "Kai", "Lea"),
  group = c("A", "B", "A", "B", "A", "B", "A", "B", "A", "B", "A", "B"),
  test1 = c(72, 65, 88, 54, 91, 47, 76, 69, 83, 58, 64, 95),
  test2 = c(78, 70, 85, 61, 94, NA, 80, 66, 88, 62, 71, 97)
)
`

/** A seedling trial: height after three weeks with three kinds of compost. */
export const SEEDLINGS = `seedlings <- data.frame(
  tray = 1:12,
  compost = c("peat", "peat", "peat", "peat", "leaf", "leaf", "leaf", "leaf", "home", "home", "home", "home"),
  height_cm = c(8.2, 7.5, 9.1, 8.0, 10.4, 11.2, 9.8, 10.9, 7.1, 12.8, 6.9, 7.6),
  leaves = c(6, 5, 7, 6, 8, 9, 7, 8, 5, 9, 4, 5)
)
`

/** Deliveries from a bakery: minutes from order to door. */
export const DELIVERIES = `deliveries <- data.frame(
  rider = c("Sam", "Ola", "Sam", "Ola", "Kit", "Sam", "Kit", "Ola", "Kit", "Sam", "Ola", "Kit"),
  area = c("north", "south", "north", "north", "south", "south", "north", "south", "south", "north", "north", "south"),
  minutes = c(24, 31, 19, 27, 35, 29, 22, 74, 33, 21, 26, 38)
)
`
