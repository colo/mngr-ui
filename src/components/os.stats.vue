<template>
  <div class="col-sm-12 col-md-19">
    <q-list>
      <os-summary
        v-if="reset == false"
        :mem="mem"
        :cpu="cpu_simple"
        :EventBus="EventBus"
        :host="currentHost"
        :key="'os-summary'+currentHost"
      />
      <!-- :timestamps="timestamps" -->

      <os-dashboard
        v-if="reset == false"
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
  data () {
    return {
      // reset: false
      // seconds: 300, //define the N timestamps to show
    }
  },
  computed: Object.merge(
    mapState({
      reset: state => state.app.reset,
      // arrow functions can make the code very succinct!
      seconds: function(state){
        let end = new Date().getTime()
        if(state.app.range[1] != null)
          end = state.app.range[1]

        let seconds = Math.trunc( (end - state.app.range[0]) / 1000 )

        console.log('seconds to splice', seconds)
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
        let loadavg = {current: [], minute: []}
        if(state.hosts.current){
          let currentHost = state.hosts.current
          loadavg.current = state.hosts[currentHost].stats.loadavg
          loadavg.minute = state.hosts[currentHost].stats.minute.loadavg
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
    // '$store.state.app.range' : function(val){
    //
    //   this.$store.commit('app/reset', true)
    //
    //   // this.reset = true
    //   // let currentHost = this.$store.state.hosts.current
    //   // this.$store.commit('hosts/'+currentHost+'/stats/reset')
    //   // console.log('$store.state.app.range....', this.$store.state.hosts[currentHost].stats)
    // },
    '$store.state.hosts.all' : function(val){
      // console.log('$store.state.hosts.all', this.$store.state.hosts.all)
      Array.each(this.$store.state.hosts.all, function(host){
        // register a nested module `nested/myModule`
        if(!this.$store.state.hosts[host].stats){
          // console.log('registering....', host, hostStats)
          this.$store.registerModule(['hosts', host, 'stats'], hostStats)
          this.$store.registerModule(['hosts', host, 'stats', 'minute'], hostStats)
        }
          // this.$store.commit('hosts/'+host+'/seconds', self.seconds)
      }.bind(this))

    }
  },
  updated: function(){
    this.$store.commit('app/reset', false)
  },
  created: function(){
    if(!window['EventBus'])
      window['EventBus'] = this.EventBus

    // Object.assign(window, this.EventBus)
    // console.log('window', window)

    let self = this;

    // this.EventBus.$on('range', doc => {
    //   console.log('os.stats.vue->range', doc)
    //   this.$store.commit('hosts/'+doc.host+'/stats/networkInterfaces', {
    //     value: {},
    //     timestamp: 0
    //   })
    //
    //   // this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'networkInterfaces', length: 0 })
		// })

    this.EventBus.$on('os.stats', doc => {
      console.log('recived doc via Event os.stats', doc)

      this.$store.commit('hosts/'+doc.host+'/stats/'+doc.messure+'/'+doc.type, doc.data)

      let divisor = (doc.messure == 'minute') ? 60 : 3600

      this.$store.commit('hosts/'+doc.host+'/stats/'+doc.messure+'/splice', { stat: doc.type, length: this.seconds / divisor })

      console.log('recived doc via Event os.stats', this.$store.state.hosts.elk.stats.minute.loadavg)
		})

    this.EventBus.$on('networkInterfaces', doc => {

      this.$store.commit('hosts/'+doc.host+'/stats/'+doc.type, doc.data)
      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: doc.type, length: this.seconds })
		})



    this.EventBus.$on('loadavg', doc => {
			////console.log('recived doc via Event loadavg', doc)

      this.$store.commit('hosts/'+doc.host+'/stats/'+doc.type, doc.data)
      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: doc.type, length: this.seconds })
		})

    this.EventBus.$on('uptime', doc => {

      this.$store.commit('hosts/'+doc.host+'/stats/'+doc.type, doc.data)
      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: doc.type, length: this.seconds })

		})

		this.EventBus.$on('mem', doc => {
      // console.log('recived doc via Event mem', doc)

      let mem = null
      if(Array.isArray(doc.data)){
        mem = []

        Array.each(doc.data, function(value){
          let data = {
            total: value.totalmem,
            free: value.freemem,
            timestamp: value.timestamp
          }
          let percentage = 100

          if(data.total != 0)
            percentage -= data.free * 100 / data.total;

          data.percentage = percentage


          mem.push(data)
        })
      }
      else{
        mem = {
          total: doc.data.totalmem,
          free: doc.data.freemem,
          timestamp: doc.data.timestamp
        }

        let percentage = 100

  			if(mem.total != 0)
  				percentage -= mem.free * 100 / mem.total;

        mem.percentage = percentage


      }

      this.$store.commit('hosts/'+doc.host+'/stats/mem', mem)

      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'mem', length: this.seconds })

		})

    // this.prev_cpu = {total: 0, idle: 0 , timestamp: 0};

    this.EventBus.$on('cpu', doc => {
      // console.log('recived doc via Event cpu', doc)


      let cpu_simple = null

      if(Array.isArray(doc.data)){
        cpu_simple = []
        Array.each(doc.data, function(row, index){

          let last = (!doc.data[index - 1]) ? null : self.format_cpu_simple(doc.data[index - 1])

          // console.log('cpu_simple last', last)

          cpu_simple.push(self.format_cpu_simple(row, last))
        })

        // console.log('cpu_simple', cpu_simple)
      }
      else{
        let last = self.$store.state.hosts[doc.host].stats.cpu_simple.getLast()

        cpu_simple = this.format_cpu_simple(doc.data, last)
      }

      this.$store.commit('hosts/'+doc.host+'/stats/cpu_simple', cpu_simple)

      this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'cpu_simple', length: this.seconds })

      // this.$store.commit('hosts/'+doc.host+'/stats/cpu', {
      //   value: doc.cpu,
      //   timestamp: doc.timestamp
      // })
      //
      // this.$store.commit('hosts/'+doc.host+'/stats/splice', { stat: 'cpu', length: this.seconds })

		})
	},

  methods: {
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
