<template>

    <div>
      <template v-for="(stat, iface) in networkInterfaces_stats">

        <q-collapsible
          :opened="true"
          icon="info"
          :label="iface +' : '+messure"
          :separator="true"
          v-for="(option, messure) in stat"
          v-if="messure == 'bytes' || messure == 'packets'"
          :key="iface+'-'+messure"
          :ref="iface+'-'+messure"
          :name="iface+'-'+messure"
        >

          <at-card :bordered="false">
            <div
              :id="iface+'-'+messure"
              :style="$options.net_stats.style"
            ></div>
          </at-card>
      </q-collapsible>
     </template>

      <!-- OS stats -->

     <q-collapsible
      :opened="true"
      icon="info"
      :label="name"
      :separator="true"
      v-for="(stat, name) in $options.stats"
      :key="name"
      :ref="name"
      :name="name"
     >

       <at-card :bordered="false">
         <div :id="name" :style="stat.style"></div>
       </at-card>
     </q-collapsible>

   </div>


</template>

<script>

import Dygraph from 'dygraphs'
import 'dygraphs/src/extras/smooth-plotter'
import 'dygraphs/dist/dygraph.css'

import stats from './js/os.dygraphs'
import net_stats from './js/net.dygraphs'

export default {
  // name: 'App',
  name: 'osdygraphs',

  // uptime_chart: null,
  components: {
    // IEcharts
    // VueCharts
  },
  props: {
    timestamps: {
      type: [Array],
      default: () => ([])
    },
    // mem: {
    //   type: [Object],
    //   default: () => ({})
    // },
    // cpu: {
    //   type: [Object],
    //    default: () => ({})
    // },
    uptime: {
      type: [Array],
      default: () => ([])
    },
    loadavg: {
      type: [Array],
      default: () => ([])
    },
    networkInterfaces: {
      type: [Array],
      default: () => ([])
    }
  },

  stats: stats,
  net_stats: net_stats,

  data () {
    return {
      expanded: [],
      charts : {},
      stats: {},
      networkInterfaces_stats: {},
      networkInterfaces_charts: {},
      // uptime_stats: []
    }
  },
  updated () {
    this.$q.loading.hide()
  },
  created () {

    // Object.each(this.$options.stats, function(stat, name){
    //   if(Array.isArray(stat)){
    //     this.$set(this.stats, name, [])
    //     Array.each(stat, function(item){
    //       this.stats[name].push({lastupdate: 0, data: [], labels: [] })
    //     }.bind(this))
    //
    //
    //   }
    //   else{
    //     this.$set(this.stats, name, {lastupdate: 0, data: [], labels: [] })
    //   }
    //
    //
    //
    // }.bind(this))
    //
    // this.stats.uptime.labels = this.formated_timestamps
  },
  mounted () {
    Object.each(this.$options.stats, function(stat, name){

      let data = [[]]
      if(stat.options.labels)
        Array.each(stat.options.labels, function(label, index){
          if(index == 0){
            data[0].push(Date.now())
          }
          else{
            data[0].push(0)
          }


        })

      this.$set(this.stats, name, {lastupdate: 0, 'data': data })
      // stat.option.dataProvider = this.stats[name].data
      this.$set(this.charts, name, new Dygraph(
          document.getElementById(name),  // containing div
          this.stats[name].data,
          stat.options
        ))

      if(stat.init)
        stat.init(this.charts[name], this.stats[name])

      this.expanded.push(name)
    }.bind(this))

  },

  watch: {
    // 'mem.percentage': function(val){
    //   if(this.$refs['mem']){
    //     // if(this.stats.mem.lastupdate < Date.now() - this.$options.stats.mem.interval){
    //
    //       val = val.toFixed(2)
    //       this.stats.mem.data = [['Used', val], ['Free', 100 - val]]
    //
    //     //
    //     //   this.charts.mem.arrows[0].setValue(val);
    //     //   this.charts.mem.axes[0].setTopText(val + " %");
    //     //
    //     //   // adjust darker band to new value
    //     //   this.charts.mem.axes[0].bands[1].setEndValue(val);
    //     //
    //     //   this.stats.mem.lastupdate = Date.now()
    //     // }
    //   }
    // },
    // 'cpu.percentage': function(val){
    //   if(this.$refs['cpu']){
    //     // if(this.stats.cpu.lastupdate < Date.now() - this.$options.stats.cpu.interval){
    //     //
    //
    //       val = val.toFixed(2)
    //       this.stats.cpu.data = [['Used', val], ['Free', 100 - val]]
    //
    //     //   this.charts.cpu.arrows[0].setValue(val);
    //     //   this.charts.cpu.axes[0].setTopText(val + " %");
    //     //
    //     //   // adjust darker band to new value
    //     //   this.charts.cpu.axes[0].bands[1].setEndValue(val);
    //     //
    //     //   this.stats.cpu.lastupdate = Date.now()
    //     // }
    //   }
    //
		// },
    uptime: function(val){
       //console.log('uptime', val)
      // //console.log(this.$refs['uptime'])

      if(this.$refs['uptime']){

        let data = []
        Array.each(val, function(uptime){
          data.push([new Date(uptime.timestamp), uptime.value])
        })

        this.$set(this.stats.uptime, 'data', data)

        // let data = this.stats.uptime.data

        // data.push([new Date(this.uptime.timestamp), val])


        // let length = data.length

        // this.stats.uptime.data.splice(
        //   -this.timestamps.length -1,
        //   length - this.timestamps.length
        // )


        //
        if(this.stats.uptime.lastupdate < Date.now() - this.$options.stats.uptime.interval){
          this.charts.uptime.updateOptions( { 'file': this.stats.uptime.data } );

          this.stats.uptime.lastupdate = Date.now()
          // this.$forceUpdate()
        }
      }

    },
    // 'uptime.value': function(val){
    //    //console.log('uptime.value', val)
    //   // //console.log(this.$refs['uptime'])
    //
    //   if(this.$refs['uptime']){
    //
    //     let data = this.stats.uptime.data
    //     // let labels = this.stats.uptime.labels
    //     // this.stats.uptime.labels = this.formated_timestamps
    //
    //     data.push([new Date(this.uptime.timestamp), val])
    //
    //     // data.push(val)
    //     // labels.push(this.uptime.timestamp)
    //
    //     let length = data.length
    //
    //     this.stats.uptime.data.splice(
    //       -this.timestamps.length -1,
    //       length - this.timestamps.length
    //     )
    //
    //     // this.stats.uptime.labels.splice(
    //     //   -this.timestamps.length -1,
    //     //   length - this.timestamps.length
    //     // )
    //
    //     //
    //     if(this.stats.uptime.lastupdate < Date.now() - this.$options.stats.uptime.interval){
    //       this.charts.uptime.updateOptions( { 'file': data } );
    //
    //       this.stats.uptime.lastupdate = Date.now()
    //       // this.$forceUpdate()
    //     }
    //   }
    //
    // },
    loadavg: function(val){
      //console.log('loadavg', val)

      if(this.$refs['loadavg']){

        let data = []

        Array.each(val, function(loadavg){
          let avg = []
          avg.push(new Date(loadavg.timestamp))

          Array.each(loadavg.value, function(value){
            avg.push(value)
          })

          data.push(avg)
        })

        // //console.log(data)
        this.$set(this.stats.loadavg, 'data', data)


        if(this.stats.loadavg.lastupdate < Date.now() - this.$options.stats.loadavg.interval){
          this.charts.loadavg.updateOptions( { 'file': this.stats.loadavg.data } );
          this.stats.loadavg.lastupdate = Date.now()
        }

      }

    },
    // 'loadavg.value': function(val){
    //   if(this.$refs['loadavg']){
    //     let data = this.stats.loadavg.data
    //
    //     // let values = { date: new Date(this.loadavg.timestamp) }
    //
    //     // Array.each(this.charts.loadavg.graphs, function(graph, index){
    //     //   let valueField = graph.valueField
    //     //   values[valueField] = this.loadavg.value[index]
    //     // }.bind(this))
    //
    //
    //     let loadavg = [new Date(this.loadavg.timestamp)]
    //
    //     Array.each(val, function(value, index){
    //       loadavg.push(value)
    //
    //     }.bind(this))
    //
    //     data.push(loadavg)
    //
    //     let length = data.length
    //     data.splice(
    //       -this.timestamps.length -1,
    //       length - this.timestamps.length
    //     )
    //
    //     // //console.log(this.stats.loadavg)
    //
    //     // this.stats.loadavg.data.splice(
    //     //   -this.timestamps.length -1,
    //     //   length - this.timestamps.length
    //     // )
    //
    //     if(this.stats.loadavg.lastupdate < Date.now() - this.$options.stats.loadavg.interval){
    //       this.charts.loadavg.updateOptions( { 'file': data } );
    //       this.stats.loadavg.lastupdate = Date.now()
    //     }
    //
    //   }
    //
    // },
    networkInterfaces: function(networkInterfaces){
      //console.log('networkInterfaces', networkInterfaces)

      let self = this

      let val = networkInterfaces.getLast().value
      let ifaces = Object.keys(val)
      let properties = Object.keys(val[ifaces[0]])
      let messures = Object.keys(val[ifaces[0]][properties[1]])//properties[0] is "if", we want recived | transmited


      Array.each(ifaces, function(iface){
        if(!self.networkInterfaces_stats[iface])
          self.$set(self.networkInterfaces_stats, iface, {})

        /**
        * turn data property->messure (ex: transmited { bytes: .. }),
        * to: messure->property (ex: bytes {transmited:.., recived: ... })
        **/
        Array.each(messures, function(messure){// "bytes" | "packets"
          if(!self.networkInterfaces_stats[iface][messure])
            self.networkInterfaces_stats[iface][messure] = { lastupdate: 0, data: [] }

            // let data = []
            // let stat = []
            // let data = JSON.parse(JSON.stringify(self.networkInterfaces_stats[iface][messure].data))
            let data = []
            Array.each(networkInterfaces, function(stats, index){
              let timestamp =  new Date(stats.timestamp)

              let recived = 0
              let transmited = 0

              let current_recived = stats.value[iface]['recived'][messure]
              let prev_recived = (index > 0) ? networkInterfaces[index - 1].value[iface]['recived'][messure] : 0
              recived = (prev_recived == 0) ? 0 : 0 - (current_recived - prev_recived)//negative, so it end up ploting under X axis

              let current_transmited = stats.value[iface]['transmited'][messure]
              let prev_transmited = (index > 0) ? networkInterfaces[index - 1].value[iface]['transmited'][messure] : 0
              transmited = (prev_transmited == 0) ? 0: current_transmited - prev_transmited

              if(messure == 'bytes'){ //bps -> Kbps
                  transmited = transmited / 128
                  recived = recived / 128
              }

              data.push([timestamp, recived, transmited])
            })

            self.$set(self.networkInterfaces_stats[iface][messure], 'data', data)

            // Array.each(properties, function(property){// "recived" | "transmited"
            //   if(property == 'recived' || property == 'transmited'){
            //     // let prev = 0
            //
            //
            //     Array.each(networkInterfaces, function(stats, index){
            //       // stat[0] = stats.timestamp
            //       // //console.log('stats.value', stats.value[iface][property][messure])
            //
            //       let current = stats.value[iface][property][messure]
            //       let prev = (index > 0) ? networkInterfaces[index - 1].value[iface][property][messure] : 0
            //       let value = current - prev + 0
            //
            //       // if(messure == 'bytes')
            //       //   value = value / 1024
            //
            //       if(property == 'recived')//negative, so it end up ploting under X axis
            //         value = 0 - value
            //
            //       // stat.push(value)
            //       let data = JSON.parse(JSON.stringify(self.networkInterfaces_stats[iface][messure].data))
            //
            //       let last = data.getLast()
            //       if(last == null || last.length == 3){//no data yet || has timestamp,OUT,IN values already
            //         let timestamp = JSON.parse(JSON.stringify(stats.timestamp + 0))
            //         last = [timestamp, value]
            //         data.push(last)
            //       }
            //       else if(last.length < 3){//has timestamp
            //         last.push(value)
            //         // data.push(last)
            //       }
            //
            //       // prev = current
            //       // data.push(stat)
            //
            //       // self.$set(self.networkInterfaces_stats[iface][messure], 'data', JSON.parse(JSON.stringify(data)))
            //
            //     }.bind(this))
            //
            //     // //console.log(data)
            //
            //     // self.networkInterfaces_stats[iface][messure].data = data
            //     // self.$set(self.networkInterfaces_stats[iface][messure], 'data', JSON.parse(JSON.stringify(data)))
            //
            //     // let current = val[iface][property][messure]
            //     // let prev = self.networkInterfaces.prev.value[iface][property][messure]
            //     // let data = current - prev + 0
            //     //
            //     // if(messure == 'bytes')
            //     //   data = data / 1024
            //     // // let serie = {}
            //     //
            //     // if(property == 'recived')//negative, so it end up ploting under X axis
            //     //   data = 0 - data
            //     //
            //     // let copy = JSON.parse(JSON.stringify(self.networkInterfaces_stats[iface][messure].data))
            //     //
            //     // let value = copy.getLast()
            //     // if(value == null || value.length == 3){//no data yet || has timestamp,OUT,IN values already
            //     //   let timestamp = JSON.parse(JSON.stringify(self.networkInterfaces.timestamp + 0))
            //     //   value = [timestamp, data]
            //     //   copy.push(value)
            //     // }
            //     // else if(value.length < 3){//has timestamp
            //     //   value.push(data)
            //     //   copy.push(value)
            //     // }
            //     //
            //     // let length = copy.length
            //     //
            //     // copy.splice(
            //     //   -self.timestamps.length -1,
            //     //   length - self.timestamps.length
            //     // )
            //     //
            //     // self.networkInterfaces_stats[iface][messure].data = JSON.parse(JSON.stringify(copy))
            //
            //   }
            // })


        })

      })

      //console.log('self.networkInterfaces_stats', self.networkInterfaces_stats)


      Object.each(this.networkInterfaces_stats, function(stat, iface){

        Object.each(stat, function(value, messure){


          if(document.getElementById(iface+'-'+messure)){

            if(!this.networkInterfaces_charts[iface+'-'+messure]){
              //console.log('---validatin---', iface+'-'+messure)


              let option = JSON.parse(JSON.stringify(this.$options.net_stats.options))
              // Array.each(option.valueAxes, function(axis, index){
              //   axis.id = iface+'-'+messure+'-'+axis.id
              //   option.graphs[index].valueAxis = axis.id
              // })

              this.$set(this.networkInterfaces_charts,
                iface+'-'+messure,
                new Dygraph(
                    document.getElementById(iface+'-'+messure),  // containing div
                    this.networkInterfaces_stats[iface][messure].data,
                    option
                  )
              )


              if(this.$options.net_stats.init)
                this.$options.net_stats.init(this.networkInterfaces_charts[iface+'-'+messure], this.networkInterfaces_stats[iface][messure])

              // this.expanded.push(iface+'-'+messure)
            }
            // else{

            if(value.lastupdate < Date.now() - this.$options.net_stats.interval){

              this.networkInterfaces_charts[iface+'-'+messure].updateOptions( { 'file': value.data } );
              value.lastupdate = Date.now()

            }
          }

        }.bind(this))
      }.bind(this))


    },
  },
  //   'networkInterfaces.value': function(val){
  //     let self = this
  //
  //     let ifaces = Object.keys(val)
  //     let properties = Object.keys(val[ifaces[0]])
  //     let messures = Object.keys(val[ifaces[0]][properties[1]])//properties[0] is "if", we want recived | transmited
  //
  //
  //     Array.each(ifaces, function(iface){
  //       if(!self.networkInterfaces_stats[iface])
  //         self.$set(self.networkInterfaces_stats, iface, {})
  //
  //       /**
  //       * turn data property->messure (ex: transmited { bytes: .. }),
  //       * to: messure->property (ex: bytes {transmited:.., recived: ... })
  //       **/
  //       Array.each(messures, function(messure){// "bytes" | "packets"
  //         if(!self.networkInterfaces_stats[iface][messure])
  //           self.networkInterfaces_stats[iface][messure] = { lastupdate: 0, data: [] }
  //
  //           Array.each(properties, function(property){// "recived" | "transmited"
  //             if(property == 'recived' || property == 'transmited'){
  //
  //               let current = val[iface][property][messure]
  //               let prev = self.networkInterfaces.prev.value[iface][property][messure]
  //               let data = current - prev + 0
  //
  //               if(messure == 'bytes')
  //                 data = data / 1024
  //               // let serie = {}
  //
  //               if(property == 'recived')//negative, so it end up ploting under X axis
  //                 data = 0 - data
  //
  //               // let copy = JSON.parse(JSON.stringify(self.networkInterfaces_stats[iface][messure]))
  //               let copy = JSON.parse(JSON.stringify(self.networkInterfaces_stats[iface][messure].data))
  //
  //               let value = copy.getLast()
  //               if(value == null || value.length == 3){//no data yet || has timestamp,OUT,IN values already
  //                 let timestamp = JSON.parse(JSON.stringify(self.networkInterfaces.timestamp + 0))
  //                 value = [timestamp, data]
  //                 copy.push(value)
  //               }
  //               else if(value.length < 3){//has timestamp
  //                 value.push(data)
  //                 copy.push(value)
  //               }
  //               // value[property] = data
  //
  //
  //
  //
  //
  //               let length = copy.length
  //
  //               copy.splice(
  //                 -self.timestamps.length -1,
  //                 length - self.timestamps.length
  //               )
  //
  //               self.networkInterfaces_stats[iface][messure].data = JSON.parse(JSON.stringify(copy))
  //
  //             }
  //           })
  //
  //
  //       })
  //
  //     })
  //
  //     //console.log(self.networkInterfaces_stats)
  //
  //
  //       Object.each(this.networkInterfaces_stats, function(stat, iface){
  //         Object.each(stat, function(value, messure){
  //
  //
  //           if(document.getElementById(iface+'-'+messure)){
  //
  //             if(!this.networkInterfaces_charts[iface+'-'+messure]){
  //               ////console.log('---validatin---', iface+'-'+messure)
  //
  //               let option = JSON.parse(JSON.stringify(this.$options.net_stats.options))
  //               // Array.each(option.valueAxes, function(axis, index){
  //               //   axis.id = iface+'-'+messure+'-'+axis.id
  //               //   option.graphs[index].valueAxis = axis.id
  //               // })
  //
  //               this.$set(this.networkInterfaces_charts,
  //                 iface+'-'+messure,
  //                 new Dygraph(
  //                     document.getElementById(iface+'-'+messure),  // containing div
  //                     this.networkInterfaces_stats[iface][messure].data,
  //                     option
  //                   )
  //               )
  //
  //
  //               if(this.$options.net_stats.init)
  //                 this.$options.net_stats.init(this.networkInterfaces_charts[iface+'-'+messure], this.networkInterfaces_stats[iface][messure])
  //
  //               // this.expanded.push(iface+'-'+messure)
  //             }
  //             // else{
  //
  //             if(value.lastupdate < Date.now() - this.$options.net_stats.interval){
  //
  //               this.networkInterfaces_charts[iface+'-'+messure].updateOptions( { 'file': value.data } );
  //               value.lastupdate = Date.now()
  //
  //             }
  //           }
  //
  //         }.bind(this))
  //       }.bind(this))
  //
  //
  //   },
  // },
  computed: {
    formated_timestamps: function(){
      return this.format_timestamps(this.timestamps)
    }
  },
  methods: {


    // format_timestamps(timestamps){
    //
    //   let formated = []
    //   Array.each(timestamps, function(timestamp, index){
    //
    //     let start = '';
    //     let end = '';
    //     let date = new Date(timestamp);
    //
    //     // if(index == 0 || index == this.columns.length - 1){
    //     if(index == 0 || index == timestamps.length - 1){
    //       date = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    //     }
    //     // else if(){
    //     //   date = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    //     // }
    //     else{
    //       let seconds = date.toLocaleTimeString([], {second:'2-digit'})
    //       if(seconds == '0'){
    //         date = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    //       }
    //       else{
    //         date = seconds
    //       }
    //
    //     }
    //
    //     formated[index] = date;
    //
    //     // ////////console.log('---timestamps---',formated)
    //   })
    //
    //   // ////////console.log('---timestamps---',formated)
    //   return formated;
    //
    // }
    format_timestamps(data){//expects timestamp to be on [0] possition

      // let formated = []
      Array.each(data, function(value, index){
        let timestamp = value[0]

        let start = '';
        let end = '';
        let date = new Date(timestamp);

        // if(index == 0 || index == this.columns.length - 1){
        if(index == 0 || index == data.length - 1){
          date = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        }
        // else if(){
        //   date = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        // }
        else{
          let seconds = date.toLocaleTimeString([], {second:'2-digit'})
          if(seconds == '0'){
            date = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
          }
          else{
            date = seconds
          }

        }

        data[index][0] = date;

        // ////////console.log('---timestamps---',formated)
      })

      // ////////console.log('---timestamps---',formated)
      return data;

    }

  },
}
</script>

