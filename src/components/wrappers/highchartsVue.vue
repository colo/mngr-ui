<template>

    <div v-if="options.class"
      :id="id+'-container'"
      class="netdata-container-with-legend"
      :style="options.style"
      v-bind:class="container_class_helper"
    >
    <!--   -->
    <highcharts
      :ref="id"
      :id="id"
      :class="options.class"
      :options="options.options"
    >
    </highcharts>

    <!-- <div
    class="netdata-chart-legend"
    :id="id+'-netdata-chart-legend'"
    >
    </div> -->
    </div>

    <highcharts v-else
      :ref="id"
      :id="id"
      :options="options.options"
    >
    </highcharts>


</template>


<script>

/**
* highcharts sync
* https://www.highcharts.com/blog/snippets/synchronisation-of-multiple-charts/
**/

export default {
  name: 'highcharts-vue-wrapper',

  // components: {
  //   highcharts
  // },

  // chart: null,
  freezed: false,

  props: {
    EventBus: {
      type: [Object],
       default: () => ({})
    },
    id: {
      type: [String],
      default: () => ('')
    },
    options: {
      type: [Object],
      default: () => ({})
    },

    stat: {
      type: [Object],
      default: () => ({})
    },

    freezed: {
      type: [Boolean],
      default: () => (false)
    },
    visible: {
      type: [Boolean],
      default: () => (true)
    },
  },
  data () {
    return {
      // values: [],
      // labels: [],
      container_class_helper: '',
      chart: null,
      // highlighted: false,
      // ready: false,
      // to_suspend: false,
    }
  },
  watch: {
    visible: function (val) {
      this.container_class_helper = (val == false) ? 'invisible' : ''
      // console.log('class visible', val, this.container_class_helper)
    }
  },

  created () {
    this.chart = this
    // // //console.log('created', this.id, this.visible)
    //
    // // this.EventBus.$on('highlightCallback', params => {
    // //   this.highlighted = true
    // //   // ////console.log('event highlightCallback', params)
		// // })
    // // this.EventBus.$on('unhighlightCallback', event => {
    // //   this.highlighted = false
    // //   // ////console.log('event unhighlightCallback', event)
		// // })
    //
    // // keypath
    // let unwatch = this.$watch('stat.data', function (val, oldVal) {
    //
    //
    //   ////console.log('created', this.id, this.stat.data)
    //
    //   // if(val.length > 1 && this.chart == null){
    //   if(val.length > 1){
    //
    //
    //     this._create_frappe()
    //
    //     unwatch()
    //   }
    //
    // })
  },
  // mounted () {
  //
  //   if(this.chart == null){
  //
  //     this._create_frappe()
  //
  //   }
  //
  // },

  // destroyed (){
  //
  //   if(this.chart){
  //     this.chart.destroy()
  //     this.chart = null
  //   }
  //   this.$off()
  // },
  methods: {

    // _create_frappe (){
    //   let options = Object.clone(this.options.options)
    //   // console.log('frappe options', options)
    //   // if(options.labelsDiv)
    //   //   options.labelsDiv = this.id+'-'+options.labelsDiv
    //
    //   this.chart = new Chart(
    //     document.getElementById(this.id),  // containing div
    //     options
    //   )
    //
    //   // this.chart.ready(function(){
    //   //   // ////console.log('chart '+this.id+' ready')
    //   //   this.ready = true
    //   // }.bind(this))
    //
    //   if(this.options.init)
    //     this.options.init(this, this.chart, 'frappe')
    // },
    update () {
      // let data = {
      //   labels: [],
      //   datasets: []
      // }
      //
      // // const skip = 15
      // this.$refs[this.id].option.xAxis.data = []

      //
      // console.log('updating....',this.options.options.series)

      Array.each(this.stat.data, function(column, index){
        // if(
        //   !this.options.watch.skip
        //   || (
        //     index == 0
        //     || (index % this.options.watch.skip == 0)
        //     || index == this.stat.data.length - 1
        //   )
        // ){

          // this.$refs[this.id].option.xAxis.data.push(new Date(column[0]).toLocaleTimeString())
          // chart.options.option.legend.data.push(name)
          // data.labels.push(new Date(column[0]).toLocaleTimeString())
          //

          // if(column[0]== 0){
          //   console.log('zeroooo')
          // }

          if(column.length == 1){//gauge type
            this.$set(this.options.options.series[0].data, 0, column[0])
            // this.options.options.series[0].data.push(column[0])
            // this.options.options.series[0].data.shift()
          }
          else{
            Array.each(column, function(value, value_index){
              if(value_index != 0){
                // if(!this.$refs[this.id].options.series[value_index -1]){
                //   this.$refs[this.id].options.series[value_index -1] = {
                //     name: this.id,
                //     data: []
                //   }
                // }
                // else
                if (index == 0){
                  // let serie = this.options.options.series[value_index -1]
                  // serie.data = []
                  this.$set(this.options.options.series[value_index -1], 'data', [])

                }

                this.options.options.series[value_index -1].data.push([
                  new Date(column[0]).getTime(),//timestamp
                  value
                ])
              }

            }.bind(this))
          }

        // }

      }.bind(this))

      // console.log('updated....',this.options.options.series)
      // Array.each(series, function(serie, index){
      //   this.$refs[this.id].options.series[index].update({ data: serie.data })
      // }.bind(this))

      //
      // // console.log(data)
      // this.chart.update(data)
      // // this.chart.updateDataset(data.datasets[0].values, 0)
      // // this.$set(this, 'labels', [])
      // // this.$set(this, 'values', [])
      // //
      // // Array.each(this.stat.data, function(data){
      // //   this.values.push(data[1])
      // // }.bind(this))
      // //
      //
      // // console.log('this.values', this.values)
    },

  }
}
</script>
