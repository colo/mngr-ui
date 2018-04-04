<template>
  <q-page class="flex"> <!-- flex-center -->
    <!-- <div class="overflow-hidden"> -->
    <div class="row window-width" >
      <template v-if="!$q.platform.is.desktop">
        <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" >

      </template>
      <template v-else>
        <osstats :EventBus="EventBus"/>
        <!-- <div class="col-sm-12 col-md-19">
          <at-collapse simple :value="[0, 1]">
            <at-collapse-item
              v-for="(item, index) in list"
              :key="index"

            >

                <div slot="title">{{item.title}} <i class="icon icon-info"/></div>
                <at-card :bordered="false">
                  <h4 slot="title">Card Title</h4>
                  <div slot="extra"><a>Extra</a></div>
                  <div>
                    Card Content
                  </div>
                </at-card>

            </at-collapse-item>
          </at-collapse>
        </div> -->

        <div class="gt-sm col-md-2">
          <at-menu mode="inline" active-name="0">
          <at-menu-item name="0" disabled><i class="icon icon-box"></i>Submenu</at-menu-item>
          <at-submenu>
            <template slot="title"><i class="icon icon-home"></i>Navigation One</template>
            <at-menu-item-group title="Group One">
              <at-menu-item name="1-1">Submenu One</at-menu-item>
              <at-menu-item name="1-2">Submenu Two</at-menu-item>
            </at-menu-item-group>
            <at-menu-item-group title="Group Two">
              <at-menu-item name="1-3">Submenu Three</at-menu-item>
              <at-menu-item name="1-4">Submenu Four</at-menu-item>
            </at-menu-item-group>
          </at-submenu>
          <at-submenu>
            <template slot="title"><i class="icon icon-life-buoy"></i>Navigation Two</template>
            <at-menu-item name="2-1">Submenu One</at-menu-item>
            <at-menu-item name="2-2">Submenu Two</at-menu-item>
            <at-menu-item name="2-3" disabled>Submenu Three</at-menu-item>
            <at-menu-item name="2-4">Submenu Four</at-menu-item>
          </at-submenu>
          <at-submenu>
            <template slot="title"><i class="icon icon-command"></i>Navigation Three</template>
            <at-menu-item name="3-1">Submenu One</at-menu-item>
            <at-menu-item name="3-2">Submenu Two</at-menu-item>
            <at-menu-item name="3-3">Submenu Three</at-menu-item>
            <at-menu-item name="3-4">Submenu Four</at-menu-item>
          </at-submenu>
          <at-submenu disabled>
            <template slot="title"><i class="icon icon-inbox"></i>Navigation Four</template>
            <at-menu-item name="4-1">Submenu One</at-menu-item>
            <at-menu-item name="4-2">Submenu Two</at-menu-item>
          </at-submenu>
        </at-menu>
      </div>

    </template>


  </div>
  <!-- </div> -->
  </q-page>
</template>

<style>
</style>

<script>
import osstats from '../components/os.stats'
import Pipeline from 'node-mngr-worker/lib/pipeline'
import InputPollerCouchDBOS from '../libs/input.poller.couchdb.os'

/**
* https://alligator.io/vuejs/global-event-bus/
* vue events as message bus
*/
import Vue from 'vue'
const EventBus = new Vue();

const pipelines = []

/* *
* @todo separate DB.host & DB.port, allow an Array of DBs
**/

/* *
* @todo: use an InputPollerCouchDBHosts to get a ONCE doc of Hosts (for each DB)
**/

/* *
* @todo: create InputPollerCouchDBOS for each Host
**/

pipelines.push(new Pipeline({
	input: [
		{
			poll: {
				id: "input.os.cradle",
				conn: [
					{
						scheme: 'http',
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

			// console.log('filter', opts, doc);
      if(opts.type == 'periodical'){

  			let mem = {totalmem: doc.data.totalmem, freemem: doc.data.freemem};
        // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp };
        let cpu = { total: 0, idle: 0 };
        let timestamp = { timestamp: doc.metadata.timestamp };
        let uptime = {uptime: doc.data.uptime }
  			let loadavg = {loadavg: doc.data.loadavg }
  			let networkInterfaces = {networkInterfaces: doc.data.networkInterfaces }
        // let core = doc.data.cpus[0];//test

        Array.each(doc.data.cpus, function(core){
          Object.each(core.times, function(value, key){

            if(key == 'idle')
              cpu.idle += value

            cpu.total += value


          });
        });


				next(mem);
				next(cpu);
				next(timestamp);
				next(uptime);
				next(loadavg);
				next(networkInterfaces);


      }
      else{
        next(doc)
      }

		},
    // function(doc, opts, next){//range docs
    //
		// 	// console.log('filter', opts, doc);
    //
    //   if(opts.type == 'range'){
    //     Array.each(doc, function(row, index){
    //
    //     })
    //
  	// 		// let mem = {totalmem: doc.data.totalmem, freemem: doc.data.freemem};
    //     // // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp };
    //     // let cpu = { total: 0, idle: 0 };
    //     // let timestamp = { timestamp: doc.metadata.timestamp };
    //     // let uptime = {uptime: doc.data.uptime }
  	// 		// let loadavg = {loadavg: doc.data.loadavg }
  	// 		// let networkInterfaces = {networkInterfaces: doc.data.networkInterfaces }
    //     // // let core = doc.data.cpus[0];//test
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
    //     //   });
    //     // });
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
  	// 		// 	next(mem);
  	// 		// 	next(cpu);
  	// 		// 	next(timestamp);
  	// 		// 	next(uptime);
  	// 		// 	next(loadavg);
  	// 		// 	next(networkInterfaces);
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

			if(doc.totalmem){
				// console.log(doc)
				EventBus.$emit('mem', doc) //update mem widget
			}
			else if(doc.idle){
        // console.log(doc)
				EventBus.$emit('cpu', doc) //update cpu widget
			}
			else if(doc.timestamp){
        // console.log(doc)
				EventBus.$emit('timestamp', doc.timestamp) //update timestamp
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

/**
* start with range, "last 300000 ms / 5min"
*/
pipelines[0].fireEvent('range', { Range: 'posix '+ ( Date.now() - 300000) +'-'+Date.now()+'/*' })

export default {
  name: 'PageIndex',
  components: { osstats },
  data () {
    return {
      EventBus : EventBus,
      // list: [
      //   {title: 'first chart'},
      //   {title: 'second chart'},
      // ]
    }
  },
  // updated () {
  //   this.$q.loading.hide()
  // },
}
</script>
