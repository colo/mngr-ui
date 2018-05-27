<template>
  <div
    :id="id+'-container'"
    class="netdata-container-with-legend"
    v-bind:class="container_class_helper"
    :style="options.style"
  >
  <!--
  :class="options.class" -->
     <div
     :style="options.style"
     :ref="id"
     :id="id"
     >

    </div>
    <!-- <div
    class="netdata-chart-legend"
    :id="id+'-netdata-chart-legend'"
    >
    </div> -->
  </div>
</template>

<script>

export default {
  name: 'amcharts3-wrapper',

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
      container_class_helper: '',
      chart: null,
      highlighted: false,
      ready: false,
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
    // //console.log('created', this.id, this.visible)

    // this.EventBus.$on('highlightCallback', params => {
    //   this.highlighted = true
    //   // ////console.log('event highlightCallback', params)
		// })
    // this.EventBus.$on('unhighlightCallback', event => {
    //   this.highlighted = false
    //   // ////console.log('event unhighlightCallback', event)
		// })

    // keypath
    let unwatch = this.$watch('stat.data', function (val, oldVal) {


      ////console.log('created', this.id, this.stat.data)

      // if(val.length > 1 && this.chart == null){
      if(val.length > 1){


        this._create_chart()

        unwatch()
      }

    })
  },
  mounted () {

    if(this.chart == null){

      this._create_chart()

    }

  },

  destroyed (){
    //
    // if(this.chart){
    //   this.chart.destroy()
    //   this.chart = null
    // }
    // this.$off()
  },
  methods: {
    _create_chart (){
      let options = Object.clone(this.options.options)

      // if(options.labelsDiv)
      //   options.labelsDiv = this.id+'-'+options.labelsDiv


      console.log('_create_chart AmCharts',options )

      this.chart = this.$AmCharts.makeChart(this.id, options)


      // this.chart = new amcharts3(
      //   document.getElementById(this.id),  // containing div
      //   this.stat.data,
      //   options
      // )
      //
      // this.chart.ready(function(){
      //   // ////console.log('chart '+this.id+' ready')
      //   this.ready = true
      // }.bind(this))

      if(this.options.init)
        this.options.init(this, this.chart, 'amcharts3')
    },
    update (){

      // console.log('update this.chart', this.chart)

      // let dataProvider = this.chart.dataProvider[0]
      let axis = this.options.axis

      // // const skip = 15
      let data = []
      Array.each(this.stat.data, function(column, index){

        // if(index == 0 || (index % skip == 0)){

          // data.labels.push(new Date(column[0]).toLocaleTimeString())
          let to_data = {}
          Array.each(column, function(value, value_index){
            let property = axis[value_index]
            to_data[property] = value

            // if(value_index != 0){
            //
            //   // if(!data.datasets[value_index -1])
            //   //   data.datasets[value_index -1] = {
            //   //     name: this.options.options.data.datasets[value_index - 1].name,
            //   //     chartType: this.options.options.data.datasets[value_index - 1].chartType,
            //   //     values: []
            //   //   }
            //   //
            //   // data.datasets[value_index -1].values.push(parseFloat((value.toFixed ) ? value.toFixed(2) : value))
            // }

          }.bind(this))

          data.push(to_data)

        // }

      }.bind(this))

      // console.log('update this.chart', data)

      // this.queueDataUpdate(this.chart)
      this.$AmCharts.queueDataUpdate(this.chart, data)
    },

    /**
     * Amcharts Queue: https://www.amcharts.com/kbase/optimizing-multi-chart-periodically-updated-dashboards/
     */
     // queueDataUpdate (chart, data){
     //
     //
     //   AmCharts.queueDataUpdate(chart, data);
     // },
  }
}
</script>
