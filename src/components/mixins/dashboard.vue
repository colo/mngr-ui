<script>
import Chart from './chart'

let get_dynamics = require( 'node-tabular-data' ).get_dynamics

export default {
  mixins: [Chart],

  DefaultChart: null,


  unwatchers: {},

  data () {
    return {

      charts: {},
      stats: {},

    }
  },

  methods: {

    add_chart (name, chart){
      this._add_chart(name, chart)
    },
    _add_chart (name, chart){
      let data = [[]]
      if(chart.options && chart.options.labels)//dygraph code, should be would
        Array.each(chart.options.labels, function(label, index){
          if(index == 0){
            data[0].push(Date.now())
          }
          else{
            // data[0].push(0)
            data[0].push(null)
          }

        })

      //console.log('adding chart...', name)
      if(!chart.icon){
        Object.each(this.$store.state.app.icons, function(rgexp, icon){
            if(rgexp.test(name))
              chart.icon = icon
        })

        if(!chart.icon)
          chart.icon = this.$store.state.app.default_chart_icon
      }

      this.$set(this.charts, name, chart)
      this.$set(this.stats, name, {lastupdate: 0, 'data': data })

      // this.expanded.push(name)
    },

    /**
    * @private
    * get dynamics charts that match this "dynamic chart name"
    **/
    _get_dynamic_charts: get_dynamics,
    // (name, dynamic_charts){
    //   let charts = {}
    //   Object.each(dynamic_charts, function(dynamic){
    //     if(dynamic.match.test(name) == true){
    //       if(!charts[name])
    //         charts[name] = []
    //
    //       charts[name].push(dynamic)
    //
    //     }
    //   }.bind(this))
    //
    //   return charts
    // },
    /**
    * @override chart [mixin]
    **/
    process_chart (chart, name){

      if(!chart.watch || chart.watch.managed != true){

        this.add_chart(name, chart)
      }

      this._process_chart(chart, name)
    },
  }
}
</script>
