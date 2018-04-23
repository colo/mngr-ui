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

let get_hosts_pipeline = new Pipeline({
	input: [
		{
			poll: {
				id: "input.hosts",
				conn: [
					{
            id: 'input.hosts',
						scheme: 'http',
						// host:'192.168.0.40',
            host:'192.168.0.180',
						// host:'127.0.0.1',
						port: 5984,
						//module: require('./lib/os.stats'),
						module: InputPollerCouchDBHosts,
						//load: ['apps/info/os/']
					}
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
					{
						scheme: 'http',
						// host:'192.168.0.40',
            host:'192.168.0.180',
						// host:'127.0.0.1',
						port: 5984,
						//module: require('./lib/os.stats'),
						module: InputPollerCouchDBOS,
						//load: ['apps/info/os/']
					}
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
		function(doc, opts, next){//periodical docs

      if(opts.type == 'periodical'){

  			let mem = {
          timestamp: doc.metadata.timestamp,
          host: doc.metadata.host,
          totalmem: doc.data.totalmem,
          freemem: doc.data.freemem
        }
        // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
        let cpu = {
          timestamp: doc.metadata.timestamp,
          host: doc.metadata.host,
          // total: 0, idle: 0,
          cpu: doc.data.cpus
        }
        // let timestamp = { host: doc.metadata.host, timestamp: doc.metadata.timestamp }
        let uptime = {timestamp: doc.metadata.timestamp, host: doc.metadata.host, uptime: doc.data.uptime }
  			let loadavg = {timestamp: doc.metadata.timestamp, host: doc.metadata.host, loadavg: doc.data.loadavg }

        let networkInterfaces = {
          timestamp: doc.metadata.timestamp,
          host: doc.metadata.host,
          networkInterfaces: doc.data.networkInterfaces
        }

				next(mem)
				next(cpu)
				// next(timestamp)
				next(uptime)
				next(loadavg)
				next(networkInterfaces)


      }
      else{
        next(doc)
      }

		},
	],
	output: [
		function(doc){
      doc = JSON.decode(doc)

      // console.log(doc.host)

      if(doc.totalmem){

				EventBus.$emit('mem', doc) //update mem widget
			}
			else if(doc.cpu){
        // ////console.log(doc)
				EventBus.$emit('cpu', doc) //update cpu widget
			}
			// else if(doc.timestamp){
      //   // ////console.log(doc)
			// 	EventBus.$emit('timestamp', doc) //update timestamp
			// }
			else if(doc.uptime){
        // ////console.log(doc)
				EventBus.$emit('uptime', doc) //update uptime widget
			}
			else if(doc.loadavg){
        // ////console.log(doc)
				EventBus.$emit('loadavg', doc) //update loadavg widget
			}
			else if(doc.networkInterfaces){
				EventBus.$emit('networkInterfaces', doc) //update loadavg widget
			}
		}
	]
}

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
  watch: {
    '$store.state.hosts.current': function(host){
      // console.log('$store.state.hosts.current', host)
      let range = this.$store.state.app.range

      Array.each(this.hosts_pipelines, function(pipe){

        console.log('pipe.inputs[0].options.id', pipe.inputs[0].options.id, 'input.os-'+host)

        if(pipe.inputs[0].options.id == 'input.os-'+host){
          // console.log('firing onResume...')

          pipe.fireEvent('onRange', { Range: 'posix '+ range[0] +'-'+ range[1] +'/*' })

          pipe.fireEvent('onResume')
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

        this.hosts_pipelines.push(pipe)
      }.bind(this))



    },
    '$store.state.app.range' : function(val){
      // console.log('store.state.app.range', val)

      Array.each(this.hosts_pipelines, function(pipe){
        console.log('firing range...', pipe)

        pipe.fireEvent('onRange', { Range: 'posix '+ val[0] +'-'+ val[1] +'/*' })

        // this.$nextTick(function(){pipe.fireEvent('onSuspend')})


      }.bind(this))
    }
  },
  created: function(){
    // let range = this.$store.state.app.range
    // Array.each(pipelines, function(pipe){
    //   console.log('created->firing range...', pipe)
    //
    //   pipe.fireEvent('range', { Range: 'posix '+ range[0] +'-'+ range[1] +'/*' })
    //
    // })

    // this.EventBus.$on('selectedDateRange', doc => {
    //   console.log('selectedDateRange event', doc, pipelines)
    //
    //   Array.each(pipelines, function(pipe){
    //     console.log('firing range...', pipe)
    //     pipe.fireEvent('range', { Range: 'posix '+ doc[0].getTime() +'-'+ doc[1].getTime() +'/*' })
    //     // Array.each(pipe.input, function(input){
    //     //
    //     //
    //     //
    //     // })
    //
    //
    //   })
    //
    //
    // })

    // let unwatch = this.$watch('$store.state.hosts.all', function (newVal, oldVal) {
    //   console.log('hosts changed')
    //
    //   let range = this.$store.state.app.range
    //
    //   Array.each(this.hosts_pipelines, function(pipe){
    //     console.log('created->firing range...', pipe)
    //
    //     pipe.fireEvent('range', { Range: 'posix '+ range[0] +'-'+ range[1] +'/*' })
    //
    //     // pipe.fireEvent('onSuspend')//suspend timer
    //
    //   })
    // })


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
