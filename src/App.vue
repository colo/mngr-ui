<template>
  <div id="q-app">
    <router-view :EventBus="EventBus" :class="($q.loading.active) ? 'invisible' : 'visible'"  />
  </div>
</template>

<script>
import Pipeline from 'node-mngr-worker/lib/pipeline'

import InputPollerCouchDBHosts from './libs/input.poller.couchdb.hosts'
import InputPollerCouchDBOS from './libs/input.poller.couchdb.os'

/**
* https://alligator.io/vuejs/global-event-bus/
* vue events as message bus
*/
import Vue from 'vue'
const EventBus = new Vue()

// const pipelines = []

/* *
* @todo: create InputPollerCouchDBOS/Pipeline for each Host??
**/

let default_conn = {
  scheme: 'http',
  // host:'192.168.0.40',
  host:'192.168.0.180',
  // host:'127.0.0.1',
  port: 5984,
  //module: require('./lib/os.stats'),
  //load: ['apps/info/os/']
}

let get_hosts_pipeline = new Pipeline({
	input: [
		{
			poll: {
				id: "input.hosts",
				conn: [
          Object.merge(
            Object.clone(default_conn),
            {
              id: 'input.hosts',
              module: InputPollerCouchDBHosts,
            }
          )

				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				requests: {
					periodical: 1000,
				},
			},
		}
	],
	output: [
		function(doc){

			doc = JSON.decode(doc)

      if(doc.data.hosts){
				// console.log(doc)
				EventBus.$emit('hosts', doc.data) //update mem widget

			}

		}
	]
})

let host_pipeline_template = {
	input: [
		{
			poll: {
				id: "input.os",
				conn: [
          Object.merge(
            Object.clone(default_conn),
            {
              module: InputPollerCouchDBOS,
            }
          )
				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				requests: {
					periodical: 1000,
				},
			},
		}
	],
	filters: [
		function(doc, opts, next){

      if(doc != null && opts.type == 'periodical'){

  			let mem = {
          type: 'mem',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            totalmem: doc.data.totalmem,
            freemem: doc.data.freemem
          },
        }
        // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
        let cpu = {
          type: 'cpu',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.cpus
          }
        }
        // let timestamp = { host: doc.metadata.host, timestamp: doc.metadata.timestamp }
        let uptime = {
          type: 'uptime',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.uptime
          }

        }

        let loadavg = {
          type: 'loadavg',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.loadavg
          }
        }

        let networkInterfaces = {
          type: 'networkInterfaces',
          host: doc.metadata.host,
          // data: [{
          //   timestamp: doc.metadata.timestamp,
          //   value: doc.data.networkInterfaces
          // }]
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.networkInterfaces
          }
        }

				next(mem)
				next(cpu)
				// next(timestamp)
				next(uptime)
				next(loadavg)
				next(networkInterfaces)


      }
      else if(doc != null && doc[0]){//range
        // console.log('range doc', doc)

        let mem = {
          type: 'mem',
          host: doc[0].doc.metadata.host,
          data: [],
        }
        // let cpu = { total: 0, idle: 0, timestamp: doc[0].doc.metadata.timestamp }
        let cpu = {
          type: 'cpu',
          host: doc[0].doc.metadata.host,
          data: []
        }
        // let timestamp = { host: doc[0].doc.metadata.host, timestamp: doc[0].doc.metadata.timestamp }
        let uptime = {
          type: 'uptime',
          host: doc[0].doc.metadata.host,
          data: []

        }

        let loadavg = {
          type: 'loadavg',
          host: doc[0].doc.metadata.host,
          data: []
        }

        let networkInterfaces = {
          type: 'networkInterfaces',
          host: doc[0].doc.metadata.host,
          data: []
        }

        Array.each(doc, function(row){
          mem.data.push({
            timestamp: row.doc.metadata.timestamp,
            totalmem: row.doc.data.totalmem,
            freemem: row.doc.data.freemem
          })
          cpu.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.cpus
          })
          uptime.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.uptime
          })
          loadavg.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.loadavg
          })
          networkInterfaces.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.networkInterfaces
          })
        })


        next(mem)
				next(cpu)
				// // next(timestamp)
				next(uptime)
				next(loadavg)
				next(networkInterfaces)
      }
      // else if(doc != null){
      //   next(doc)
      // }

		},
	],
	output: [
		function(doc){
      doc = JSON.decode(doc)

      // console.log(doc.host)
      let type = doc.type
      EventBus.$emit(type, doc) //update mem widget

      // if(doc.totalmem){
      //
			// 	EventBus.$emit('mem', doc) //update mem widget
			// }
			// else if(doc.cpu){
      //   // ////console.log(doc)
			// 	EventBus.$emit('cpu', doc) //update cpu widget
			// }
			// // else if(doc.timestamp){
      // //   // ////console.log(doc)
			// // 	EventBus.$emit('timestamp', doc) //update timestamp
			// // }
			// else if(doc.uptime){
      //   // ////console.log(doc)
			// 	EventBus.$emit('uptime', doc) //update uptime widget
			// }
			// else if(doc.loadavg){
      //   // ////console.log(doc)
			// 	EventBus.$emit('loadavg', doc) //update loadavg widget
			// }
			// else if(doc.networkInterfaces){
			// 	EventBus.$emit('networkInterfaces', doc) //update loadavg widget
			// }
		}
	]
}

