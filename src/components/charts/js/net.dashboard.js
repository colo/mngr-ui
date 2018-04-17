export default {
  "style": "width:100%; height:126px;",
  "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
  "interval": 0,
  "options": {
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
    // drawPoints: true,
    showRoller: false,
    // valueRange: [0.0, 1.2],
    labels: ['Date', 'OUT', 'IN'],
    series: {
      'OUT': {
         plotter: smoothPlotter,
         // color: 'red',
         strokeWidth: 2
      },
      'IN': {
         plotter: smoothPlotter,
         // color: 'red',
         strokeWidth: 2
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
