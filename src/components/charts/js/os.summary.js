import DefaultQKnob from './default.qknob.js'
import DefaultVueEasyPieChart from './default.vueEasyPieChart.js'
import DefaultVueCanvasGauge from './default.vueCanvasGauge.js'
import DefaultVueTrend from './default.vueTrend.js'
import DefaultVueBars from './default.vueBars.js'
import DefaultVueOdometer from './default.vueOdometer.js'
import DefaultHighchartsVueGauge from './default.highchartsVue.gauge.js'

export default {
  "uptime_seconds": Object.merge(Object.clone(DefaultVueOdometer),{
    name: 'uptime_seconds',
    match: /uptime/,

    // watch: {
    //   merge: true,//merging so we get only one chart, not 3 as there are 3 load values
    //   value: 0,//watch only the load[0]
    // },
  }),
  // "uptime_days": Object.merge(Object.clone(DefaultVueOdometer),{
  //   name: 'uptime_days',
  //   match: /uptime/,
  //
  //   watch: {
  //     // merge: true,
  //     // value: undefined,
  //     /**
  //     * @trasnform: diff between each value against its prev one
  //     */
  //     transform: function(values, vm, chart){
  //        let watcher = chart.watch || {}
  //       // console.log('transform: ', values)
  //       let transformed = []
  //
  //       Array.each(values, function(val, index){
  //         // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
  //         let transform = { timestamp: val.timestamp, value: Math.round( val.value  / 60 / 60 / 24 ) }
  //         transformed.push(transform)
  //       })
  //
  //       // // console.log('transform: ', transformed)
  //
  //       return transformed
  //     }
  //   },
  // }),
  "loadavg": Object.merge(Object.clone(DefaultVueTrend),{
    match: /loadavg/,
    "options": {
      min: undefined,
      max: undefined,
    },
    watch: {
      merge: true,//merging so we get only one chart, not 3 as there are 3 load values
      value: 0,//watch only the load[0]
    },
  }),
  // "freemem": Object.merge(Object.clone(DefaultQKnob),{
  // // "freemem": Object.merge(Object.clone(DefaultVueEasyPieChart),{
  // // "freemem": Object.merge(Object.clone(DefaultVueCanvasGauge),{
  // // "freemem": Object.merge(Object.clone(DefaultVueTrend),{
  //   // name : 'summary.freemem',
  //   icon: 'memory',
  //   match: /freemem/,
  //   labeling: 'Free Mem',
  //   init: function (vm, chart, type){
  //     if(type == 'chart'
  //       && vm.$store.state.hosts[vm.host]
  //       && vm.$store.state.hosts[vm.host].os
  //     ){
  //       // if(vm.$store.state.hosts[vm.host])
  //       chart.watch.totalmem = vm.$store.state.hosts[vm.host].os.totalmem[0].value
  //       // console.log('valueRange', chart.options.valueRange)
  //     }
  //
  //   },
  //   watch: {
  //     // merge: true,
  //     value: undefined,
  //     /**
  //     * @trasnform: diff between each value against its prev one
  //     */
  //     transform: function(values, vm, chart){
  //       let watcher = chart.watch || {}
  //       // console.log('transform: ', values)
  //       let transformed = []
  //
  //       Array.each(values, function(val, index){
  //         // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
  //         let transform = { timestamp: val.timestamp, value: 100 - (Math.round((val.value * 100) / watcher.totalmem)) }
  //         transformed.push(transform)
  //       })
  //
  //       // console.log('freemem transform: ', transformed)
  //
  //       return transformed
  //     }
  //   },
  // }),
  // "cpus": Object.merge(Object.clone(DefaultQKnob),{
  // "cpus": Object.merge(Object.clone(DefaultVueEasyPieChart),{
  "cpus": Object.merge(Object.clone(DefaultVueCanvasGauge),{
    // name: 'summary.cpus',
    options: {
      // width: 300,
      height: 200,
      minValue: 0,
      startAngle: 90,
      ticksAngle: 180,
      valueBox: false,
      maxValue: 100,
      majorTicks: [ "0", "20", "40", "60", "80", "100"],
      minorTicks: 2,
      strokeTicks: true,
      highlights: [
        {
          "from": 80,
          "to": 100,
          "color": "rgba(200, 50, 50, .75)"
        }
      ],
      colorPlate: "#fff",
      borderShadowWidth: 0,
      borders: false,
      needleType: "arrow",
      needleWidth: 2,
      needleCircleSize: 7,
      needleCircleOuter: true,
      needleCircleInner: false,
      animationDuration: 1500,
      animationRule: "linear"
    },
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

          transform.value.times.usage = (percentage > 100) ? 100 : parseFloat(percentage.toFixed(1))


          prev = Object.clone(current)
          transformed.push(transform)
        })
        return transformed
      }
    },
  }),
  "mounts_percentage": Object.merge(Object.clone(DefaultVueEasyPieChart),{
  // "mounts_percentage": Object.merge(Object.clone(DefaultVueCanvasGauge),{
    // name: 'mounts_percentage',
    match: /mounts/,
    // label: 'somelabel',
    labeling: function(stat){
      // console.log('mounts_percentage', stat)
      // let name = ''
      // if(stat[0].value.mount_point == '/'){
      //   name = '_root'
      // }
      // else{
      //   name = stat[0].value.mount_point.replace('/', '_')
      // }

      return 'os.mounts['+stat[0].value.mount_point+']'
    },
    watch: {
      // merge: true,
      filters: [{
        type: /ext.*/
      }],
      value: 'percentage',

    },
    // init: function (vm, chart, type){
    //   if(type == 'chart'
    //     && vm.$store.state.hosts[vm.host]
    //     && vm.$store.state.hosts[vm.host].os
    //     && vm.$store.state.hosts[vm.host].os.mounts
    //   ){
    //     if(vm.$store.state.hosts[vm.host])
    //     chart.options.valueRange = [0, Math.round((vm.$store.state.hosts[vm.host].os.totalmem[0].value / 1024) / 1024) ]
    //     console.log('valueRange', chart)
    //   }
    //
    // },

  }),
  "freemem": Object.merge(Object.clone(DefaultHighchartsVueGauge),{
  // "freemem": Object.merge(Object.clone(DefaultVueEasyPieChart),{
  // "freemem": Object.merge(Object.clone(DefaultVueCanvasGauge),{
  // "freemem": Object.merge(Object.clone(DefaultVueTrend),{
    // name : 'summary.freemem',
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
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}
        // console.log('transform: ', values)
        let transformed = []

        // Array.each(values, function(val, index){
          // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
          let transform = {
            timestamp: values.getLast().timestamp,
            value: 100 - (Math.round((values.getLast().value * 100) / watcher.totalmem))
          }
          transformed.push(transform)
        // })

        console.log('freemem transform: ', transformed)

        return transformed
      }
    },
  }),
}
