export default {
  component: 'frappe-charts-wrapper',
  "style": "width:100%; height:200px;",
  // "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
  "interval": 0,
  "options": {
    data: {
      labels: [
        // "12am-3am", "3am-6am", "6am-9am", "9am-12pm",
        // "12pm-3pm", "3pm-6pm", "6pm-9pm", "9pm-12am"
      ],

      datasets: [
        // {
        //   name: "Some Data", chartType: 'bar',
        //   values: [25, 40, 30, 35, 8, 52, 17, -4]
        // },
        // {
        //   name: "Another Set", chartType: 'bar',
        //   values: [25, 50, -10, 15, 18, 32, 27, 14]
        // },
        // {
        //   name: "Yet Another", chartType: 'line',
        //   values: [15, 20, -3, -15, 58, 12, -17, 37]
        // }
      ],

      // yMarkers: [{ label: "Marker", value: 70,
      //   options: { labelPos: 'left' }}],
      // yRegions: [{ label: "Region", start: -10, end: 50,
      //   options: { labelPos: 'right' }}]
    },
    // valuesOverPoints: 1,
    lineOptions: {
      // hideLine: 1,
      regionFill: 1
    },

    // isNavigable: 1,

    // axisOptions: {
    //   yAxisMode: 'span',   // Axis lines, default
    //   xAxisMode: 'tick',   // No axis lines, only short ticks
    //   xIsSeries: 1         // Allow skipping x values for space
    //                         // default: 0
    // },

    // title: "My Awesome Chart",
    type: 'axis-mixed', // or 'bar', 'line', 'pie', 'percentage'
    // height: 400,
    // colors: ['purple', '#ffa3ef', 'light-blue'],
    //
    // tooltipOptions: {
    //   formatTooltipX: d => (d + '').toUpperCase(),
    //   formatTooltipY: d => d + ' pts',
    // }
    // title: "",
    // type: "axis-mixed",
    // data: {
    //   labels: [],
    //   datasets: [],
    // },
    // height: 120,
  },
  // init: function (vue){
  // },
  pre_process: function(chart, name, stat){

    return chart
  },

}
