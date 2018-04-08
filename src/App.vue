<template>
  <div id="q-app">
    <router-view :EventBus="EventBus" :class="($q.loading.active) ? 'invisible' : 'visible'"  />
  </div>
</template>

<script>
import Pipeline from 'node-mngr-worker/lib/pipeline'
import InputPollerCouchDBOS from './libs/input.poller.couchdb.os'

/**
* https://alligator.io/vuejs/global-event-bus/
* vue events as message bus
*/
import Vue from 'vue'
const EventBus = new Vue()

const pipelines = []

/* *
* @todo: create InputPollerCouchDBOS/Pipeline for each Host??
**/

pipelines.push(new Pipeline({
	input: [
		{
			poll: {
				id: "input.os.cradle",
				conn: [
					{
						scheme: 'http',
						// host:'192.168.0.180',
						host:'127.0.0.1',
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

			// console.log('filter', doc)

      if(opts.type == 'periodical'){
        if(doc.data.hosts){
          next(doc.data)
        }
        else{
    			let mem = { host: doc.metadata.host, totalmem: doc.data.totalmem, freemem: doc.data.freemem }
          // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
          let cpu = { host: doc.metadata.host, total: 0, idle: 0 }
          let timestamp = { host: doc.metadata.host, timestamp: doc.metadata.timestamp }
          let uptime = { host: doc.metadata.host, uptime: doc.data.uptime }
    			let loadavg = { host: doc.metadata.host, loadavg: doc.data.loadavg }
    			let networkInterfaces = { host: doc.metadata.host, networkInterfaces: doc.data.networkInterfaces }
          // let core = doc.data.cpus[0]//test

          Array.each(doc.data.cpus, function(core){
            Object.each(core.times, function(value, key){

              if(key == 'idle')
                cpu.idle += value

              cpu.total += value


            })
          })


  				next(mem)
  				next(cpu)
  				next(timestamp)
  				next(uptime)
  				next(loadavg)
  				next(networkInterfaces)

        }
      }
      else{
        next(doc)
      }

		},
    // function(doc, opts, next){//range docs
    //
		// 	// console.log('filter', opts, doc)
    //
    //   if(opts.type == 'range'){
    //     Array.each(doc, function(row, index){
    //
    //     })
    //
  	// 		// let mem = {totalmem: doc.data.totalmem, freemem: doc.data.freemem}
    //     // // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
    //     // let cpu = { total: 0, idle: 0 }
    //     // let timestamp = { timestamp: doc.metadata.timestamp }
    //     // let uptime = {uptime: doc.data.uptime }
  	// 		// let loadavg = {loadavg: doc.data.loadavg }
  	// 		// let networkInterfaces = {networkInterfaces: doc.data.networkInterfaces }
    //     // // let core = doc.data.cpus[0]//test
    //     //
    //     // Array.each(doc.data.cpus, function(core){
    //     //   Object.each(core.times, function(value, key){
    //     //
    //     //     if(key == 'idle')
    //     //       cpu.idle += value
    //     //
    //     //     cpu.total += value
    //     //
    //     //
    //     //   })
    //     // })
    //     //
  	// 		// // if(buffer_size > 1){
  	// 		// // 	if(buffer.length < buffer_size){
  	// 		// // 		buffer.push([mem,cpu,timestamp,uptime,loadavg,networkInterfaces])
  	// 		// // 	}
  	// 		// // 	else{
  	// 		// // 		Array.each(buffer, function(docs){
  	// 		// // 			Array.each(docs, function(doc){
  	// 		// // 				next(doc)
  	// 		// // 			})
  	// 		// // 		})
    //     // //
  	// 		// // 		buffer = []
  	// 		// // 	}
  	// 		// // }
  	// 		// // else{
  	// 		// 	next(mem)
  	// 		// 	next(cpu)
  	// 		// 	next(timestamp)
  	// 		// 	next(uptime)
  	// 		// 	next(loadavg)
  	// 		// 	next(networkInterfaces)
  	// 		// // }
    //
    //   }
    //   else{
    //     next(doc)
    //   }
    //
		// }
	],
	output: [
		function(doc){

			doc = JSON.decode(doc)

      if(doc.hosts){
				// console.log(doc)
				EventBus.$emit('hosts', doc) //update mem widget
			}
      else if(doc.totalmem){
				// console.log(doc)
				EventBus.$emit('mem', doc) //update mem widget
			}
			else if(doc.idle){
        // console.log(doc)
				EventBus.$emit('cpu', doc) //update cpu widget
			}
			else if(doc.timestamp){
        // console.log(doc)
				EventBus.$emit('timestamp', doc) //update timestamp
			}
			else if(doc.uptime){
        // console.log(doc)
				EventBus.$emit('uptime', doc.uptime) //update uptime widget
			}
			else if(doc.loadavg){
        // console.log(doc)
				EventBus.$emit('loadavg', doc.loadavg) //update loadavg widget
			}
			else if(doc.networkInterfaces){
				EventBus.$emit('networkInterfaces', doc.networkInterfaces) //update loadavg widget
			}
		}
	]
}))

export default {
  name: 'App',
  data () {
    return {
      EventBus : EventBus,
      // list: [
      //   {title: 'first chart'},
      //   {title: 'second chart'},
      // ]
    }
  },
  created: function(){
    this.EventBus.$on('hosts', doc => {
			// console.log('recived doc via Event hosts', doc)
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
