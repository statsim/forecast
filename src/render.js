const Plotly = require('./plotly-custom.js')

module.exports = class Render {
  constructor () {
    this.outputs = document.getElementById('outputs')

    this.pOpts = document.createElement('h6')
    this.pOpts.style.textAlign = 'center'
    this.outputs.appendChild(this.pOpts)

    this.divPlot = document.createElement('div')
    this.divPlot.style.width = '100%'
    this.divPlot.style.maxWidth = '900px'
    this.outputs.appendChild(this.divPlot)

    this.divPlotTest = document.createElement('div')
    this.divPlotTest.style.width = '100%'
    this.divPlotTest.style.maxWidth = '900px'
    this.outputs.appendChild(this.divPlotTest)

    this.divCor = document.createElement('div')
    this.divCor.style.width = '100%'
    this.divCor.style.maxWidth = '900px'
    this.outputs.appendChild(this.divCor)
  }

  render (data) {
    const { ts, forecast, forecastTest, autocor, params } = data

    this.pOpts.innerHTML = `
      ARIMA (<b>p</b>:${params.p}, <b>d</b>: ${params.d}, <b>q</b>: ${params.q})
    `

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
      x: forecast[0].map((_, i) => i + ts.length),
      y: forecast[0],
      line: { color: '#17BECF' }
    }
    const plotlyData = [tsTrace, forecastTrace]

    if (forecast[1] && Array.isArray(forecast[1])) {
      const forecastIntervals = {
        name: 'Forecast',
        showlegend: false,
        type: 'scatter',
        fill: 'tonexty',
        fillcolor: 'rgba(0, 0, 0, 0.1)',
        line: { color: 'transparent' },
        x: forecast[0].map((_, i) => i + ts.length),
        y: forecast[1].map((e, i) => forecast[0][i] + 1.96 * Math.sqrt(e))
      }
      for (let i = forecast[0].length - 1; i >= 0; i--) {
        forecastIntervals.x.push(forecastIntervals.x[i])
        forecastIntervals.y.push(forecast[0][i] - 1.96 * Math.sqrt(forecast[1][i]))
      }
      plotlyData.unshift(forecastIntervals)
    }

    Plotly.newPlot(this.divPlot, plotlyData, {
      title: forecast[0].length + ' steps forecast'
    })

    //
    const tsTrain = ts.slice(0, ts.length - forecastTest[0].length)
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
      x: forecastTest[0].map((_, i) => i + tsTrain.length),
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
      x: forecastTest[0].map((_, i) => i + tsTrain.length),
      y: forecastTest[0],
      line: { color: '#17BECF' }
    }
    const plotlyDataTest = [tsTraceTrain, tsTraceTest, forecastTestTrace]
    Plotly.newPlot(this.divPlotTest, plotlyDataTest, {
      title: forecastTest[0].length + ' steps test'
    })

    const autocorTrace = {
      type: 'scatter',
      mode: 'lines',
      name: 'Autocorrelation',
      x: autocor.map((_, i) => i),
      y: autocor,
      line: { color: '#8F8F8F' }
    }
    const autocorData = [autocorTrace]
    Plotly.newPlot(this.divCor, autocorData, {
      title: 'Autocorrelation plot'
    })
  }
}
