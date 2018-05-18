export default {
  "mounts_percentage": {
    match: /mounts/,
    watch: {
      // merge: true,
      filters: [{
        type: /ext.*/
      }],
      value: 'percentage',
      /**
      * @trasnform: diff between each value against its prev one
      */
      // transform: function(values){
      //   // console.log('transform: ', values)
      //   let transformed = []
      //
      //   Array.each(values, function(val, index){
      //     let transform = { timestamp: val.timestamp, value: val.value.percentage }
      //     transformed.push(transform)
      //   })
      //
      //   console.log('transform: ', transformed)
      //
      //   return transformed
      // }
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
    "options": {
      valueRange: [0, 100],
      labels: ['Time', 'usage %'],
      series: {
       'usage %': {
         color: 'red',
         //strokeWidth: 2,
         // plotter: smoothPlotter,
       },

      },
    }
  },
  "blkdev_stats": {
    match: /blockdevices\..*/,
    watch: {
      value: 'stats',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // console.log('transform: ', values)
        let transformed = []
        let prev = null
        Array.each(values, function(val, index){
          let transform = {timestamp: val.timestamp, value: { stats: {} } }
          if(index == 0){
            Object.each(val.value.stats, function(stat, key){
                transform.value.stats[key] = 0
            })
          }
          else{
            Object.each(val.value.stats, function(stat, key){
              let value = ((stat - prev.value.stats[key]) > 0) ? stat - prev.value.stats[key] : 0
              transform.value.stats[key] = value
            })
          }
          prev = val
          transformed.push(transform)
        })
        return transformed
      }
    }

  },
  "cpu_times": {
    name: 'cpus_times',
    match: /cpus/,
    watch: {
      merge: true,
      value: 'times',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // console.log('transform: ', values)
        let transformed = []
        let prev = null
        Array.each(values, function(val, index){
          let transform = {timestamp: val.timestamp, value: { times: {} } }
          if(index == 0){
            Object.each(val.value.times, function(stat, key){
                transform.value.times[key] = 0
            })
          }
          else{
            Object.each(val.value.times, function(stat, key){
              if(key == 'idle'){//represent idle on the negative sideof axes
                stat = 0 - stat
                let value = ((stat + prev.value.times[key]) < 0) ? stat + prev.value.times[key] : 0
                transform.value.times[key] = value
              }
              else{
                let value = ((stat - prev.value.times[key]) > 0) ? stat - prev.value.times[key] : 0
                transform.value.times[key] = value
              }
            })
          }
          prev = val
          transformed.push(transform)
        })
        return transformed
      }
    }

  },
  "cpu_simple": {
    name: 'cpus_simple',
    match: /cpus/,
    "options": {
      valueRange: [0, 100],
      labels: ['Time', 'usage %'],
      series: {
       'usage %': {
         color: 'red',
         //strokeWidth: 2,
         // plotter: smoothPlotter,
       },

      },

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

          transform.value.times.usage = (percentage > 100) ? 100 : percentage

          // }
          // else{
          //   Object.each(val.value.times, function(stat, key){
          //     if(key == 'idle'){//represent idle on the negative sideof axes
          //       stat = 0 - stat
          //       let value = ((stat + prev.value.times[key]) < 0) ? stat + prev.value.times[key] : 0
          //       transform.value.times[key] = value
          //     }
          //     else{
          //       let value = ((stat - prev.value.times[key]) > 0) ? stat - prev.value.times[key] : 0
          //       transform.value.times[key] = value
          //     }
          //   })
          // }
          prev = Object.clone(current)
          transformed.push(transform)
        })
        return transformed
      }
    },


  },
  "os_freemem": {
    match: /freemem/,
    watch: {
      // merge: true,
      value: undefined,
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // console.log('transform: ', values)
        let transformed = []

        Array.each(values, function(val, index){
          let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
          transformed.push(transform)
        })

        // console.log('transform: ', transformed)

        return transformed
      }
    },
    init: function (vm, chart, type){
      // console.log('chart', chart)
      if(type == 'chart'
        && vm.$store.state.hosts[vm.host]
        && vm.$store.state.hosts[vm.host].os
      ){
        // if(vm.$store.state.hosts[vm.host])
        chart.options.valueRange = [0, Math.round((vm.$store.state.hosts[vm.host].os.totalmem[0].value / 1024) / 1024) ]
        // console.log('valueRange', chart.options.valueRange)
      }

    },
    "options": {
      labels: ['Time', 'Mbytes'],
    }
  },
}