<style scoped>

.container-with-legend {
    display: inline-block;
    overflow: hidden;

    transform: translate3d(0,0,0);

    /* fix minimum scrollbar issue in firefox */
    min-height: 99px;

    /* required for child elements to have absolute position */
    position: relative;

    /* width and height is given per chart with data-width and data-height */
}
.chart-with-legend-right {
    position: absolute; /* within .netdata-container */
    top: 0; /* within .netdata-container */
    left: 0; /* within .netdata-container */
    display: block;
    overflow: hidden;
    margin-right: 140px; /* --legend-width */
    width: calc(100% - 140px); /* --legend-width */
    height: 100%;
    z-index: 5;
    flex-grow: 1;

    /* width and height is calculated (depends on the appearance of the legend) */
}

.dygraph-chart {

}

.dygraph-ylabel {
}

.dygraph-axis-label-x {
    overflow-x: hidden;
}

.dygraph-label-rotate-left {
    text-align: center;
    /* See http://caniuse.com/#feat=transforms2d */
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -o-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
}

/* For y2-axis label */
.dygraph-label-rotate-right {
    text-align: center;
    /* See http://caniuse.com/#feat=transforms2d */
    transform: rotate(-90deg);
    -webkit-transform: rotate(-90deg);
    -moz-transform: rotate(-90deg);
    -o-transform: rotate(-90deg);
    -ms-transform: rotate(-90deg);
}

.dygraph-title {
    text-indent: 56px;
    text-align: left;
    position: absolute;
    left: 0px;
    top: 4px;
    font-size: 11px;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>
