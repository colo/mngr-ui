<template>

    <div>
      <template v-for="(chart, name) in charts">
        <a :name="name"></a>
      <!-- OS stats -->

       <q-collapsible
        :no-ripple="true"
        :opened="true"
        :separator="true"
        :key="name"
        header-class="text-weight-light text-primary bg-white"
        :ref="name+'-collapsible'"
        :label="chart.label || name"
        @show="showCollapsible(name)"
        @hide="hideCollapsible(name)"
       >
       <!-- header-class="text-primary bg-white"
       :icon="chart.icon"
       :label="beautifyLabel(chart.label || name)" -->


       <template slot="header" >
         <q-icon :name="chart.icon" small style="padding-right: 10px"/>
         <q-item-main
         :label="beautifyLabel(chart.label || name)"
         />
       </template>

       <!-- @hide="hideCollapsible(name)" -->
       <!-- :name="name" -->
       <!-- v-if="hide[name] != true" -->
       <!-- :opened="(hide[name] != true) ? true : false" -->
       <!-- :opened="true" -->
       <!-- v-if="hide[name] != true" -->


        <el-card
          v-observe-visibility="visibilityChanged"
          :id="name+'-card'"
        >
        <!-- shadow="hover" -->
        <!-- {{hide[name]}}
        {{name}} -->
         <!-- <at-card :bordered="false"> -->
           <!-- <div
            :id="name"
            :style="chart.style"
            v-observe-visibility="visibilityChanged"
            >
          </div> -->

            <component
              v-if="visibles[name] && visibles[name] != false"
              :is="chart.component"
              :visible="visibles[name]"
              :ref="name"
              :id="name"
              :options="chart"
              :stat="stats[name]"
              :EventBus="EventBus"
              :freezed="freezed"
            />
            </component>
            <div
              v-else
              :id="name+'-container'"
              class="netdata-container-with-legend"
              :style="chart.options.style"
            >
              <div
                :class="chart.options.class"
              >
              </div>
             <div
               class="netdata-chart-legend"
             >
             </div>
            </div>

            <!-- class="netdata-container" -->

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

     </template>


   </div>


</template>

<script>

import Dashboard from './mixins/dashboard'

import { frameDebounce } from 'quasar'
import { throttle } from 'quasar'


import dygraphWrapper from './wrappers/dygraph'
// import frappeChartsWrapper from './wrappers/frappeCharts'
// import amcharts3Wrapper from './wrappers/amcharts3'
// import vueEcharts3Wrapper from './wrappers/vueEcharts3'
// import highchartsVueWrapper from './wrappers/highchartsVue'

import Dygraph from 'dygraphs'
// import 'dygraphs/src/extras/smooth-plotter'

/**
* https://stackoverflow.com/questions/33774592/dygraphs-live-trending-and-synchronization
* zoom: true, range: false -> https://github.com/danvk/dygraphs/issues/612
*/
import '../libs/synchronizer' //modified version

// import 'dygraphs/dist/dygraph.css'

import DefaultChart from './charts/js/default.dygraph.line'
import static_charts from './charts/js/os.static.charts'
import dynamic_charts from './charts/js/os.dynamic.charts'
// import net_stats from './js/net.dashboard'

import { mapState } from 'vuex'
// import { mapMutations } from 'vuex'

