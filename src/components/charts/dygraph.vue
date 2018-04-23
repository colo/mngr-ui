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
    EventBus: {
      type: [Object],
       default: () => ({})
    },
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

    this.EventBus.$on('highlightCallback', params => {
      this.highlighted = true
      ////console.log('event highlightCallback', params)
		})
    this.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      ////console.log('event unhighlightCallback', event)
		})

    // keypath
    let unwatch = this.$watch('stat.data', function (val, oldVal) {

      if(val.length > 1 && this.chart == null){
        // //console.log('creating chart...', this.id,this.chart, this.stat.data)

        /**
        * ugly hack:
        * Due to JavaScript deep cloning
        */
        //deep clone/stringify object to loose any refere (loosing any "function" declarations)
        let options = JSON.parse(JSON.stringify(this.options.options))

        /**
        * deep clone object with completeAssign (keep references), and merge the two,
        * recovering "function" declarations
        */
        options = Object.merge(options, this.completeAssign({}, this.options.options ))

        if(options.labelsDiv)
          options.labelsDiv = this.id+'-'+options.labelsDiv

        //console.log('creatin chart labelsDiv', this.id, options.labelsDiv, document.getElementById(options.labelsDiv))

        this.chart = new Dygraph(
          document.getElementById(this.id),  // containing div
          this.stat.data,
          options
        )

        if(this.options.init)
          this.options.init(this)

        unwatch()
      }
      // else if(val.length > 1 && val.length != oldVal.length){
      //   console.log('destroying...')
      //   this.$destroy()
      // }


    })
  },
  mounted () {

  },
  watch: {
    // 'stat.data': function(val){
    //   // //////console.log('creating chart...', this.id, this.stat.data)
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
    /**
    * @source: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Object/assign
    */
    completeAssign(target, ...sources) {
      sources.forEach(source => {
        let descriptors = Object.keys(source).reduce((descriptors, key) => {
          descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
          return descriptors;
        }, {});
        // por defecto, Object.assign copia las propiedades de tipo Symbol que sean enumerables
        Object.getOwnPropertySymbols(source).forEach(sym => {
          let descriptor = Object.getOwnPropertyDescriptor(source, sym);
          if (descriptor.enumerable) {
            descriptors[sym] = descriptor;
          }
        });
        Object.defineProperties(target, descriptors);
      });
      return target;
    },

    // getDygraph (){
    //   return document.getElementById(this.id)
    // },
    updateOptions (options){
      let self = this
      ////console.log('updating chart...', this.id, self.stat.data)

      if(this.highlighted == false){
        this.chart.updateOptions(
          Object.merge(
            {
              'file': self.stat.data
            },
            options
          )
        );


        this.chart.setSelection(this.chart.numRows() - 1, {}, false)

      }



    }
  }
}
</script>
