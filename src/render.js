const Plotly = require('./plotly-custom.js')

module.exports = class Render {
  constructor () {
    this.outputs = document.getElementById('outputs')

    this.divPlot = document.createElement('div')
    this.divPlot.style.width = '100%'
    this.divPlot.style.maxWidth = '900px'
    this.outputs.appendChild(this.divPlot)

    this.divPlotTest = document.createElement('div')
    this.divPlotTest.style.width = '100%'
    this.divPlotTest.style.maxWidth = '900px'
    this.outputs.appendChild(this.divPlotTest)

    this.pOpts = document.createElement('p')
    this.outputs.appendChild(this.pOpts)
  }

  render (data) {
    const { ts, forecast, forecastTest, params } = data

    //
    const tsTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Original timeseries',
      x: ts.map((_, i) => i),
      y: ts,
      line: { color: '#8F8F8F' }
    }
    const forecastTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Forecast',
      x: forecast.map((_, i) => i + ts.length),
      y: forecast,
      line: { color: '#17BECF' }
    }
    const plotlyData = [tsTrace, forecastTrace]
    Plotly.newPlot(this.divPlot, plotlyData, {
      title: forecast.length + ' steps forecast'
    })

    //
    const tsTrain = ts.slice(0, ts.length - forecastTest.length)
    const tsTraceTrain = {
      type: 'scatter',
      mode: 'lines',
      name: 'Original timeseries',
      x: tsTrain.map((_, i) => i),
      y: tsTrain,
      line: { color: '#8F8F8F' }
    }
    const tsTraceTest = {
      type: 'scatter',
      mode: 'lines',
      name: 'True values',
      x: forecastTest.map((_, i) => i + tsTrain.length),
      y: ts.slice(tsTrain.length),
      line: {
        dash: 'dot',
        color: '#8F8F8F'
      }
    }
    const forecastTestTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Forecast',
      x: forecastTest.map((_, i) => i + tsTrain.length),
      y: forecastTest,
      line: { color: '#17BECF' }
    }
    const plotlyDataTest = [tsTraceTrain, tsTraceTest, forecastTestTrace]
    Plotly.newPlot(this.divPlotTest, plotlyDataTest, {
      title: forecast.length + ' steps test'
    })

    this.pOpts.innerHTML = `
      <b>p</b>:${params.p}, <b>d</b>: ${params.d}, <b>q</b>: ${params.q}
    `
  }
}
