// Statistics, hard side quest: The ice-cream model.
import { code, makeProject, mc, near, qShort, snippet, task } from '../_builders.mjs'

const SALES = 'kiosk <- data.frame(\n  day = 1:12,\n  temp = c(14, 16, 18, 20, 22, 24, 26, 28, 30, 19, 23, 27),\n  sales = c(118, 152, 141, 196, 183, 240, 231, 292, 284, 170, 221, 248)\n)\n'
const MODEL = 'model <- lm(sales ~ temp, data = kiosk)\n'

export default makeProject('hard', {
  id: 'proj_icecream_model',
  title: 'The ice-cream model',
  paragraphs: [
    'A kiosk by the lake sells ice creams. The owner noted the afternoon temperature (°C) and the number sold on 12 days, and wants to know how many to order for tomorrow.',
    code(...SALES.trim().split('\n')),
    'Measure the link, fit a model, check how well it fits, and build a small forecasting function that refuses to guess outside the temperatures it has seen.',
  ],
  sandboxCode: SALES + 'cor(kiosk$temp, kiosk$sales)\n' + MODEL + 'coef(model)',
  sandboxSnippets: [snippet('Residuals', SALES + MODEL + 'round(residuals(model), 1)')],
  challenges: [
    task('easy', 'Warmer, more sold?', {
      prompt: 'Make `r` the correlation between temperature and sales, rounded to 2 decimal places.',
      starter: SALES,
      hint: '`round(cor(kiosk$temp, kiosk$sales), 2)`',
      solution: SALES + 'r <- round(cor(kiosk$temp, kiosk$sales), 2)',
      tests: [['r is 0.96', near('r', 0.96)]],
    }),
    task('medium', 'Per degree', {
      prompt: 'Fit `model`, sales explained by temperature, and make `per_degree` the slope, unnamed, rounded to 2 decimal places.',
      starter: SALES,
      hint: '`model <- lm(sales ~ temp, data = kiosk)`, then `round(unname(coef(model)[2]), 2)`.',
      solution: SALES + MODEL + 'per_degree <- round(unname(coef(model)[2]), 2)',
      tests: [['model is an lm', 'inherits(model, "lm")'], ['per_degree is 10.75', near('per_degree', 10.75)]],
    }),
    task('medium', 'How good', {
      prompt: 'Make `r2` the R-squared, rounded to 2 decimal places.',
      starter: SALES + MODEL,
      hint: '`round(summary(model)$r.squared, 2)`',
      solution: SALES + MODEL + 'r2 <- round(summary(model)$r.squared, 2)',
      tests: [['r2 is 0.93', near('r2', 0.93)]],
    }),
    task('hard', 'Tomorrow at 25 °C', {
      prompt: 'Make `to_order` the predicted sales for 25 °C, rounded to a whole number.',
      starter: SALES + MODEL,
      hint: '`round(unname(predict(model, newdata = data.frame(temp = 25))))`',
      solution: SALES + MODEL + 'to_order <- round(unname(predict(model, newdata = data.frame(temp = 25))))',
      tests: [['to_order is 236', near('to_order', 236)]],
    }),
    task('hard', 'The surprising day', {
      prompt: 'Make `odd_day` the day whose sales were furthest from the line, either way.',
      starter: SALES + MODEL,
      hint: '`kiosk$day[which.max(abs(residuals(model)))]`',
      solution: SALES + MODEL + 'odd_day <- kiosk$day[which.max(abs(residuals(model)))]',
      tests: [['odd_day is 8', near('odd_day', 8)]],
    }),
    task('expert', 'A careful forecast', {
      prompt: 'Write `forecast(t)` that gives the predicted sales for temperature `t`, rounded to a whole number, but `NA` if `t` is outside the temperatures in the data. `forecast(25)` is 236 and `forecast(35)` is NA.',
      starter: SALES + MODEL,
      hint: 'Inside the function: `if (t < min(kiosk$temp) || t > max(kiosk$temp)) return(NA)`, then the prediction.',
      solution: SALES + MODEL + 'forecast <- function(t) {\n  if (t < min(kiosk$temp) || t > max(kiosk$temp)) return(NA)\n  round(unname(predict(model, newdata = data.frame(temp = t))))\n}',
      tests: [['forecast(25) is 236', 'is.function(forecast) && isTRUE(all.equal(forecast(25), 236))'], ['forecast(35) is NA', 'is.na(forecast(35))'], ['forecast(10) is NA', 'is.na(forecast(10))']],
    }),
  ],
  questions: [
    mc('The slope is 10.75. What does it mean?', ['10.75 ice creams a day', 'About 10.75 more ice creams sold per extra degree', 'The temperature rises 10.75', 'R² is 10.75'], 1,
      'Change in sales per unit of temperature.'),
    mc('R² is 0.93. What share of the day-to-day variation in sales does temperature explain?', ['7%', '93%', '0.93%', '96%'], 1,
      'The rest is everything else: weekends, holidays, luck.'),
    mc('Why refuse to forecast at 35 °C?', ['R can\'t', 'The data only go up to 30 °C; the straight line might not hold beyond (extrapolation)', '35 is too hot to sell', 'predict() gives an error'], 1,
      'At very high temperatures people may stay indoors, or the kiosk may run out.'),
    mc('What does `which.max(abs(c(3, -9, 5)))` give?', ['`1`', '`2`', '`3`', '`9`'], 1,
      'The biggest gap either way is −9, in position 2.',
      { code: 'which.max(abs(c(3, -9, 5)))', output: '[1] 2' }),
    mc('The intercept is about −33. What does that say?', ['The kiosk loses 33 ice creams', 'At 0 °C the line predicts −33 sales: another sign not to trust it outside the data', 'The model is wrong', 'Sales start at 33'], 1,
      'An intercept far outside the data often has no real meaning.'),
    qShort('Which function uses a fitted model to give values for new data?', 'predict',
      '`predict(model, newdata = data.frame(temp = 25))`'),
  ],
})
