import DefaultQKnob from './default.qknob.js'

export default {
  "summary_freemem": Object.merge(Object.clone(DefaultQKnob),{
    icon: 'memory',
    match: /freemem/,
    labeling: 'Free Mem',
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
  "summary_cpu": Object.merge(Object.clone(DefaultQKnob),{
    name: 'cpus_simple',
    icon: 'flash_on',
    match: /cpus/,
    labeling: 'CPU Usage',
    init: function (vm, chart, type){
      console.log('init cpu_simple')
      // if(type == 'chart'
      //   && vm.$store.state.hosts[vm.host]
      //   && vm.$store.state.hosts[vm.host].os
      // ){
      //   // if(vm.$store.state.hosts[vm.host])
      //   chart.watch.totalmem = vm.$store.state.hosts[vm.host].os.totalmem[0].value
      //   // console.log('valueRange', chart.options.valueRange)
      // }

    },
    watch: {
      merge: true,
      value: 'times',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // console.log('transform: ', values)
        let transformed = []
        let prev = {idle: 0, total: 0, timestamp: 0 }
        Array.each(values, function(val, index){
          let transform = {timestamp: val.timestamp, value: { times: { usage: 0} } }
          let current = {idle: 0, total: 0, timestamp: val.timestamp }

          // if(index == 0){
          Object.each(val.value.times, function(stat, key){
            if(key == 'idle')
              current.idle += stat

              current.total += stat
          })


          let diff_time = current.timestamp - prev.timestamp
          let diff_total = current.total - prev.total;
          let diff_idle = current.idle - prev.idle;

          // console.log('transform: ', current, prev)

          //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
          let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10

          // console.log('transform: ', diff_time)

          transform.value.times.usage = (percentage > 100) ? 100 : parseFloat(percentage.toFixed(2))


          prev = Object.clone(current)
          transformed.push(transform)
        })
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
