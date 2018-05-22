import DefaultQKnob from './default.qknob.js'

export default {
  "os_freemem": Object.merge(Object.clone(DefaultQKnob),{
    icon: 'memory',
    match: /freemem/,
    init: function (vm, chart, type){
      if(type == 'chart'
        && vm.$store.state.hosts[vm.host]
        && vm.$store.state.hosts[vm.host].os
      ){
        // if(vm.$store.state.hosts[vm.host])
        chart.watch.totalmem = vm.$store.state.hosts[vm.host].os.totalmem[0].value
        // console.log('valueRange', chart.options.valueRange)
      }

    },
    watch: {
      // merge: true,
      value: undefined,
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, watcher){
        // console.log('transform: ', values)
        let transformed = []

        Array.each(values, function(val, index){
          // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
          let transform = { timestamp: val.timestamp, value: Math.round((val.value * 100) / watcher.totalmem) }
          transformed.push(transform)
        })

        // console.log('transform: ', transformed)

        return transformed
      }
    },
  }),


  // "cpu": {
  //   // // component: 'q-knob',
  //   // // icon: 'flash_on',
  //   // // "class": "chart-with-legend-right dygraph-with-legend-right",
  //   // // "style": "height:120px;",
  //   // "interval": 0,
  //   // "options": {
  //   //   // min: 0,
  //   //   // max: 100,
  //   //   size: 120,
  //   //   // color: "red",
  //   //   // 'bar-color': '#000000'
  //   //   // 'lineCap': 'butt'
  //   // }
  //   component: 'q-knob',
  //   // icon: 'memory',
  //   // "class": "chart-with-legend-right dygraph-with-legend-right",
  //   // "style": "width:100%; height:126px;",
  //   // "style": "font-size: 1.5rem",
  //   // "style": "height:120px;",
  //   "interval": 0,
  //   "options": {
  //     min: 0,
  //     max: 100,
  //     color: "primary",
  //     size: "100px",
  //     // "track-color": "yellow-3",
  //     // "line-width": "5px"
  //   }
  // },
}
