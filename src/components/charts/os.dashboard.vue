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
         :options="stat"
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
            :options="networkInterfaces_stats[iface][messure].options"
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
    EventBus: {
      type: [Object],
       default: () => ({})
    },
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
      highlighted: false,
      expanded: [],
      // charts : {},
      stats: {},
      networkInterfaces_stats: {},
      // networkInterfaces_charts: {},
      // uptime_stats: []
    }
  },
  updated () {
    // this.$nextTick(function () {
    //   this.sync_charts()
    // })

    this.$q.loading.hide()
  },
  created () {
    window.EventBus.$on('highlightCallback', params => {
      this.highlighted = true
      //console.log('event OS.DASHBOARD highlightCallback', params)
      this.sync_charts()
		})
    window.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      //console.log('event OS.DASHBOARD unhighlightCallback', event)
      this.unsync_charts()
		})

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
      // ////console.log('gonna update')
      // ////console.log(this.$refs['uptime'][0])

      if(this.$refs['uptime'] && val.length > 0){

        let data = []
        Array.each(val, function(uptime){
          data.push([new Date(uptime.timestamp), uptime.value])
        })

        this.$set(this.stats.uptime, 'data', data)

        if(
          this.stats.uptime.lastupdate < Date.now() - this.$options.stats.uptime.interval &&
          this.$refs['uptime'][0].chart != null &&
          // this.$options.visibles['uptime'] != false &&
          this.highlighted == false
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
      //////console.log('loadavg', val)

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

        // //////console.log(data)
        this.$set(this.stats.loadavg, 'data', data)


        if(
          this.stats.loadavg.lastupdate < Date.now() - this.$options.stats.loadavg.interval &&
          this.$refs['loadavg'][0].chart != null &&
          // this.$options.visibles['loadavg'] != false &&
          this.highlighted == false
        ){
          // this.sync_charts()
          // this.charts.loadavg.updateOptions( { 'file': this.stats.loadavg.data, 'dateWindow': this.charts.loadavg.xAxisExtremes() } )
          this.$refs['loadavg'][0].updateOptions({ 'dateWindow': this.$refs['loadavg'][0].chart.xAxisExtremes() })
          this.stats.loadavg.lastupdate = Date.now()
        }

      }

    },
    networkInterfaces: function(networkInterfaces){
      // ////console.log('networkInterfaces', networkInterfaces)

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
            if(!self.networkInterfaces_stats[iface][messure]){
              /**
              * ugly hack:
              * Due to JavaScript deep cloning
              */
              //deep clone/stringify object to loose any refere (loosing any "function" declarations)
              let options = JSON.parse(JSON.stringify(self.$options.net_stats))

              /**
              * deep clone object with completeAssign (keep references), and merge the two,
              * recovering "function" declarations
              */
              options = Object.merge(options, self.completeAssign({}, self.$options.net_stats ))

              self.$set(self.networkInterfaces_stats[iface], messure, {
                options: options,
                lastupdate: 0,
                data: []
              })
            }
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

        ////console.log('self.networkInterfaces_stats', self.networkInterfaces_stats)


        Object.each(this.networkInterfaces_stats, function(stat, iface){

          Object.each(stat, function(value, messure){


            // if(document.getElementById(iface+'-'+messure)){
            if(this.$refs[iface+'-'+messure]){

              // if(!this.networkInterfaces_charts[iface+'-'+messure]){
              //   //////console.log('---validatin---', iface+'-'+messure)
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
                this.$refs[iface+'-'+messure][0].chart != null &&
                // this.$options.visibles[iface+'-'+messure] != false &&
                this.highlighted == false
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
    /**
    * @source: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Object/assign
    */
    completeAssign(target, ...sources) {
      sources.forEach(source => {
        let descriptors = Object.keys(source).reduce((descriptors, key) => {
          descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
          return descriptors;
        }, {});
        // por defecto, Object.assign copia las propiedades de tipo Symbol que sean enumerables
        Object.getOwnPropertySymbols(source).forEach(sym => {
          let descriptor = Object.getOwnPropertyDescriptor(source, sym);
          if (descriptor.enumerable) {
            descriptors[sym] = descriptor;
          }
        });
        Object.defineProperties(target, descriptors);
      });
      return target;
    },
    visibilityChanged (isVisible, entry) {
      this.$options.visibles[entry.target.id.replace('-container','')] = isVisible

      //console.log('visible', isVisible, entry.target.id.replace('-container',''))

      // if(this.$refs[entry.target.id.replace('-container','')]){
      //   this.$refs[entry.target.id.replace('-container','')][0].chart.setSelection(
      //     this.$refs[entry.target.id.replace('-container','')][0].chart.numRows() - 1
      //   )
      // }

      // this.sync_charts()

    },
    sync_charts(){
      if(this.$options.sync == null){
        let gs = []
        // let sync = []

        // ////console.log(this.charts)
        Object.each(this.$refs, function(ref, name){

          if(ref[0].chart instanceof Dygraph && this.$options.visibles[name] != false){
            //console.log('charts', name, ref[0].chart, ref[0].chart instanceof Dygraph)

          // if(ref[0].chart instanceof Dygraph){

            gs.push(ref[0].chart)
            // sync.push(ref[0])
          }
        }.bind(this))

        // Object.each(this.charts, function(dygraph, name){
        //   if(this.$options.visibles[name] == true){
        //     // ////console.log('charts', dygraph)
        //     gs.push(dygraph)
        //   }
        // }.bind(this))
        //
        // Object.each(this.networkInterfaces_charts, function(dygraph, name){
        //   if(this.$options.visibles[name] == true){
        //     // ////console.log('networkInterfaces', dygraph)
        //     gs.push(dygraph)
        //   }
        // }.bind(this))

        // ////console.log(this.networkInterfaces_charts)
        //


        // //console.log(gs)
        this.unsync_charts()

        if(gs.length > 1){
          this.$options.sync = synchronize(gs, {
            zoom: true,
            // selection: true,
            range: false
          })

          // Object.each(sync, function (ref){
          //   ref.updateOptions({ 'dateWindow': ref.chart.xAxisExtremes() })
          // }.bind(this))
        }
      }
    },
    unsync_charts(){
      if(this.$options.sync){
        // ////console.log('detaching', this.$options.sync)
        this.$options.sync.detach()
        this.$options.sync = null
      }
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
    //     // ////////////console.log('---timestamps---',formated)
    //   })
    //
    //   // ////////////console.log('---timestamps---',formated)
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

        // ////////////console.log('---timestamps---',formated)
      })

      // ////////////console.log('---timestamps---',formated)
      return data;

    }

  },
}
</script>

<style>

.netdata-chart-alignment {
    margin-left: 55px;
}

.netdata-chart-row {
    width: 100%;
    text-align: center;
    display: flex;
    display: -webkit-flex;
    display: -moz-flex;
    align-items: flex-end;
    -moz-align-items: flex-end;
    -webkit-align-items: flex-end;
    justify-content: center;
    -moz--webkit-justify-content: center;
    -moz-justify-content: center;
    padding-top: 10px;
}

.netdata-container {
    display: inline-block;
    overflow: hidden;

    transform: translate3d(0,0,0);

    /* required for child elements to have absolute position */
    position: relative;

    /* width and height is given per chart with data-width and data-height */
}

.netdata-container-gauge {
    display: inline-block;
    overflow: hidden;

    transform: translate3d(0,0,0);

    /* required for child elements to have absolute position */
    position: relative;

    /* width and height is given per chart with data-width and data-height */
}

.netdata-container-gauge:after {
    padding-top: 60%;
    display: block;
    content: '';
}

.netdata-container-easypiechart {
    display: inline-block;
    overflow: hidden;

    transform: translate3d(0,0,0);

    /* required for child elements to have absolute position */
    position: relative;

    /* width and height is given per chart with data-width and data-height */
}

.netdata-container-easypiechart:after {
    padding-top: 100%;
    display: block;
    content: '';
}

.netdata-aspect {
    position: relative;
    width: 100%;
    padding: 0px;
    margin: 0px;
}

.netdata-container-with-legend {
    display: inline-block;
    overflow: hidden;

    transform: translate3d(0,0,0);

    /* fix minimum scrollbar issue in firefox */
    min-height: 99px;

    /* required for child elements to have absolute position */
    position: relative;

    /* width and height is given per chart with data-width and data-height */
}

.netdata-legend-resize-handler {
    display: block;
    position: absolute;
    bottom: 0px;
    right: 0px;
    height: 15px;
    width: 20px;
    background-color: #272b30;
    font-size: 15px;
    vertical-align: middle;
    line-height: 15px;
    cursor: ns-resize;
    color: #373b40;
    text-align: center;
    overflow: hidden;
    z-index: 20;
    padding: 0px;
    margin: 0px;
}

.netdata-legend-toolbox {
    display: block;
    position: absolute;
    bottom: 0px;
    right: 30px;
    height: 15px;
    width: 110px;
    background-color: #272b30;
    font-size: 12px;
    vertical-align: middle;
    line-height: 15px;
    color: #373b40;
    text-align: center;
    overflow: hidden;
    z-index: 20;
    padding: 0px;
    margin: 0px;

    /* prevent text selection after double click */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
}

.netdata-legend-toolbox-button {
    display: inline-block;
    position: relative;
    height: 15px;
    width: 18px;
    background-color: #272b30;
    font-size: 12px;
    vertical-align: middle;
    line-height: 15px;
    color: #474b50;
    text-align: center;
    overflow: hidden;
    z-index: 21;
    padding: 0px;
    margin: 0px;
    cursor: pointer;

    /* prevent text selection after double click */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
}

.netdata-message {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: left;
    vertical-align: top;
    font-weight: bold;
    font-size: x-small;
    overflow: hidden;
    background: inherit;
    z-index: 0;
}

.netdata-message.hidden {
    display: none;
}

.netdata-message.icon {
    color: #2f3338;
    text-align: center;
    vertical-align: middle;
}

.netdata-chart-legend {
    position: absolute; /* within .netdata-container */
    top: 0;
    right: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 14px;
    display: block;
    width: 140px; /* --legend-width */
    height: calc(100% - 15px); /* 10px for the resize handler and 5px for the top margin */
    font-size: 10px;
    margin-top: 5px;
    text-align: left;
    /* width and height is calculated (depends on the appearance of the legend) */
}

.netdata-legend-title-date {
    font-size: 10px;
    font-weight: normal;
    margin-top: 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.netdata-legend-title-time {
    font-size: 11px;
    font-weight: bold;
    margin-top: 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.netdata-legend-title-units {
    position: absolute;
    right: 10px;
    float: right;
    font-size: 11px;
    vertical-align: top;
    font-weight: normal;
    margin-top: 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.netdata-legend-series {
    position: absolute;
    width: 140px; /* legend-width */
    height: calc(100% - 50px);
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 14.5px; /* line spacing at the legend */
    display: block;
    font-size: 10px;
    margin-top: 0px;
}

.netdata-legend-name-table-line {
    display: inline-block;
    width: 13px;
    height: 4px;
    border-width: 0px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    border-bottom-color: #272b30;
}

.netdata-legend-name-table-area {
    display: inline-block;
    width: 13px;
    height: 5px;
    border-width: 1px;
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: inherit;
}

.netdata-legend-name-table-stacked {
    display: inline-block;
    width: 13px;
    height: 5px;
    border-width: 1px;
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: inherit;
}

.netdata-legend-name-tr {
}

.netdata-legend-name-td {
}

.netdata-legend-name {
    text-align: left;
    font-size: 11px; /* legend: dimension name size */
    font-weight: bold;
    vertical-align: bottom;
    margin-top: 0px;
    z-index: 9;
    padding: 0px;
    width: 80px !important;
    max-width: 80px !important;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    cursor: pointer;
    -webkit-print-color-adjust: exact;
}

.netdata-legend-value {
    /*margin-left: 14px;*/
    position: absolute;
    right: 10px;
    float: right;
    text-align: right;
    font-size: 11px; /* legend: dimension value size */
    font-weight: bold;
    vertical-align: bottom;
    background-color: #272b30;
    margin-top: 0px;
    z-index: 10;
    padding: 0px;
    padding-left: 15px;
    cursor: pointer;
    /* -webkit-font-smoothing: none; */
}

.netdata-legend-name.not-selected {
    font-weight: normal;
    opacity: 0.3;
}

.netdata-chart {
    position: absolute; /* within .netdata-container */
    top: 0; /* within .netdata-container */
    left: 0; /* within .netdata-container */
    display: inline-block;
    overflow: hidden;
    width: 100%;
    height: 100%;
    z-index: 5;

    /* width and height is calculated (depends on the appearance of the legend) */
}

.netdata-chart-with-legend-right {
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

.netdata-peity-chart {

}

.netdata-sparkline-chart {

}

.netdata-dygraph-chart {

}

.netdata-morris-chart {

}

.netdata-google-chart {

}

.dygraph-ylabel {
}

.dygraph-axis-label-x {
    overflow-x: hidden;
}

.dygraph-axis-label {
    color: #6c7075;
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

/* fix for sparkline tooltip under bootstrap */
.jqstooltip {
    width: auto !important;
    height: auto !important;
}

.easyPieChart {
    position: relative;
    text-align: center;
}

.easyPieChart canvas {
    position: absolute;
    top: 0;
    left: 0;
}

.easyPieChartLabel {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    width: 100%;
    text-align: center;
    color: #BBB;
    font-weight: normal;
    text-shadow: #272b30 0px 0px 1px;
    /* -webkit-font-smoothing: none; */
}

.easyPieChartTitle {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    width: 64%;
    margin-left: 18% !important;
    text-align: center;
    color: #676b70;
    font-weight: bold;
}

.easyPieChartUnits {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    width: 60%;
    margin-left: 20% !important;
    text-align: center;
    color: #676b70;
    font-weight: normal;
}

.gaugeChart {
    position: relative;
    text-align: center;
}

.gaugeChart canvas {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 0;
}

.gaugeChartLabel {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    width: 100%;
    text-align: center;
    color: #BBB;
    font-weight: bold;
    z-index: 1;
    text-shadow: #272b30 0px 0px 1px;
    /* text-shadow: #CCC 1px 1px 0px, #CCC -1px -1px 0px, #CCC 1px -1px 0px, #CCC -1px 1px 0px; */
    /* -webkit-text-stroke: 1px #777; */
    /* -webkit-font-smoothing: none; */
}

.gaugeChartTitle {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    width: 100%;
    text-align: center;
    color: #676b70;
    font-weight: bold;
}

.gaugeChartUnits {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: left;
    margin-left: 5%;
    color: #676b70;
    font-weight: normal;
}

.gaugeChartMin {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    bottom: 8%;
    width: 92%;
    margin-left: 8%;
    text-align: left;
    color: #676b70;
    font-weight: normal;
}

.gaugeChartMax {
    display: inline-block;
    position: absolute;
    float: left;
    left: 0;
    bottom: 8%;
    width: 95%;
    margin-right: 5%;
    text-align: right;
    color: #676b70;
    font-weight: normal;
}

.popover-title {
    font-weight: bold;
    font-size: 12px;
}

.popover-content {
    font-size: 11px;
}
</style>
