<template>
  <div
    :id="id+'-container'"
    class="netdata-container-with-legend"
    v-bind:class="container_class_helper"
    :style="options.style"
  >

     <IEcharts
       :ref="id"
       :id="id"
       :class="options.class"
       v-bind="options.options"
     />


    <!-- <div
    class="netdata-chart-legend"
    :id="id+'-netdata-chart-legend'"
    >
    </div> -->
  </div>
</template>

<script>


export default {
  name: 'vue-echarts3-wrapper',

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
    this.chart = this

    // // //console.log('created', this.id, this.visible)
    //
    // this.EventBus.$on('highlightCallback', params => {
    //   this.highlighted = true
    //   // ////console.log('event highlightCallback', params)
		// })
    // this.EventBus.$on('unhighlightCallback', event => {
    //   this.highlighted = false
    //   // ////console.log('event unhighlightCallback', event)
		// })
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
    //     this._create_dygraph()
    //
    //     unwatch()
    //   }
    //
    // })
  },
  mounted () {

    // if(this.chart == null){
    //
    //   this._create_dygraph()
    //
    // }

  },

  destroyed (){

    // if(this.chart){
    //   this.chart.destroy()
    //   this.chart = null
    // }
    // this.$off()
  },
  methods: {

    // _create_dygraph (){
    //   let options = Object.clone(this.options.options)
    //
    //   if(options.labelsDiv)
    //     options.labelsDiv = this.id+'-'+options.labelsDiv
    //
    //   this.chart = new Dygraph(
    //     document.getElementById(this.id),  // containing div
    //     this.stat.data,
    //     options
    //   )
    //
    //   this.chart.ready(function(){
    //     // ////console.log('chart '+this.id+' ready')
    //     this.ready = true
    //   }.bind(this))
    //
    //   if(this.options.init)
    //     this.options.init(this, this.chart, 'dygraph')
    // },
    update (){
      // let data = {
      //   labels: [],
      //   datasets: []
      // }

      // const skip = 15
      this.$refs[this.id].option.xAxis.data = []

      // console.log('updating....',this.stat.data)

      Array.each(this.stat.data, function(column, index){
        // if(
        //   !this.options.watch.skip
        //   || (
        //     index == 0
        //     || (index % this.options.watch.skip == 0)
        //     || index == this.stat.data.length - 1
        //   )
        // ){

          this.$refs[this.id].option.xAxis.data.push(new Date(column[0]).toLocaleTimeString())
          // chart.options.option.legend.data.push(name)
          // data.labels.push(new Date(column[0]).toLocaleTimeString())
          //
          Array.each(column, function(value, value_index){
            if(value_index != 0){
              if(!this.$refs[this.id].option.series[value_index -1]){
                this.$refs[this.id].option.series[value_index -1] = {
                  type: this.options.type,
                  data: []
                }
              }
              else if (index == 0){
                this.$refs[this.id].option.series[value_index -1].data = []
              }

              this.$refs[this.id].option.series[value_index -1].data.push(value)
            }

          }.bind(this))

        // }

      }.bind(this))
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
