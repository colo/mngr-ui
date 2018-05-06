// import Dygraph from 'dygraphs'

export default {
  "mem": {
    // component: {
    //   type: 'q-knob',
    //   // 'v-model': "stats[name].data",
    //   // 'v-model': function(param){
    //   //   console.log('v-model', param)
    //   //   // stats['mem'].data
    //   // },
    //   // class: "readonly",
    //   'data': 'v-model',
    //   "options": {
    //     content: '<q-icon class="on-left" :name="stat.icon" />{{stats[name].data}} %',
    //     // value: 10,
    //     min: 0,
    //     max: 100,
    //     color: "primary",
    //     size: "100px",
    //     readonly: true,
    //     // 'v-model': "stats[name].data"
    //     // 'track-color': "yellow-3",
    //     // "line-width": "5px"
    //   }
    // }
    component: 'q-knob',
    icon: 'memory',
    // "class": "chart-with-legend-right dygraph-with-legend-right",
    // "style": "width:100%; height:126px;",
    // "style": "font-size: 1.5rem",
    // "style": "height:120px;",
    "interval": 0,
    "options": {
      min: 0,
      max: 100,
      color: "primary",
      size: "100px",
      // track-color="yellow-3"
      // "line-width": "5px"
    }
  },
  "cpu": {
    // // component: 'q-knob',
    // // icon: 'flash_on',
    // // "class": "chart-with-legend-right dygraph-with-legend-right",
    // // "style": "height:120px;",
    // "interval": 0,
    // "options": {
    //   // min: 0,
    //   // max: 100,
    //   size: 120,
    //   // color: "red",
    //   // 'bar-color': '#000000'
    //   // 'lineCap': 'butt'
    // }
    component: 'q-knob',
    // icon: 'memory',
    // "class": "chart-with-legend-right dygraph-with-legend-right",
    // "style": "width:100%; height:126px;",
    // "style": "font-size: 1.5rem",
    // "style": "height:120px;",
    "interval": 0,
    "options": {
      min: 0,
      max: 100,
      color: "primary",
      size: "100px",
      // "track-color": "yellow-3",
      // "line-width": "5px"
    }
  },
}
