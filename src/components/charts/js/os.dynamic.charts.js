import DefaultDygraphLine from './default.dygraph.line'
import DefaultNetDygraphLine from './default.net.dygraph.line'
import DefaultFrappeCharts from './default.frappeCharts'
import DefaultNetFrappeCharts from './default.net.frappeCharts'
import DefaultAMCharts3Line from './default.amcharts3.line'
import DefaultNetAMCharts3Line from './default.net.amcharts3.line'
import DefaultVueEcharts3Line from './default.vueEcharts3.line'
import DefaultHighchartsVueLine from './default.highchartsVue.line'

export default {
  "networkInterfaces": Object.merge(Object.clone(DefaultNetDygraphLine), {
    match: /networkInterfaces/,
    watch: {
      managed: true,
      transform: function(networkInterfaces, vm, chart){
        let watcher = chart.watch || {}
        // ////console.log('networkInterfaces transform: ', networkInterfaces)

        // //////////////console.log('networkInterfaces', networkInterfaces)

        if(networkInterfaces.getLast() !== null){

          let val = networkInterfaces.getLast().value
          let ifaces = Object.keys(val)
          let properties = Object.keys(val[ifaces[0]])
          let messures = Object.keys(val[ifaces[0]][properties[1]])//properties[0] is "if", we want recived | transmited

          let chart = Object.clone(DefaultNetDygraphLine)

          Array.each(ifaces, function(iface){
            // if(!vm.stats.networkInterfaces+'.'+iface)
            //   vm.$set(vm.stats, 'networkInterfaces.'+iface, {})


            /**
            * turn data property->messure (ex: transmited { bytes: .. }),
            * to: messure->property (ex: bytes {transmited:.., recived: ... })
            **/
            Array.each(messures, function(messure){// "bytes" | "packets"
              if(!vm.stats['os.networkInterfaces.'+iface+'.'+messure]){

                vm.add_chart('os.networkInterfaces.'+iface+'.'+messure, chart)
              }


              let data = []
              Array.each(networkInterfaces, function(stats, index){
                let timestamp =  new Date(stats.timestamp)

                let recived = 0
                let transmited = 0
                let prev_recived = 0
                let prev_transmited = 0

                if(stats.value[iface] !== undefined){
                  let current_recived = stats.value[iface]['recived'][messure]
                  let current_transmited = stats.value[iface]['transmited'][messure]

                  if(index > 0 && networkInterfaces[index - 1].value[iface]){
                    prev_recived = networkInterfaces[index - 1].value[iface]['recived'][messure]
                    prev_transmited = networkInterfaces[index - 1].value[iface]['transmited'][messure]
                  }

                  // let prev_recived = (index > 0) ? networkInterfaces[index - 1].value[iface]['recived'][messure] : 0
                  recived = (prev_recived == 0) ? 0 : 0 - (current_recived - prev_recived)//negative, so it end up ploting under X axis

                  // let prev_transmited = (index > 0) ? networkInterfaces[index - 1].value[iface]['transmited'][messure] : 0
                  transmited = (prev_transmited == 0) ? 0: current_transmited - prev_transmited

                  if(messure == 'bytes'){ //bps -> Kbps
                      transmited = transmited / 128
                      recived = recived / 128
                  }

                  data.push([timestamp, recived, transmited])
                }
                else{
                  data = []
                  ////////////////console.log('stats.value[iface] undefined', iface)
                  /**
                  * should notify error??
                  **/
                }
              })

              // vm.$set(vm.stats['os.networkInterfaces.'+iface+'.'+messure], 'data', data)
              vm.update_chart_stat('os.networkInterfaces.'+iface+'.'+messure, data)

            })

          })




        }

        // return values
      }

    }

  }),
  "mounts_percentage": Object.merge(Object.clone(DefaultDygraphLine),{
    // name: 'mounts_percentage',
    match: /mounts/,
    // label: 'somelabel',
    labeling: function(stat){
      // ////console.log('mounts_percentage', stat)
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
    //     ////console.log('valueRange', chart)
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
  }),
  "blkdev_stats": Object.merge(Object.clone(DefaultDygraphLine),{
    match: /blockdevices\..*/,
    watch: {
      value: 'stats',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // ////console.log('transform: ', values)
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

  }),
  "cpus_times": Object.merge(Object.clone(DefaultDygraphLine),{
    name: 'os.cpus_times',
    match: /cpus/,
    watch: {
      merge: true,
      value: 'times',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // ////console.log('transform: ', values)
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

  }),
  "cpus_simple": Object.merge(Object.clone(DefaultDygraphLine),{
    name: 'os.cpus_simple',
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
        // ////console.log('transform: ', values)
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

          // ////console.log('transform: ', current, prev)

          //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
          let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10

          // ////console.log('transform: ', diff_time)

          transform.value.times.usage = (percentage > 100) ? 100 : percentage


          prev = Object.clone(current)
          transformed.push(transform)
        })
        return transformed
      }
    },


  }),
  "freemem": Object.merge(Object.clone(DefaultDygraphLine),{
    name: 'os.freemem',
    match: /freemem/,
    watch: {
      // merge: true,
      value: undefined,
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // ////console.log('transform: ', values)
        let transformed = []

        Array.each(values, function(val, index){
          let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
          transformed.push(transform)
        })

        // ////console.log('transform: ', transformed)

        return transformed
      }
    },
    init: function (vm, chart, type){
      // ////console.log('chart', chart)
      if(type == 'chart'
        && vm.$store.state.hosts[vm.host]
        && vm.$store.state.hosts[vm.host].os
      ){
        // if(vm.$store.state.hosts[vm.host])
        chart.options.valueRange = [0, Math.round((vm.$store.state.hosts[vm.host].os.totalmem[0].value / 1024) / 1024) ]
        // ////console.log('valueRange', chart.options.valueRange)
      }

    },
    "options": {
      labels: ['Time', 'Mbytes'],
    }
  }),

  "loadavg_minute": Object.merge(Object.clone(DefaultDygraphLine),{
    name: 'os.minute.loadavg',
    match: /minute\.loadavg.*/,
    watch: {
      exclude: /samples/,

    },
    "options": {
      fillGraph: false,
    }
  }),
  "uptime_minute": Object.merge(Object.clone(DefaultDygraphLine),{
    name: 'os.minute.uptime',
    match: /minute\.uptime.*/,
    watch: {
      exclude: /samples/,

    },
    "options": {
      fillGraph: false,
    }
  }),
  "freemem_minute": Object.merge(Object.clone(DefaultDygraphLine),{
    name: 'os.minute.freemem',
    match: /minute\.freemem.*/,
    watch: {
      exclude: /samples/,

      transform: function(values){
        // ////console.log('transform: ', values)
        let transformed = []

        Array.each(values, function(val, index){
          let transform = { timestamp: val.timestamp, value: {} }
          Object.each(val.value, function(stat, name){
            transform.value[name] = Math.floor(stat / 1024 / 1024)
          })
          transformed.push(transform)
        })

        // ////console.log('transform: ', transformed)

        return transformed
      }

    },
    "options": {
      fillGraph: false,
    }
  }),




}
