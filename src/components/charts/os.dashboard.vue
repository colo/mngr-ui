<template>

    <div>

      <!-- OS stats -->

     <q-collapsible
      v-for="(chart, name) in charts"
      :no-ripple="true"
      :opened="true"
      icon="info"
      :label="beautifyLabel(chart.label || name)"
      :separator="true"
      header-class="text-primary bg-white"
      :key="name"
      :name="name"
      v-if="hide[name] != true"
     >

      <el-card shadow="hover"
        v-observe-visibility="visibilityChanged"
        :id="host+'_'+name+'-card'"
      >
       <!-- <at-card :bordered="false"> -->
         <!-- <div
          :id="name"
          :style="chart.style"
          v-observe-visibility="visibilityChanged"
          >
        </div> -->

          <component
            :is="chart.component"
            v-if="visibles[host+'_'+name] && visibles[host+'_'+name] != false"
            :visible="visibles[host+'_'+name]"
            :ref="host+'_'+name"
            :id="host+'_'+name"
            :options="chart"
            :stat="stats[name]"
            :EventBus="EventBus"
            :freezed="freezed"
          />
          </component>

          <!-- <dygraph-vue
           v-if="visibles[host+'_'+name] && visibles[host+'_'+name] != false"
           :visible="visibles[host+'_'+name]"
           :ref="host+'_'+name"
           :id="host+'_'+name"
           :options="chart"
           :stat="stats[name]"
           :EventBus="EventBus"
           :freezed="freezed"
           >
          </dygraph-vue> -->

       <!-- </at-card> -->
     </el-card>



     </q-collapsible>



   </div>


</template>

<script>

import Dashboard from '../mixins/dashboard'

import { frameDebounce } from 'quasar'


import dygraphVue from './dygraph'

import Dygraph from 'dygraphs'
// import 'dygraphs/src/extras/smooth-plotter'

/**
* https://stackoverflow.com/questions/33774592/dygraphs-live-trending-and-synchronization
* zoom: true, range: false -> https://github.com/danvk/dygraphs/issues/612
*/
import '../../libs/synchronizer' //modified version

// import 'dygraphs/dist/dygraph.css'

import DefaultChart from './js/default.dygraph.line'
import static_charts from './js/os.static.charts'
import dynamic_charts from './js/os.dynamic.charts'
// import net_stats from './js/net.dashboard'

import { mapState } from 'vuex'

