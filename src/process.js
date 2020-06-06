const arima = require('arima')
const parse = require('csv-parse/lib/sync')

module.exports = class Process {
  constructor () {
    this.file = ''
    this.records = []
    this.keys = []
  }

  run (params) {
    if (!params.file && !this.file.length) {
      console.log('No file provided')
      throw new Error('No file selected')
    } else if (params.file !== this.file) {
      this.file = params.file
      this.records = parse(params.file, {
        columns: true,
        skip_empty_lines: true
      })
      this.keys = Object.keys(this.records[0]).filter(key => key.length)
      return {
        column: {
          options: this.keys
        }
      }
    } else {
      const ts = this.records.map(row => +row[params.column]) // .filter((_, i) => rows.includes(i))
      // Assume ARIMA here
      if (params.parameters === 'Auto') {
        const scores = []
        const split = ts.length - params.timesteps
        const tsTrain = ts.slice(0, split)
        const tsTrue = ts.slice(split)
        for (let i = 0; i <= 60; i++) {
          const pars = {
            p: Math.round(Math.random() * 12),
            d: Math.round(Math.random() * 3),
            q: Math.round(Math.random() * 6)
          }
          const [tsPred, err] = arima(tsTrain, params.timesteps, {
            p: pars.p,
            d: pars.d,
            q: pars.q,
            verbose: false
          })
          const score = tsPred.map((v, i) => Math.abs(tsPred[i] - tsTrue[i])).reduce((a, v) => a + v / tsPred.length, 0)
          console.log('Iteration:', i, score, pars)
          scores.push({
            score, pars
          })
        }
        const min = scores.reduce((iMax, x, i, arr) => x.score < arr[iMax].score ? i : iMax, 0)
        console.log('Best params', scores[min])
        const forecastTest = arima(ts.slice(0, ts.length - params.timesteps), params.timesteps, scores[min].pars)
        const forecast = arima(ts, params.timesteps, scores[min].pars)
        return { ts, forecast, forecastTest, params: scores[min].pars }
      } else {
        const arimaOpts = {
          p: params.p,
          d: params.d,
          q: params.q
        }
        const forecastTest = arima(ts.slice(0, ts.length - params.timesteps), params.timesteps, arimaOpts)
        const forecast = arima(ts, params.timesteps, arimaOpts)
        return { ts, forecast, forecastTest, params: arimaOpts }
      }
    }
  }
}
