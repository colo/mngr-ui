export default {
  component: 'highcharts-vue-wrapper',
  "style": "width:100%; height:200px;",
  type: 'line',
  "class": "netdata-chart-with-legend-right netdata-dygraph-chart-with-legend-right",
  "interval": 0,
  watch: {
    skip: 60,//some charts like frappe need to skip values for render performance (dygraph does this automatically)
  },
  pre_process: function(chart, name, stat){


    if(!chart.options
      || !chart.options.xAxis
      || !chart.options.xAxis.categories
      || chart.options.xAxis.categories.length == 0
    ){
      if(!chart.options)
        chart.options = {}

      if(!chart.options.xAxis)
        chart.options.xAxis = {}

      if(!chart.options.xAxis.categories)
        chart.options.xAxis.categories = []

      if(!chart.options.series)
        chart.options.series = []




      /**
      * dynamic, like 'cpus', that is an Array (multiple cores) of Objects and we wanna watch a specific value
      * cpus[0].value[N].times[idle|irq...]
      */
      if(Array.isArray(stat[0].value)
        && chart.watch && chart.watch.value
        && stat[0].value[0][chart.watch.value]
      ){
        Array.each(stat, function(d, d_index){
          if(
            !chart.watch.skip
            || (
              d_index == 0
              || (d_index % chart.watch.skip == 0)
              || d_index == d.length - 1
            )
          ){
            chart.options.data.labels.push(new Date(d.timestamp).toLocaleTimeString())

            let counter = 0
            Object.each(d.value[0][chart.watch.value], function(tmp, tmp_key){
              // console.log('TMP val', tmp)

              if(d_index == 0){
                chart.options.data.datasets.push({
                  name: tmp_key,
                  chartType: chart.type,
                  values: [parseFloat( (tmp.toFixed ) ? tmp.toFixed(2) : tmp ) ]
                })
              }
              else{
                chart.options.data.datasets[counter].values.push( parseFloat( (tmp.toFixed ) ? tmp.toFixed(2) : tmp ))
              }

              counter++
              // chart.options.labels.push(tmp_key)
            })


          }
        })

        // // console.log('Array.isArray(stat[0].value)', stat[0].value)
        // Object.each(stat[0].value[0][chart.watch.value], function(tmp, tmp_key){
        //   chart.options.labels.push(tmp_key)
        // })
        //
        // chart.options.labels.unshift('Time')

      }
      /**
      * dynamic, like 'blockdevices' or 'networkInterfaces', that is an Object and we wanna watch a specific value
      * stat[N].value.stats[in_flight|io_ticks...]
      */
      else if(isNaN(stat[0].value) && !Array.isArray(stat[0].value)){//an Object
        // console.log('pre_process frappe-charts-wrapper', chart, name, stat)

        //if no "watch.value" property, everything should be manage on "trasnform" function
        if(
          chart.watch && chart.watch.managed != true
          || !chart.watch
        ){

          Array.each(stat, function(d, d_index){
            if(
              !chart.watch.skip
              || (
                d_index == 0
                || (d_index % chart.watch.skip == 0)
                || d_index == d.length - 1
              )
            ){
              let obj = {}
              if(chart.watch.value){
                obj = d.value[chart.watch.value]
              }
              else{
                obj = d.value
              }

              chart.options.data.labels.push(new Date(d.timestamp).toLocaleTimeString())

              let counter = 0
              Object.each(obj, function(tmp, tmp_key){
                if(
                  !chart.watch
                  || !chart.watch.exclude
                  || (chart.watch.exclude && chart.watch.exclude.test(tmp_key) == false)
                ){

                  if(d_index == 0){
                  // if(chart.options.data.datasets.length == 0){
                    chart.options.data.datasets.push({
                      name: tmp_key,
                      chartType: chart.type,
                      values: [parseFloat( (tmp.toFixed ) ? tmp.toFixed(2) : tmp ) ]
                    })
                  }
                  else{
                    chart.options.data.datasets[counter].values.push( parseFloat( (tmp.toFixed ) ? tmp.toFixed(2) : tmp ))
                  }

                  counter++
                  // chart.options.labels.push(tmp_key)
                }
              })


            }
          })


        }


      }
      //simple, like 'loadavg', that has 3 columns
      else if(Array.isArray(stat[0].value)){

        Array.each(stat, function(d, d_index){
          if(
            !chart.watch.skip
            || (
              d_index == 0
              || (d_index % chart.watch.skip == 0)
              || d_index == d.length - 1
            )
          ){
            chart.options.data.labels.push(new Date(d.timestamp).toLocaleTimeString())

            Array.each(d.value, function(v, v_index){
              if(d_index == 0){
                chart.options.data.datasets.push({
                  name: name+'_'+v_index,
                  chartType: chart.type,
                  values: [parseFloat( v.toFixed(2) ) ]
                })
              }
              else{
                chart.options.data.datasets[v_index].values.push( parseFloat( (v.toFixed ) ? v.toFixed(2) : v ))
              }
            })
          }
        })

      }
      //simple, like 'uptime', that has one simple Numeric value
      else if(!isNaN(stat[0].value)){//
        console.log('highcharts-vue-wrapper', chart, name, stat)

        Array.each(stat, function(d, d_index){
          if(
            !chart.watch.skip
            || (
              d_index == 0
              || (d_index % chart.watch.skip == 0)
              || d_index == d.length - 1
            )
          ){


            if(d_index == 0){
              chart.options.series.push({
                name: name,
                data: [[
                  d.timestamp,
                  parseFloat( (d.value.toFixed ) ? d.value.toFixed(2) : d.value )
                ]]
              })
            }
            else{
              chart.options.series[0].data.push([
                d.timestamp,
                parseFloat( (d.value.toFixed ) ? d.value.toFixed(2) : d.value )
              ])
            }

            // chart.options.xAxis.categories.push(d.timestamp)
            //
            // if(d_index == 0){
            //   chart.options.series.push({
            //     name: name,
            //     data: [parseFloat( (d.value.toFixed ) ? d.value.toFixed(2) : d.value )]
            //   })
            // }
            // else{
            //   chart.options.series[0].data.push( parseFloat( (d.value.toFixed ) ? d.value.toFixed(2) : d.value ))
            // }

          }
        })


      }

      else{
        chart = null
      }
    }

    // console.log('pre_process frappe-charts-wrapper', chart, name)

    return chart
  },
  "options": {
    time: {
        useUTC: false
    },

    title: {
      // text: 'Solar Employment Growth by Sector, 2010-2016'
    },

    subtitle: {
      // text: 'Source: thesolarfoundation.com'
    },

    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%k-%M-%S}'
      },
      // categories: [
      //   // 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      // ]
    },
    yAxis: {
      title: {
        // text: 'Number of Employees'
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle'
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        // pointStart: 2010
      }
    },

    series: [

    ],

    responsive: {
      rules: [{
        condition: {
           maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  },
  // init: function (vue){
  // },


}
