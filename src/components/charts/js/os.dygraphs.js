export default {
  "uptime": {
    // "class": "chart-with-legend-right dygraph-with-legend-right",
    "style": "width:100%; height:126px;",
    "interval": 0,
    "options": {
      // drawPoints: true,
      showRoller: true,
      // valueRange: [0.0, 1.2],
      labels: ['Time', 'Value'],
      series: {
         // Straight: {
         //   color: 'rgba(0,0,0,0.33)',
         //   strokeWidth: 2,
         //   drawPoints: true,
         //   pointSize: 3
         // },
         Value: {
           plotter: smoothPlotter,
           color: 'red',
           strokeWidth: 2
         }
       },
    }
  },

  "loadavg": {
    // "class": "chart-with-legend-right dygraph-with-legend-right",
    "style": "width:100%; height:126px;",
    "interval": 0,
    "options": {
      // drawPoints: true,
      showRoller: true,
      // valueRange: [0.0, 1.2],
      labels: ['Time', '1 min avg', '5 min avg', '15 min avg'],
      series: {
       '1 min avg': {
         plotter: smoothPlotter,
         // color: 'red',
         strokeWidth: 2
       },
       '5 min avg': {
         plotter: smoothPlotter,
         // color: 'red',
         strokeWidth: 2
       },
       '15 min avg': {
         plotter: smoothPlotter,
         // color: 'red',
         strokeWidth: 2
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
