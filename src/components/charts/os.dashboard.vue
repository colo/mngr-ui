<template>

    <div>

      <!-- OS stats -->

     <q-collapsible
      :no-ripple="true"
      :opened="true"
      icon="info"
      :label="name"
      :separator="true"
      header-class="text-primary bg-white"
      v-for="(stat, name) in os_charts"
      :key="name"
      :name="name"
     >

      <el-card shadow="hover">
       <!-- <at-card :bordered="false"> -->
         <!-- <div
          :id="name"
          :style="stat.style"
          v-observe-visibility="visibilityChanged"
          >
        </div> -->

          <dygraph-vue
           :visible="visibles[host+'_'+name]"
           :ref="host+'_'+name"
           :id="host+'_'+name"
           :options="stat"
           :stat="stats[name]"
           :EventBus="EventBus"
           :freezed="freezed"
           v-observe-visibility="visibilityChanged"
           >
          </dygraph-vue>

       <!-- </at-card> -->
     </el-card>



     </q-collapsible>

     <template v-for="(stat, iface) in networkInterfaces_stats">

       <q-collapsible
         :no-ripple="true"
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

        <el-card shadow="hover">
         <!-- <at-card :bordered="false"> -->
           <!-- <div
             :id="iface+'-'+messure"
             :style="$options.net_stats.style"
             v-observe-visibility="visibilityChanged"
           ></div> -->

             <dygraph-vue
              :visible="visibles[host+'_'+iface+'-'+messure]"
              :ref="host+'_'+iface+'-'+messure"
              :id="host+'_'+iface+'-'+messure"
              :options="networkInterfaces_stats[iface][messure].options"
              :stat="networkInterfaces_stats[iface][messure]"
              :EventBus="EventBus"
              :freezed="freezed"
              v-observe-visibility="visibilityChanged"
              >
             </dygraph-vue>

         <!-- </at-card> -->
       </el-card>

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

import DefaultDygraphLine from './js/default.dygraph.line'
import os_static_charts from './js/os.static.charts'
import os_dynamic_charts from './js/os.dynamic.charts'
import net_stats from './js/net.dashboard'

import { mapState } from 'vuex'