export default {
  mixins: [Dashboard],

  // name: 'App',
  name: 'os-dashboard',

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
    host: {
      type: [String],
      default: () => ('')
    },

  },

  has_no_data: {},
  sync: null,
  visibles: {},

  /**
  * @override chart [mixin]
  **/
  DefaultChart: DefaultChart,
  static_charts: static_charts,
  dynamic_charts: dynamic_charts,
  dynamic_blacklist: /minute|totalmem/, //don't add charts automatically for this os[key]


  data () {
    return {
      hide: {},
      visibles: {},
      highlighted: false,

      // charts: {},
      // stats: {},

    }
  },

  computed: Object.merge(
    mapState({
      paused: state => state.app.pause,
      freezed: state => state.app.freeze,
    })
  ),
  updated: function(){
    this.$store.commit('app/reset', false)
  },
  created (){

    let self = this
    this.EventBus.$on('highlightCallback', function(params) {
      this.highlighted = true
      //////////////////////////console.log('event OS.DASHBOARD highlightCallback', self.$refs)
      self.sync_charts()
		})

    this.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      ////////////////////////////console.log('event OS.DASHBOARD unhighlightCallback', event)
      self.unsync_charts()
		})
  },

  mounted () {


    //if "remounted" the $watch ain't gonna work if it's not changed
    if(this.$store.state.hosts[this.host] && this.$store.state.hosts[this.host].os){
      // this.$set(this.os, {})
      ////////console.log('remounted', this._watchers)
      this.initialize_all_charts(this.$store.state.hosts[this.host].os)
    }

    this.$watch('$store.state.hosts.'+this.host+'.os', function (val, oldVal) {

      this.initialize_all_charts(val)

    }.bind(this))

    // this.$watch('$store.state.hosts.'+this.host+'.os.networkInterfaces', this.networkInterfaces_watcher)


  },
  methods: {
    /**
    * initlize all charts, dynamics & static
    */
    initialize_all_charts (val){
      Object.each(val, function(stat, key){

        this.parse_chart_from_stat(stat, key)

      }.bind(this))

      Object.each(this.$options.static_charts, function(chart, name){
        // chart = Object.merge(Object.clone(DefaultChart), chart)
        this.process_chart(chart, name)
      }.bind(this))
    },


    /**
    * UI related
    **/
    visibilityChanged (isVisible, entry) {
      // //console.log('visibilityChanged', isVisible, entry.target.id)
      // this.$set(this.visibles, entry.target.id.replace('-container',''), isVisible)
      this.$options.visibles[entry.target.id.replace('-card','')] = isVisible

      frameDebounce(function() {//performance reasons
        // //console.log('visibilityChanged frameDebounce')
        Object.each(this.$options.visibles, function(bool, visible){
          this.$set(this.visibles, visible, bool)
        }.bind(this))

      }.bind(this))()

    },
    sync_charts(){
      if(this.$options.sync == null){
        let gs = []
        // let sync = []

        //////////////////////////console.log(this.$refs, this.host)
        Object.each(this.$refs, function(ref, name){

          // ////////////////////////console.log('charts', name, ref)

          if(ref[0] && ref[0].chart instanceof Dygraph
            && (this.visibles[name] != false || this.freezed == true ))
          {
            ////////////////////////console.log('charts', name, ref[0].chart, ref[0].chart instanceof Dygraph)

          // if(ref[0].chart instanceof Dygraph){

            gs.push(ref[0].chart)
            // sync.push(ref[0])
          }
        }.bind(this))

        this.unsync_charts()

        if(gs.length > 1){
          this.$options.sync = synchronize(gs, {
            zoom: true,
            // selection: true,
            range: false
          })


        }
      }
    },
    unsync_charts(){
      if(this.$options.sync){
        // console.log('detaching', this.$options.sync)
        this.$options.sync.detach()
        this.$options.sync = null
      }
    },
    beautifyLabel (label) {
      return label.replace('_', '.')
    },

    /**
    * @override dashboard [mixin]
    **/
    add_chart (name, chart){
      this._add_chart('os.'+name, chart)
    },
    /**
    * @override chart [mixin]
    **/
    create_watcher(name, watcher){
      this._create_watcher('$store.state.hosts.'+this.host+'.', 'os.'+name, watcher)
    },
    /**
    * @override chart [mixin]
    **/
    update_chart_stat (name, data){
      // console.log('update_chart_stat', name, data)

      if(this.hide[name] != true){

        let has_data = true
        Array.each(data, function(columns){
           has_data = columns.some(function(column, index){
             if(index == 0) return false//timestamp column
             return column > 0;
          });
        })


        if(!this.$options.has_no_data[name])
          this.$options.has_no_data[name] = 0

        this.$options.has_no_data[name] = (has_data == true) ? 0 : this.$options.has_no_data[name] + 1

        if(this.$options.has_no_data[name] > 10)//once hidden, user should unhide it
          this.$set(this.hide, name, true)

        // console.log('has_data ', name, has_data, this.$options.has_no_data[name])

        this.$set(this.stats[name], 'data', data)

        if(
          this.stats[name].lastupdate < Date.now() - this.charts[name].interval
          && (this.$refs[this.host+'_'+name]
            && this.$refs[this.host+'_'+name][0]
            && this.$refs[this.host+'_'+name][0].chart != null
          )
          && ( this.visibles[this.host+'_'+name] != false || this.freezed == true )
          && this.highlighted == false
          && this.paused == false
          && data.length > 0
        ){

          // this.$refs[this.host+'_'+name][0].updateOptions(
          //   { 'dateWindow': this.$refs[this.host+'_'+name][0].chart.xAxisExtremes() },
          //   false
          // )

          this.$refs[this.host+'_'+name][0].update()//default update
          
          this.stats[name].lastupdate = Date.now()
          // this.$forceUpdate()
        }

      }
    },

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
