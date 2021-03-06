export default {
  "style": "width:100%; height:126px;",
  "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
  "interval": 0,
  "options": {
    axisLabelFontSize: 12,
    /**
    * netdata options
    */
    xRangePad: 0,
    yRangePad: 1,
    pixelRatio: 1,
    drawGapEdgePoints: true,
    stepPlot: false,
    gridLinePattern: null,
    gridLineWidth: 1.0,
    maxNumberWidth: 8,
    sigFigs: null,
    digitsAfterDecimal: 2,
    /**
    * netdata options
    */
    highlightCallback: function(event, x, points, row, seriesName){
      console.log('highlightCallback', event, x, points, row, seriesName)
      // console.log('highlightCallback', window.EventBus)
      window.EventBus.$emit('highlightCallback', [event, x, points, row, seriesName])
    },
    unhighlightCallback: function(event){
      // console.log('highlightCallback', event, x, points, row, seriesName)
      // console.log('highlightCallback', window.EventBus)
      window.EventBus.$emit('unhighlightCallback', event)
    },
    drawGrid: true,
    labelsSeparateLines: true,
    "hideOverlayOnMouseOut": false,
    "labelsDiv": "netdata-chart-legend",
    "legend": "always",
    fillGraph: true,
    // showRangeSelector: true,
    // rangeSelectorHeight: 20,
    // rangeSelectorPlotStrokeColor: 'blue',
    // rangeSelectorPlotFillColor: null,
    // rangeSelectorPlotStrokeColor: null,
    // rangeSelectorPlotFillGradientColor: null,
    // drawPoints: true,
    showRoller: false,
    // valueRange: [0.0, 1.2],
    labels: ['Date', 'OUT', 'IN'],
    series: {
      'OUT': {
         // plotter: smoothPlotter,
         color: 'red',
         // fillAlpha: 0.4,
         //strokeWidth: 2
      },
      'IN': {
         // plotter: smoothPlotter,
         color: 'blue',
         // fillAlpha: 0.4,
         //strokeWidth: 2
      }

    },
    // axis : {
    //   x : {
    //     // valueFormatter: Dygraph.dateString_,
    //     valueFormatter: function(x){
    //       console.log('valueFormatter',x)
    //       return x
    //     },
    //     valueParser: function(x) {
    //       console.log('valueParser',x)
    //       return x
    //     },
    //     // ticker: Dygraph.dateTicker
    //   }
    // }
  }
}
