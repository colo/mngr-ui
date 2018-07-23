<template>
  <div class="col-sm-12 col-md-19">
    <q-list>
      <!-- <os-summary
        v-if="reset == false"
        :EventBus="EventBus"
        :host="currentHost"
        :key="'os-summary'+currentHost"
      /> -->
      <!-- :timestamps="timestamps" -->

      <os-dashboard
        v-if="reset == false"
        :EventBus="EventBus"
        :host="currentHost"
        :key="'os-dashboard'+currentHost"
      />

    </q-list>

  </div>

</template>

<script>

let extract_data_os = require( 'node-mngr-docs' ).extract_data_os
let extract_data_os_historical = require( 'node-mngr-docs' ).extract_data_os_historical


import { mapState } from 'vuex'
import Vue from 'vue'

import osDashboard from './os.dashboard'
import osSummary from './os.summary'

// import hostStats from '../store/stats'
let hostStats = {
  namespaced: true,
  state: {},
  getters: {},
  actions: {},
  mutations: {
    data: function(state, payload) {//generic mutation
      if(Array.isArray(payload.value)){
        // state.networkInterfaces = payload
        Vue.set(state, payload.key, payload.value)


      }
      else {

        // if(payload.key == 'loadavg'){
        //   ////////console.log('data', state, payload)
        // }

        state[payload.key].push(payload.value)
      }
    },
    splice: (state, payload) => {

      let length = state[payload.key].length
      state[payload.key].splice(
        -payload.length -1,
        length - payload.length
      )
    }
  }
}


