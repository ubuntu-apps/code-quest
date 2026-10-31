// Other data for the "works with other data too" checks of challenges where the default
// change (see _rerun.mjs) doesn't work. Made by ../find-variations.mjs; keyed by
// variationKey(starter, solution), so an entry stops applying when its challenge changes.
export const VARIATIONS = {
  "12ewx8z": {
    where: "cleaning/duplicates \"Easy: Which are repeats\"",
    alt: "emails <- c(\"ana@example.org\", \"ben@example.org\", \"ana@example.org\", \"ana@example.org\")\n",
  },
  "cxv631": {
    where: "cleaning/duplicates \"Hard: Duplicates after cleaning\"",
    alt: "emails <- c(\"Ana@Example.org\", \"ben@example.org\", \" ana@example.org\", \"BEN@EXAMPLE.ORG\", \"Ana@Example.org\")\n",
  },
  "1c2xzv0": {
    where: "cleaning/numbers_as_text \"Expert: Grams and kilograms\"",
    alt: "raw <- c(\"500 g\", \"1.2 kg\", \"250 g\", \"500 g\")\n",
  },
  "10hyilh": {
    where: "cleaning/recoding \"Medium: Yes in many forms\"",
    alt: "answers <- c(\"yes\", \"no\", \"y\", \"1\", \"0\", \"yes\")\n",
  },
  "xpm2ln": {
    where: "data_frames/combining \"Easy: How many matched\"",
    alt: "sales <- data.frame(item = c(\"latte\", \"tea\", \"cake\", \"latte\", \"latte\"), qty = c(5, 4, 7, 4, 5))\nmenu <- data.frame(item = c(\"latte\", \"tea\", \"cake\", \"latte\"), price = c(8.6, 10.4, 6, 8.8))\n",
  },
  "8zvl1m": {
    where: "data_frames/frame_summaries \"Easy: Missing weights\"",
    alt: "harvest <- data.frame(\n  plot = c(\"A\", \"A\", \"B\", \"B\", \"C\", \"C\", \"D\", \"D\"),\n  crop = c(\"tomatoes\", \"beans\", \"tomatoes\", \"kale\", \"beans\", \"kale\", \"tomatoes\", \"beans\"),\n  kg = c(NA, 3.6, 9.8, NA, 4.1, 2.7, 14.2, 2.9),\n  family = c(\"Silva\", \"Silva\", \"Okafor\", \"Okafor\", \"Li\", \"Li\", \"Mensah\", \"Mensah\")\n)\n",
  },
  "vx3vpf": {
    where: "data_frames/frame_summaries \"Medium: Gaps in every column\"",
    alt: "harvest <- data.frame(\n  plot = c(\"A\", \"A\", \"B\", \"B\", \"C\", \"C\", \"D\", \"D\"),\n  crop = c(\"tomatoes\", \"beans\", \"tomatoes\", \"kale\", \"beans\", \"kale\", \"tomatoes\", \"beans\"),\n  kg = c(NA, 3.6, 9.8, NA, 4.1, 2.7, 14.2, 2.9),\n  family = c(\"Silva\", \"Silva\", \"Okafor\", \"Okafor\", \"Li\", \"Li\", \"Mensah\", \"Mensah\")\n)\n",
  },
  "28v55x": {
    where: "first_steps/functions \"Hard: Enough taxis\"",
    alt: "people <- 47\n",
  },
  "12x38jy": {
    where: "first_steps/proj_cafe_bill \"Hard: Split three ways\"",
    alt: "total <- 22.12\n",
  },
  "6z38uv": {
    where: "functions/functions_on_data \"Easy: Gaps per column\"",
    alt: "harvest <- data.frame(\n  plot = c(\"A\", \"A\", \"B\", \"B\", \"C\", \"C\", \"D\", \"D\"),\n  crop = c(\"tomatoes\", \"beans\", \"tomatoes\", \"kale\", \"beans\", \"kale\", \"tomatoes\", \"beans\"),\n  kg = c(NA, 3.6, 9.8, NA, 4.1, 2.7, 14.2, 2.9),\n  family = c(\"Silva\", \"Silva\", \"Okafor\", \"Okafor\", \"Li\", \"Li\", \"Mensah\", \"Mensah\")\n)\n",
  },
  "us5rsp": {
    where: "projects/capstone_bikes \"Easy: The busiest hour\"",
    alt: "day <- data.frame(\n  id = 1:16,\n  start = c(\"07:45\", \"08:10\", \"08:20\", \"08:55\", \"12:05\", \"12:30\", \"13:10\", \"17:05\",\n            \"17:20\", \"17:35\", \"17:50\", \"18:10\", \"18:40\", \"19:05\", \"08:05\", \"07:45\"),\n  station = c(\"Park\", \"River\", \"Park\", \"Market\", \"River\", \"Park\", \"Market\", \"Park\",\n              \"River\", \"River\", \"Market\", \"Park\", \"River\", \"Market\", \"Market\", \"Park\"),\n  minutes = c(32, 17, 44, 103, 54, 25, 56, 77, 34, 45, 50, 91, 20, 23, 66, 29),\n  km = c(8.6, 4.4, 12.4, 22.2, 10.2, 5.8, 14, 17.2, 9.2, 10.6, 9, 20.6, 5.8, 6.2, 16.4, 7.2),\n  member = c(TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE)\n)\nday$hour <- as.numeric(substr(day$start, 1, 2))\n",
  },
  "1ntbg6z": {
    where: "projects/capstone_planning \"Easy: Look first\"",
    alt: "visits <- data.frame(\n  date = seq(as.Date(\"2026-09-07\"), by = \"day\", length.out = 28),\n  visitors = c(NA, 98, 105, 120, 134, 76, 41, 108, 95, -1, 118, 140, 81, 38,\n               115, 101, 99, NA, 129, 72, 45, 110, 92, 104, 116, 138, 79, 40)\n)\n",
  },
  "ncs46g": {
    where: "reshaping/sets_and_match \"Medium: Where on the menu\"",
    alt: "menu <- data.frame(drink = c(\"latte\", \"tea\", \"mocha\", \"latte\"), price = c(9.6, 9.4, 7, 7.8))\norders <- c(\"tea\", \"latte\", \"latte\", \"flat white\", \"tea\")\n",
  },
  "1ytswny": {
    where: "statistics/correlation \"Medium: The strongest link\"",
    alt: "study <- data.frame(\n  student = c(\"Ana\", \"Ben\", \"Cy\", \"Dee\", \"Eli\", \"Fay\", \"Gus\", \"Ana\"),\n  hours = c(6, 15, 8, 13, 10, 3, 12, 5),\n  phone = c(8, 3, 10, 3, 6, 13, 6, 11),\n  sleep = c(14, 15, 20, 17, 16, 13, 18, 15),\n  score = c(126, 169, 118, 159, 152, 105, 144, 129)\n)\n",
  },
  "pvrqf8": {
    where: "statistics/two_sample_t \"Easy: Leaf against peat\"",
    alt: "seedlings <- data.frame(\n  tray = 1:12,\n  compost = c(\"peat\", \"peat\", \"peat\", \"peat\", \"leaf\", \"leaf\", \"leaf\", \"leaf\", \"home\", \"home\", \"home\", \"home\"),\n  height_cm = c(NA, 7.5, 9.1, 8.0, 10.4, 11.2, 9.8, 10.9, 7.1, 12.8, 6.9, 7.6),\n  leaves = c(NA, 5, 7, 6, 8, 9, 7, 8, 5, 9, 4, 5)\n)\ntwo <- seedlings[seedlings$compost %in% c(\"peat\", \"leaf\"), ]\n",
  },
  "a76jmm": {
    where: "statistics/two_sample_t \"Easy: The group means\"",
    alt: "seedlings <- data.frame(\n  tray = 1:12,\n  compost = c(\"peat\", \"peat\", \"peat\", \"peat\", \"leaf\", \"leaf\", \"leaf\", \"leaf\", \"home\", \"home\", \"home\", \"home\"),\n  height_cm = c(7.9, 7.1, 12.9, 7.4, 11.1, 9.9, 11.5, 10.6, 8.1, 9.4, 7.7, 8.3),\n  leaves = c(8, 6, 10, 8, 10, 8, 12, 10, 7, 10, 7, 7)\n)\ntwo <- seedlings[seedlings$compost %in% c(\"peat\", \"leaf\"), ]\n",
  },
  "1m899ts": {
    where: "statistics/two_sample_t \"Expert: Summary sentence\"",
    alt: "seedlings <- data.frame(\n  tray = 1:12,\n  compost = c(\"peat\", \"peat\", \"peat\", \"peat\", \"leaf\", \"leaf\", \"leaf\", \"leaf\", \"home\", \"home\", \"home\", \"home\"),\n  height_cm = c(NA, 7.5, 9.1, 8.0, 10.4, 11.2, 9.8, 10.9, 7.1, 12.8, 6.9, 7.6),\n  leaves = c(NA, 5, 7, 6, 8, 9, 7, 8, 5, 9, 4, 5)\n)\ntwo <- seedlings[seedlings$compost %in% c(\"peat\", \"leaf\"), ]\n",
  },
  "1uxmu7l": {
    where: "statistics/two_sample_t \"Medium: How big is the gap\"",
    alt: "seedlings <- data.frame(\n  tray = 1:12,\n  compost = c(\"peat\", \"peat\", \"peat\", \"peat\", \"leaf\", \"leaf\", \"leaf\", \"leaf\", \"home\", \"home\", \"home\", \"home\"),\n  height_cm = c(NA, 7.5, 9.1, 8.0, 10.4, 11.2, 9.8, 10.9, 7.1, 12.8, 6.9, 7.6),\n  leaves = c(NA, 5, 7, 6, 8, 9, 7, 8, 5, 9, 4, 5)\n)\ntwo <- seedlings[seedlings$compost %in% c(\"peat\", \"leaf\"), ]\n",
  },
  "quf4y3": {
    where: "statistics/two_sample_t \"Medium: North and south\"",
    alt: "deliveries <- data.frame(\n  rider = c(\"Sam\", \"Ola\", \"Sam\", \"Ola\", \"Kit\", \"Sam\", \"Kit\", \"Ola\", \"Kit\", \"Sam\", \"Ola\", \"Sam\"),\n  area = c(\"north\", \"south\", \"north\", \"north\", \"south\", \"south\", \"north\", \"south\", \"south\", \"north\", \"north\", \"north\"),\n  minutes = c(78, 53, 44, 67, 150, 45, 60, 71, 56, 39, 64, 49)\n)\n",
  },
  "4ifkci": {
    where: "summarising/centre \"Easy: How far apart\"",
    alt: "deliveries <- data.frame(\n  rider = c(\"Sam\", \"Ola\", \"Sam\", \"Ola\", \"Kit\", \"Sam\", \"Kit\", \"Ola\", \"Kit\", \"Sam\", \"Ola\", \"Sam\"),\n  area = c(\"north\", \"south\", \"north\", \"north\", \"south\", \"south\", \"north\", \"south\", \"south\", \"north\", \"north\", \"north\"),\n  minutes = c(78, 53, 44, 67, 150, 45, 60, 71, 56, 39, 64, 49)\n)\n",
  },
  "1vjunc1": {
    where: "summarising/counts_percentages \"Easy: Share of lattes\"",
    alt: "orders <- data.frame(\n  order = 101:110,\n  day = c(\"Mon\", \"Mon\", \"Tue\", \"Tue\", \"Tue\", \"Wed\", \"Wed\", \"Thu\", \"Fri\", \"Mon\"),\n  drink = c(\"latte\", \"tea\", \"mocha\", \"latte\", \"latte\", \"tea\", \"chai\", \"latte\", \"mocha\", \"latte\"),\n  size = c(\"M\", \"S\", \"L\", \"M\", \"S\", \"M\", \"L\", \"L\", \"M\", \"M\"),\n  price = c(6.4, 9.4, 9.8, 8.6, 7, 6.8, 8.8, 9.4, 7, 7.8)\n)\n",
  },
  "n6wzln": {
    where: "summarising/proj_seedling_trial \"Medium: The odd tray\"",
    alt: "seedlings <- data.frame(\n  tray = 1:12,\n  compost = c(\"home\", \"home\", \"home\", \"home\", \"leaf\", \"leaf\", \"leaf\", \"leaf\", \"peat\", \"peat\", \"peat\", \"peat\"),\n  height_cm = c(8.2, 7.5, 9.1, 8.0, 10.4, 11.2, 9.8, 10.9, 7.1, 12.8, 6.9, 7.6),\n  leaves = c(6, 5, 7, 6, 8, 9, 7, 8, 5, 9, 4, 5)\n)\n",
  },
  "6vr1ey": {
    where: "summarising/summary_report \"Hard: Pass rate\"",
    alt: "class_results <- data.frame(\n  student = c(\"Ana\", \"Ben\", \"Cy\", \"Dee\", \"Eli\", \"Fay\", \"Gus\", \"Hal\", \"Ivy\", \"Jo\", \"Kai\", \"Ana\"),\n  group = c(\"A\", \"B\", \"A\", \"B\", \"A\", \"B\", \"A\", \"B\", \"A\", \"B\", \"A\", \"A\"),\n  test1 = c(192, 129, 118, 167, 140, 153, 96, 183, 110, 177, 132, 145),\n  test2 = c(195, 144, 125, 178, 133, 162, NA, 189, 124, 171, 142, 157)\n)\n",
  },
  "133bo0v": {
    where: "summarising/summary_report \"Medium: How many took test 2\"",
    alt: "class_results <- data.frame(\n  student = c(\"Ana\", \"Ben\", \"Cy\", \"Dee\", \"Eli\", \"Fay\", \"Gus\", \"Hal\", \"Ivy\", \"Jo\", \"Kai\", \"Lea\"),\n  group = c(\"A\", \"B\", \"A\", \"B\", \"A\", \"B\", \"A\", \"B\", \"A\", \"B\", \"A\", \"B\"),\n  test1 = c(NA, 65, 88, 54, 91, 47, 76, 69, 83, 58, 64, 95),\n  test2 = c(NA, 70, 85, 61, 94, NA, 80, 66, 88, 62, 71, 97)\n)\n",
  },
  "d1mvo5": {
    where: "types_text/converting \"Medium: Spot the bad values\"",
    alt: "raw <- c(\"12\", \"8\", \"n/a\", \"15\", \"12\")\n",
  },
  "1qeo1yr": {
    where: "types_text/converting \"Medium: Whole boxes\"",
    alt: "boxes <- 101 / 6\n",
  },
  "1mokypb": {
    where: "types_text/counting \"Easy: How many lattes\"",
    alt: "drinks <- c(\"latte\", \"tea\", \"latte\", \"mocha\", \"latte\", \"latte\")\ncounts <- table(drinks)\n",
  },
  "1lrzyow": {
    where: "types_text/factors \"Medium: Catch the typo\"",
    alt: "orders <- c(\"M\", \"S\", \"LL\", \"M\", \"M\")\n",
  },
  "10g86dc": {
    where: "types_text/find_replace \"Easy: Only the teas\"",
    alt: "items <- c(\"chai latte\", \"mocha\", \"green tea\", \"black tea\", \"oat latte\")\n",
  },
  "nrenmc": {
    where: "types_text/find_replace \"Easy: Which are lattes\"",
    alt: "items <- c(\"oat latte\", \"black tea\", \"latte\", \"mocha\", \"CHAI LATTE\")\n",
  },
  "zp1xeg": {
    where: "types_text/find_replace \"Medium: Books only\"",
    alt: "codes <- c(\"BK-104\", \"DVD-07\", \"BK-221\", \"MAG-12\", \"BK-104\")\n",
  },
  "16ywbru": {
    where: "types_text/ifelse \"Easy: Free delivery\"",
    alt: "orders <- c(53.8, 61, 86, 38)\n",
  },
  "1cd2nqi": {
    where: "types_text/ifelse \"Medium: Count the passes\"",
    alt: "result <- c(\"pass\", \"fail\", \"pass\", \"pass\", \"pass\")\n",
  },
  "zuxzrd": {
    where: "types_text/proj_library_loans \"Hard: Loans per shelf\"",
    alt: "codes <- c(\"FI-104\", \"SC-221\", \"FI-350\", \"HI-007\", \"FI-104\")\nborrowed <- as.Date(c(\"2027-10-01\", \"2026-10-03\", \"2027-10-07\", \"2026-10-10\", \"2027-10-12\"))\nreturned <- as.Date(c(\"2026-10-12\", \"2027-10-25\", \"2026-10-21\", \"2027-10-30\", \"2026-10-20\"))\n",
  },
  "njp1jx": {
    where: "types_text/proj_signup_sheet \"Hard: Initials\"",
    alt: "First <- c(\"Ana\", \"Ben\", \"Cy\", \"Ana\")\nLast <- c(\"Silva\", \"Okafor\", \"Li\", \"Silva\")\n",
  },
  "1chrs52": {
    where: "types_text/text_tools \"Expert: The middle part\"",
    alt: "codes <- c(\"FI-104\", \"SC-221\", \"FI-104\")\n",
  },
  "yj528n": {
    where: "types_text/text_tools \"Medium: Shelf codes\"",
    alt: "codes <- c(\"FI-350\", \"HI-007\", \"SC-221\", \"FI-104\")\n",
  },
  "1861071": {
    where: "vectors/by_condition \"Medium: Names of the busy days\"",
    alt: "steps <- c(6001, 19802, 13001, 16202, 8401)\ndays <- c(\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Mon\")\n",
  },
  "1wz3qz1": {
    where: "vectors/na_in_vectors \"Medium: Share missing\"",
    alt: "answers <- c(NA, NA, 5, 3, NA, NA, 4, 2)\n",
  },
  "7kddk6": {
    where: "vectors/proj_quiz_club \"Easy: Who took part\"",
    alt: "members <- c(\"Ana\", \"Ben\", \"Cy\", \"Dee\", \"Eli\", \"Fay\", \"Gus\", \"Hal\")\nscores <- c(NA, 27, NA, 38, 19, 35, NA, 24)\n",
  },
  "au247j": {
    where: "vectors/proj_weekly_steps \"Medium: Goal days\"",
    alt: "steps <- c(7801, 24202, 15201, 20602, 10201, 16802, 12401)\ndays <- c(\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Mon\")\n",
  },
  "1hgxk3d": {
    where: "vectors/which_any_all \"Medium: Weekend or not\"",
    alt: "days <- c(\"Mon\", \"Sun\", \"Sat\", \"Fri\", \"Thu\")\n",
  },
}
