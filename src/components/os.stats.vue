<template>
  <div class="col-sm-12 col-md-19">
    <q-list>
      <!-- <os-summary
        v-if="reset == false"
        :mem="mem"
        :cpu="cpu_simple"
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
      <!-- :networkInterfaces="networkInterfaces"
      :uptime="uptime"
      :loadavg="loadavg" -->
      <!-- :timestamps="timestamps" -->

    </q-list>

  </div>

</template>

<script>

import { mapState } from 'vuex'
import Vue from 'vue'

import osDashboard from './charts/os.dashboard'
import osSummary from './charts/os.summary'

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

// const hostStatsDefaultMutation = function(state, payload) {
//   if(Array.isArray(payload)){
//     // state.networkInterfaces = payload
//     Vue.set(state, payload.key, payload.value)
//
//     // ////////console.log(state.networkInterfaces)
//   }
//   else {
//     state[payload.key].push(payload.value)
//   }
// }

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
      // computed_doc_properties_state: {}
      // reset: false
      // seconds: 300, //define the N timestamps to show
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
      /**
      * @moved: os.dashboard.vue generates dinamically
      */
      // uptime: function(state){
      //   let uptime = []
      //   if(state.hosts.current){
      //     let currentHost = state.hosts.current
      //
      //     if(state.hosts[currentHost].os)
      //       uptime = state.hosts[currentHost].os.uptime
      //     // //////////console.log('current uptime host', currentHost)
      //   }
      //
      //   return uptime
      // },
      // loadavg: function(state){
      //   let loadavg = {current: [], minute: []}
      //   if(state.hosts.current){
      //     let currentHost = state.hosts.current
      //
      //     if(state.hosts[currentHost].os){
      //       loadavg.current = state.hosts[currentHost].os.loadavg
      //
      //       if(state.hosts[currentHost].os.minute){
      //         // //console.log('state.hosts[currentHost].os.minute', state.hosts[currentHost].os.minute.loadavg)
      //         loadavg.minute = state.hosts[currentHost].os.minute.loadavg
      //       }
      //
      //     }
      //
      //   }
      //
      //   return loadavg
      // },
      // mem: function(state){
      //   let mem = []
      //   if(state.hosts.current){
      //     let currentHost = state.hosts.current
      //     // mem = state.hosts[currentHost].os.mem
      //
      //     if(state.hosts[currentHost].os){
      //       let freemem = state.hosts[currentHost].os.freemem
      //       let totalmem = state.hosts[currentHost].os.totalmem
      //
      //       Array.each(freemem, function(free, index){
      //         let data = {
      //           total: totalmem[index].value,
      //           free: free.value,
      //           timestamp: free.timestamp
      //         }
      //         let percentage = 100
      //
      //         if(data.total != 0)
      //           percentage -= data.free * 100 / data.total;
      //
      //         data.percentage = percentage
      //
      //
      //         mem.push(data)
      //       })
      //     }
      //
      //   }
      //
      //   return mem
      // },
      // cpu: function(state){
      //   let cpu = []
      //   if(state.hosts.current){
      //     let currentHost = state.hosts.current
      //
      //     if(state.hosts[currentHost].os)
      //       cpu = state.hosts[currentHost].os.cpu
      //   }
      //
      //   return cpu
      // },
      // cpu_simple: function(state){
      //   let cpu_simple = []
      //   if(state.hosts.current){
      //     let currentHost = state.hosts.current
      //     // cpu_simple = state.hosts[currentHost].os.cpu_simple
      //
      //     if(state.hosts[currentHost].os){
      //       let cpus = state.hosts[currentHost].os.cpus
      //
      //       Array.each(cpus, function(row, index){
      //
      //         let last = (!cpus[index - 1]) ? null : this.format_cpu_simple(cpus[index - 1])
      //
      //         // //////////console.log('cpu_simple last', last)
      //
      //         cpu_simple.push(this.format_cpu_simple(row, last))
      //       }.bind(this))
      //     }
      //   }
      //
      //   // ////////console.log('cpu_simple', cpu_simple)
      //   return cpu_simple
      // },
      // networkInterfaces: function(state){
      //   let networkInterfaces = []
      //   if(state.hosts.current){
      //     let currentHost = state.hosts.current
      //
      //   // ////////console.log('state.hosts[currentHost].os.networkInterfaces', state.hosts[currentHost].os)
      //     if(state.hosts[currentHost].os)
      //       networkInterfaces = state.hosts[currentHost].os.networkInterfaces
      //   }
      //
      //   return networkInterfaces
      // }
    })

  ),
  watch:{
    // // '$store.state.app.range' : function(val){
    // //
    // //   this.$store.commit('app/reset', true)
    // //
    // //   // this.reset = true
    // //   // let currentHost = this.$store.state.hosts.current
    // //   // this.$store.commit('hosts/'+currentHost+'/stats/reset')
    // //   // //////////console.log('$store.state.app.range....', this.$store.state.hosts[currentHost].stats)
    // // },
    // '$store.state.hosts.all' : function(val){
    //   // //////////console.log('$store.state.hosts.all', this.$store.state.hosts.all)
    //   Array.each(this.$store.state.hosts.all, function(host){
    //     // register a nested module `nested/myModule`
    //     if(!this.$store.state.hosts[host].stats){
    //       // //////////console.log('registering....', host, hostStats)
    //       this.$store.registerModule(['hosts', host, 'stats'], hostStats)
    //       this.$store.registerModule(['hosts', host, 'stats', 'minute'], hostStats)
    //     }
    //       // this.$store.commit('hosts/'+host+'/seconds', self.seconds)
    //   }.bind(this))
    //
    // }
  },
  updated: function(){
    this.$store.commit('app/reset', false)
  },
  created: function(){
    if(!window['EventBus'])
      window['EventBus'] = this.EventBus

    let self = this;

    // this.$store.subscribe((mutation, state) => {
    //   let type = mutation.type.replace(/\//g, '.')
    //
    //   /**
    //   * match os.data|os.minute.data|os.blockdevices.data|...
    //   */
    //   let os_regexp = '^hosts\.'+this.currentHost+'\.os.*\.data'
    //   let os = new RegExp(os_regexp);
    //
    //   if(type.test(os)== true){
    //     //console.log('mutation.type', type)
    //     //console.log('mutation.payload', mutation.payload)
    //   }
    // })


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

    //
    //   let keys = {}
    //   keys[doc.type] = []
    //
    //   if(this.register_host_store_module(doc.host, 'os/'+doc.messure, keys) == true){
    //
    //     this.$store.commit('hosts/'+doc.host+'/os/'+doc.messure+'/data', { key: doc.type, value: doc.data })
    //
    //     let divisor = (doc.messure == 'minute') ? 60 : 3600
    //     let splice = ((this.seconds / divisor) < 1) ? 1 : Math.trunc((this.seconds / divisor))
    //
    //     this.$store.commit('hosts/'+doc.host+'/os/'+doc.messure+'/splice', { key: doc.type, length: splice })
    //   }
    //
		})

    this.EventBus.$on('os', doc => {
      // ////////console.log('recived doc via Event os', doc)

      // if(Array.isArray(doc)){

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

      // }
      // else{
      //
      //   let {keys, path, host} = this.extract_data_os_doc(doc)
      //
      //   if(this.register_host_store_module(host, path, keys) == true){
      //     Object.each(keys, function(data, key){
      //       this.$store.commit('hosts/'+host+'/'+path+'/data', {key: key, value: data })
      //       this.$store.commit('hosts/'+host+'/'+path+'/splice', { key: key, length: this.seconds })
      //     }.bind(this))
      //
      //   }
      //
      // }
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
    // register_module_recursive_path(path, root, module){
    //   for(let i = 0; i < path.length; ){
    //     if(root[path[i]] == undefined && i == path.length - 1){//last path item
    //       root[path[i]].registerModule()
    //     }
    //     else if(){
    //
    //     }
    //     else{
    //       return this.check_store_path(path[++i], root[path[i]])
    //     }
    //   }
    // },
    // check_store_path(path, root){
    //   ////////console.log('check_store_path', path)
    //   // let paths = path.split('/')
    //   for(let i = 0; i < path.length; ){
    //     if(root[path[i]] == undefined){
    //       return false
    //     }
    //     else if(){
    //
    //     }
    //     else{
    //       return this.check_store_path(path[++i], root[path[i]])
    //     }
    //   }
    //
    //
    // },
    format_cpu_simple (doc, prev){

      let doc_simple = { idle: 0, total: 0 }
      Array.each(doc.value, function(core){
        Object.each(core.times, function(value, key){

          if(key == 'idle')
            doc_simple.idle += value

          doc_simple.total += value


        })
      })

      let cpu_simple = {
        total: doc_simple.total,
        idle: doc_simple.idle,
        timestamp: doc.timestamp
      }

      if(prev == null)
        prev = {
          total: 0,
          idle: 0,
          timestamp: 0
        }

      let diff_time = cpu_simple.timestamp - prev.timestamp
      let diff_total = cpu_simple.total - prev.total;
      let diff_idle = cpu_simple.idle - prev.idle;

      //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
      let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10
      // self.cpu.percentage = (percentage.toFixed(2) > 100) ? 100 : percentage.toFixed(2);

      cpu_simple.percentage = (percentage > 100) ? 100 : percentage

      return cpu_simple
    }
  }
}
</script>
