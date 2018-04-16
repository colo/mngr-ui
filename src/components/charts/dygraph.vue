<template>
  <div :id="id+'-container' "class="netdata-container-with-legend" :style="options.style">
     <div
       :id="id"
       :class="options.class"
     >

    </div>
    <div
    class="netdata-chart-legend"
    :id="id+'-netdata-chart-legend'"
    >
    </div>
  </div>
</template>

<script>

import Dygraph from 'dygraphs'
import 'dygraphs/src/extras/smooth-plotter'

import 'dygraphs/dist/dygraph.css'

export default {
  name: 'dygraph',

  // chart: null,
  props: {
    id: {
      type: [String],
      default: () => ('')
    },
    // style: {
    //   type: [String],
    //   default: () => ('')
    // },
    options: {
      type: [Object],
      default: () => ({})
    },
    // data: {
    //   type: [Array],
    //   default: () => ([])
    // },
    // init: {
    //   type: [Function],
    //   default: () => (null)
    // },
    stat: {
      type: [Object],
      default: () => ({})
    },
  },
  data () {
    return {
      chart: null,
      highlighted: false,
    }
  },
  created () {
    window.EventBus.$on('highlightCallback', params => {
      this.highlighted = true
      console.log('event highlightCallback', params)
		})
    window.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      console.log('event unhighlightCallback', event)
		})

    // keypath
    let unwatch = this.$watch('stat.data', function (val, oldVal) {
      //console.log('creating chart...', this.id, this.stat.data)
      if(val.length > 1 && this.chart == null){

        if(this.options.options.labelsDiv)
          this.options.options.labelsDiv = this.id+'-'+this.options.options.labelsDiv

        console.log('labelsDiv', this.id, this.options.options.labelsDiv, document.getElementById(this.options.options.labelsDiv))

        this.chart = new Dygraph(
          document.getElementById(this.id),  // containing div
          this.stat.data,
          this.options.options
        )

        if(this.options.init)
          this.options.init(this)

        unwatch()
      }
    })
  },
  mounted () {

  },
  watch: {
    // 'stat.data': function(val){
    //   // //console.log('creating chart...', this.id, this.stat.data)
    //   if(this.stat.data.length > 1 && this.chart == null){
    //
    //     this.chart = new Dygraph(
    //       document.getElementById(this.id),  // containing div
    //       this.stat.data,
    //       this.options
    //     )
    //
    //     if(this.init)
    //       this.init(this.chart, this.stat)
    //   }
    // }
  },
  methods: {
    // getDygraph (){
    //   return document.getElementById(this.id)
    // },
    updateOptions (options){
      let self = this
      // //console.log('updating chart...', this.id, self.stat.data)
      if(this.highlighted == false)
        this.chart.updateOptions(
          Object.merge(
            {
              'file': self.stat.data
            },
            options
          )
        );
    }
  }
}
</script>
