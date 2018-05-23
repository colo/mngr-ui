<template>

  <q-collapsible
    :no-ripple="true"
    :opened="true"
    icon="info"
    :separator="true"
    header-class="text-primary bg-white"
    label="System Overview"
  >

    <el-card shadow="hover">
     <!-- <at-card :bordered="false"> -->
       <div class="row justify-center">
         <div
          v-for="(chart, name) in charts"
          class="col-sm-2 col-md-3 justify-center"
          :key="host+'_'+name"
          :id="host+'_'+name+'-summary-card-container'"
          v-observe-visibility="visibilityChanged"
          >
          <!-- :style="chart.style" -->
            <!-- https://github.com/vuejs/babel-plugin-transform-vue-jsx/issues/86 -->

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

         </div>
      </div>
     <!-- </at-card> -->
   </el-card>

  </q-collapsible>

</template>

<script>

import qKnobWrapper from './qknob.wrapper'
import vueEasyPieChartWrapper from './vueEasyPieChart.wrapper'

import Dashboard from '../mixins/dashboard'

import { frameDebounce } from 'quasar'

// import static_charts from './js/os.summary'
import dynamic_charts from './js/os.summary'

import { mapState } from 'vuex'

export default {
  mixins: [Dashboard],

  // name: 'App',
  name: 'os-summary',

  components: {
    qKnobWrapper,
    vueEasyPieChartWrapper
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

  // DefaultChart: DefaultChart,

  // static_charts: static_charts,
  dynamic_charts: dynamic_charts,
  dynamic_whitelist: /freemem|cpus/,
  // dynamic_blacklist: /minute|totalmem/, //don't add charts automatically for this os[key]

  has_no_data: {},
  sync: null,
  visibles: {},


  data () {
    return {
      hide: {},
      visibles: {},
      highlighted: false,

    }
  },

  computed: Object.merge(
    mapState({
      paused: state => state.app.pause,
      freezed: state => state.app.freeze,
    })
  ),
  // updated: function(){
  //   this.$store.commit('app/reset', false)
  // },
  // created (){
  //
  //   let self = this
  //   this.EventBus.$on('highlightCallback', function(params) {
  //     this.highlighted = true
  //     ////////////////////////////console.log('event OS.DASHBOARD highlightCallback', self.$refs)
  //     self.sync_charts()
	// 	})
  //
  //   this.EventBus.$on('unhighlightCallback', event => {
  //     this.highlighted = false
  //     //////////////////////////////console.log('event OS.DASHBOARD unhighlightCallback', event)
  //     self.unsync_charts()
	// 	})
  // },

  mounted () {


    //if "remounted" the $watch ain't gonna work if it's not changed
    if(this.$store.state.hosts[this.host] && this.$store.state.hosts[this.host].os){
      // this.$set(this.os, {})
      // //console.log('remounted', this._watchers)
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

      // Object.each(this.$options.static_charts, function(chart, name){
      //   // chart = Object.merge(Object.clone(DefaultChart), chart)
      //   this.process_chart(chart, name)
      // }.bind(this))
    },


    /**
    * UI related
    **/
    visibilityChanged (isVisible, entry) {
      //console.log('visibilityChanged', isVisible, entry.target.id)
      // this.$set(this.visibles, entry.target.id.replace('-container',''), isVisible)
      this.$options.visibles[entry.target.id.replace('-summary-card-container','')] = isVisible

      frameDebounce(function() {//performance reasons
        // ////console.log('visibilityChanged frameDebounce')
        Object.each(this.$options.visibles, function(bool, visible){
          this.$set(this.visibles, visible, bool)
        }.bind(this))

      }.bind(this))()

    },
    // sync_charts(){
    //   if(this.$options.sync == null){
    //     let gs = []
    //     // let sync = []
    //
    //     ////////////////////////////console.log(this.$refs, this.host)
    //     Object.each(this.$refs, function(ref, name){
    //
    //       // //////////////////////////console.log('charts', name, ref)
    //
    //       if(ref[0] && ref[0].chart instanceof Dygraph
    //         && (this.visibles[name] != false || this.freezed == true ))
    //       {
    //         //////////////////////////console.log('charts', name, ref[0].chart, ref[0].chart instanceof Dygraph)
    //
    //       // if(ref[0].chart instanceof Dygraph){
    //
    //         gs.push(ref[0].chart)
    //         // sync.push(ref[0])
    //       }
    //     }.bind(this))
    //
    //     this.unsync_charts()
    //
    //     if(gs.length > 1){
    //       this.$options.sync = synchronize(gs, {
    //         zoom: true,
    //         // selection: true,
    //         range: false
    //       })
    //
    //
    //     }
    //   }
    // },
    // unsync_charts(){
    //   if(this.$options.sync){
    //     // //console.log('detaching', this.$options.sync)
    //     this.$options.sync.detach()
    //     this.$options.sync = null
    //   }
    // },
    beautifyLabel (label) {
      return label.replace('_', '.')
    },

    /**
    * @override dashboard [mixin]
    **/
    // add_chart (name, chart){
    //   this._add_chart('summary.'+name, chart)
    // },
    process_chart (chart, name){

      if(name.indexOf('summary.') < 0)
        name = 'summary.'+name


      if(!chart.watch || chart.watch.managed != true){

        this.add_chart(name, chart)
      }

      this._process_chart(chart, name)
    },
    /**
    * @override chart [mixin]
    **/
    create_watcher(name, watcher){
      // //console.log('gonna watch...', name, watcher)
      let watch_name = name
      if(watch_name.indexOf('_') > 0 )//removes indixes, ex: cpu.0
        watch_name = watch_name.substring(0, watch_name.indexOf('_'))

      watch_name = watch_name.replace('os.', '')
      watch_name = watch_name.replace('summary.', '')

      this._create_watcher('$store.state.hosts.'+this.host+'.os.'+watch_name, name, watcher)
    },
    /**
    * @override chart [mixin]
    **/
    /**
    * update chart data
    **/
    // update_chart_stat (name, data){
    //   //console.log('summary update_chart_stat', name, data)
    // },
    update_chart_stat (name, data){
      // //console.log('update_chart_stat', name, data)

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

        //console.log('has_data ', name, has_data, this.$options.has_no_data[name])

        this.$set(this.stats[name], 'data', data)

        // //console.log('update_chart_stat', this.$refs, name)

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
          // //console.log('update_chart_stat', name, data)

          this.$refs[this.host+'_'+name][0].update()
          this.stats[name].lastupdate = Date.now()
          // this.$forceUpdate()
        }

      }
    },

  },
}
</script>

<style>
</style>
