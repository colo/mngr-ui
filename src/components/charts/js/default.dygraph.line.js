export default {
    component: 'dygraph-vue',
    "style": "width:100%; height:126px;",
    "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
    "interval": 0,
    // init: function (vue){
    //   // //console.log('init', vue)
    //   this.$vm = vue
    //   // EventBus.$emit('cpu', doc) //update cpu widget
    // },
    pre_process: function(chart, name, stat){

      if(!chart.options || !chart.options.labels){
        if(!chart.options)
          chart.options = {}

        chart.options.labels = []

        /**
        * dynamic, like 'cpus', that is an Array (multiple cores) of Objects and we wanna watch a specific value
        * cpus[0].value[N].times[idle|irq...]
        */
        if(Array.isArray(stat[0].value)
          && chart.watch && chart.watch.value
          && stat[0].value[0][chart.watch.value]
        ){
          // console.log('Array.isArray(stat[0].value)', stat[0].value)
          Object.each(stat[0].value[0][chart.watch.value], function(tmp, tmp_key){
            chart.options.labels.push(tmp_key)
          })

          chart.options.labels.unshift('Time')

        }
        /**
        * dynamic, like 'blockdevices', that is an Object and we wanna watch a specific value
        * stat[N].value.stats[in_flight|io_ticks...]
        */
        else if(isNaN(stat[0].value) && !Array.isArray(stat[0].value)){//an Object

          //if no "watch.value" property, everything should be manage on "trasnform" function
          if(chart.watch && chart.watch.managed != true
            // && chart.watch.value
          ){
            Object.each(stat[0].value[chart.watch.value], function(tmp, tmp_key){
              // //console.log('labeling...', tmp)
              chart.options.labels.push(tmp_key)
            })

            chart.options.labels.unshift('Time')
          }

        }
        //simple, like 'loadavg', that has 3 columns
        else if(Array.isArray(stat[0].value)){

          chart.options.labels = ['Time']

          for(let i= 0; i < stat[0].value.length; i++){//create data columns
            chart.options.labels.push(name+'_'+i)
          }


          // this.process_chart(chart, name)
        }
        //simple, like 'uptime', that has one simple Numeric value
        else if(!isNaN(stat[0].value)){//
          chart.options.labels = ['Time']

          chart.options.labels.push(name)
          // this.process_chart(chart, name)
        }

        else{
          chart = null
        }
      }

      return chart
    },
    "options": {
      axisLabelFontSize: 12,
      /**
      * netdata options
      */
      xRangePad: 0,
      yRangePad: 10,
      pixelRatio: 1,
      drawGapEdgePoints: true,
      stepPlot: false,
      gridLinePattern: null,
      gridLineWidth: 1.0,
      maxNumberWidth: 8,
      sigFigs: null,
      digitsAfterDecimal: 2,
      /**
      * netdata options
      */
      highlightCallback: function(event, x, points, row, seriesName){
        window.EventBus.$emit('highlightCallback', [event, x, points, row, seriesName])
      },
      unhighlightCallback: function(event){
        window.EventBus.$emit('unhighlightCallback', event)
      },
      drawGrid: true,
      labelsSeparateLines: true,
      "hideOverlayOnMouseOut": false,
      "labelsDiv": "netdata-chart-legend",
      "legend": "always",
      connectSeparatedPoints: true,
      // connectSeparatedPoints: false,
      includeZero: true,
      fillGraph: true,
      showRoller: false,


    }
  }
