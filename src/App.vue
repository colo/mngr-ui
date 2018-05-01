<template>
  <div id="q-app">
    <router-view :EventBus="EventBus" :class="($q.loading.active) ? 'invisible' : 'visible'"  />
  </div>
</template>

<script>
import Pipeline from 'node-mngr-worker/lib/pipeline'

import InputPollerCouchDBHosts from './libs/input.poller.couchdb.hosts'
import InputPollerCouchDBOS from './libs/input.poller.couchdb.os'
import InputPollerCouchDBOSStats from './libs/input.poller.couchdb.os.stats'

/**
* https://alligator.io/vuejs/global-event-bus/
* vue events as message bus
*/
import Vue from 'vue'
const EventBus = new Vue()

let default_conn = {
  scheme: 'http',
  host:'192.168.0.40',
  // host:'192.168.0.180',
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
				// ////console.log(doc)
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
              path_key: 'os',
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
        // ////console.log('range doc', doc)

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

      // ////console.log(doc.host)
      let type = doc.type
      EventBus.$emit(type, doc) //update mem widget

		}
	]
}

let host_munin_pipeline_template = {
	input: [
		{
			poll: {
				id: "input.munin",
				conn: [
          Object.merge(
            Object.clone(default_conn),
            {
              path_start_key: "munin\ufff0",
              path_end_key: 'munin',
              module: InputPollerCouchDBOS,
            }
          )
				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				requests: {
					periodical: 2000,
				},
			},
		}
	],
	filters: [
		function(doc, opts, next){
      console.log('host_munin_pipeline_template', doc)

      if(doc != null && opts.type == 'periodical'){

      }
      else if(doc != null && doc[0]){
      }
      // else if(doc != null){
      //   next(doc)
      // }

		},
	],
	output: [
		function(doc){
      // doc = JSON.decode(doc)
      //
      // let type = doc.type
      // EventBus.$emit(type, doc) //update mem widget

		}
	]
}

import cron from 'node-cron'

let hostStats_pipeline_template = {
	input: [
		{
			poll: {
				id: "input.os.stats",
				conn: [
          Object.merge(
            Object.clone(default_conn),
            {
              module: InputPollerCouchDBOSStats,
            }
          )
				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
        /**
        * @dev
        **/
				// requests: {
				// 	periodical: 10000,
				// },
        requests: {
    			periodical: function(dispatch){
    				return cron.schedule('* * * * *', dispatch);//every minute
    			}
    		},
			},
		}
	],
	filters: [
		function(doc, opts, next){

      if(doc != null && opts.type == 'periodical'){
        //console.log('InputPollerCouchDBOSStats->filter periodical', doc)

      //
  		// 	let mem = {
      //     type: 'mem',
      //     host: doc.metadata.host,
      //     data: {
      //       timestamp: doc.metadata.timestamp,
      //       totalmem: doc.data.totalmem,
      //       freemem: doc.data.freemem
      //     },
      //   }
      //   // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
      //   let cpu = {
      //     type: 'cpu',
      //     host: doc.metadata.host,
      //     data: {
      //       timestamp: doc.metadata.timestamp,
      //       value: doc.data.cpus
      //     }
      //   }
      //   // let timestamp = { host: doc.metadata.host, timestamp: doc.metadata.timestamp }
      //   let uptime = {
      //     type: 'uptime',
      //     host: doc.metadata.host,
      //     data: {
      //       timestamp: doc.metadata.timestamp,
      //       value: doc.data.uptime
      //     }
      //
      //   }
      //
        let loadavg = {
          path: 'os.stats',
          messure: doc.metadata.type,
          type: 'loadavg',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            range: doc.metadata.range,
            value: doc.data.loadavg
          }
        }
      //
        // let networkInterfaces = {
        //   path: 'os.stats',
        //   messure: doc.metadata.type,
        //   type: 'loadavg',
        //   host: doc.metadata.host,
        //   data: {
        //     timestamp: doc.metadata.timestamp,
        //     range: doc.metadata.range,
        //     value: doc.data.networkInterfaces
        //   }
        // }
      //
			// 	next(mem)
			// 	next(cpu)
			// 	// next(timestamp)
			// 	next(uptime)
				next(loadavg)
				// next(networkInterfaces)
      //
      //
      }
      else if(doc != null && doc[0]){//range
        //console.log('InputPollerCouchDBOSStats->filter range', doc)
      //   // ////console.log('range doc', doc)
      //
      //   let mem = {
      //     type: 'mem',
      //     host: doc[0].doc.metadata.host,
      //     data: [],
      //   }
      //   // let cpu = { total: 0, idle: 0, timestamp: doc[0].doc.metadata.timestamp }
      //   let cpu = {
      //     type: 'cpu',
      //     host: doc[0].doc.metadata.host,
      //     data: []
      //   }
      //   // let timestamp = { host: doc[0].doc.metadata.host, timestamp: doc[0].doc.metadata.timestamp }
      //   let uptime = {
      //     type: 'uptime',
      //     host: doc[0].doc.metadata.host,
      //     data: []
      //
      //   }
      //
        let loadavg = {
          path: 'os.stats',
          messure: doc[0].doc.metadata.type,
          type: 'loadavg',
          host: doc[0].doc.metadata.host,
          data: []
        }


        // let networkInterfaces = {
        //   path: 'os.stats',
        //   messure: doc[0].doc.metadata.type,
        //   type: 'networkInterfaces',
        //   host: doc[0].doc.metadata.host,
        //   data: []
        // }

        Array.each(doc, function(row){
          // mem.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   totalmem: row.doc.data.totalmem,
          //   freemem: row.doc.data.freemem
          // })
          // cpu.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   value: row.doc.data.cpus
          // })
          // uptime.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   value: row.doc.data.uptime
          // })

          loadavg.data.push({
            timestamp: row.doc.metadata.timestamp,
            range: row.doc.metadata.range,
            value: row.doc.data.loadavg
          })

          // networkInterfaces.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   range: row.doc.metadata.range,
          //   value: row.doc.data.networkInterfaces
          // })
        })
      //
      //
      //   next(mem)
			// 	next(cpu)
			// 	// // next(timestamp)
			// 	next(uptime)
				next(loadavg)
				// next(networkInterfaces)
      }


		},
	],
	output: [
		function(doc){
      doc = JSON.decode(doc)

      //console.log('InputPollerCouchDBOSStats->output', doc)
      //
      // // ////console.log(doc.host)
      // let type = doc.type
      EventBus.$emit(doc.path, doc) //update mem widget

		}
	]
}

let host_pipelines_templates = [
  host_pipeline_template,
  // host_munin_pipeline_template,
  hostStats_pipeline_template
]

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
      currentHost: state => state.hosts.current,
    })
  ),
  watch: {
    '$store.state.app.suspend': function(bool){
      ////console.log('$store.state.app.suspend', bool)
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
      ////console.log('$store.state.hosts.current range', host)
      let range = this.$store.state.app.range

      Array.each(this.hosts_pipelines, function(pipe){

        ////console.log('pipe.inputs[0].options.id', pipe.inputs[0].options.id, 'input.os-'+host)

        // if(pipe.inputs[0].options.id == 'input.os-'+host){
        let search_host = new RegExp(host, 'g')
        if(search_host.test(pipe.inputs[0].options.id)){
          // //console.log('firing onResume...', pipe.inputs[0].options.id)


          if(range[1] == null){
            range[1] = new Date().getTime()
          }

          pipe.fireEvent('onRange', { Range: 'posix '+ range[0] +'-'+ range[1] +'/*' })

          // if(null_range == false){
          //   pipe.fireEvent('onSuspend')
          // }
          // else{
          if(this.$store.state.app.suspend != true)
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
      // ////console.log('$store.state.hosts.all', hosts)

      this.$set(this.hosts_pipelines, [])

      Array.each(hosts, function(host){
        Array.each(host_pipelines_templates, function(pipeline_template){

          let template = Object.clone(pipeline_template)

          template.input[0].poll.conn[0].stat_host = host
          template.input[0].poll.id += '-'+host
          template.input[0].poll.conn[0].id = template.input[0].poll.id

          let pipe = new Pipeline(template)

          ////console.log('$store.state.hosts.all', pipe)

          pipe.fireEvent('onSuspend')

          //suscribe to 'onRangeDoc

          pipe.inputs[0].addEvent('onRangeDoc', function(doc){
            if(this.$store.state.app.freeze == true){
              ////console.log('pipe.inputs[0].addEvent(onRangeDoc)')
              // this.$nextTick(function(){pipe.fireEvent('onSuspend')})
              this.$store.commit('app/suspend', true)
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

      }.bind(this))



    },
    '$store.state.app.range' : function(range){
      ////console.log('store.state.app.range', range)

      Array.each(this.hosts_pipelines, function(pipe){

        let search_host = new RegExp(this.currentHost, 'g')
        if(search_host.test(pipe.inputs[0].options.id)){
        // if(pipe.inputs[0].options.id == 'input.os-'+this.currentHost){
          //console.log('firing range......', pipe.inputs[0].options.id)

          let end = new Date().getTime()

          // ////console.log('firing range...', pipe.inputs[0].options.conn[0].stat_host)

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
			// ////////console.log('recived doc via Event hosts', doc)
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
    this.$q.loading.show({
      delay: 0, // ms
      spinner: 'QSpinnerGears',
      spinnerColor: 'blue',
      customClass : 'bg-white'
    })
  },
}
</script>

<style>
</style>
