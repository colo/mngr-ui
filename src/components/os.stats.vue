<template>
    <osdygraphs
      :mem="mem"
      :cpu="cpu"
      :uptime="uptime"
      :loadavg="loadavg"
      :timestamps="timestamps"
      :networkInterfaces="networkInterfaces"
    />
</template>

<script>
import osdygraphs from './charts/os.dygraphs'


export default {
  name: 'osstats',

  components: {
    osdygraphs
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
      seconds: 300, //define the N timestamps to show
			/**
			* mem
			*/
      mem: {
        total: 0,
        free: 0,
        percentage: 0,
        prev: {
          total: 0,
          free: 0,
          percentage: 0
        },
      },
      timestamps: [],
      uptime: {
        value: 0,
        timestamp: 0,
        prev: {
          value: 0,
          timestamp: 0
        }
      },
      loadavg: {
        value: 0,
        timestamp: 0,
        prev: {
          value: 0,
          timestamp: 0
        }
      },
      // loadavg: [],
      networkInterfaces: {
        value: {},
        timestamp: 0,
        prev: {
          value: {},
          timestamp: 0,
        }
      },
      cpu: {
        total: 0,
        idle: 0,
        timestamp: 0,
        percentage: 0,
        prev: {
          total: 0,
          idle: 0,
          timestamp: 0,
          percentage: 0
        }
      },
			/** **/

    }
  },
  created: function(){
    let self = this;

    this.EventBus.$on('timestamp', doc => {
			// ////console.log('recived doc via Event timestamp', doc)
      self.timestamps.push( doc );
      // self.timestamps = self.timestamps.slice(-self.seconds)
      let length = self.timestamps.length
      self.timestamps.splice(
        -self.seconds -1,
        length - self.seconds
      )

		})

    this.EventBus.$on('networkInterfaces', doc => {
			// console.log('recived doc via Event networkInterfaces', doc)

      self.$set(self.networkInterfaces, 'prev', {
        value: JSON.parse(JSON.stringify(self.networkInterfaces.value)),
        timestamp: JSON.parse(JSON.stringify(self.networkInterfaces.timestamp)),
      })

      // self.networkInterfaces.prev = JSON.parse(JSON.stringify(self.networkInterfaces.current))
      if(Object.keys(self.networkInterfaces.prev.value) == 0)
        self.networkInterfaces.prev.value = JSON.parse(JSON.stringify(doc))


      self.networkInterfaces.value = doc;
      self.networkInterfaces.timestamp = JSON.parse(JSON.stringify(self.timestamps.getLast()));
		})



    this.EventBus.$on('loadavg', doc => {
			//console.log('recived doc via Event loadavg', doc)

      self.$set(self.loadavg, 'prev', {
        value: JSON.parse(JSON.stringify(self.loadavg.value)),
        timestamp: JSON.parse(JSON.stringify(self.loadavg.timestamp)),
      })

      self.loadavg.value = doc;
			self.loadavg.timestamp = self.timestamps.getLast();


		})

    this.EventBus.$on('uptime', doc => {



      self.$set(self.uptime, 'prev', {
        value: JSON.parse(JSON.stringify(self.uptime.value)),
        timestamp: JSON.parse(JSON.stringify(self.uptime.timestamp)),
      })

      self.uptime.value = doc;
			self.uptime.timestamp = self.timestamps.getLast();

      // console.log('recived doc via Event uptime', doc)
      // console.log('recived doc via Event uptime', self.timestamps.getLast())
		})

		this.EventBus.$on('mem', doc => {
      // //console.log('recived doc via Event mem', doc)

      self.$set(self.mem, 'prev', {
        total: JSON.parse(JSON.stringify(self.mem.total)),
        free: JSON.parse(JSON.stringify(self.mem.free)),
        percentage: JSON.parse(JSON.stringify(self.mem.percentage)),
      })


      self.mem.total = doc.totalmem
      self.mem.free = doc.freemem

      let percentage = 100

			if(doc.totalmem != 0)
				percentage -= doc.freemem * 100 / doc.totalmem;

      self.mem.percentage = percentage

		})

    // this.prev_cpu = {total: 0, idle: 0 , timestamp: 0};

    this.EventBus.$on('cpu', doc => {
      // //console.log('recived doc via Event cpu', doc)

      if(doc.total != self.cpu.total){
        self.$set(self.cpu, 'prev', {
          total: JSON.parse(JSON.stringify(self.cpu.total)),
          idle: JSON.parse(JSON.stringify(self.cpu.idle)),
          timestamp: JSON.parse(JSON.stringify(self.cpu.timestamp)),
        })

        self.cpu.total = doc.total;
  			self.cpu.idle = doc.idle;
        self.cpu.timestamp = self.timestamps.getLast();

        let diff_time = this.cpu.timestamp - this.cpu.prev.timestamp;
        let diff_total = this.cpu.total - this.cpu.prev.total;
        let diff_idle = this.cpu.idle - this.cpu.prev.idle;

        //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
        let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / 10;
        // self.cpu.percentage = (percentage.toFixed(2) > 100) ? 100 : percentage.toFixed(2);
        self.cpu.percentage = (percentage > 100) ? 100 : percentage;


      }
		})
	},


}
</script>
