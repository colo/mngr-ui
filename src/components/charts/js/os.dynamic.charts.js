import DefaultNetDygraphLine from './default.net.dygraph.line'

export default {
  "networkInterfaces": {
    match: /networkInterfaces/,
    watch: {
      managed: true,
      transform: function(networkInterfaces, vm){
        // console.log('networkInterfaces transform: ', networkInterfaces)

        // //////////console.log('networkInterfaces', networkInterfaces)

        if(networkInterfaces.getLast() !== null){

          let val = networkInterfaces.getLast().value
          let ifaces = Object.keys(val)
          let properties = Object.keys(val[ifaces[0]])
          let messures = Object.keys(val[ifaces[0]][properties[1]])//properties[0] is "if", we want recived | transmited


          Array.each(ifaces, function(iface){
            // if(!vm.stats.networkInterfaces+'.'+iface)
            //   vm.$set(vm.stats, 'networkInterfaces.'+iface, {})


            /**
            * turn data property->messure (ex: transmited { bytes: .. }),
            * to: messure->property (ex: bytes {transmited:.., recived: ... })
            **/
            Array.each(messures, function(messure){// "bytes" | "packets"
              if(!vm.stats['os.networkInterfaces.'+iface+'.'+messure]){
                let chart = Object.clone(DefaultNetDygraphLine)

                vm.$set(vm.charts, 'os.networkInterfaces.'+iface+'.'+messure, chart)

                vm.$set(vm.stats, 'os.networkInterfaces.'+iface+'.'+messure, {
                  lastupdate: 0,
                  data: []
                })
              }


              // vm.stats.networkInterfaces+'.'+iface[messure] = { lastupdate: 0, data: [] }

              // let data = []
              // let stat = []
              // let data = JSON.parse(JSON.stringify(vm.stats.networkInterfaces+'.'+iface[messure].data))
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
                  ////////////console.log('stats.value[iface] undefined', iface)
                  /**
                  * should notify error??
                  **/
                }
              })

              vm.$set(vm.stats['os.networkInterfaces.'+iface+'.'+messure], 'data', data)
              // vm.stats.networkInterfaces+'.'+iface[messure].data = data

            })

          })

          //////////////////////////console.log('vm.stats.networkInterfaces', vm.stats.networkInterfaces)

          Object.each(vm.stats, function(value, name){

            Array.each(ifaces, function(iface){
              let search = new RegExp("networkInterfaces\."+iface+".*", "g")
              if(search.test(name)){
                let messure = name.split('.')[3]

                  // console.log('vm.stats', iface, messure, vm.$refs)

                  if(vm.$refs[vm.host+'_os.networkInterfaces.'+iface+'.'+messure]){


                    // //////////////////console.log('updating NET', vm.freezed, vm.stats.networkInterfaces)

                    if(
                      value.lastupdate < Date.now() - vm.$options.net_stats.interval &&
                      vm.$refs[vm.host+'_os.networkInterfaces.'+iface+'.'+messure][0].chart != null &&
                      ( vm.visibles[vm.host+'_os.networkInterfaces.'+iface+'.'+messure] != false  || vm.freezed == true ) &&
                      vm.highlighted == false &&
                      vm.paused == false
                    ){

                      // vm.networkInterfaces_charts[iface+'-'+messure].updateOptions({
                      //    'file': value.data,
                      //    'dateWindow': vm.networkInterfaces_charts[iface+'-'+messure].xAxisExtremes()
                      //  });

                      vm.$refs[vm.host+'_os.networkInterfaces.'+iface+'.'+messure][0].updateOptions(
                        { 'dateWindow': vm.$refs[vm.host+'_os.networkInterfaces.'+iface+'.'+messure][0].chart.xAxisExtremes() },
                        false
                      )

                      value.lastupdate = Date.now()

                    }
                  }
              }
            })
            //
            // // Object.each(stat, function(value, messure){
            //
            //
            //   // if(document.getElementById(iface+'-'+messure)){
            //   // //////////////////console.log('updating NET', vm.$refs)
            //
            //   if(vm.$refs[vm.host+'_'+iface+'-'+messure]){
            //
            //     // //////////////////console.log('updating NET', vm.freezed, vm.stats.networkInterfaces)
            //
            //     if(
            //       value.lastupdate < Date.now() - vm.$options.net_stats.interval &&
            //       vm.$refs[vm.host+'_'+iface+'-'+messure][0].chart != null &&
            //       ( vm.visibles[vm.host+'_'+iface+'-'+messure] != false  || vm.freezed == true ) &&
            //       vm.highlighted == false &&
            //       vm.paused == false
            //     ){
            //
            //       // vm.networkInterfaces_charts[iface+'-'+messure].updateOptions({
            //       //    'file': value.data,
            //       //    'dateWindow': vm.networkInterfaces_charts[iface+'-'+messure].xAxisExtremes()
            //       //  });
            //
            //
            //       vm.$refs[vm.host+'_'+iface+'-'+messure][0].updateOptions(
            //         { 'dateWindow': vm.$refs[vm.host+'_'+iface+'-'+messure][0].chart.xAxisExtremes() },
            //         false
            //       )
            //
            //       value.lastupdate = Date.now()
            //
            //     }
            //   }
            //
            // // }.bind(vm))


          }.bind(vm))



        }

        // return values
      }
      // transform: function(networkInterfaces, vm){
      //   // console.log('networkInterfaces transform: ', values, vm)
      //
      //   // //////////console.log('networkInterfaces', networkInterfaces)
      //
      //   if(networkInterfaces.getLast() !== null){
      //
      //     let val = networkInterfaces.getLast().value
      //     let ifaces = Object.keys(val)
      //     let properties = Object.keys(val[ifaces[0]])
      //     let messures = Object.keys(val[ifaces[0]][properties[1]])//properties[0] is "if", we want recived | transmited
      //
      //
      //     Array.each(ifaces, function(iface){
      //       if(!vm.networkInterfaces_stats[iface])
      //         vm.$set(vm.networkInterfaces_stats, iface, {})
      //
      //
      //       /**
      //       * turn data property->messure (ex: transmited { bytes: .. }),
      //       * to: messure->property (ex: bytes {transmited:.., recived: ... })
      //       **/
      //       Array.each(messures, function(messure){// "bytes" | "packets"
      //         if(!vm.networkInterfaces_stats[iface][messure]){
      //           let chart = Object.clone(vm.$options.net_stats)
      //
      //           vm.$set(vm.networkInterfaces_stats[iface], messure, {
      //             options: chart,
      //             lastupdate: 0,
      //             data: []
      //           })
      //         }
      //
      //
      //         // vm.networkInterfaces_stats[iface][messure] = { lastupdate: 0, data: [] }
      //
      //         // let data = []
      //         // let stat = []
      //         // let data = JSON.parse(JSON.stringify(vm.networkInterfaces_stats[iface][messure].data))
      //         let data = []
      //         Array.each(networkInterfaces, function(stats, index){
      //           let timestamp =  new Date(stats.timestamp)
      //
      //           let recived = 0
      //           let transmited = 0
      //           let prev_recived = 0
      //           let prev_transmited = 0
      //
      //           if(stats.value[iface] !== undefined){
      //             let current_recived = stats.value[iface]['recived'][messure]
      //             let current_transmited = stats.value[iface]['transmited'][messure]
      //
      //             if(index > 0 && networkInterfaces[index - 1].value[iface]){
      //               prev_recived = networkInterfaces[index - 1].value[iface]['recived'][messure]
      //               prev_transmited = networkInterfaces[index - 1].value[iface]['transmited'][messure]
      //             }
      //
      //             // let prev_recived = (index > 0) ? networkInterfaces[index - 1].value[iface]['recived'][messure] : 0
      //             recived = (prev_recived == 0) ? 0 : 0 - (current_recived - prev_recived)//negative, so it end up ploting under X axis
      //
      //             // let prev_transmited = (index > 0) ? networkInterfaces[index - 1].value[iface]['transmited'][messure] : 0
      //             transmited = (prev_transmited == 0) ? 0: current_transmited - prev_transmited
      //
      //             if(messure == 'bytes'){ //bps -> Kbps
      //                 transmited = transmited / 128
      //                 recived = recived / 128
      //             }
      //
      //             data.push([timestamp, recived, transmited])
      //           }
      //           else{
      //             data = []
      //             ////////////console.log('stats.value[iface] undefined', iface)
      //             /**
      //             * should notify error??
      //             **/
      //           }
      //         })
      //
      //         vm.$set(vm.networkInterfaces_stats[iface][messure], 'data', data)
      //         // vm.networkInterfaces_stats[iface][messure].data = data
      //
      //       })
      //
      //     })
      //
      //     //////////////////////////console.log('vm.networkInterfaces_stats', vm.networkInterfaces_stats)
      //
      //     Object.each(vm.networkInterfaces_stats, function(stat, iface){
      //
      //       Object.each(stat, function(value, messure){
      //
      //
      //         // if(document.getElementById(iface+'-'+messure)){
      //         // //////////////////console.log('updating NET', vm.$refs)
      //
      //         if(vm.$refs[vm.host+'_'+iface+'-'+messure]){
      //
      //           // //////////////////console.log('updating NET', vm.freezed, vm.networkInterfaces_stats)
      //
      //           if(
      //             value.lastupdate < Date.now() - vm.$options.net_stats.interval &&
      //             vm.$refs[vm.host+'_'+iface+'-'+messure][0].chart != null &&
      //             ( vm.visibles[vm.host+'_'+iface+'-'+messure] != false  || vm.freezed == true ) &&
      //             vm.highlighted == false &&
      //             vm.paused == false
      //           ){
      //
      //             // vm.networkInterfaces_charts[iface+'-'+messure].updateOptions({
      //             //    'file': value.data,
      //             //    'dateWindow': vm.networkInterfaces_charts[iface+'-'+messure].xAxisExtremes()
      //             //  });
      //
      //
      //             vm.$refs[vm.host+'_'+iface+'-'+messure][0].updateOptions(
      //               { 'dateWindow': vm.$refs[vm.host+'_'+iface+'-'+messure][0].chart.xAxisExtremes() },
      //               false
      //             )
      //
      //             value.lastupdate = Date.now()
      //
      //           }
      //         }
      //
      //       }.bind(vm))
      //     }.bind(vm))
      //
      //
      //
      //   }
      //
      //   return values
      // }
    }

  },
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
