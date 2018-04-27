// import Dygraph from 'dygraphs'

export default {
  "loadavg": {
    // "class": "chart-with-legend-right dygraph-with-legend-right",
    "style": "width:100%; height:126px;",
    "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
    "interval": 0,
    // init: function (vue){
    //   // console.log('init', vue)
    //   this.$vm = vue
    //   // EventBus.$emit('cpu', doc) //update cpu widget
    // },
    "options": {
      highlightCallback: function(event, x, points, row, seriesName){
        // console.log('highlightCallback', event, x, points, row, seriesName)
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
      // connectSeparatedPoints: true,
      // includeZero: 0,
      fillGraph: true,
      // fillAlpha: 1.0,
      showRangeSelector: true,
      rangeSelectorHeight: 20,
      rangeSelectorPlotStrokeColor: 'blue',
      rangeSelectorPlotFillColor: 'lightblue',
      // drawPoints: true,
      showRoller: false,
      // valueRange: [0.0, 1.2],
      labels: ['Time', '1 min avg', '5 min avg', '15 min avg'],
      series: {
       '1 min avg': {
         // color: 'red',
         //strokeWidth: 2,
         // plotter: smoothPlotter,
       },
       '5 min avg': {
         // color: 'red',
         //strokeWidth: 2,
         // plotter: smoothPlotter,
       },
       '15 min avg': {
         // color: 'red',
         //strokeWidth: 2,
         // includeZero: 0,
         // fillGraph: true,
         // plotter: smoothPlotter,
         // fillAlpha: 1.0,
       }

     },

    }
  },
  "uptime": {
    "style": "width:100%; height:126px;",
    "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
    "interval": 0,
    "options": {
      // legendFormatter: function(data) {
      //   console.log('legendFormatter', data)
      //   if (data.x == null) {
      //     // This happens when there's no selection and {legend: 'always'} is set.
      //     return '<br>' + data.series.map(function(series) { return series.dashHTML + ' ' + series.labelHTML }).join('<br>');
      //   }
      //
      //   // return data.xHTML + data.series.map(v => v.labelHTML + ': ' + v.yHTML).join(' ');
      //   var html = this.getLabels()[0] + ': ' + data.xHTML;
      //   data.series.forEach(function(series) {
      //     if (!series.isVisible) return;
      //     var labeledData = series.labelHTML + ': ' + series.yHTML;
      //     if (series.isHighlighted) {
      //       labeledData = '<b>' + labeledData + '</b>';
      //     }
      //     html += '<br>' + series.dashHTML + ' ' + labeledData;
      //   });
      //   return html;
      // },
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
      "hideOverlayOnMouseOut": false,
      "labelsDiv": "netdata-chart-legend",
      "legend": "always",
      fillGraph: true,
      showRangeSelector: true,
      rangeSelectorHeight: 20,
      rangeSelectorPlotStrokeColor: 'blue',
      rangeSelectorPlotFillColor: 'lightblue',
      // axes: {
      //   x: {
      //     // valueFormatter: Dygraph.dateString_,
      //     xValueParser: function(x) {
      //       console.log('valueParser', x)
      //       return 1000*parseInt(x);
      //       // return x;
      //     },
      //     // ticker: Dygraph.dateTicker
      //     // valueFormatter: function(x){
      //     //   console.log('valueFormatter', x)
      //     //   return x
      //     // }
      //   }
      // },
      // axis : {
      //   x : {
      //     // valueFormatter: Dygraph.dateString_,
      //     valueFormatter: function(x) {
      //       console.log('valueParser', x)
      //       return x;
      //     },
      //     // ticker: Dygraph.dateTicker
      //   }
      // },
      // drawPoints: true,
      showRoller: false,
      // valueRange: [0.0, 1.2],
      labels: ['Time', 'Value'],
      series: {
         // Straight: {
         //   color: 'rgba(0,0,0,0.33)',
         //   //strokeWidth: 2,
         //   // drawPoints: true,
         //   pointSize: 3
         // },
         Value: {
           // plotter: smoothPlotter,
           color: 'red',
           // //strokeWidth: 2
         }
       },
    }
  },



  // cpu: {
  //   "class": "gauge",
  //   "interval": 1000,
  //   "type": "pie-chart",
  //   "option": {
  //
  //
  //   }
  // },
  // mem: {
  //   "class": "gauge",
  //   "interval": 2000,
  //   "type": "pie-chart",
  //   "option": {
  //
  //   }
  // }
}
