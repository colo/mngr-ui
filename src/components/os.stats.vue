<template>
  <div class="col-sm-12 col-md-19">
    <q-list>
      <os-summary
        v-if="reset == false"
        :EventBus="EventBus"
        :host="currentHost"
        :key="'os-summary'+currentHost"
      />
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
        //   //////console.log('data', state, payload)
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
        // ////////console.log('seconds to splice', state.app.range)

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
      console.log('store.state.app.reset', val)
    },
    '$store.state.app.freeze' : function(val){
      console.log('store.state.app.freeze', val)
    },
    '$store.state.app.pause' : function(val){
      console.log('store.state.app.pause', val)
    },
    '$store.state.app.suspend' : function(val){
      console.log('store.state.app.suspend', val)
    },

  },
  mounted: function(){
    console.log('os.stats.vue mounted')
    // this.$store.commit('app/reset', false)
  },
  updated: function(){
    this.$store.commit('app/reset', false)
    console.log('os.stats.vue updated', this.$store.state.app)
  },
  created: function(){
    console.log('os.stats.vue created')

    if(!window['EventBus'])
      window['EventBus'] = this.EventBus

    let self = this;


    this.EventBus.$on('os.historical', doc => {
      //console.log('recived doc via Event os.historical', doc)

      let {keys, path, host} = this.extract_data_os_historical_doc(doc)

      let register_commit = function(){
        let register = this.register_host_store_module(host, path, keys)

        if(register == true){
          Object.each(keys, function(data, key){


            this.$store.commit('hosts/'+host+'/'+path+'/data', {key: key, value: data })

            let divisor = (path == 'os/minute') ? 60 : 3600
            let splice = ((this.seconds / divisor) < 1) ? 1 : Math.trunc((this.seconds / divisor))

            //console.log('recived doc via Event os.historical', path, divisor, splice, this.seconds)

            this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: splice })

            // this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: this.seconds })
          }.bind(this))
        }

        return register
      }.bind(this)


      if(register_commit() != true){
        let interval = setInterval(function(){
          //console.log('historical_interval', interval)

          if(register_commit() == true){
            clearInterval(interval)
          }


        }.bind(this), 1000)
      }


		})

    this.EventBus.$on('os', doc => {

        let {keys, path, host} = this.extract_data_os_doc(doc)

        let register_commit = function(){
          let register = this.register_host_store_module(host, path, keys)
          if(register == true){
            Object.each(keys, function(data, key){
              this.$store.commit('hosts/'+host+'/'+path+'/data', {key: key, value: data })
              this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: this.seconds })
            }.bind(this))
          }

          return register
        }.bind(this)

        if(register_commit() != true){
          let interval = setInterval(function(){
            //console.log('os_interval', interval, path)

            if(register_commit() == true){
              clearInterval(interval)
            }


          }.bind(this), 1000)
        }

		})

	},

  methods: {
    extract_data_os_historical_doc(doc){
      let type = ''
      let range = {}
      if(Array.isArray(doc)){
        type = host = doc[0].doc.metadata.type
        range = host = doc[0].doc.metadata.range
      }
      else{
        type = doc.metadata.type
        range = doc.metadata.range
      }

      let {keys, path, host} = this.extract_data_os_doc(doc)
      path = path.replace('historical', type)

      Object.each(keys, function(data, key){
        if(Array.isArray(data)){
          Array.each(data, function(value, index){
            data[index].range = range
          })
        }
        else{
          data.range = range
        }
      })

      return {keys: keys, path: path, host: host}
    },
    extract_data_os_doc(doc){
      let keys = {}
      let path = ''
      let host = ''

      if(Array.isArray(doc)){
        Object.each(doc[0].doc.data, function(data, key){
          keys[key] = []
        })

        path = doc[0].doc.metadata.path.replace(/\./g, '/')
        host = doc[0].doc.metadata.host

        Array.each(doc, function(item){
          Object.each(item.doc.data, function(value, key){
            let data = {value: value, timestamp: item.doc.metadata.timestamp}
            keys[key].push(data)
          })
        }.bind(this))
      }
      else {
        Object.each(doc.data, function(data, key){
          keys[key] = null
        })
        path = doc.metadata.path.replace(/\./g, '/')
        host = doc.metadata.host

        Object.each(doc.data, function(value, key){
          let data = {value: value, timestamp: doc.metadata.timestamp}
          keys[key] = data
        })
      }
      return {keys: keys, path: path, host: host}
    },
    register_host_store_module (host, path, keys){
      let state_props = (keys) ? Object.clone(keys) : {}
      Object.each(state_props, function(data, key){
        state_props[key] = []
      })
      // ////////console.log('registering....', state_props)

      let stats = Object.merge(Object.clone(hostStats), {state: function() {
        return state_props
      }})

      // ////////console.log('this.check_store_path', path, this.check_store_path(path.split('/'), this.$store.state.hosts[host]))

      // if(!this.$store.state.hosts[host][path]){
      let status = this.check_store_path(path.split('/'), this.$store.state.hosts[host])
      ////////console.log('status', status)
      if(status == false){

        // this.$store.registerModule(['hosts', host, path], stats)
        let new_path = ['hosts', host]
        new_path = new_path.append(path.split('/'))
        this.$store.registerModule(new_path, stats)

        //////console.log('registering....', host, path, this.$store.state.hosts[host])

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
      // ////////console.log('check_store_path', path)
      for(let i = 0; i < path.length; ){
        if(root == undefined){
          return undefined
        }
        else if(root[path[i]] == undefined && i == path.length - 1){//last path item
          return false
        }
        else if(i < path.length - 1){
          let tmp_root = root[path[i]]
          return this.check_store_path([path[++i]], tmp_root)
        }
        else{
          return true
        }
      }
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