import { mapState } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
      EventBus : EventBus,
      hosts_pipelines: [],
      // list: [
      //   {title: 'first chart'},
      //   {title: 'second chart'},
      // ]
    }
  },
  computed: Object.merge(
    mapState({
      // reset: state => state.app.reset,
      // // arrow functions can make the code very succinct!
      // seconds: function(state){
      //   let end = new Date().getTime()
      //   if(state.app.range[1] != null)
      //     end = state.app.range[1]
      //
      //   let seconds = Math.trunc( (end - state.app.range[0]) / 1000 )
      //
      //   console.log('seconds to splice', seconds)
      //   return seconds
      // },
      // hosts: state => state.hosts.all,
      currentHost: state => state.hosts.current,

    })

  ),
  watch: {
    '$store.state.app.suspend': function(bool){
      Array.each(this.hosts_pipelines, function(pipe){
        if(bool == false){
          pipe.fireEvent('onResume')
        }
        else{
          pipe.fireEvent('onSuspend')
        }

      }.bind(this))
    },
    '$store.state.hosts.current': function(host){
      console.log('$store.state.hosts.current range', host)
      let range = this.$store.state.app.range

      Array.each(this.hosts_pipelines, function(pipe){

        console.log('pipe.inputs[0].options.id', pipe.inputs[0].options.id, 'input.os-'+host)

        if(pipe.inputs[0].options.id == 'input.os-'+host){
          // console.log('firing onResume...')

          // let null_range = (range[1] == null) ? true : false

          if(range[1] == null){
            range[1] = new Date().getTime()
          }

          pipe.fireEvent('onRange', { Range: 'posix '+ range[0] +'-'+ range[1] +'/*' })

          // if(null_range == false){
          //   pipe.fireEvent('onSuspend')
          // }
          // else{
            pipe.fireEvent('onResume')
          // }

          // pipe.fireEvent('onResume')
        }
        else{
          pipe.fireEvent('onSuspend')
        }

      }.bind(this))



    },

    '$store.state.hosts.all': function(hosts){
      // console.log('$store.state.hosts.all', hosts)

      this.$set(this.hosts_pipelines, [])

      Array.each(hosts, function(host){
        let template = Object.clone(host_pipeline_template)

        template.input[0].poll.conn[0].stat_host = host
        template.input[0].poll.id += '-'+host
        template.input[0].poll.conn[0].id = template.input[0].poll.id

        let pipe = new Pipeline(template)

        console.log('$store.state.hosts.all', pipe)

        pipe.fireEvent('onSuspend')

        //suscribe to 'onRangeDoc

        pipe.inputs[0].addEvent('onRangeDoc', function(doc){
          if(this.$store.state.app.freeze == true){
            console.log('pipe.inputs[0].addEvent(onRangeDoc)')
            // this.$nextTick(function(){pipe.fireEvent('onSuspend')})
            this.$q.loading.hide()
            // this.$store.commit('app/pause', true)
          }
          else{
            pipe.fireEvent('onResume')
            this.$q.loading.hide()
            // this.$store.commit('app/pause', false)
          }
        }.bind(this))

        this.hosts_pipelines.push(pipe)
      }.bind(this))



    },
    '$store.state.app.range' : function(range){
      console.log('store.state.app.range', range)

      Array.each(this.hosts_pipelines, function(pipe){

        if(pipe.inputs[0].options.id == 'input.os-'+this.currentHost){
          let end = new Date().getTime()

          // console.log('firing range...', pipe.inputs[0].options.conn[0].stat_host)

          // let host = pipe.inputs[0].options.conn[0].stat_host

          // let null_range = (range[1] == null) ? true : false

          if(range[1] != null){
            end = range[1]

            this.$store.commit('app/freeze', true)
            // this.$nextTick(() => this.$store.commit('app/pause', true))
            // this.EventBus.$emit('suspend')
          }
          else{
            this.$store.commit('app/freeze', false)
            // this.$store.commit('app/pause', false)
            // this.EventBus.$emit('resume')
          }


          pipe.fireEvent('onRange', { Range: 'posix '+ range[0] +'-'+ end +'/*' })

          pipe.fireEvent('onSuspend')

          // if(range[1] != null){
          //   this.$nextTick(function(){pipe.fireEvent('onSuspend')})
          // }
        }

        this.$store.commit('app/reset', true)

        this.$q.loading.show({
          delay: 0, // ms
          spinner: 'QSpinnerGears',
          spinnerColor: 'blue',
          customClass : 'bg-white'
        })

        // if(null_range == false){
        //   this.$nextTick(() => this.$store.commit('app/freeze', true))
        // }
        // else{
        //   // this.EventBus.$emit('resume')
        //   //pipe.fireEvent('onResume')
        // }

        // this.EventBus.$emit('range', { host: host, Range: 'posix '+ val[0] +'-'+ val[1] +'/*' })

        // this.$nextTick(function(){pipe.fireEvent('onSuspend')})


      }.bind(this))
    }
  },
  created: function(){

    this.EventBus.$on('hosts', doc => {
			// ////console.log('recived doc via Event hosts', doc)
      this.$store.commit('hosts/set', doc.hosts)

      Array.each(doc.hosts, function(host){
        if(!this.$store.state.hosts[host])
          this.$store.registerModule(['hosts', host],{
            namespaced:true,
            state:{}, getters:{}, actions:{}, modules:{}, mutations: {}
          })

      }.bind(this))

      /**
      * should unregister modules for unset hosts?
      */
      Array.each(this.$store.state.hosts, function(host){
        if(!doc.hosts.contains(host))
          this.$store.unregisterModule(['hosts', host])
      }.bind(this))


		})
  },
  beforeCreate () {
    // this.$q.loading.show({
    //   delay: 0, // ms
    //   spinner: 'QSpinnerGears',
    //   spinnerColor: 'blue',
    //   customClass : 'bg-white'
    // })
  },
}
</script>

<style>
</style>
