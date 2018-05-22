export default {
    component: 'dygraph-vue',
    // "class": "chart-with-legend-right dygraph-with-legend-right",
    "style": "width:100%; height:126px;",
    "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
    "interval": 0,
    // init: function (vue){
    //   // //console.log('init', vue)
    //   this.$vm = vue
    //   // EventBus.$emit('cpu', doc) //update cpu widget
    // },
    "options": {
      axisLabelFontSize: 12,
      /**
      * netdata options
      */
      xRangePad: 0,
      yRangePad: 10,
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
        // //console.log('highlightCallback', event, x, points, row, seriesName)
        // //console.log('highlightCallback', window.EventBus)
        window.EventBus.$emit('highlightCallback', [event, x, points, row, seriesName])
      },
      unhighlightCallback: function(event){
        // //console.log('highlightCallback', event, x, points, row, seriesName)
        // //console.log('highlightCallback', window.EventBus)
        window.EventBus.$emit('unhighlightCallback', event)
      },
      drawGrid: true,
      labelsSeparateLines: true,
      "hideOverlayOnMouseOut": false,
      "labelsDiv": "netdata-chart-legend",
      "legend": "always",
      connectSeparatedPoints: true,
      // connectSeparatedPoints: false,
      includeZero: true,
      fillGraph: true,
      // fillAlpha: 1.0,
      // showRangeSelector: true,
      // rangeSelectorHeight: 20,
      // rangeSelectorPlotStrokeColor: 'blue',
      // rangeSelectorPlotFillColor: null,
      // rangeSelectorPlotStrokeColor: null,
      // rangeSelectorPlotFillGradientColor: null,
      // drawPoints: true,
      showRoller: false,
      // valueRange: [0.0, 1.2],

     //  labels: ['Time', '1 min avg', '5 min avg', '15 min avg', 'minute median'],
     //  series: {
     //   '1 min avg': {
     //     // color: 'red',
     //     //strokeWidth: 2,
     //     // plotter: smoothPlotter,
     //   },
     //   '5 min avg': {
     //     // color: 'red',
     //     //strokeWidth: 2,
     //     // plotter: smoothPlotter,
     //   },
     //   '15 min avg': {
     //     // color: 'red',
     //     // strokeWidth: 2,
     //     // includeZero: 0,
     //     // fillGraph: true,
     //     // plotter: smoothPlotter,
     //     // fillAlpha: 1.0,
     //   },
     //   'minute median':{
     //     strokeWidth: 2,
     //   }
     //
     // },

    }
  }
