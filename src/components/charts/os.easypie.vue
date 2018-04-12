<template>

      <!-- OS stats -->

    <q-collapsible
      :opened="true"
      icon="info"
      :separator="true"
      header-class="text-primary bg-white"
      label="System Overview"
    >
    <!-- :key="name"
    :ref="name"
    :name="name"
    :label="name" -->
    <!-- v-for="(stat, name) in $options.stats" -->

       <at-card :bordered="false">
         <div class="row justify-center">
           <div
            v-for="(stat, name) in $options.stats"
            class="col-sm-2 col-md-3 justify-center"
            :id="name"
            :style="stat.style"
            :key="name"
            :ref="name"
            v-observe-visibility="visibilityChanged"
            >
              <!-- https://github.com/vuejs/babel-plugin-transform-vue-jsx/issues/86 -->
              <component
                :is="stat.component.type"
                :class="stat.component.class"
                v-model="stats[name].data"
                v-bind="stat.component.options"
              />


              <!-- v-bind="stat.component.options" -->
              <!-- v-model="stat.component['v-model']" -->
              <!-- v-bind="stat.component.options" -->
              <!-- <q-knob v-if="stat.component == 'q-knob'"
               v-model="stats[name].data"
               readonly
               v-bind="stat.options"
              >
              <q-icon class="on-left" :name="stat.icon" />{{stats[name].data}} %
              </q-knob>
             <vue-easy-pie-chart v-else v-bind="stat.options" :percent="stats[name].data"/> -->

             <!-- <p>{{name}}</p> -->
           </div>
        </div>
       </at-card>
    </q-collapsible>


</template>

<script>

import VueEasyPieChart from 'vue-easy-pie-chart'
import 'vue-easy-pie-chart/dist/vue-easy-pie-chart.css'

import stats from './js/os.easypie'


export default {
  // name: 'App',
  name: 'oseasypie',

  visibles: {},
  // uptime_chart: null,
  components: {
    VueEasyPieChart
  },
  props: {
    timestamps: {
      type: [Array],
      default: () => ([])
    },
    mem: {
      type: [Array],
      default: () => ([])
    },
    cpu: {
      type: [Array],
       default: () => ([])
    },
    // uptime: {
    //   type: [Array],
    //   default: () => ([])
    // },
    // loadavg: {
    //   type: [Array],
    //   default: () => ([])
    // },
    // networkInterfaces: {
    //   type: [Array],
    //   default: () => ([])
    // }
  },

  stats: stats,

  data () {
    return {
      charts : {},
      stats: {},
    }
  },
  // updated () {
  //   this.$q.loading.hide()
  // },
  created () {
    Object.each(this.$options.stats, function(stat, name){

      // let data = [[]]
      // if(stat.options.labels)
      //   Array.each(stat.options.labels, function(label, index){
      //     if(index == 0){
      //       data[0].push(Date.now())
      //     }
      //     else{
      //       data[0].push(0)
      //     }
      //
      //
      //   })

      this.$set(this.stats, name, {lastupdate: 0, 'data': 0 })


      // this.$set(this.charts, name, new Dygraph(
      //     document.getElementById(name),  // containing div
      //     this.stats[name].data,
      //     stat.options
      //   ))
      //
      // if(stat.init)
      //   stat.init(this.charts[name], this.stats[name])
      //
      // this.expanded.push(name)
    }.bind(this))
  },
  mounted () {

    // Object.each(this.$options.stats, function(stat, name){
    // //
    // //   let data = [[]]
    // //   if(stat.options.labels)
    // //     Array.each(stat.options.labels, function(label, index){
    // //       if(index == 0){
    // //         data[0].push(Date.now())
    // //       }
    // //       else{
    // //         data[0].push(0)
    // //       }
    // //
    // //
    // //     })
    // //
    // //   this.$set(this.stats, name, {lastupdate: 0, 'data': data })
    // //   // stat.option.dataProvider = this.stats[name].data
    // //   this.$set(this.charts, name, new Dygraph(
    // //       document.getElementById(name),  // containing div
    // //       this.stats[name].data,
    // //       stat.options
    // //     ))
    // //
    // //   if(stat.init)
    // //     stat.init(this.charts[name], this.stats[name])
    // //
    // //   this.expanded.push(name)
    //   // this.$set(this.$refs[name][0],'value', this.stats[name].data)
    //   console.log('this.$refs', name, this.$refs[name])
    // }.bind(this))

  },

  watch: {
    mem: function(val){
      // console.log('mem val', val)
      // if(this.$refs['mem']){
        if(
          this.stats.mem.lastupdate < Date.now() - this.$options.stats.mem.interval &&
          this.$options.visibles['mem'] == true
        ){
          let last = val.getLast()

          if(last == null)
            last = { percentage: 0 }

          last.percentage = parseFloat(last.percentage.toFixed(2))
          this.stats.mem.data = last.percentage
          this.stats.mem.lastupdate = Date.now()
        }
      // }
    },
    cpu: function(val){
      // console.log('cpu val', val)
      if(this.$refs['cpu']){
        if(
          this.stats.cpu.lastupdate < Date.now() - this.$options.stats.cpu.interval &&
          this.$options.visibles['cpu'] == true
        ){
          // console.log('update cpu')
          let last = val.getLast()

          if(last == null)
            last = { percentage: 0 }

          last.percentage = parseFloat(last.percentage.toFixed(2))
          this.stats.cpu.data = last.percentage
          this.stats.cpu.lastupdate = Date.now()
        }

      }

		},
  },

  computed: {
  },
  methods: {
    visibilityChanged (isVisible, entry) {
      this.$options.visibles[entry.target.id] = isVisible
      console.log('visible', isVisible, entry.target)
    },
  },
}
</script>

<style scoped>

</style>