export default {
  mixins: [Dashboard],

  // name: 'App',
  name: 'os-dashboard',

  // uptime_chart: null,
  components: {
    dygraphWrapper,
    // frappeChartsWrapper,
    // amcharts3Wrapper,
    // vueEcharts3Wrapper,
    // highchartsVueWrapper

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
  // dynamic_blacklist: /totalmem/, //don't add charts automatically for this os[key]
  dynamic_blacklist: /[\s\S]*/,
  dynamic_whitelist: /loadavg|cpu|mounts|blockdevices|freemem|networkInterfaces/,


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
  watch: {
    'charts': frameDebounce(function(val) {
      // console.log('charts watched', val )
      this._update_charts_menu()

    }),
    // 'charts': function(val) {
    //   console.log('charts watched', val )
    //   this._update_charts_menu()
    //
    // },
    // 'visibles' (val){
    //   ////console.log('visibles watched', val )
    // },
    // 'hide': frameDebounce(function(val) {
    //   // ////console.log('hide watched', val )
    //   Object.each(val, function(value, collapsible){
    //     ////console.log('hide watched', collapsible, value )
    //     if(value == true){
    //
    //       this.$refs[collapsible+'-collapsible'][0].hide()
    //     }
    //   }.bind(this))
    //
    // }),
    'hide': function(val) {
      ////console.log('hide watched', val )
      Object.each(val, function(value, collapsible){
        // ////console.log('hide watched', collapsible, value )
        if(value == true){

          this.$refs[collapsible+'-collapsible'][0].hide()
        }
      }.bind(this))

    },
  },
  // updated (){
  //   // this.$store.commit('app/reset', false)
  //   // this._update_charts_menu()
  // },
  created (){

    let self = this
    this.EventBus.$on('highlightCallback', function(params) {
      this.highlighted = true
      //////////////////////////////////console.log('event OS.DASHBOARD highlightCallback', self.$refs)
      self.sync_charts()
		})

    this.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      ////////////////////////////////////console.log('event OS.DASHBOARD unhighlightCallback', event)
      self.unsync_charts()
		})
  },

  mounted () {


    //if "remounted" the $watch ain't gonna work if it's not changed
    if(this.$store.state.hosts[this.host] && this.$store.state.hosts[this.host].os){
      // this.$set(this.os, {})
      ////////////////console.log('remounted', this._watchers)
      this.initialize_all_charts(this.$store.state.hosts[this.host].os)
    }

    this.$watch('$store.state.hosts.'+this.host+'.os', function (val, oldVal) {
      // console.log('watcher $store.state.hosts.'+this.host+'.os', Object.clone(val))
      this.initialize_all_charts(val)

    }.bind(this))

    this.$watch('$store.state.hosts.'+this.host+'.os.minute', function (val, oldVal) {
      // console.log('watcher $store.state.hosts.'+this.host+'.os.minute', Object.clone(val))
      this.initialize_all_charts(this.$store.state.hosts[this.host].os)

    }.bind(this))

    // this.$watch('$store.state.hosts.'+this.host+'.os.networkInterfaces', this.networkInterfaces_watcher)


  },

  methods: {
    showCollapsible (collapsible){
      ////console.log('showCollapsible', collapsible)
      this.$options.has_no_data[collapsible.replace('-collapsible', '')] = 0
      this.$set(this.hide, collapsible.replace('-collapsible', ''), false)

    },
    hideCollapsible (collapsible){
      ////console.log('hideCollapsible', collapsible)
      let name = collapsible.replace('-collapsible', '')
      this.$options.has_no_data[name] = 61
      this.$set(this.hide, name, true)

      // delete this.stats[name].data
      // this.$set(this.stats[name], 'data', [])

    },
    _update_charts_menu (){

      // let menu = Array.clone(this.$store.state.app.charts_tree_menu)
      let menu = []

      console.log('os.dashboard.vue _update_charts_menu', this.$refs)

      Object.each(this.$refs, function(ref, key){
        if(
          /-collapsible/.test(key)
          && ref[0]
          && ref[0].label
        ){
          let menu_entry = {}

          menu_entry = this._parse_menu_key(
            ref[0].label.replace(this.host+'.', ''),//remove 'host.' from label
            key.replace('-collapsible', '')//remove '-collapsible' from link
          )

          console.log('os.dashboard.vue _update_charts_menu entry', key, ref, menu_entry)

          menu = this._merge_menu(menu, menu_entry)

        }
      }.bind(this))



      // console.log('os.dashboard.vue _update_charts_menu', menu)

      Object.each(this.$store.state.app.icons, function(rgexp, name){
          if(rgexp.test('os') && menu[0])
            menu[0].icon = name
      })

      this.$store.commit('app/charts_tree_menu', menu)

    },
    _parse_menu_key (label, link, icon){


      if(!icon){
        Object.each(this.$store.state.app.icons, function(rgexp, name){
            if(rgexp.test(label))
              icon = name
        })

        if(!icon)
          icon = this.$store.state.app.default_chart_icon
      }

      let menu = {label: null, icon: icon, children: [], header: 'generic'}


      if(label.indexOf('.') > -1 || label.indexOf('[') > -1){
        let sub = ''
        if(label.indexOf('[') > -1 && label.indexOf('.') == -1){
          menu.label = label.substring(0, label.indexOf('['))
          sub = label.substring(label.indexOf('[')+1, label.indexOf(']'))
        }
        else{
          menu.label = label.substring(0, label.indexOf('.'))
          sub = label.substring(label.indexOf('.')+1, label.length)
        }

        if(this.charts[label] && this.charts[label].icon){
          icon = this.charts[label].icon
        }

        menu.children.push(this._parse_menu_key(sub, link, icon))

        //////console.log('os.dashboard.vue _parse_menu_key', menu.children)

        // if(menu.children.length == 0){//no children, means last leaf
          // menu.id = link
        // }
        // else{
          menu.id = menu.label
        // }

      }
      else{
        menu.label = label
        menu.id = link
        menu.header = 'anchor'
        // menu.icon = ''
      }



      return menu
    },
    _merge_menu(menu, menu_entry){
      menu = Array.clone(menu)
      let found = false
      if(menu.length > 0){
        Array.each(menu, function(child, index){
          if(child.label == menu_entry.label){
           found = true
           let children = []
           Array.each(menu_entry.children, function(sub){
             children = Array.combine(children, this._merge_menu(child.children, sub))
           }.bind(this))

           child = Object.merge(child, menu_entry)
           child.children = children
           menu[index] = child
         }

        }.bind(this))
      }
      // //////console.log('found', found)

      if(menu.length == 0 || found == false){
        menu.push(menu_entry)
      }

      return menu
    },

    // _create_menu_entry(label, children){
    //   let menu = {label: label, children: []}
    //   Array.each(children, function(child){
    //     menu.children.push(this._create_menu_entry())
    //   }.bind(this))
    //   return menu
    // },
    /**
    * initlize all charts, dynamics & static
    */
    initialize_all_charts (val){
      // console.log('initializing ...', val)

      Object.each(val, function(stat, key){
        this.parse_chart_from_stat(stat, key)
      }.bind(this))

      Object.each(this.$options.static_charts, function(chart, name){
        this.process_chart(chart, name, undefined)
      }.bind(this))
    },


    /**
    * UI related
    **/
    visibilityChanged (isVisible, entry) {
      // let module = entry.target.id.replace(this.host+'_', '').replace('-card','')
      // if(module.indexOf('_') > -1)
      //   module = module.substring(0, module.indexOf('_'))
      //
      // let path = module.substring(0, module.lastIndexOf('.')).replace('.', '/')
      // let list = module.substring(module.lastIndexOf('.') + 1, module.length)
      let {path, list} = this.name_to_module(entry.target.id.replace('-card',''))

      console.log('visibilityChanged', isVisible, entry.target.id, module, path, list)

      if(isVisible == true){
        this.$store.commit('hosts/whitelist_module', {path: path, list: list} )
      }
      else{
        this.$store.commit('hosts/erase_whitelist_module', {path: path, list: list} )
      }

      // this.$set(this.visibles, entry.target.id.replace('-container',''), isVisible)

      // this.$options.visibles[entry.target.id.replace('-card','')] = isVisible

      // frameDebounce(function() {//performance reasons
      //   // //////////console.log('visibilityChanged frameDebounce')
      //   Object.each(this.$options.visibles, function(bool, visible){
      //     this.$set(this.visibles, visible, bool)
      //   }.bind(this))
      //
      // }.bind(this))()

      this.$set(this.visibles, entry.target.id.replace('-card',''), isVisible)

    },
    sync_charts(){
      if(this.$options.sync == null){
        let gs = []
        // let sync = []

        //////////////////////////////////console.log(this.$refs, this.host)
        Object.each(this.$refs, function(ref, name){

          // ////////////////////////////////console.log('charts', name, ref)

          if(ref[0] && ref[0].chart instanceof Dygraph
            && (this.visibles[name] != false || this.freezed == true ))
          {
            ////////////////////////////////console.log('charts', name, ref[0].chart, ref[0].chart instanceof Dygraph)

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
        // ////////console.log('detaching', this.$options.sync)
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
    // add_chart (name, chart){
    //   this._add_chart('os.'+name, chart)
    // },
    // process_chart_name (chart, stat){
    //   let name = ''
    //   if(chart.name && typeOf(chart.name) == 'function') name = chart.name(stat)
    //   else if(chart.name) name = chart.name
    //
    //   if(name.indexOf('os.') < 0)
    //     name = 'os.'+name
    //
    //   return name
    // },
    // process_chart_label (chart, stat) {
    //   let label = ''
    //   if(chart.labeling && typeOf(chart.labeling) == 'function'){
    //
    //     label = chart.labeling(stat)
    //   }
    //   else if(chart.label){
    //     label = chart.label
    //   }
    //   else{
    //     label = this.process_chart_name(chart, stat)
    //   }
    //
    //     if(label && label.indexOf('os.') < 0)
    //       label = 'os.'+label
    //
    //     return label
    // },
    name_to_module(name){
      let module = name.replace(this.host+'_', '')
      if(module.indexOf('_') > -1)
        module = module.substring(0, module.indexOf('_'))

      let second_indexOf = module.indexOf('.', module.indexOf('.') + 1)
      let path = module.substring(0, second_indexOf).replace('.', '/')


      let list = ''
      // if(second_indexOf == -1){
        list = module.substring(module.lastIndexOf('.') + 1, module.length)
      // }
      // else{
      //   list = module.substring(second_indexOf + 1, module.indexOf('.', second_indexOf+1) )
      // }

      console.log('name_to_module', name, path, list)

      return {path, list}
    },
    process_chart (chart, name, stat){

      // this.$store.commit('hosts/blacklist_module', {path: path, list: /[\s\S]*/} )

      if(name.indexOf('os.') < 0)
        name = this.host+'_os.'+name

      let {path, list} = this.name_to_module(name)
      // if(path == "")
      //   path == 'os'

      console.log('process_chart', name, path, list)
      this.$store.commit('hosts/blacklist_module', {path: path, list: /[\s\S]*/} )

      // if(chart.watch && chart.watch.managed == true)
      //   this.$store.commit('hosts/whitelist_module', {path: path, list: list} )

      if(!chart.watch || chart.watch.managed != true){

        this.add_chart(name, chart)
      }

      this._process_chart(chart, name, stat)


    },
    /**
    * @override chart [mixin]
    **/
    create_watcher(name, chart){
      let watcher = chart.watch || {}
      let watch_name = name
      let replace_host = new RegExp(this.host+'_', 'g')
      watch_name = watch_name.replace(replace_host, '')

      if(watch_name.indexOf('_') > 0 ){//removes host_ & indixes, ex: cpu.0
        watch_name = watch_name.substring(0, watch_name.indexOf('_'))
      }

      // ////console.log('create_watcher ', watch_name, name)


      watch_name = watch_name.replace(/os\./, '', 'g')



      this._create_watcher('$store.state.hosts.'+this.host+'.os.'+watch_name, name, chart)
    },
    /**
    * @override chart [mixin]
    **/
    _create_watcher(path, name, chart){
      let watcher = chart.watch || {}
      path = path || ''

      watcher = watcher || {}
      watcher.value = watcher.value || ''
      watcher.transform = watcher.transform || ''

      if(this.$options.unwatchers[path+name]){
        this.$options.unwatchers[path+name]()
        delete this.$options.unwatchers[path+name]
      }

      /**
      * process only if it's visible
      * saves CPU
      **/
      let generic_data_watcher = function(current){

        /**
        * managed charts doens't match (==) visibles[name]
        * so use it as a regexp
        */
        let visible_found = false
        if(chart.watch && chart.watch.managed == true){ //managed stats must run always
          let rg = new RegExp(name, 'ig')
          Object.each(this.visibles, function(bool, namaged){
            if(rg.test(namaged) == true && bool == true)
              visible_found = true
          })
        }

        if(
          (this.visibles[name] == true || visible_found == true)
          && this.freezed == false
          && this.highlighted == false
          && this.paused == false
          // || (chart.watch && chart.watch.managed == true) //managed stats must run always
        ){

          console.log('generic_data_watcher', name, this.visibles[name], visible_found, this.freezed)
          
          this.generic_data_watcher(current, chart, name, this.update_chart_stat.bind(this))
        }
      }

      // console.log('gonna watch...', name, path)
      // this.$options.unwatchers[path+name] = this.$watch(path+watch_name, generic_data_watcher)
      this.$options.unwatchers[path+name] = this.$watch(path, generic_data_watcher)

    },

    update_chart_stat (name, data){

      if(this.hide[name] != true){

        let has_data = true
        Array.each(data, function(columns){
           has_data = columns.some(function(column, index){
             if(index == 0) return false//timestamp column
             return column != 0;
          });
        })


        if(!this.$options.has_no_data[name])
          this.$options.has_no_data[name] = 0

        this.$options.has_no_data[name] = (has_data == true) ? 0 : this.$options.has_no_data[name] + 1

        if(this.$options.has_no_data[name] > 60){//60 = a minute, once hidden, user should unhide it
          // this.$set(this.hide, name, true)
          let hide = Object.clone(this.hide)
          hide[name] = true
          this.$set(this, 'hide', hide)//or won't work the watch.hide
        }

        if(
          this.stats[name].lastupdate < Date.now() - this.charts[name].interval
          && (this.$refs[name]
            && this.$refs[name][0]
            && this.$refs[name][0].chart != null
          )
          && ( this.visibles[name] != false || this.freezed == true )
          && this.highlighted == false
          && this.paused == false
          && this.stats[name].data.length > 0 && this.stats[name].data[0].length > 0
        ){

          /**
          * @start
          * moved from outside this 'if'
          **/
          console.log('update_chart_stat', name)



          /**
          * always update data, allow a hidden chart to update graphs on visibility change
          **/
          this.$set(this.stats[name], 'data', data)
          /**
          * @end
          * moved from outside this 'if'
          **/

          this.$refs[name][0].update()//default update

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
    font-size: 11px;/* colo: 10 -> 11 */
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

.dygraph-legend {
    color: #6c7075;
    font-size: 11px;
}

.dygraph-axis-label {
    color: #6c7075;
    font-size: 11px;
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
