<template>
  <div class="col-sm-12 col-md-19">
    <q-list>
      <os-summary
        :mem="mem"
        :cpu="cpu_simple"
        :EventBus="EventBus"
        :host="currentHost"
        :key="'os-summary'+currentHost"
      />
      <!-- :timestamps="timestamps" -->

      <os-dashboard
        :networkInterfaces="networkInterfaces"
        :uptime="uptime"
        :loadavg="loadavg"
        :EventBus="EventBus"
        :host="currentHost"
        :key="'os-dashboard'+currentHost"
      />
      <!-- :timestamps="timestamps" -->

    </q-list>

  </div>

</template>

<script>

import { mapState } from 'vuex'

import osDashboard from './charts/os.dashboard'
import osSummary from './charts/os.summary'

import hostStats from '../store/stats'

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
  // computed: {
  //   hosts () {
  //     console.log('computed.hosts')
  //     return this.$store.state.hosts.all
  //   }
  // },
  computed: Object.merge(
    // {
    //   uptime: function(){
    //     let uptime = []
    //     if(this.$store.state.hosts.current){
    //       let currentHost = this.$store.state.hosts.current
    //       uptime = this.$store.state.hosts[currentHost].stats.uptime
    //     }
    //
    //     return uptime
    //   }
    // },
    // {
    //   'stats.uptime.data': function () {
    //     let self = this
    //     let data = this.stats.uptime.data
    //
    //     Array.each(self.$store.state.hosts[this.currentHost].stats.uptimes, function(uptime){
    //       console.log('self.$store.state.hosts[this.currentHost].stats.uptimes', uptime)
    //       data.push([new Date(uptime.timestamp), uptime.value])
    //     })
    //
    //     if(
    //       this.stats.uptime.lastupdate < Date.now() - this.$options.stats.uptime.interval &&
    //       this.$options.visibles['uptime'] == true
    //     ){
    //       // this.sync_charts()
    //       this.charts.uptime.updateOptions( { 'file': this.stats.uptime.data, 'dateWindow': this.charts.uptime.xAxisExtremes() } );
    //       this.stats.uptime.lastupdate = Date.now()
    //       // this.$forceUpdate()
    //     }
    //
    //     return data
    //   },
    // },
    // {
    //   currentHost: {
    //     get () {
    //       let host = this.$store.state.hosts.current
    //       if(host == '' && this.hosts.length == 1){
    //         host = this.hosts[0]
    //         this.$store.commit('hosts/current', host)
    //       }
    //       return host
    //     },
    //     // setter
    //     set (value) {
    //       console.log('setting host...', value)
    //       this.$store.commit('hosts/current', value)
    //     }
    //   }
    // },
    mapState({
      // arrow functions can make the code very succinct!
      seconds: function(state){
        let seconds = state.app.range[0] - state.app.range[1]
        return seconds
      },
      hosts: state => state.hosts.all,
      currentHost: state => state.hosts.current,
      uptime: function(state){
        let uptime = []
        if(state.hosts.current){
          let currentHost = state.hosts.current
          uptime = state.hosts[currentHost].stats.uptime
          // console.log('current uptime host', currentHost)
        }

        return uptime
      },
      loadavg: function(state){
        let loadavg = []
        if(state.hosts.current){
          let currentHost = state.hosts.current
          loadavg = state.hosts[currentHost].stats.loadavg
        }

        return loadavg
      },
      mem: function(state){
        let mem = []
        if(state.hosts.current){
          let currentHost = state.hosts.current
          mem = state.hosts[currentHost].stats.mem
        }

        return mem
      },
      cpu: function(state){
        let cpu = []
        if(state.hosts.current){
          let currentHost = state.hosts.current
          cpu = state.hosts[currentHost].stats.cpu
        }

        return cpu
      },
      cpu_simple: function(state){
        let cpu_simple = []
        if(state.hosts.current){
          let currentHost = state.hosts.current
          cpu_simple = state.hosts[currentHost].stats.cpu_simple
        }

        return cpu_simple
      },
      networkInterfaces: function(state){
        let networkInterfaces = []
        if(state.hosts.current){
          let currentHost = state.hosts.current
          networkInterfaces = state.hosts[currentHost].stats.networkInterfaces
        }

        return networkInterfaces
      }
    })

  ),
  watch:{
    '$store.state.hosts.all' : function(val){
      // console.log('$store.state.hosts.all', this.$store.state.hosts.all)
      Array.each(this.$store.state.hosts.all, function(host){
        // register a nested module `nested/myModule`
        if(!this.$store.state.hosts[host].stats){
          console.log('registering....', host, hostStats)
          this.$store.registerModule(['hosts', host, 'stats'], hostStats)
        }
          // this.$store.commit('hosts/'+host+'/seconds', self.seconds)
      }.bind(this))

    }
  },
  data () {
    return {
      // seconds: 300, //define the N timestamps to show
			/**
			* mem
			*/
      // mem: {
      //   total: 0,
      //   free: 0,
      //   percentage: 0,
      //   prev: {
      //     total: 0,
      //     free: 0,
      //     percentage: 0
      //   },
      // },
      // mem: [],
      // timestamps: [],
      // uptime: {
      //   value: 0,
      //   timestamp: 0,
      //   prev: {
      //     value: 0,
      //     timestamp: 0
      //   }
      // },
      // uptime: [],

      // loadavg: {
      //   value: 0,
      //   timestamp: 0,
      //   prev: {
      //     value: 0,
      //     timestamp: 0
      //   }
      // },
      // loadavg: [],

      // networkInterfaces: {
      //   value: {},
      //   timestamp: 0,
      //   prev: {
      //     value: {},
      //     timestamp: 0,
      //   }
      // },
      // networkInterfaces: [],

      // cpu: {
      //   total: 0,
      //   idle: 0,
      //   timestamp: 0,
      //   percentage: 0,
      //   prev: {
      //     total: 0,
      //     idle: 0,
      //     timestamp: 0,
      //     percentage: 0
      //   }
      // },
      // cpu: []
			/** **/

    }
  },
  created: function(){
    if(!window['EventBus'])
      window['EventBus'] = this.EventBus

    // Object.assign(window, this.EventBus)
    // console.log('window', window)

    let self = this;

    // this.EventBus.$on('timestamp', doc => {
		// 	// // console.log('recived doc via Event timestamp', doc)
    //   //
    //   // self.timestamps.push( doc.timestamp );
    //   // // self.$store.state.hosts[doc.host].stats.timestamps = self.$store.state.hosts[doc.host].stats.timestamps.slice(-self.seconds)
    //   // let length = self.timestamps.length
    //   // self.timestamps.splice(
    //   //   -self.seconds -1,
    //   //   length - self.seconds
    //   // )
    //
    //   this.$store.commit('hosts/'+doc.host+'/stats/timestamp', doc.timestamp)
    //   this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'timestamps', length: this.seconds })
    //
    //   // console.log(this.$store)
    //
    //
		// })

    this.EventBus.$on('networkInterfaces', doc => {

      // self.networkInterfaces.push({
      //   value: doc.networkInterfaces,
      //   timestamp: self.$store.state.hosts[doc.host].stats.timestamps.getLast() + 0
      // })
      //
      // let length = self.networkInterfaces.length
      //
      // self.networkInterfaces.splice(
      //   -this.$store.state.hosts[doc.host].stats.timestamps.length -1,
      //   length - this.$store.state.hosts[doc.host].stats.timestamps.length
      // )

      this.$store.commit('hosts/'+doc.host+'/stats/networkInterfaces', {
        value: doc.networkInterfaces,
        timestamp: doc.timestamp
      })

      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'networkInterfaces', length: this.seconds })
		})



    this.EventBus.$on('loadavg', doc => {
			////console.log('recived doc via Event loadavg', doc)

      // self.loadavg.push({
      //   value: doc.loadavg,
      //   timestamp: self.$store.state.hosts[doc.host].stats.timestamps.getLast() + 0
      // })
      //
      // let length = self.loadavg.length
      //
      // self.loadavg.splice(
      //   -this.$store.state.hosts[doc.host].stats.timestamps.length -1,
      //   length - this.$store.state.hosts[doc.host].stats.timestamps.length
      // )

      this.$store.commit('hosts/'+doc.host+'/stats/loadavg', {
        value: doc.loadavg,
        timestamp: doc.timestamp
      })
      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'loadavg', length: this.seconds })
		})

    this.EventBus.$on('uptime', doc => {

      // self.uptime.push({
      //   value: doc.uptime,
      //   timestamp: self.$store.state.hosts[doc.host].stats.timestamps.getLast() + 0
      // })
      //
      // let length = self.uptime.length
      //
      // self.uptime.splice(
      //   -this.$store.state.hosts[doc.host].stats.timestamps.length -1,
      //   length - this.$store.state.hosts[doc.host].stats.timestamps.length
      // )

      this.$store.commit('hosts/'+doc.host+'/stats/uptime', {
        value: doc.uptime,
        timestamp: doc.timestamp
      })
      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'uptime', length: this.seconds })

		})

		this.EventBus.$on('mem', doc => {
      // console.log('recived doc via Event mem', doc)

      let mem = {
        total: doc.totalmem,
        free: doc.freemem,
        timestamp: doc.timestamp
      }

      // let last = self.mem.getLast()
      let last = self.$store.state.hosts[doc.host].stats.mem.getLast()

      // console.log(last)

      if(!last)
        last = {
          total: 0,
          free: 0,
          timestamp: 0
        }

      let percentage = 100

			if(mem.total != 0)
				percentage -= mem.free * 100 / mem.total;

      mem.percentage = percentage

      // self.mem.push(mem)

      // let length = self.mem.length
      //
      // self.mem.splice(
      //   -this.$store.state.hosts[doc.host].stats.timestamps.length -1,
      //   length - this.$store.state.hosts[doc.host].stats.timestamps.length
      // )

      this.$store.commit('hosts/'+doc.host+'/stats/mem', {
        total: doc.totalmem,
        free: doc.freemem,
        percentage: percentage,
        timestamp: doc.timestamp
      })

      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'mem', length: this.seconds })

		})

    // this.prev_cpu = {total: 0, idle: 0 , timestamp: 0};

    this.EventBus.$on('cpu', doc => {
      // console.log('recived doc via Event cpu', doc)

      let doc_simple = { idle: 0, total: 0 }
      Array.each(doc.cpu, function(core){
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



      // let last = self.cpu.getLast()
      let last = self.$store.state.hosts[doc.host].stats.cpu_simple.getLast()

      // console.log('cpu last', last)

      if(last == null)
        last = {
          total: 0,
          idle: 0,
          timestamp: 0
        }

      let diff_time = cpu_simple.timestamp - last.timestamp
      let diff_total = cpu_simple.total - last.total;
      let diff_idle = cpu_simple.idle - last.idle;

      //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
      let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10
      // self.cpu.percentage = (percentage.toFixed(2) > 100) ? 100 : percentage.toFixed(2);

      cpu_simple.percentage = (percentage > 100) ? 100 : percentage

      // self.cpu.push(cpu)
      //
      // let length = self.cpu.length
      //
      // self.cpu.splice(
      //   -this.$store.state.hosts[doc.host].stats.timestamps.length -1,
      //   length - this.$store.state.hosts[doc.host].stats.timestamps.length
      // )

      this.$store.commit('hosts/'+doc.host+'/stats/cpu_simple', {
        total: doc_simple.total,
        idle: doc_simple.idle,
        percentage: cpu_simple.percentage,
        timestamp: doc.timestamp
      })

      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'cpu_simple', length: this.seconds })

      this.$store.commit('hosts/'+doc.host+'/stats/cpu', {
        value: doc.cpu,
        timestamp: doc.timestamp
      })

      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'cpu', length: this.seconds })

		})
	},


}
</script>
