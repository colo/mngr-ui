<template>

    <div>

      <!-- OS stats -->

     <q-collapsible
      :opened="true"
      icon="info"
      :label="name"
      :separator="true"
      header-class="text-primary bg-white"
      v-for="(stat, name) in $options.stats"
      :key="name"
      :name="name"
     >

       <at-card :bordered="false">
         <!-- <div
          :id="name"
          :style="stat.style"
          v-observe-visibility="visibilityChanged"
          >
        </div> -->
        <dygraph-vue
         :ref="name"
         :id="name"
         :style="stat.style"
         :options="stat.options"
         :stat="stats[name]"
         v-observe-visibility="visibilityChanged"
         >
        </dygraph-vue>
       </at-card>
     </q-collapsible>

     <template v-for="(stat, iface) in networkInterfaces_stats">

       <q-collapsible
         :opened="true"
         icon="info"
         :label="iface +' : '+messure"
         :separator="true"
         header-class="text-primary bg-white"
         v-for="(option, messure) in stat"
         v-if="messure == 'bytes' || messure == 'packets'"
         :key="iface+'-'+messure"
         :name="iface+'-'+messure"
       >

         <at-card :bordered="false">
           <!-- <div
             :id="iface+'-'+messure"
             :style="$options.net_stats.style"
             v-observe-visibility="visibilityChanged"
           ></div> -->
           <dygraph-vue
            :ref="iface+'-'+messure"
            :id="iface+'-'+messure"
            :style="$options.net_stats.style"
            :options="$options.net_stats.options"
            :stat="networkInterfaces_stats[iface][messure]"
            v-observe-visibility="visibilityChanged"
            >
           </dygraph-vue>
         </at-card>
     </q-collapsible>
    </template>

   </div>


</template>

<script>

import dygraphVue from './dygraph'

import Dygraph from 'dygraphs'
// import 'dygraphs/src/extras/smooth-plotter'

/**
* https://stackoverflow.com/questions/33774592/dygraphs-live-trending-and-synchronization
* zoom: true, range: false -> https://github.com/danvk/dygraphs/issues/612
*/
import '../../libs/synchronizer' //modified version

// import 'dygraphs/dist/dygraph.css'

import stats from './js/os.dashboard'
import net_stats from './js/net.dashboard'

