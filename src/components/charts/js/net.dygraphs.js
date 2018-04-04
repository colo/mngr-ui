export default {
  "class": "line",
  "style": "width:100%; height:120px;",
  "interval": 0,
  "options": {
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
    axis : {
      x : {
        // valueFormatter: Dygraph.dateString_,
        valueFormatter: function(x){
          console.log('valueFormatter',x)
          return x
        },
        valueParser: function(x) {
          console.log('valueParser',x)
          return x
        },
        // ticker: Dygraph.dateTicker
      }
    }
  }
}
