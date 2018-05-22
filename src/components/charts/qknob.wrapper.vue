<template>
  <!-- <div
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
  </div> -->
  <q-knob
   v-model="stat.data.getLast()[1]"
   readonly
   v-bind="stat.options"
   :ref="id"
   :id="id"
   :class="options.class"
  >
    <q-icon class="on-left" :name="stat.icon" />{{stat.data.getLast()[1]}} %
  </q-knob>
</template>


<script>


export default {
  name: 'q-knob-wrapper',

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
      // container_class_helper: '',
      // chart: null,
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

  // created () {
  //   // //console.log('created', this.id, this.visible)
  //
  //   this.EventBus.$on('highlightCallback', params => {
  //     this.highlighted = true
  //     // ////console.log('event highlightCallback', params)
	// 	})
  //   this.EventBus.$on('unhighlightCallback', event => {
  //     this.highlighted = false
  //     // ////console.log('event unhighlightCallback', event)
	// 	})
  //
  //   // keypath
  //   let unwatch = this.$watch('stat.data', function (val, oldVal) {
  //
  //
  //     ////console.log('created', this.id, this.stat.data)
  //
  //     // if(val.length > 1 && this.chart == null){
  //     if(val.length > 1){
  //
  //
  //       this._create_dygraph()
  //
  //       unwatch()
  //     }
  //
  //   })
  // },
  // mounted () {
  //
  //   if(this.chart == null){
  //
  //     this._create_dygraph()
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
    // update (){
    //   this.updateOptions(
    //     { 'dateWindow': this.chart.xAxisExtremes() },
    //     false
    //   )
    // },
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
