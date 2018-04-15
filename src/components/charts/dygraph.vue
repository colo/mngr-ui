<template>

   <div
     :id="id"
   ></div>

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
      chart: null
    }
  },
  created () {
    // keypath
    let unwatch = this.$watch('stat.data', function (val, oldVal) {
      //console.log('creating chart...', this.id, this.stat.data)
      if(val.length > 1 && this.chart == null){

        this.chart = new Dygraph(
          document.getElementById(this.id),  // containing div
          this.stat.data,
          this.options
        )

        if(this.stat.init)
          this.init(this.chart, this.stat)

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
    updateOptions (options){
      let self = this
      // //console.log('updating chart...', this.id, self.stat.data)
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