export default {
  // name: 'App',
  name: 'osdygraphs',

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
    // timestamps: {
    //   type: [Array],
    //   default: () => ([])
    // },
    // mem: {
    //   type: [Object],
    //   default: () => ({})
    // },
    // cpu: {
    //   type: [Object],
    //    default: () => ({})
    // },
    // uptime: {
    //   type: [Array],
    //   default: () => ([])
    // },
    // loadavg: {
    //   type: [Object],
    //   default: () => ({})
    // },
    // networkInterfaces: {
    //   type: [Array],
    //   default: () => ([])
    // }
  },


  net_stats: net_stats,
  os_static_charts: os_static_charts,
  os_dynamic_charts: os_dynamic_charts,

  blacklist_keys: /minute|totalmem|networkInterfaces/, //don't add charts automatically for this os[key]
  // watch_value: [
  //   {
  //     match: /blockdevices\..*/,
  //     value: 'stats'
  //   }
  // ],
  sync: null,
  unwatchers: {},
  // visibles: {},

  data () {
    return {
      visibles: {},
      highlighted: false,
      expanded: [],
      // charts : {},
      os_charts: {},
      stats: {},
      networkInterfaces_stats: {},
      // to_suspend: false,
      // suspended: false
      // networkInterfaces_charts: {},
      // uptime_stats: []
      os: {}
    }
  },

  mounted () {


    let self = this
    this.EventBus.$on('highlightCallback', function(params) {
      this.highlighted = true
      //////////////////console.log('event OS.DASHBOARD highlightCallback', self.$refs)
      self.sync_charts()
		})

    this.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      ////////////////////console.log('event OS.DASHBOARD unhighlightCallback', event)
      self.unsync_charts()
		})


    this.$watch('$store.state.hosts.'+this.host+'.os', function (val, oldVal) {
      // //////console.log('$store.state.hosts.'+this.host+'.os', val)
      
      this.add_os_key(val)

      Object.each(this.$options.os_static_charts, function(chart, name){
        chart = Object.merge(Object.clone(DefaultDygraphLine), chart)
        this.add_chart(chart, name)
      }.bind(this))

    }.bind(this))






  },

  watch: {

    // 'networkInterfaces_stats': function(val){
    //   //////////////console.log('$watched', this.$refs)
    // },
    // 'os.uptime': function(current){
    //   let minute = (this.$store.state.hosts[this.host].os.minute) ? this.$store.state.hosts[this.host].os.minute.uptime : null
    //   let val = {
    //     current: current,
    //     minute: minute
    //   }
    //
    //
    //   if(this.$refs[this.host+'_uptime'] && val.current.length > 0){
    //
    //     let data = []
    //     Array.each(val.current, function(uptime){
    //       data.push([new Date(uptime.timestamp), uptime.value, 0])//0, minute column
    //     })
    //
    //     Array.each(data, function(column, column_index){//insert minute stats
    //       let timestamp = column[0]
    //
    //       // if(this.stats.uptime.data[0].length > data[column_index].length){//means there is one colum for minute
    //         Array.each(val.minute, function(minute, minute_index){
    //           if(
    //             ( column_index < 60 && minute_index == 0) //put firt minute on first 60 secs
    //             || ( column_index > (data.length - 60) && minute_index == val.minute.length - 1 )//put last minute on last 60 secs
    //             || ( timestamp > minute.range.start && timestamp < minute.range.end ) //if column is in this range
    //           ){
    //             column[2] = minute.value.median
    //           }
    //         })
    //       // }
    //
    //     }.bind(this))
    //
    //     this.$set(this.stats.uptime, 'data', data)
    //
    //     if(
    //       this.stats.uptime.lastupdate < Date.now() - this.os_charts.uptime.interval &&
    //       this.$refs[this.host+'_uptime'][0].chart != null &&
    //       ( this.visibles[this.host+'_uptime'] != false || this.freezed == true ) &&
    //       this.highlighted == false &&
    //       this.paused == false
    //     ){
    //
    //
    //
    //       // this.sync_charts()
    //       // this.charts.uptime.updateOptions( { 'file': this.stats.uptime.data, 'dateWindow': this.charts.uptime.xAxisExtremes() } );
    //       this.$refs[this.host+'_uptime'][0].updateOptions(
    //         { 'dateWindow': this.$refs[this.host+'_uptime'][0].chart.xAxisExtremes() },
    //         false
    //       )
    //       this.stats.uptime.lastupdate = Date.now()
    //       // this.$forceUpdate()
    //     }
    //   }
    //
    // },
    // 'os.loadavg': function(current){
    //   let minute = (this.$store.state.hosts[this.host].os.minute) ? this.$store.state.hosts[this.host].os.minute.loadavg : null
    //   let val = {
    //     current: current,
    //     minute: minute
    //   }
    //
    //   // ////////console.log('loadavg', val)
    //
    //   if(this.$refs[this.host+'_loadavg'] && val.current.length > 0){
    //
    //     let data = []
    //
    //     Array.each(val.current, function(loadavg){
    //       let avg = []
    //       avg.push(new Date(loadavg.timestamp))
    //
    //       Array.each(loadavg.value, function(value){
    //         avg.push(value)
    //       })
    //
    //       avg.push(0)//add minute column
    //
    //       data.push(avg)
    //     })
    //
    //     Array.each(data, function(column, column_index){//insert minute stats
    //       let timestamp = column[0]
    //
    //       Array.each(val.minute, function(minute, minute_index){
    //         if(
    //           ( column_index < 60 && minute_index == 0) //put firt minute on first 60 secs
    //           || ( column_index > (data.length - 60) && minute_index == val.minute.length - 1 )//put last minute on last 60 secs
    //           || ( timestamp > minute.range.start && timestamp < minute.range.end ) //if column is in this range
    //         ){
    //           column[4] = minute.value.median
    //         }
    //       })
    //     })
    //
    //     // ////////console.log('loadavg data', data)
    //
    //     this.$set(this.stats.loadavg, 'data', data)
    //
    //
    //     if(
    //       this.stats.loadavg.lastupdate < Date.now() - this.os_charts.loadavg.interval &&
    //       this.$refs[this.host+'_loadavg'][0].chart != null &&
    //       ( this.visibles[this.host+'_loadavg'] != false  || this.freezed == true ) &&
    //       this.highlighted == false &&
    //       this.paused == false
    //     ){
    //       // this.sync_charts()
    //       // this.charts.loadavg.updateOptions( { 'file': this.stats.loadavg.data, 'dateWindow': this.charts.loadavg.xAxisExtremes() } )
    //       this.$refs[this.host+'_loadavg'][0].updateOptions(
    //         { 'dateWindow': this.$refs[this.host+'_loadavg'][0].chart.xAxisExtremes() },
    //         false
    //       )
    //       this.stats.loadavg.lastupdate = Date.now()
    //     }
    //
    //   }
    //
    // },


    'os.networkInterfaces': function(networkInterfaces){
      // //////console.log('networkInterfaces', networkInterfaces)

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
              let chart = Object.clone(self.$options.net_stats)

              self.$set(self.networkInterfaces_stats[iface], messure, {
                options: chart,
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
                  ////////console.log('stats.value[iface] undefined', iface)
                  /**
                  * should notify error??
                  **/
                }
              })

              self.$set(self.networkInterfaces_stats[iface][messure], 'data', data)
              // self.networkInterfaces_stats[iface][messure].data = data

          })

        })

        //////////////////////console.log('self.networkInterfaces_stats', self.networkInterfaces_stats)

        Object.each(this.networkInterfaces_stats, function(stat, iface){

          Object.each(stat, function(value, messure){


            // if(document.getElementById(iface+'-'+messure)){
            // //////////////console.log('updating NET', this.$refs)

            if(this.$refs[this.host+'_'+iface+'-'+messure]){

              // //////////////console.log('updating NET', this.freezed, this.networkInterfaces_stats)

              if(
                value.lastupdate < Date.now() - this.$options.net_stats.interval &&
                this.$refs[this.host+'_'+iface+'-'+messure][0].chart != null &&
                ( this.visibles[this.host+'_'+iface+'-'+messure] != false  || this.freezed == true ) &&
                this.highlighted == false &&
                this.paused == false
              ){

                // this.networkInterfaces_charts[iface+'-'+messure].updateOptions({
                //    'file': value.data,
                //    'dateWindow': this.networkInterfaces_charts[iface+'-'+messure].xAxisExtremes()
                //  });


                this.$refs[this.host+'_'+iface+'-'+messure][0].updateOptions(
                  { 'dateWindow': this.$refs[this.host+'_'+iface+'-'+messure][0].chart.xAxisExtremes() },
                  false
                )

                value.lastupdate = Date.now()

              }
            }

          }.bind(this))
        }.bind(this))



      }
    },
    // 'os.cpus': function(cpus){
    //   //////console.log('os.cpus', cpus)
    // },
    // 'os.blockdevices': function(blockdevices){
    //   //////console.log('os.blockdevices', blockdevices)
    //
    //   let self = this
    //   let devices = Object.keys(blockdevices)
    //
    // },
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
  // updated (){
  //   if(this.to_suspend == true)
  //     this.$nextTick(function(){this.suspended = true}.bind(this))
  //     // this.suspended = true
  //
  //
  //   //////////////console.log('updated suspended', this.to_suspend , this.suspended)
  // },
  methods: {
    add_os_key (val){
      //////console.log('add_os_key', val)

      Object.each(val, function(stat, key){

        /**
        * automatically add reactive property
        **/
        this.$set(this.os, key, this.$store.state.hosts[this.host].os[key])

        this.create_chart(stat, key)

      }.bind(this))
    },
    create_chart (stat, name){
      let watcher = {value: ''}
      /**
      * create chart automatically if it's not blacklisted
      **/
      if(
        this.$options.blacklist_keys.test(name) == false
        && Object.keys(this.$options.os_static_charts).contains(name) == false
      ){

        if(Array.isArray(stat)){//it's stat

            let dynamic_charts = {}
            Object.each(this.$options.os_dynamic_charts, function(dynamic){
              if(dynamic.match.test(name) == true){
                if(!dynamic_charts[name])
                  dynamic_charts[name] = []

                dynamic_charts[name].push(dynamic)
                // chart = Object.merge(chart, dynamic)
                // watcher = dynamic.watch
                //
                // Object.each(stat[0].value[watcher.value], function(tmp, tmp_key){
                //   chart.options.labels.push(tmp_key)
                // })
                //
                // chart.options.labels.push(name+'_minute')//minute
                // this.add_chart(chart, name, watcher)
              }
            }.bind(this))

            let chart = Object.clone(DefaultDygraphLine)
            chart.options.labels = ['Time']

            if(dynamic_charts[name]){
              Array.each(dynamic_charts[name], function(dynamic){

                if(Array.isArray(stat[0].value)){//like 'cpus'
                  // //console.log('isArray', stat[0].value)

                  Array.each(stat[0].value, function(val, index){

                    let arr_chart = Object.merge(Object.clone(chart), dynamic)
                    watcher = dynamic.watch

                    let chart_name = dynamic.name || name

                    if(watcher.merge != true){
                      chart_name += '_'+index
                    }
                    // else{
                    //   chart_name = name
                    // }

                    if(watcher.merge != true || index == 0){//merge creates only once instance

                      if(!dynamic.options || !dynamic.options.labels){
                        Object.each(val[watcher.value], function(tmp, tmp_key){
                          arr_chart.options.labels.push(tmp_key)
                        })

                        // arr_chart.options.labels.push(name+'_minute')//minute
                      }

                      this.add_chart(arr_chart, chart_name, watcher)


                    }




                  }.bind(this))



                }
                else if(isNaN(stat[0].value)){
                  //sdX.stats.

                  chart = Object.merge(chart, dynamic)
                  watcher = dynamic.watch

                  Object.each(stat[0].value[watcher.value], function(tmp, tmp_key){
                    chart.options.labels.push(tmp_key)
                  })

                  // chart.options.labels.push(name+'_minute')//minute
                  this.add_chart(chart, name, watcher)


                }
                else{
                  // //console.log('isNumber', name, stat[0], dynamic)
                  chart = Object.merge(Object.clone(chart), dynamic)
                  watcher = dynamic.watch

                  let chart_name = dynamic.name || name

                  if(!dynamic.options || !dynamic.options.labels){
                    chart.options.labels.push(name)
                  }

                  // chart.options.labels.push(name+'_minute')//minute
                  this.add_chart(chart, chart_name, watcher)
                }


              }.bind(this))
            }
            else{
              if(Array.isArray(stat[0].value)){//like 'loadavg', that has 3 values

                //////console.log('isArray', stat[0].value)

                for(let i= 0; i < stat[0].value.length; i++){//create data columns
                  chart.options.labels.push(name+'_'+i)
                }

                // chart.options.labels.push(name+'_minute')//minute
                this.add_chart(chart, name, watcher)
              }
              else if(!isNaN(stat[0].value)){//like 'uptime', one value only
                //console.log('isNumber', name, stat[0].value)

                chart.options.labels.push(name)

                // chart.options.labels.push(name+'_minute')//minute
                this.add_chart(chart, name, watcher)
              }
            }


        }
        else{//blockdevices.[key]
          Object.each(stat, function(data, key){
            this.create_chart(data, name+'.'+key)
          }.bind(this))

        }

      }
    },
    add_chart (chart, name, watcher){
      let data = [[]]
      if(chart.options.labels)
        Array.each(chart.options.labels, function(label, index){
          if(index == 0){
            data[0].push(Date.now())
          }
          else{
            data[0].push(0)
          }

        })

      // if(!this.stats[name])
      if(chart.init && typeOf(chart.init) == 'function')
        chart.init(this, chart, 'chart')

      this.$set(this.os_charts, name, chart)
      this.$set(this.stats, name, {lastupdate: 0, 'data': data })
      this.create_watcher(name, 'os', watcher)

      this.expanded.push(name)
    },
    create_watcher(name, path, watcher){
      watcher = watcher || {}
      watcher.value = watcher.value || ''
      watcher.transform = watcher.transform || ''

      // //console.log('create_watcher',path+'.'+name, this._watchers)

      let found = false
      if(Array.isArray(this._watchers)){
        Array.each(this._watchers, function(watcher){
          if(watcher.expression == path+'.'+name && watcher.user == true)//means user already added a watcher for this chart
            found = true
        })
      }

      if(found == false){
        // //console.log('creating watcher',path+'.'+name)

        if(this.$options.unwatchers[path+'.'+name]){
          this.$options.unwatchers[path+'.'+name]()
          delete this.$options.unwatchers[path+'.'+name]
        }

        let generic_data_watcher = function(current){
          //console.log('generic_data_watcher', this.host+'_'+name, current)

          // let minute = (this.$store.state.hosts[this.host][path].minute) ? this.$store.state.hosts[this.host][path].minute[name] : null
          let val = {
            current: current,
            // minute: minute
          }

          //////console.log('type_value', name, val.current)

          let type_value = null
          let value_length = 0
          if(watcher.value != ''){
            /**
            * val.current[0].value[0][watcher.value] = cpus[0].times
            * val.current[0].value[watcher.value] = blockdevices.sda.value.stats
            **/
            // let tmp_name = name.split('.')
            // tmp_name[1] = tmp_name[1] * 1 || null//tmp may be and 'index', ex: cpus->val.current.value[index]
            //
            // if(tmp_name[1] != null)

            type_value = (Array.isArray(val.current[0].value) && val.current[0].value[0][watcher.value]) ? val.current[0].value[0][watcher.value] : val.current[0].value[watcher.value]
            // value_length = (Array.isArray(val.current.value) && val.current.value[0][watcher.value]) ? val.current.value[0][watcher.value].length : val.current[0].value[watcher.value].length
          }
          else{
            type_value = val.current[0].value
            // value_length = val.current.length
          }



          if(this.$refs[this.host+'_'+name]){

            // //////console.log('generic_data_watcher watch_value', watch_value)

            let data = []


            if(Array.isArray(type_value)){//multiple values, ex: loadavg
              //////console.log('generic_data_watcher isArray', name, type_value)

              Array.each(val.current, function(current){
                let tmp_data = []
                tmp_data.push(new Date(current.timestamp))

                let value = null
                if(watcher.value != ''){
                  value = current.value[watcher.value]
                }
                else{
                  value = current.value
                }

                Array.each(value, function(real_value){
                  tmp_data.push(real_value)
                })

                // tmp_data.push(0)//add minute column

                data.push(tmp_data)
              })
            }
            else if(isNaN(type_value) || watcher.value != ''){


              if(Array.isArray(val.current[0].value) && val.current[0].value[0][watcher.value]){//cpus
                let index = (name.substring(name.indexOf('_') +1 , name.length - 1)) * 1
                ////console.log('generic_data_watcher isNanN', name, val, index)

                let val_current = []
                Array.each(val.current, function(current){
                  // ////console.log('CPU current', current)

                  let value = {}
                  Array.each(current.value, function(val, value_index){//each cpu

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

                  val_current.push({timestamp: current.timestamp, value: value})

                }.bind(this))

                // ////console.log('CPU new current', val_current)

                val.current = val_current
              }

              // else{//blockdevices.sdX
                let transformed_values = []
                if(typeOf(watcher.transform) == 'function'){
                  transformed_values = watcher.transform(val.current)
                }
                else{
                  transformed_values = val.current
                }

                ////console.log('transformed_values', transformed_values)

                Array.each(transformed_values, function(current){
                  let tmp_data = []
                  tmp_data.push(new Date(current.timestamp))

                  let value = null
                  if(watcher.value != ''){
                    value = current.value[watcher.value]
                  }
                  else{
                    value = current.value
                  }

                  Object.each(value, function(real_value){
                    real_value = real_value * 1
                    tmp_data.push(real_value)
                  })

                  // tmp_data.push(0)//add minute column

                  data.push(tmp_data)
                })

              // }


            }
            else{//single value, ex: uptime
              //////console.log('generic_data_watcher Num', name, type_value)
              if(typeOf(watcher.transform) == 'function'){
                val.current = watcher.transform(val.current)
              }

              Array.each(val.current, function(current){
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


            }




            // Array.each(data, function(column, column_index){//insert minute stats
            //   let timestamp = column[0]
            //
            //   // if(this.stats.uptime.data[0].length > data[column_index].length){//means there is one colum for minute
            //     Array.each(val.minute, function(minute, minute_index){
            //       if(
            //         ( column_index < 60 && minute_index == 0) //put firt minute on first 60 secs
            //         || ( column_index > (data.length - 60) && minute_index == val.minute.length - 1 )//put last minute on last 60 secs
            //         || ( timestamp > minute.range.start && timestamp < minute.range.end ) //if column is in this range
            //       ){
            //         column[column.length -1] = minute.value.median//last column
            //       }
            //     })
            //   // }
            //
            // }.bind(this))

            this.$set(this.stats[name], 'data', data)

            if(
              this.stats[name].lastupdate < Date.now() - this.os_charts.uptime.interval
              && this.$refs[this.host+'_'+name][0].chart != null
              && ( this.visibles[this.host+'_'+name] != false || this.freezed == true )
              && this.highlighted == false
              && this.paused == false
              && data.length > 0
            ){



              // this.sync_charts()
              // this.charts.uptime.updateOptions( { 'file': this.stats.uptime.data, 'dateWindow': this.charts.uptime.xAxisExtremes() } );

              this.$refs[this.host+'_'+name][0].updateOptions(
                { 'dateWindow': this.$refs[this.host+'_'+name][0].chart.xAxisExtremes() },
                false
              )
              this.stats[name].lastupdate = Date.now()
              // this.$forceUpdate()
            }
          }

        }

        let watch_name = name
        if(watch_name.indexOf('_') > 0 )//removes indixes, ex: cpu.0
          watch_name = watch_name.substring(0, watch_name.indexOf('_'))

        // //console.log('gonna watch...', path+'.'+watch_name)
        this.$options.unwatchers[path+'.'+watch_name] = this.$watch(path+'.'+watch_name, generic_data_watcher)
      }
    },

    visibilityChanged (isVisible, entry) {
      // this.visibles[entry.target.id.replace('-container','')] = isVisible

      this.$set(this.visibles, entry.target.id.replace('-container',''), isVisible)
      //////////console.log('visible', entry.target.id.replace('-container',''), this.visibles[entry.target.id.replace('-container','')])

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

        //////////////////console.log(this.$refs, this.host)
        Object.each(this.$refs, function(ref, name){

          // ////////////////console.log('charts', name, ref)

          if(ref[0] && ref[0].chart instanceof Dygraph
            && (this.visibles[name] != false || this.freezed == true ))
          {
            ////////////////console.log('charts', name, ref[0].chart, ref[0].chart instanceof Dygraph)

          // if(ref[0].chart instanceof Dygraph){

            gs.push(ref[0].chart)
            // sync.push(ref[0])
          }
        }.bind(this))

        // Object.each(this.charts, function(dygraph, name){
        //   if(this.visibles[name] == true){
        //     // //////////////////////console.log('charts', dygraph)
        //     gs.push(dygraph)
        //   }
        // }.bind(this))
        //
        // Object.each(this.networkInterfaces_charts, function(dygraph, name){
        //   if(this.visibles[name] == true){
        //     // //////////////////////console.log('networkInterfaces', dygraph)
        //     gs.push(dygraph)
        //   }
        // }.bind(this))

        // //////////////////////console.log(this.networkInterfaces_charts)
        //


        // ////////////////////console.log(gs)
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
        // //////////////////////console.log('detaching', this.$options.sync)
        this.$options.sync.detach()
        this.$options.sync = null
      }
    },

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

        // //////////////////////////////console.log('---timestamps---',formated)
      })

      // //////////////////////////////console.log('---timestamps---',formated)
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
