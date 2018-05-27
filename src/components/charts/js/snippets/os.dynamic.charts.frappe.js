import DefaultDygraphLine from './default.dygraph.line'
import DefaultNetDygraphLine from './default.net.dygraph.line'
import DefaultFrappeCharts from './default.frappeCharts'
import DefaultNetFrappeCharts from './default.net.frappeCharts'

export default {

  "loadavg": Object.merge(Object.clone(DefaultFrappeCharts),{
    // name: 'os.freemem',
    match: /loadavg/,
    // type: 'line',
    watch: {
      merge: true,
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
    "options": {
      // data: {
      //   labels: [
      //   ],
      //
      //   datasets: [
      //     {
      //       name: '1 min avg', chartType: 'bar',
      //       values: [0]
      //     },
      //     {
      //       name: '5 min avg', chartType: 'bar',
      //       values: [0]
      //     },
      //     {
      //       name: '15 min avg', chartType: 'bar',
      //       values: [0]
      //     }
      //   ],
      //
      //   // yMarkers: [{ label: "Marker", value: 70,
      //   //   options: { labelPos: 'left' }}],
      //   // yRegions: [{ label: "Region", start: -10, end: 50,
      //   //   options: { labelPos: 'right' }}]
      // },
    }
  }),
  "uptime": Object.merge(Object.clone(DefaultFrappeCharts),{
    // name: 'os.freemem',
    "style": "width:100%; height:250px;",
    type: 'line',
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
    "options": {
      // data: {
      //   labels: [
      //   ],
      //
      //   datasets: [
      //     {
      //       name: '1 min avg', chartType: 'bar',
      //       values: [0]
      //     },
      //     {
      //       name: '5 min avg', chartType: 'bar',
      //       values: [0]
      //     },
      //     {
      //       name: '15 min avg', chartType: 'bar',
      //       values: [0]
      //     }
      //   ],
      //
      //   // yMarkers: [{ label: "Marker", value: 70,
      //   //   options: { labelPos: 'left' }}],
      //   // yRegions: [{ label: "Region", start: -10, end: 50,
      //   //   options: { labelPos: 'right' }}]
      // },
    }
  }),
  "blkdev_stats": Object.merge(Object.clone(DefaultFrappeCharts),{
    type: 'line',
    "style": "width:100%; height:250px;",
    options: {
      lineOptions: {
        // hideLine: 1,
        regionFill: 0
      },
    },
    match: /blockdevices\..*/,
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
  "networkInterfaces": Object.merge(Object.clone(DefaultNetFrappeCharts), {
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

              // Array.each(properties, function(property, index){
              //   if(property != 'if'){//we want only recived | transmited
              //     chart.options.data.datasets.push({
              //       name: property,
              //       chartType: chart.type,
              //       values: []
              //     })
              //   }
              // })

              if(!vm.stats['os.networkInterfaces.'+iface+'.'+messure]){
                chart = Object.clone(DefaultNetFrappeCharts)
                // chart.options.data.labels = []

                console.log('networkInterfaces chart', chart, 'os.networkInterfaces.'+iface+'.'+messure)

                vm.add_chart('os.networkInterfaces.'+iface+'.'+messure, chart)
              }
              else{
                chart = vm.charts['os.networkInterfaces.'+iface+'.'+messure]
              }



              let data = []
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
                  if(index == 0)
                    chart.options.data.labels = []

                  chart.options.data.labels.push(timestamp.toLocaleTimeString())
                  /**
                  * managed labels update
                  **/
                  // if(messure_index == 0)//only once, as labels are the same
                  //   chart.options.data.labels.push(new Date(timestamp).toLocaleTimeString())

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

                }//skip if

              })


              vm.update_chart_stat('os.networkInterfaces.'+iface+'.'+messure, data)

            })

          })




        }


      }

    }

  }),
}
