<template>
  <div class="col-sm-12 col-md-19">
    <q-list>
      <oseasypie
        :mem="mem"
        :cpu="cpu"
        :timestamps="timestamps"
      />

      <osdygraphs
        :uptime="uptime"
        :loadavg="loadavg"
        :timestamps="timestamps"
        :networkInterfaces="networkInterfaces"
      />
    </q-list>

  </div>

</template>

<script>
import osdygraphs from './charts/os.dygraphs'
import oseasypie from './charts/os.easypie'

import hostStats from '../store/stats'

export default {
  name: 'osstats',

  components: {
    osdygraphs,
    oseasypie
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
      seconds: 300, //define the N timestamps to show
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
      mem: [],
      timestamps: [],
      // uptime: {
      //   value: 0,
      //   timestamp: 0,
      //   prev: {
      //     value: 0,
      //     timestamp: 0
      //   }
      // },
      uptime: [],

      // loadavg: {
      //   value: 0,
      //   timestamp: 0,
      //   prev: {
      //     value: 0,
      //     timestamp: 0
      //   }
      // },
      loadavg: [],

      // networkInterfaces: {
      //   value: {},
      //   timestamp: 0,
      //   prev: {
      //     value: {},
      //     timestamp: 0,
      //   }
      // },
      networkInterfaces: [],

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
      cpu: []
			/** **/

    }
  },
  created: function(){
    let self = this;

    this.EventBus.$on('timestamp', doc => {
			// console.log('recived doc via Event timestamp', doc)

      self.timestamps.push( doc.timestamp );
      // self.timestamps = self.timestamps.slice(-self.seconds)
      let length = self.timestamps.length
      self.timestamps.splice(
        -self.seconds -1,
        length - self.seconds
      )

      this.$store.commit('hosts/'+doc.host+'/stats/timestamp', doc.timestamp)

      // console.log(this.$store)


		})

    this.EventBus.$on('networkInterfaces', doc => {
			// console.log('recived doc via Event networkInterfaces', doc)

      // self.$set(self.networkInterfaces, 'prev', {
      //   value: JSON.parse(JSON.stringify(self.networkInterfaces.value)),
      //   timestamp: JSON.parse(JSON.stringify(self.networkInterfaces.timestamp)),
      // })
      //
      // // self.networkInterfaces.prev = JSON.parse(JSON.stringify(self.networkInterfaces.current))
      // if(Object.keys(self.networkInterfaces.prev.value) == 0)
      //   self.networkInterfaces.prev.value = JSON.parse(JSON.stringify(doc))
      //
      //
      // self.networkInterfaces.value = doc;
      // self.networkInterfaces.timestamp = JSON.parse(JSON.stringify(self.timestamps.getLast()));

      self.networkInterfaces.push({
        value: doc,
        timestamp: self.timestamps.getLast() + 0
      })

      let length = self.networkInterfaces.length

      self.networkInterfaces.splice(
        -this.timestamps.length -1,
        length - this.timestamps.length
      )
		})



    this.EventBus.$on('loadavg', doc => {
			////console.log('recived doc via Event loadavg', doc)

      // self.$set(self.loadavg, 'prev', {
      //   value: JSON.parse(JSON.stringify(self.loadavg.value)),
      //   timestamp: JSON.parse(JSON.stringify(self.loadavg.timestamp)),
      // })

      // self.loadavg.value = doc;
			// self.loadavg.timestamp = self.timestamps.getLast();

      self.loadavg.push({
        value: doc,
        timestamp: self.timestamps.getLast() + 0
      })

      let length = self.loadavg.length

      self.loadavg.splice(
        -this.timestamps.length -1,
        length - this.timestamps.length
      )
		})

    this.EventBus.$on('uptime', doc => {
      // //console.log('recived doc via Event uptime', doc)


      // self.$set(self.uptime, 'prev', {
      //   value: JSON.parse(JSON.stringify(self.uptime.value)),
      //   timestamp: JSON.parse(JSON.stringify(self.uptime.timestamp)),
      // })
      //
      // self.uptime.value = doc;
			// self.uptime.timestamp = self.timestamps.getLast();

      self.uptime.push({
        value: doc,
        timestamp: self.timestamps.getLast() + 0
      })

      let length = self.uptime.length

      self.uptime.splice(
        -this.timestamps.length -1,
        length - this.timestamps.length
      )

		})

		this.EventBus.$on('mem', doc => {
      // ////console.log('recived doc via Event mem', doc)

      let mem = {
        total: doc.totalmem,
        free: doc.freemem,
        timestamp: self.timestamps.getLast() + 0
      }

      let last = self.cpu.getLast()
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

      self.mem.push(mem)

      let length = self.mem.length

      self.mem.splice(
        -this.timestamps.length -1,
        length - this.timestamps.length
      )
      // self.$set(self.mem, 'prev', {
      //   total: JSON.parse(JSON.stringify(self.mem.total)),
      //   free: JSON.parse(JSON.stringify(self.mem.free)),
      //   percentage: JSON.parse(JSON.stringify(self.mem.percentage)),
      // })
      //
      //
      // self.mem.total = doc.totalmem
      // self.mem.free = doc.freemem
      //
      // let percentage = 100
      //
			// if(doc.totalmem != 0)
			// 	percentage -= doc.freemem * 100 / doc.totalmem;
      //
      // self.mem.percentage = percentage

		})

    // this.prev_cpu = {total: 0, idle: 0 , timestamp: 0};

    this.EventBus.$on('cpu', doc => {
      // console.log('recived doc via Event cpu', doc)

      let cpu = {
        total: doc.total,
        idle: doc.idle,
        timestamp: self.timestamps.getLast() + 0
      }

      let last = self.cpu.getLast()
      if(last == null)
        last = {
          total: 0,
          idle: 0,
          timestamp: 0
        }

      let diff_time = cpu.timestamp - last.timestamp
      let diff_total = cpu.total - last.total;
      let diff_idle = cpu.idle - last.idle;

      //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
      let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10
      // self.cpu.percentage = (percentage.toFixed(2) > 100) ? 100 : percentage.toFixed(2);

      cpu.percentage = (percentage > 100) ? 100 : percentage

      self.cpu.push(cpu)

      let length = self.cpu.length

      self.cpu.splice(
        -this.timestamps.length -1,
        length - this.timestamps.length
      )

      // if(doc.total != self.cpu.total){
      //   self.$set(self.cpu, 'prev', {
      //     total: JSON.parse(JSON.stringify(self.cpu.total)),
      //     idle: JSON.parse(JSON.stringify(self.cpu.idle)),
      //     timestamp: JSON.parse(JSON.stringify(self.cpu.timestamp)),
      //   })
      //
      //   self.cpu.total = doc.total;
  		// 	self.cpu.idle = doc.idle;
      //   self.cpu.timestamp = self.timestamps.getLast();
      //
      //   let diff_time = this.cpu.timestamp - this.cpu.prev.timestamp;
      //   let diff_total = this.cpu.total - this.cpu.prev.total;
      //   let diff_idle = this.cpu.idle - this.cpu.prev.idle;
      //
      //   //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
      //   let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10;
      //   // self.cpu.percentage = (percentage.toFixed(2) > 100) ? 100 : percentage.toFixed(2);
      //   self.cpu.percentage = (percentage > 100) ? 100 : percentage;
      //
      //
      // }
		})
	},


}
</script>