export default {
  name: 'osstats',

  components: {
    osDashboard,
    osSummary
  },

  modules_blacklist: {
    'os': /[\s\S]*/,
    'os/blockdevices': /sd.*/
  },
  modules_whitelist: {
    'os': /freemem|totalmem/,
  },

  // template: '<div><osdygraphs '+
  //           ':mem="mem" :cpu="cpu" '+
  //           ':uptime="uptime" '+
  //           ':loadavg="loadavg"'+
  //           ':timestamps="timestamps"'+
  //           ':networkInterfaces="networkInterfaces"'+
  //           '/></div>',
  props: {
    EventBus: {
      type: [Object],
       default: () => ({})
    },
  },
  data () {
    return {
    }
  },
  computed: Object.merge(
    mapState({
      reset: state => state.app.reset,
      // arrow functions can make the code very succinct!
      seconds: function(state){
        // //////////console.log('seconds to splice', state.app.range)

        let end = new Date().getTime()
        if(state.app.range[1] != null)
          end = state.app.range[1]

        let seconds = Math.trunc( (end - state.app.range[0]) / 1000 )


        return seconds
      },
      hosts: state => state.hosts.all,
      currentHost: state => state.hosts.current,

    })

  ),
  watch:{
    '$store.state.app.reset' : function(val){
      //console.log('store.state.app.reset', val)
    },
    '$store.state.app.freeze' : function(val){
      //console.log('store.state.app.freeze', val)
    },
    '$store.state.app.pause' : function(val){
      //console.log('store.state.app.pause', val)
    },
    '$store.state.app.suspend' : function(val){
      //console.log('store.state.app.suspend', val)
    },

  },
  mounted: function(){
    //console.log('os.stats.vue mounted')
    // this.$store.commit('app/reset', false)
  },
  updated: function(){
    this.$store.commit('app/reset', false)
    // //console.log('os.stats.vue updated', this.$store.state.app)
  },
  created: function(){
    //console.log('os.stats.vue created')

    if(!window['EventBus'])
      window['EventBus'] = this.EventBus

    let self = this;


    // this.EventBus.$on('os.historical', doc => {
    this.EventBus.$on('historical.os', doc => {
      ////console.log('recived doc via Event os.historical', doc)

      let {keys, path, host} = this.extract_data_os_historical_doc(doc)

      let register_commit = function(){
        let register = this.register_host_store_module(host, path, keys)

        if(register == true){
          Object.each(keys, function(data, key){

            // //console.log('recived doc via Event os.historical', 'hosts/'+host+'/'+path+'/data', key, data)

            this.$store.commit('hosts/'+host+'/'+path+'/data', {key: key, value: data })

            console.log('PATH', path)

            let divisor = (path.indexOf('minute') >= 0 ) ? 60 : 3600
            let splice = ((this.seconds / divisor) < 1) ? 1 : Math.trunc((this.seconds / divisor))

            ////console.log('recived doc via Event os.historical', path, divisor, splice, this.seconds)

            this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: splice })

            // this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: this.seconds })
          }.bind(this))
        }

        return register
      }.bind(this)


      if(register_commit() != true){
        let interval = setInterval(function(){
          ////console.log('historical_interval', interval)

          if(register_commit() == true){
            clearInterval(interval)
          }


        }.bind(this), 1000)
      }


		})

    this.EventBus.$on('os', doc => {

      let register_commit = function(host, path, keys){
        let register = this.register_host_store_module(host, path, keys)
        if(register == true){
          Object.each(keys, function(data, key){

            console.log('register_host_store_module',path, key)

            this.$store.commit('hosts/'+host+'/'+path+'/data', {key: key, value: data })
            this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: this.seconds })

          }.bind(this))
        }

        return register
      }.bind(this)

      let {keys, path, host} = this.extract_data_os_doc(doc)
      // console.log('pre register_host_store_module',path, keys)

      Object.each(keys, function(data, key){
        if(
          this.$options.modules_blacklist
          && this.$options.modules_blacklist[path]
          && this.$options.modules_blacklist[path].test(key) == true
          && (
            ! this.$options.modules_whitelist
            || !this.$options.modules_whitelist[path]
            || this.$options.modules_whitelist[path].test(key) != true
          )
        ){
            // console.log('deleting...', path, key)
            delete keys[key]
        }
      }.bind(this))

      // if(Object.getLength(keys) > 0){
        if(register_commit(host, path, keys) != true){
          let interval = setInterval(function(){
            ////console.log('os_interval', interval, path)

            if(register_commit(host, path, keys) == true){
              clearInterval(interval)
            }


          }.bind(this), 1000)
        }
      // }

		})

	},

  methods: {

    extract_data_os_historical_doc: extract_data_os_historical,
    extract_data_os_doc: extract_data_os,

    register_host_store_module (host, path, keys){
      let state_props = (keys) ? Object.clone(keys) : {}
      Object.each(state_props, function(data, key){
        state_props[key] = []
      })

      // console.log('registering....', host, path, keys)

      let stats = Object.merge(Object.clone(hostStats), Object.clone({state: function() {
        return state_props
      }}))

      // //////////console.log('this.check_store_path', path, this.check_store_path(path.split('/'), this.$store.state.hosts[host]))

      // if(!this.$store.state.hosts[host][path]){
      let status = this.check_store_path(path.split('/'), this.$store.state.hosts[host])
      //////////console.log('status', status)
      if(status == false){

        // this.$store.registerModule(['hosts', host, path], stats)
        let new_path = ['hosts', host]
        new_path = new_path.append(path.split('/'))
        this.$store.registerModule(new_path, stats)

        // console.log('registering....', host, new_path, this.$store.state.hosts[host])

        return true
      }
      else if(status == undefined){
        return false
      }
      else{
        return true
      }
    },
    check_store_path(path, root){
      // console.log('registering check_store_path', path)
      // for(let i = 0; i < path.length; ){
        if(root == undefined){
          return undefined
        }
        else if(root[path[0]] == undefined && path.length == 1){//last path item
          return false
        }
        // else if(i < path.length - 1){
        else if(path.length > 1){
          let tmp_root = root[path[0]]
          // return this.check_store_path([path[++i]], tmp_root)
          path.shift()
          return this.check_store_path(path, tmp_root)
        }
        else{
          return true
        }
      // }
    },

    // format_cpu_simple (doc, prev){
    //
    //   let doc_simple = { idle: 0, total: 0 }
    //   Array.each(doc.value, function(core){
    //     Object.each(core.times, function(value, key){
    //
    //       if(key == 'idle')
    //         doc_simple.idle += value
    //
    //       doc_simple.total += value
    //
    //
    //     })
    //   })
    //
    //   let cpu_simple = {
    //     total: doc_simple.total,
    //     idle: doc_simple.idle,
    //     timestamp: doc.timestamp
    //   }
    //
    //   if(prev == null)
    //     prev = {
    //       total: 0,
    //       idle: 0,
    //       timestamp: 0
    //     }
    //
    //   let diff_time = cpu_simple.timestamp - prev.timestamp
    //   let diff_total = cpu_simple.total - prev.total;
    //   let diff_idle = cpu_simple.idle - prev.idle;
    //
    //   //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
    //   let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10
    //   // self.cpu.percentage = (percentage.toFixed(2) > 100) ? 100 : percentage.toFixed(2);
    //
    //   cpu_simple.percentage = (percentage > 100) ? 100 : percentage
    //
    //   return cpu_simple
    // }
  }
}
</script>