export default {
  // name: 'App',
  name: 'osdygraphs',

  sync: null,
  visibles: {},

  // uptime_chart: null,
  components: {
    dygraphVue
    // IEcharts
    // VueCharts
  },
  props: {
    timestamps: {
      type: [Array],
      default: () => ([])
    },
    mem: {
      type: [Object],
      default: () => ({})
    },
    cpu: {
      type: [Object],
       default: () => ({})
    },
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
      // charts : {},
      stats: {},
      networkInterfaces_stats: {},
      // networkInterfaces_charts: {},
      // uptime_stats: []
    }
  },
  updated () {
    this.$nextTick(function () {
      this.sync_charts()
    })

    this.$q.loading.hide()
  },
  created () {
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

      // this.$set(this.charts, name, new Dygraph(
      //     document.getElementById(name),  // containing div
      //     this.stats[name].data,
      //     stat.options
      //   ))
      //
      // if(stat.init)
      //   stat.init(this.charts[name], this.stats[name])

      this.expanded.push(name)
    }.bind(this))

  },

  watch: {

    uptime: function(val){
      // //console.log('gonna update')
      // //console.log(this.$refs['uptime'][0])

      if(this.$refs['uptime'] && val.length > 0){

        let data = []
        Array.each(val, function(uptime){
          data.push([new Date(uptime.timestamp), uptime.value])
        })

        this.$set(this.stats.uptime, 'data', data)

        if(
          this.stats.uptime.lastupdate < Date.now() - this.$options.stats.uptime.interval &&
          // this.$options.visibles['uptime'] == true &&
          this.$refs['uptime'][0].chart != null
        ){



          // this.sync_charts()
          // this.charts.uptime.updateOptions( { 'file': this.stats.uptime.data, 'dateWindow': this.charts.uptime.xAxisExtremes() } );
          this.$refs['uptime'][0].updateOptions({ 'dateWindow': this.$refs['uptime'][0].chart.xAxisExtremes() })
          this.stats.uptime.lastupdate = Date.now()
          // this.$forceUpdate()
        }
      }

    },
    loadavg: function(val){
      ////console.log('loadavg', val)

      if(this.$refs['loadavg'] && val.length > 0){

        let data = []

        Array.each(val, function(loadavg){
          let avg = []
          avg.push(new Date(loadavg.timestamp))

          Array.each(loadavg.value, function(value){
            avg.push(value)
          })

          data.push(avg)
        })

        // ////console.log(data)
        this.$set(this.stats.loadavg, 'data', data)


        if(
          this.stats.loadavg.lastupdate < Date.now() - this.$options.stats.loadavg.interval &&
          // this.$options.visibles['loadavg'] == true &&
          this.$refs['loadavg'][0].chart != null
        ){
          // this.sync_charts()
          // this.charts.loadavg.updateOptions( { 'file': this.stats.loadavg.data, 'dateWindow': this.charts.loadavg.xAxisExtremes() } )
          this.$refs['loadavg'][0].updateOptions({ 'dateWindow': this.$refs['loadavg'][0].chart.xAxisExtremes() })
          this.stats.loadavg.lastupdate = Date.now()
        }

      }

    },
    networkInterfaces: function(networkInterfaces){
      // //console.log('networkInterfaces', networkInterfaces)

      let self = this
      if(networkInterfaces.getLast() !== null){

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
              self.$set(self.networkInterfaces_stats[iface], messure, { lastupdate: 0, data: [] })
              // self.networkInterfaces_stats[iface][messure] = { lastupdate: 0, data: [] }

              // let data = []
              // let stat = []
              // let data = JSON.parse(JSON.stringify(self.networkInterfaces_stats[iface][messure].data))
              let data = []
              Array.each(networkInterfaces, function(stats, index){
                let timestamp =  new Date(stats.timestamp)

                let recived = 0
                let transmited = 0
                let prev_recived = 0
                let prev_transmited = 0

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
              })

              self.$set(self.networkInterfaces_stats[iface][messure], 'data', data)
              // self.networkInterfaces_stats[iface][messure].data = data

          })

        })

        //console.log('self.networkInterfaces_stats', self.networkInterfaces_stats)


        Object.each(this.networkInterfaces_stats, function(stat, iface){

          Object.each(stat, function(value, messure){


            // if(document.getElementById(iface+'-'+messure)){
            if(this.$refs[iface+'-'+messure]){

              // if(!this.networkInterfaces_charts[iface+'-'+messure]){
              //   ////console.log('---validatin---', iface+'-'+messure)
              //
              //
              //   let option = JSON.parse(JSON.stringify(this.$options.net_stats.options))
              //
              //
              //   // this.$set(this.networkInterfaces_charts,
              //   //   iface+'-'+messure,
              //   //   new Dygraph(
              //   //       document.getElementById(iface+'-'+messure),  // containing div
              //   //       this.networkInterfaces_stats[iface][messure].data,
              //   //       option
              //   //     )
              //   // )
              //
              //
              //   // if(this.$options.net_stats.init)
              //     // this.$options.net_stats.init(this.networkInterfaces_charts[iface+'-'+messure], this.networkInterfaces_stats[iface][messure])
              //
              //   // this.sync_charts()
              //   // this.expanded.push(iface+'-'+messure)
              // }
              // else{

              if(
                value.lastupdate < Date.now() - this.$options.net_stats.interval &&
                // this.$options.visibles[iface+'-'+messure] == true &&
                this.$refs[iface+'-'+messure][0].chart != null
              ){

                // this.networkInterfaces_charts[iface+'-'+messure].updateOptions({
                //    'file': value.data,
                //    'dateWindow': this.networkInterfaces_charts[iface+'-'+messure].xAxisExtremes()
                //  });

                this.$refs[iface+'-'+messure][0].updateOptions({ 'dateWindow': this.$refs[iface+'-'+messure][0].chart.xAxisExtremes() })

                value.lastupdate = Date.now()

              }
            }

          }.bind(this))
        }.bind(this))



      }
    },
  },
  // computed: {
  //   formated_timestamps: function(){
  //     return this.format_timestamps(this.timestamps)
  //   }
  // },
  methods: {
    visibilityChanged (isVisible, entry) {
      this.$options.visibles[entry.target.id] = isVisible
      this.sync_charts()
      console.log('visible', isVisible, entry.target)
    },
    sync_charts(){
      // if(this.$options.sync == null){
        let gs = []
        // //console.log(this.charts)
        Object.each(this.$refs, function(ref, name){
          // //console.log('charts', name, ref[0].chart, ref[0].chart instanceof Dygraph)

          if(ref[0].chart instanceof Dygraph && this.$options.visibles[name] == true){

            gs.push(ref[0].chart)
          }
        }.bind(this))

        // Object.each(this.charts, function(dygraph, name){
        //   if(this.$options.visibles[name] == true){
        //     // //console.log('charts', dygraph)
        //     gs.push(dygraph)
        //   }
        // }.bind(this))
        //
        // Object.each(this.networkInterfaces_charts, function(dygraph, name){
        //   if(this.$options.visibles[name] == true){
        //     // //console.log('networkInterfaces', dygraph)
        //     gs.push(dygraph)
        //   }
        // }.bind(this))

        // //console.log(this.networkInterfaces_charts)
      //
      if(this.$options.sync){
        // //console.log('detaching', this.$options.sync)
        this.$options.sync.detach()
      }

      // //console.log(gs)

      if(gs.length > 1){
        this.$options.sync = synchronize(gs, {
          zoom: true,
          // selection: true,
          range: false
        })
      }
      // }
    },

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
    //     // //////////console.log('---timestamps---',formated)
    //   })
    //
    //   // //////////console.log('---timestamps---',formated)
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

        // //////////console.log('---timestamps---',formated)
      })

      // //////////console.log('---timestamps---',formated)
      return data;

    }

  },
}
</script>
