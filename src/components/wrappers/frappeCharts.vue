<template>
  <div
    :id="id+'-container'"
    class="netdata-container-with-legend"
    v-bind:class="container_class_helper"
    :style="options.style"
  >
     <div
       :ref="id"
       :id="id"
       :class="options.class"
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

import { Chart } from 'frappe-charts/dist/frappe-charts.min.esm'

export default {
  name: 'frappe-charts-wrapper',

  // components: {
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
    // this.chart = this
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


        this._create_frappe()

        unwatch()
      }

    })
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

    _create_frappe (){
      let options = Object.clone(this.options.options)
      // console.log('frappe options', options)
      // if(options.labelsDiv)
      //   options.labelsDiv = this.id+'-'+options.labelsDiv

      this.chart = new Chart(
        document.getElementById(this.id),  // containing div
        options
      )

      // this.chart.ready(function(){
      //   // ////console.log('chart '+this.id+' ready')
      //   this.ready = true
      // }.bind(this))

      if(this.options.init)
        this.options.init(this, this.chart, 'frappe')
    },
    update () {
      let data = {
        labels: [],
        datasets: []
      }

      // const skip = 15
      Array.each(this.stat.data, function(column, index){
        // if(index == 0 || (index % skip == 0)){

          data.labels.push(new Date(column[0]).toLocaleTimeString())

          Array.each(column, function(value, value_index){
            if(value_index != 0){
              if(!data.datasets[value_index -1])
                data.datasets[value_index -1] = {
                  name: this.options.options.data.datasets[value_index - 1].name,
                  chartType: this.options.options.data.datasets[value_index - 1].chartType,
                  values: []
                }

              data.datasets[value_index -1].values.push(parseFloat((value.toFixed ) ? value.toFixed(2) : value))
            }

          }.bind(this))

        // }

      }.bind(this))

      // console.log(data)
      this.chart.update(data)
      // this.chart.updateDataset(data.datasets[0].values, 0)
      // this.$set(this, 'labels', [])
      // this.$set(this, 'values', [])
      //
      // Array.each(this.stat.data, function(data){
      //   this.values.push(data[1])
      // }.bind(this))
      //

      // console.log('this.values', this.values)
    },
    // updateOptions (options, block_redraw){
    //
    //   let self = this
    //
    //   if(this.highlighted == false && this.ready == true
    //     // && this.$options.freezed <= 2//needed number of iterations to update data 'onRange'
    //     // && this.freezed == false
    //   ){
    //
    //       this.chart.updateOptions(
    //         Object.merge(
    //           {
    //             'file': self.stat.data
    //           },
    //           options
    //         ),
    //         block_redraw
    //       );
    //
    //       this.chart.setSelection(this.chart.numRows() - 1, {}, false)
    //
    //
    //   }
    //
    // }
  }
}
</script>
