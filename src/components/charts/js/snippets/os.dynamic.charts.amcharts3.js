import DefaultDygraphLine from './default.dygraph.line'
import DefaultNetDygraphLine from './default.net.dygraph.line'
import DefaultFrappeCharts from './default.frappeCharts'
import DefaultNetFrappeCharts from './default.net.frappeCharts'
import DefaultAMCharts3Line from './default.amcharts3.line'
import DefaultNetAMCharts3Line from './default.net.amcharts3.line'

export default {
  "loadavg_minute": Object.merge(Object.clone(DefaultAMCharts3Line),{
    name: 'os.minute.loadavg',
    match: /minute\.loadavg.*/,
    watch: {
      skip: 0,
      exclude: /samples/,

    },
    // "options": {
    //   fillGraph: false,
    // }
  }),
  "uptime_minute": Object.merge(Object.clone(DefaultAMCharts3Line),{
    name: 'os.minute.uptime',
    match: /minute\.uptime.*/,
    watch: {
      skip: 0,
      exclude: /samples/,

    },
    // "options": {
    //   fillGraph: false,
    // }
  }),
  "freemem_minute": Object.merge(Object.clone(DefaultAMCharts3Line),{
    name: 'os.minute.freemem',
    match: /minute\.freemem.*/,
    watch: {
      skip: 0,
      exclude: /samples/,

      // transform: function(values){
      //   // console.log('transform: ', values)
      //   let transformed = []
      //
      //   Array.each(values, function(val, index){
      //     let transform = { timestamp: val.timestamp, value: {} }
      //     Object.each(val.value, function(stat, name){
      //       transform.value[name] = Math.floor(stat / 1024 / 1024)
      //     })
      //     transformed.push(transform)
      //   })
      //
      //   // console.log('transform: ', transformed)
      //
      //   return transformed
      // }

    },

  }),
  "networkInterfaces": Object.merge(Object.clone(DefaultNetAMCharts3Line), {
    match: /networkInterfaces/,
    watch: {
      managed: true,
      transform: function(networkInterfaces, vm, chart){
        let watcher = chart.watch || {}


        // console.log('networkInterfaces transform: ', networkInterfaces)

        // //////////console.log('networkInterfaces', networkInterfaces)

        if(networkInterfaces.getLast() !== null){

          let val = networkInterfaces.getLast().value
          let ifaces = Object.keys(val)
          let properties = Object.keys(val[ifaces[0]])
          let messures = Object.keys(val[ifaces[0]][properties[1]])//properties[0] is "if", we want only recived | transmited

          // chart = chart.pre_process(chart, 'networkInterfaces', networkInterfaces)

          Array.each(ifaces, function(iface){
            // if(!vm.stats.networkInterfaces+'.'+iface)
            //   vm.$set(vm.stats, 'networkInterfaces.'+iface, {})


            /**
            * turn data property->messure (ex: transmited { bytes: .. }),
            * to: messure->property (ex: bytes {transmited:.., recived: ... })
            **/
            Array.each(messures, function(messure, messure_index){// "bytes" | "packets"

              if(!vm.stats['os.networkInterfaces.'+iface+'.'+messure]){
                chart = Object.clone(DefaultNetAMCharts3Line)
                // chart.options.data.labels = []

                // console.log('networkInterfaces chart', chart, 'os.networkInterfaces.'+iface+'.'+messure)

                vm.add_chart('os.networkInterfaces.'+iface+'.'+messure, chart)
              }
              else{
                chart = vm.charts['os.networkInterfaces.'+iface+'.'+messure]
              }



              let data = []
              let counter = 0
              Array.each(networkInterfaces, function(stats, index){
                if(
                  !watcher.skip
                  || (
                    index == 0
                    || (index % watcher.skip == 0)
                    || index == networkInterfaces.length - 1
                  )
                ){

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

                    recived = (prev_recived == 0) ? 0 : 0 - (current_recived - prev_recived)//negative, so it end up ploting under X axis

                    transmited = (prev_transmited == 0) ? 0: current_transmited - prev_transmited

                    if(messure == 'bytes'){ //bps -> Kbps
                        transmited = transmited / 128
                        recived = recived / 128
                    }

                    /**
                    * managed updated
                    **/
                    // Array.each(chart.options.data.datasets, function(dataset){
                    //   if(dataset.name == 'transmited'){
                    //     dataset.values.push(parseFloat( (transmited.toFixed ) ? transmited.toFixed(2) : transmited ))
                    //   }
                    //   else{
                    //     dataset.values.push(parseFloat( (recived.toFixed ) ? recived.toFixed(2) : recived ))
                    //   }
                    // })

                    data.push([timestamp, recived, transmited])
                  }
                  else{
                    // data = []
                    ////////////console.log('stats.value[iface] undefined', iface)
                    /**
                    * should notify error??
                    **/
                  }

                  counter++
                }//skip if

              })


              vm.update_chart_stat('os.networkInterfaces.'+iface+'.'+messure, data)

            })

          })




        }


      }

    }

  }),
  "loadavg": Object.merge(Object.clone(DefaultAMCharts3Line),{
    match: /loadavg/,
    watch: {
      merge: true,
      value: undefined,
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}
        // console.log('transform: ', chart.options.dataProvider)
        let transformed = []

        // // const skip = 30
        Array.each(values, function(val, index){
          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){

            transformed.push(val)

          }

        })

        // console.log('transform: ', transformed)

        return transformed
      }
    },

  }),

  "uptime": Object.merge(Object.clone(DefaultAMCharts3Line),{
    match: /uptime/,
    // type: 'line',
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

        // const skip = 30
        Array.each(values, function(val, index){
          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){
            // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
            // transformed.push(transform)
            transformed.push(val)
          }

        })

        // console.log('transform: ', transformed)

        return transformed
      }
    },

  }),
  "blkdev_stats": Object.merge(Object.clone(DefaultAMCharts3Line),{
    match: /blockdevices\..*/,
    labeling: function(chart, name, stat){
      // console.log('blkdev_stats', chart, name, stat)

      return 'os.'+name
    },
    watch: {
      value: 'stats',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}
        // console.log('blkdev_frappe_stats transform: ', values)
        let transformed = []
        let prev = null
        Array.each(values, function(val, index){
          if(
            !watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){
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
          }
        })
        return transformed
      }
    }

  }),
  "cpus_times": Object.merge(Object.clone(DefaultAMCharts3Line),{
    name: 'os.cpus_times',
    match: /cpus/,
    watch: {
      merge: true,
      value: 'times',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}

        let transformed = []
        let prev = null
        Array.each(values, function(val, index){
          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){

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
          }
        })
        return transformed

      }
    }

  }),

}
