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
      console.log('class visible', val, this.container_class_helper)
    }
  },
  // computed: {
  //   container_class_helper: function (){
  //     // let css = 'netdata-container-with-legend'
  //     let css = (this.visible == true) ? ' hidden' : ''
  //     //console.log('class visible '+css)
  //     return css
  //   }
  // },
  created () {
    // //console.log('created', this.id, this.visible)

    this.EventBus.$on('highlightCallback', params => {
      this.highlighted = true
      // ////console.log('event highlightCallback', params)
		})
    this.EventBus.$on('unhighlightCallback', event => {
      this.highlighted = false
      // ////console.log('event unhighlightCallback', event)
		})

    // keypath
    let unwatch = this.$watch('stat.data', function (val, oldVal) {


      ////console.log('created', this.id, this.stat.data)

      // if(val.length > 1 && this.chart == null){
      if(val.length > 1){


        this._create_dygraph()

        unwatch()
      }

    })
  },
  mounted () {
    //console.log('mounted', this.id, this.visible)


    if(this.chart == null){

      this._create_dygraph()

    }

  },
  // mounted () {
  //
  //
  // },
  destroyed (){
    ////console.log('destroyed', this.id)
    // ////console.log('destroyed suspended', this.suspended)
    // if(this.to_suspend == true)
    //   this.suspended = true//do update this time, next one ommit, so we get chart redraw
    //
    //
    if(this.chart){
      this.chart.destroy()
      this.chart = null
    }
    this.$off()
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
    _create_dygraph (){
      let options = Object.clone(this.options.options)

      /**
      * ugly hack:
      * Due to JavaScript deep cloning
      */
      //deep clone/stringify object to loose any refere (loosing any "function" declarations)
      // let options = JSON.parse(JSON.stringify(this.options.options))

      /**
      * deep clone object with completeAssign (keep references), and merge the two,
      * recovering "function" declarations
      */
      // options = Object.merge(options, this.completeAssign({}, this.options.options ))

      if(options.labelsDiv)
        options.labelsDiv = this.id+'-'+options.labelsDiv

      //////console.log('creatin chart labelsDiv', this.id, options.labelsDiv, document.getElementById(options.labelsDiv))

      this.chart = new Dygraph(
        document.getElementById(this.id),  // containing div
        this.stat.data,
        options
      )

      this.chart.ready(function(){
        // ////console.log('chart '+this.id+' ready')
        this.ready = true
      }.bind(this))

      if(this.options.init)
        this.options.init(this, this.chart, 'dygraph')
    },
    updateOptions (options, block_redraw){


      let self = this

      ////console.log('updating chart, suspended...', this.id, this.$options.freezed, this.freezed)

      // let data =  Array.clone(self.stat.data)

      if(this.highlighted == false && this.ready == true
        // && this.$options.freezed <= 2//needed number of iterations to update data 'onRange'
        // && this.freezed == false
      ){


        /**
        * needed to reset chart, for rangeDocs
        **/
        // if(this.chart.numRows() !=  self.stat.data.length -1){
        //   let columns = this.chart.rawData_[0].length - 1
        //   let data = []
        //   // data[0].fill(0, 0, columns)
        //   for(let i = 0; i < self.stat.data.length -1; i++){
        //     data[i] = []
        //     for(let j = 0; j<= columns; j++){
        //       data[i].push(0)
        //     }
        //   }
        //
        //
        //
        //   this.chart.updateOptions(
        //     Object.merge(
        //       {
        //         'file': data
        //       },
        //       options
        //     )
        //   );
        // }



        // if(this.$options.freezed == false || (this.chart.numRows() !=  this.$options.freezed)){
        //
          // ////console.log('data length',this.chart.numRows(), self.stat.data.length)

          // //console.log('this.chart.updateOptions', this.id)

          this.chart.updateOptions(
            Object.merge(
              {
                'file': self.stat.data
              },
              options
            ),
            block_redraw
          );
          // this.chart.updateOptions(
          //   Object.merge(
          //     {
          //       'file': Array.clone(self.stat.data)
          //     },
          //     options
          //   )
          // );

          ////console.log('updating data', this.id, this.chart.numRows(), self.stat.data.length - 1)

          // this.chart.adjustRoll(self.stat.data.length)



          this.chart.setSelection(this.chart.numRows() - 1, {}, false)

        //   if(this.freezed == true){
        //     this.$options.freezed = data.length -1
        //   }
        //
        // }

      }

      // this.$options.freezed = JSON.parse(JSON.stringify(this.freezed))
      // if(this.freezed == false){
      //   this.$options.freezed = false
      // }
      // else{
      //   this.$options.freezed = data.length
      // }
      // if(this.suspended == true){
      //   this.chart.setSelection(this.chart.numRows() - 1, {}, false)
      //   ////console.log('updating chart, suspended...', this.id, this.suspended)
      // }

    }
  }
}
</script>
