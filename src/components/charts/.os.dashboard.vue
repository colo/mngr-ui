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

          <dygraph-vue
           v-if="visibles[host+'_'+name] && visibles[host+'_'+name] != false"
           :visible="visibles[host+'_'+name]"
           :ref="host+'_'+name"
           :id="host+'_'+name"
           :options="chart"
           :stat="stats[name]"
           :EventBus="EventBus"
           :freezed="freezed"
           >
          </dygraph-vue>
          <!-- :visible="visibles[host+'_'+name]" -->
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


  // net_stats: net_stats,
  static_charts: static_charts,
  dynamic_charts: dynamic_charts,

  dynamic_blacklist: /minute|totalmem/, //don't add charts automatically for this os[key]

  sync: null,

  visibles: {},


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
      this.object_to_charts(this.$store.state.hosts[this.host].os)
    }

    this.$watch('$store.state.hosts.'+this.host+'.os', function (val, oldVal) {

      this.object_to_charts(val)

    }.bind(this))

    // this.$watch('$store.state.hosts.'+this.host+'.os.networkInterfaces', this.networkInterfaces_watcher)


  },
  methods: {

    object_to_charts (val){
      Object.each(val, function(stat, key){

        this.create_dynamic_chart(stat, key)

      }.bind(this))

      Object.each(this.$options.static_charts, function(chart, name){
        // chart = Object.merge(Object.clone(DefaultChart), chart)
        this.process_chart(chart, name)
      }.bind(this))
    },

    create_dynamic_chart (stat, name){

      /**
      * create chart automatically if it's not blacklisted
      **/
      if(
        this.$options.dynamic_blacklist.test(name) == false
        && Object.keys(this.$options.static_charts).contains(name) == false
      ){

        if(Array.isArray(stat)){//it's stat

            let dynamic_charts = this._get_dynamic_charts(name, this.$options.dynamic_charts)

            if(dynamic_charts[name]){

              Array.each(dynamic_charts[name], function(dynamic){

                // chart = Object.merge(Object.clone(chart), dynamic)
                // this._process_dynamic_chart(chart, name, stat)
                this._process_dynamic_chart(dynamic, name, stat)

              }.bind(this))
            }
            else{

              let chart = Object.clone(DefaultChart)

              this._process_generic_chart(chart, name, stat)

            }


        }
        else{//blockdevices.[key]
          Object.each(stat, function(data, key){
            this.create_dynamic_chart(data, name+'.'+key)
          }.bind(this))

        }

      }
    },
    process_chart (chart, name){
      //console.log('process_chart',chart, name)


      if(!chart.watch || chart.watch.managed != true){

        this.add_chart(name, chart)
      }

      if(chart.init && typeOf(chart.init) == 'function')
        chart.init(this, chart, 'chart')

      this.create_watcher('os.'+name, chart.watch)

    },
    add_chart (name, chart){
      let data = [[]]
      if(chart.options && chart.options.labels)
        Array.each(chart.options.labels, function(label, index){
          if(index == 0){
            data[0].push(Date.now())
          }
          else{
            // data[0].push(0)
            data[0].push(null)
          }

        })


      this.$set(this.charts, 'os.'+name, chart)
      this.$set(this.stats, 'os.'+name, {lastupdate: 0, 'data': data })

      // this.expanded.push(name)
    },

    // create_watcher(name, watcher){
    //   watcher = watcher || {}
    //   watcher.value = watcher.value || ''
    //   watcher.transform = watcher.transform || ''
    //
    //   ////////console.log('create_watcher',path+'.'+name, this._watchers)
    //
    //   let watch_name = name
    //   if(watch_name.indexOf('_') > 0 )//removes indixes, ex: cpu.0
    //     watch_name = watch_name.substring(0, watch_name.indexOf('_'))
    //
    //   if(this.$options.unwatchers[name]){
    //     this.$options.unwatchers[name]()
    //     delete this.$options.unwatchers[name]
    //   }
    //
    //   let found_watcher = false
    //
    //   if(Array.isArray(this._watchers)){
    //     Array.each(this._watchers, function(watcher){
    //       if(watcher.expression == name && watcher.user == true)//means user already added a watcher for this chart
    //         found_watcher = true
    //     })
    //   }
    //
    //   //////console.log('before creating watcher',path+'.'+name, watch_name)
    //
    //   if(found_watcher == false){
    //     // //console.log('creating watcher',name, watch_name)
    //
    //     let generic_data_watcher = function(current){
    //       this.generic_data_watcher(current, watcher, name)
    //     }
    //
    //     //////console.log('gonna watch...', path+'.'+watch_name)
    //     this.$options.unwatchers[name] = this.$watch('$store.state.hosts.'+this.host+'.'+watch_name, generic_data_watcher)
    //
    //   }
    // },
    create_watcher(name, watcher){
      this._create_watcher('$store.state.hosts.'+this.host+'.', name, watcher)
    },
    generic_data_watcher (current, watcher, name){
      // console.log('generic_data_watcher', this.host+'_'+name, current)

      // let minute = (this.$store.state.hosts[this.host][path].minute) ? this.$store.state.hosts[this.host][path].minute[name] : null
      // let val = {
      //   current: current,
      //   // minute: minute
      // }

      //////////////console.log('type_value', name, val.current)
      if(watcher.managed == true){
        watcher.transform(current, this)
      }
      else{
        let type_value = null
        let value_length = 0
        if(watcher.value != ''){

          type_value = (Array.isArray(current[0].value) && current[0].value[0][watcher.value]) ? current[0].value[0][watcher.value] : current[0].value[watcher.value]
          // value_length = (Array.isArray(val.current.value) && val.current.value[0][watcher.value]) ? val.current.value[0][watcher.value].length : val.current[0].value[watcher.value].length
        }
        else{
          type_value = current[0].value
          // value_length = current.length
        }

        // if(this.$refs[this.host+'_'+name]){

          let data = []

          if(Array.isArray(type_value)){//multiple values, ex: loadavg
            if(typeOf(watcher.transform) == 'function'){
              current = watcher.transform(current, this)
            }

            data = this._current_array_to_data(current, watcher)
          }
          else if(isNaN(type_value) || watcher.value != ''){

            if(Array.isArray(current[0].value) && current[0].value[0][watcher.value]){//cpus
              // ////console.log('generic_data_watcher isNaN', name, type_value, current)

              current = this._current_nested_array(current, watcher, name)
            }

            // else{//blockdevices.sdX

            if(typeOf(watcher.transform) == 'function'){
              current = watcher.transform(current, this)
            }

            if(!Array.isArray(current))
              current = [current]

            data = this._current_array_to_data(current, watcher)

          }
          else{//single value, ex: uptime
            //////////////console.log('generic_data_watcher Num', name, type_value)
            if(typeOf(watcher.transform) == 'function'){
              current = watcher.transform(current, this)
            }

            data = this._current_number_to_data (current, watcher)


          }

          this.update_chart_stat(name, data)

        // }
      }


    },
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

          this.$refs[this.host+'_'+name][0].updateOptions(
            { 'dateWindow': this.$refs[this.host+'_'+name][0].chart.xAxisExtremes() },
            false
          )
          this.stats[name].lastupdate = Date.now()
          // this.$forceUpdate()
        }

      }
    },

    _process_chart_label (chart, stat) {
      if(chart.labeling && typeOf(chart.labeling) == 'function'){

        return chart.labeling(stat)
      }
      else if(chart.label){
        return chart.label
      }
      else{
        return this._process_chart_name(chart, stat)
      }
    },
    _process_chart_name (chart, stat){
      if(chart.name && typeOf(chart.name) == 'function') return chart.name(stat)
      else if(chart.name) return chart.name
    },
    _process_dynamic_chart (chart, name, stat){
      // ////console.log('_process_dynamic_chart',  name, chart)
      // let watcher = {value: ''}

      if(Array.isArray(stat[0].value)){//like 'cpus'
        // //////////console.log('isArray', stat[0].value)

        Array.each(stat[0].value, function(val, index){

          // let arr_chart = Object.merge(Object.clone(chart), chart)
          let arr_chart = Object.clone(chart)
          // watcher = chart.watch

          arr_chart.label = this._process_chart_label(chart, stat) || name
          let chart_name = this._process_chart_name(chart, stat) || name

          if(chart.watch.merge != true){
            chart_name += '_'+index
          }
          // else{
          //   chart_name = name
          // }

          if(chart.watch.merge != true || index == 0){//merge creates only once instance

            if(!arr_chart.options || !arr_chart.options.labels){
              if(!arr_chart.options)
                arr_chart.options = {}

              arr_chart.options.labels = []

              Object.each(val[chart.watch.value], function(tmp, tmp_key){
                arr_chart.options.labels.push(tmp_key)
              })

              arr_chart.options.labels.unshift('Time')

              // arr_chart.options.labels.push(name+'_minute')//minute
            }

            this.process_chart(arr_chart, chart_name)


          }




        }.bind(this))



      }
      else if(isNaN(stat[0].value)){
        //sdX.stats.

        ////console.log('isNan', name, stat, chart)

        let filtered = false
        if(chart.watch && chart.watch.filters){
          Array.each(chart.watch.filters, function(filter){
            let prop_to_filter = Object.keys(filter)[0]
            let value_to_filter = filter[prop_to_filter]

            if(
              stat[0].value[prop_to_filter]
              && value_to_filter.test(stat[0].value[prop_to_filter]) == true
            ){
              filtered = true
            }

          })
        }
        else{
          filtered = true
        }

        if(filtered == true){
          // chart = Object.merge(chart, chart)
          // watcher = chart.watch

          if(!chart.options || !chart.options.labels){
            if(!chart.options)
              chart.options = {}

            chart.options.labels = []

            //if no "watch.value" property, everything should be manage on "trasnform" function
            if(chart.watch && chart.watch.managed != true
              // && chart.watch.value
            ){
              Object.each(stat[0].value[chart.watch.value], function(tmp, tmp_key){
                // //console.log('labeling...', tmp)
                chart.options.labels.push(tmp_key)
              })

              chart.options.labels.unshift('Time')
            }


          }
          // chart.options.labels.push(name+'_minute')//minute
          chart.label = this._process_chart_label(chart, stat) || name
          let chart_name = this._process_chart_name(chart, stat) || name

          this.process_chart(chart, chart_name)
        }



      }
      else{

        // chart = Object.merge(Object.clone(chart), chart)
        // watcher = chart.watch

        chart.label = this._process_chart_label(chart, stat) || name
        let chart_name = this._process_chart_name(chart, stat) || name

        if(!chart.options || !chart.options.labels){
          if(!chart.options)
            chart.options = {}

          chart.options.labels = []

          chart.options.labels.push(name)

          chart.options.labels.unshift('Time')
        }


        // chart.options.labels.push(name+'_minute')//minute
        this.process_chart(chart, chart_name)
      }


    },
    _process_generic_chart (chart, name, stat){

      chart.options.labels = ['Time']

      if(Array.isArray(stat[0].value)){//like 'loadavg', that has 3 values

        for(let i= 0; i < stat[0].value.length; i++){//create data columns
          chart.options.labels.push(name+'_'+i)
        }

        // chart.options.labels.push(name+'_minute')//minute
        this.process_chart(chart, name)
      }
      else if(!isNaN(stat[0].value)){//like 'uptime', one value only

        chart.options.labels.push(name)
        this.process_chart(chart, name)
      }
    },
    _get_dynamic_charts (name, dynamic_charts){
      let charts = {}
      Object.each(dynamic_charts, function(dynamic){
        if(dynamic.match.test(name) == true){
          if(!charts[name])
            charts[name] = []

          charts[name].push(dynamic)

        }
      }.bind(this))

      return charts
    },

    _current_nested_array(current, watcher, name){

      let index = (name.substring(name.indexOf('_') +1 , name.length - 1)) * 1
      ////////////console.log('generic_data_watcher isNanN', name, val, index)

      let val_current = []
      Array.each(current, function(item){
        // ////////////console.log('CPU item', item)

        let value = {}
        Array.each(item.value, function(val, value_index){//each cpu

          if(watcher.merge !== true && value_index == index){////no merging - compare indexes to add to this watcher
            value[watcher.value] = Object.clone(val[watcher.value])
          }
          else{//merge all into a single stat
            if(value_index == 0){
              value[watcher.value] = Object.clone(val[watcher.value])
            }
            else{
              Object.each(val[watcher.value], function(prop, key){
                value[watcher.value][key] += prop
              })

            }
          }

        }.bind(this))

        val_current.push({timestamp: item.timestamp, value: value})

      }.bind(this))

      // ////////////console.log('CPU new current', val_current)

      return val_current
    },
    _current_number_to_data (current, watcher){
      let data = []
      Array.each(current, function(current){
        let value = null
        if(watcher.value != ''){
          value = current.value[watcher.value]
        }
        else{
          value = current.value
        }

        // data.push([new Date(current.timestamp), value, 0])//0, minute column
        data.push([new Date(current.timestamp), value])//0, minute column
      })

      return data
    },
    _current_array_to_data (current, watcher){
      let data = []
      Array.each(current, function(item){
        let tmp_data = []
        tmp_data.push(new Date(item.timestamp))

        let value = null
        if(watcher.value != ''){
          value = item.value[watcher.value]
        }
        else{
          value = item.value
        }

        // Array.each(value, function(real_value){
        //   tmp_data.push(real_value)
        // })
        if(Array.isArray(value)){
          Array.each(value, function(real_value){
            tmp_data.push(real_value)
          })
        }
        else if(!isNaN(value)){//mounts[mount_point].value.percentage
          tmp_data.push(value * 1)
        }
        else{
          Object.each(value, function(real_value){
            real_value = real_value * 1
            tmp_data.push(real_value)
          })
        }

        // tmp_data.push(0)//add minute column

        data.push(tmp_data)
      })

      return data
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
        // //////////////////////////////console.log('detaching', this.$options.sync)
        this.$options.sync.detach()
        this.$options.sync = null
      }
    },
    beautifyLabel (label) {
      return label.replace('_', '.')
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
