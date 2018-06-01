import DefaultDygraphLine from './default.dygraph.line'
import DefaultNetDygraphLine from './default.net.dygraph.line'
import DefaultFrappeCharts from './default.frappeCharts'
import DefaultNetFrappeCharts from './default.net.frappeCharts'
import DefaultAMCharts3Line from './default.amcharts3.line'
import DefaultNetAMCharts3Line from './default.net.amcharts3.line'
import DefaultVueEcharts3Line from './default.vueEcharts3.line'

export default {

  "uptime": Object.merge(Object.clone(DefaultVueEcharts3Line),{
    name: 'os.uptime',
    match: /^uptime$/,
    watch: {
      // skip: 0,
      // exclude: /samples/,
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}
        // console.log('transform: ', values)
        let transformed = []

        // const skip = 30
        Array.each(values, function(val, index){
          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){
            // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
            // transformed.push(transform)
            transformed.push(val)
          }

        })

        // console.log('transform: ', transformed)

        return transformed
      }
    },

  }),
  "loadavg": Object.merge(Object.clone(DefaultVueEcharts3Line),{
    // name: 'os.freemem',
    match: /^loadavg$/,
    // type: 'line',
    watch: {
      merge: true,
      value: undefined,
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}
        // console.log('transform: ', values)
        let transformed = []

        // const skip = 30
        Array.each(values, function(val, index){
          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){
            // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
            // transformed.push(transform)
            transformed.push(val)
          }

        })

        // console.log('transform: ', transformed)

        return transformed
      }
    },
    "options": {
      "initOpts": {
        "renderer": "canvas"
      },
      // "lazyUpdate": true,
      "option": {
        "animation": false,
        legend: {
          data:[]
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        "title": {
        //     "text": ""
        },
        tooltip : {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        "xAxis": {
            "type": "category",
            boundaryGap : false,
            "splitLine": {
                "show": false
            },
            "data": []
        },
        "yAxis": {
            "type": "value",
            "splitLine": {
                "show": false
            }
        },
        "series": [
          {
            "type": "line",
            "showSymbol": true,
            "hoverAnimation": false,
            "data": [],
            areaStyle: {normal: {}},
            // label: {
            //   normal: {
            //     show: true,
            //     position: 'top'
            //   }
            // },
            smooth: true
          }
        ]

  		}
    },
  }),
  "blkdev_stats": Object.merge(Object.clone(DefaultVueEcharts3Line),{
    match: /blockdevices\..*/,
    labeling: function(chart, name, stat){
      // console.log('blkdev_stats', chart, name, stat)

      return 'os.'+name
    },
    watch: {
      skip: 0,
      value: 'stats',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}
        // //console.log('transform: ', values)
        let transformed = []
        let prev = null
        Array.each(values, function(val, index){

          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){

            let transform = {timestamp: val.timestamp, value: { stats: {} } }
            if(index == 0){
              Object.each(val.value.stats, function(stat, key){
                  transform.value.stats[key] = 0
              })
            }
            else{
              Object.each(val.value.stats, function(stat, key){
                let value = ((stat - prev.value.stats[key]) > 0) ? stat - prev.value.stats[key] : 0
                transform.value.stats[key] = value
              })
            }
            prev = val

            transformed.push(transform)
          }
        })
        return transformed
      }
    },
    "options": {
      "initOpts": {
        "renderer": "canvas"
      },
      // "lazyUpdate": true,
      "option": {
        "animation": false,
        legend: {
          data:[]
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        "title": {
        //     "text": ""
        },
        tooltip : {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        "xAxis": {
            "type": "category",
            boundaryGap : false,
            "splitLine": {
                "show": false
            },
            "data": []
        },
        "yAxis": {
            "type": "value",
            "splitLine": {
                "show": false
            }
        },
        "series": [
          {
            "type": "line",
            "showSymbol": true,
            "hoverAnimation": false,
            "data": [],
            // areaStyle: {normal: {}},
            // label: {
            //   normal: {
            //     show: true,
            //     position: 'top'
            //   }
            // },
            // smooth: true
          }
        ]

  		}
    }

  }),
  "cpus_times": Object.merge(Object.clone(DefaultVueEcharts3Line),{
    name: 'os.cpus_times',
    match: /cpus/,
    watch: {
      skip: 0,
      merge: true,
      value: 'times',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values, vm, chart){
        let watcher = chart.watch || {}

        let transformed = []
        let prev = null
        Array.each(values, function(val, index){
          if(
            ! watcher.skip
            || (
              index == 0
              || (index % watcher.skip == 0)
              || index == values.length - 1
            )
          ){

            let transform = {timestamp: val.timestamp, value: { times: {} } }
            if(index == 0){
              Object.each(val.value.times, function(stat, key){
                  transform.value.times[key] = 0
              })
            }
            else{
              Object.each(val.value.times, function(stat, key){
                if(key == 'idle'){//represent idle on the negative sideof axes
                  stat = 0 - stat
                  let value = ((stat + prev.value.times[key]) < 0) ? stat + prev.value.times[key] : 0
                  transform.value.times[key] = value
                }
                else{
                  let value = ((stat - prev.value.times[key]) > 0) ? stat - prev.value.times[key] : 0
                  transform.value.times[key] = value
                }
              })
            }
            prev = val
            transformed.push(transform)

          }
        })
        return transformed
      }
    },
    "options": {
      "initOpts": {
        "renderer": "canvas"
      },
      // "lazyUpdate": true,
      "option": {
        "animation": false,
        legend: {
          data:[]
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        "title": {
        //     "text": ""
        },
        tooltip : {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        "xAxis": {
            "type": "category",
            boundaryGap : false,
            "splitLine": {
                "show": false
            },
            "data": []
        },
        "yAxis": {
            "type": "value",
            "splitLine": {
                "show": false
            }
        },
        "series": [
          {
            "type": "line",
            "showSymbol": true,
            "hoverAnimation": false,
            "data": [],
            // areaStyle: {normal: {}},
            // label: {
            //   normal: {
            //     show: true,
            //     position: 'top'
            //   }
            // },
            // smooth: true
          }
        ]

  		}
    }
  }),
}
