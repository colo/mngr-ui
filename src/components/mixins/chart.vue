<script>
export default {


  unwatchers: {},

  dynamic_blacklist: null, //regexp
  dynamic_whitelist: null, //regexp

  static_charts: null,
  dynamic_charts: null,

  data () {
    return {


    }
  },

  methods: {
    /**
    * @param stat = stat data to parse
    * @param name = chart name
    */
    parse_chart_from_stat (stat, name){

      /**
      * create chart automatically if it's not blacklisted or is whitelisted
      **/
      if(
        (
          ( this.$options.dynamic_blacklist
          && this.$options.dynamic_blacklist.test(name) == false )
        || ( this.$options.dynamic_whitelist
          && this.$options.dynamic_whitelist.test(name) == true )
        )
        && (
          !this.$options.static_charts
          || Object.keys(this.$options.static_charts).contains(name) == false
        )
      ){

        if(Array.isArray(stat)){//it's stat

            let dynamic_charts = this._get_dynamic_charts(name, this.$options.dynamic_charts)

            if(dynamic_charts[name]){

              Array.each(dynamic_charts[name], function(dynamic){

                // chart = Object.merge(Object.clone(chart), dynamic)
                // this.process_dynamic_chart(chart, name, stat)
                this.process_dynamic_chart(Object.clone(dynamic), name, stat)

              }.bind(this))
            }
            else{

              let chart = Object.clone(this.$options.DefaultChart)

              // this.process_generic_chart(chart, name, stat)
              this.process_chart(
                chart.pre_process(chart, name, stat),
                name
              )

            }


        }
        else{//blockdevices.[key]
          Object.each(stat, function(data, key){
            this.parse_chart_from_stat(data, name+'.'+key)
          }.bind(this))

        }

      }
    },
    /**
    * process
    * @moved char.pre_process
    */
    // process_generic_chart (chart, name, stat){
    //
    //   chart.options.labels = ['Time']
    //
    //   if(Array.isArray(stat[0].value)){//like 'loadavg', that has 3 values
    //
    //     for(let i= 0; i < stat[0].value.length; i++){//create data columns
    //       chart.options.labels.push(name+'_'+i)
    //     }
    //
    //     // chart.options.labels.push(name+'_minute')//minute
    //     this.process_chart(chart, name)
    //   }
    //   else if(!isNaN(stat[0].value)){//like 'uptime', one value only
    //
    //     chart.options.labels.push(name)
    //     this.process_chart(chart, name)
    //   }
    // },
    process_dynamic_chart (chart, name, stat){
      // ////console.log('process_dynamic_chart',  name, chart)
      // let watcher = {value: ''}

      if(Array.isArray(stat[0].value)){//like 'cpus'
        // //////////console.log('isArray', stat[0].value)

        Array.each(stat[0].value, function(val, index){

          // let arr_chart = Object.merge(Object.clone(chart), chart)
          let arr_chart = Object.clone(chart)
          // watcher = chart.watch

          arr_chart.label = this.process_chart_label(chart, stat) || name
          let chart_name = this.process_chart_name(chart, stat) || name

          if(chart.watch.merge != true){
            chart_name += '_'+index
          }
          // else{
          //   chart_name = name
          // }

          if(chart.watch.merge != true || index == 0){//merge creates only once instance

            /**
            * @moved chart.pre_process
            **/
            // if(!arr_chart.options || !arr_chart.options.labels){
            //   if(!arr_chart.options)
            //     arr_chart.options = {}
            //
            //   arr_chart.options.labels = []
            //
            //   Object.each(val[chart.watch.value], function(tmp, tmp_key){
            //     arr_chart.options.labels.push(tmp_key)
            //   })
            //
            //   arr_chart.options.labels.unshift('Time')
            //
            //   // arr_chart.options.labels.push(name+'_minute')//minute
            // }

            // this.process_chart(arr_chart, chart_name)
            this.process_chart(
              arr_chart.pre_process(arr_chart, chart_name, stat),
              chart_name
            )


          }




        }.bind(this))



      }
      else if(isNaN(stat[0].value)){
        //sdX.stats.

        ////console.log('isNan', name, stat, chart)

        let filtered = false
        if(chart.watch && chart.watch.filters){
          Array.each(chart.watch.filters, function(filter){
            let prop_to_filter = Object.keys(filter)[0]
            let value_to_filter = filter[prop_to_filter]

            if(
              stat[0].value[prop_to_filter]
              && value_to_filter.test(stat[0].value[prop_to_filter]) == true
            ){
              filtered = true
            }

          })
        }
        else{
          filtered = true
        }

        if(filtered == true){


          /**
          * @moved chart.pre_process
          **/
          // if(!chart.options || !chart.options.labels){
          //   if(!chart.options)
          //     chart.options = {}
          //
          //   chart.options.labels = []
          //
          //
          //   //if no "watch.value" property, everything should be manage on "trasnform" function
          //   if(chart.watch && chart.watch.managed != true
          //     // && chart.watch.value
          //   ){
          //     Object.each(stat[0].value[chart.watch.value], function(tmp, tmp_key){
          //       // //console.log('labeling...', tmp)
          //       chart.options.labels.push(tmp_key)
          //     })
          //
          //     chart.options.labels.unshift('Time')
          //   }
          //
          //
          // }
          chart = chart.pre_process(chart, name, stat)

          chart.label = this.process_chart_label(chart, stat) || name
          let chart_name = this.process_chart_name(chart, stat) || name

          this.process_chart(chart, chart_name)
        }



      }
      else{

        // // chart = Object.merge(Object.clone(chart), chart)
        // // watcher = chart.watch
        //
        chart.label = this.process_chart_label(chart, stat) || name
        let chart_name = this.process_chart_name(chart, stat) || name
        //
        // if(!chart.options || !chart.options.labels){
        //   if(!chart.options)
        //     chart.options = {}
        //
        //   chart.options.labels = []
        //
        //   chart.options.labels.push(name)
        //
        //   chart.options.labels.unshift('Time')
        // }
        //
        //
        // // chart.options.labels.push(name+'_minute')//minute
        // this.process_chart(chart, chart_name)

        this.process_chart(
          chart.pre_process(chart, chart_name, stat),
          name
        )
      }


    },
    /**
    * commmon for generics or dynamics charts
    */
    process_chart (chart, name){
      this._process_chart(chart, name)
    },
    _process_chart (chart, name){

      if(chart.init && typeOf(chart.init) == 'function')
        chart.init(this, chart, 'chart')

      // this.create_watcher('os.'+name, chart.watch)
      this.create_watcher(name, chart.watch)

    },
    /**
    * creates watchers for charts
    **/
    create_watcher(name, watcher){
      this._create_watcher('', name, watcher)
    },
    _create_watcher(path, name, watcher){
      path = path || ''

      watcher = watcher || {}
      watcher.value = watcher.value || ''
      watcher.transform = watcher.transform || ''

      // let watch_name = name
      // if(watch_name.indexOf('_') > 0 )//removes indixes, ex: cpu.0
      //   watch_name = watch_name.substring(0, watch_name.indexOf('_'))

      if(this.$options.unwatchers[name]){
        this.$options.unwatchers[name]()
        delete this.$options.unwatchers[name]
      }

      let found_watcher = false

      if(Array.isArray(this._watchers)){
        Array.each(this._watchers, function(watcher){
          if(watcher.expression == name && watcher.user == true)//means user already added a watcher for this chart
            found_watcher = true
        })
      }

      if(found_watcher == false){

        let generic_data_watcher = function(current){
          this.generic_data_watcher(current, watcher, name)
        }

        console.log('gonna watch...', name, path)
        // this.$options.unwatchers[path+name] = this.$watch(path+watch_name, generic_data_watcher)
        this.$options.unwatchers[path+name] = this.$watch(path, generic_data_watcher)

      }
    },

    generic_data_watcher (current, watcher, name){
      // console.log('generic_data_watcher', this.host+'_'+name, current)
      console.log('generic_data_watcher', this.host+'_'+name)


      //////////////console.log('type_value', name, val.current)
      if(watcher.managed == true){
        watcher.transform(current, this, watcher)
      }
      else{
        let type_value = null
        let value_length = 0
        if(watcher.value != ''){

          type_value = (Array.isArray(current[0].value) && current[0].value[0][watcher.value]) ? current[0].value[0][watcher.value] : current[0].value[watcher.value]
          // value_length = (Array.isArray(val.current.value) && val.current.value[0][watcher.value]) ? val.current.value[0][watcher.value].length : val.current[0].value[watcher.value].length
        }
        else{
          type_value = current[0].value
          // value_length = current.length
        }

        // if(this.$refs[this.host+'_'+name]){

          let data = []

          if(Array.isArray(type_value)){//multiple values, ex: loadavg
            if(typeOf(watcher.transform) == 'function'){
              current = watcher.transform(current, this, watcher)
            }

            data = this._current_array_to_data(current, watcher)
          }
          else if(isNaN(type_value) || watcher.value != ''){

            if(Array.isArray(current[0].value) && current[0].value[0][watcher.value]){//cpus
              // ////console.log('generic_data_watcher isNaN', name, type_value, current)

              current = this._current_nested_array(current, watcher, name)
            }

            // else{//blockdevices.sdX

            if(typeOf(watcher.transform) == 'function'){
              current = watcher.transform(current, this, watcher)
            }

            if(!Array.isArray(current))
              current = [current]

            data = this._current_array_to_data(current, watcher)

          }
          else{//single value, ex: uptime
            //////////////console.log('generic_data_watcher Num', name, type_value)
            if(typeOf(watcher.transform) == 'function'){
              current = watcher.transform(current, this, watcher)
            }

            data = this._current_number_to_data (current, watcher)


          }

          this.update_chart_stat(name, data)

        // }
      }


    },
    /**
    * update chart data
    **/
    update_chart_stat (name, data){

    },
    /**
    * chart attributes
    **/
    process_chart_label (chart, stat) {
      if(chart.labeling && typeOf(chart.labeling) == 'function'){

        return chart.labeling(stat)
      }
      else if(chart.label){
        return chart.label
      }
      else{
        return this.process_chart_name(chart, stat)
      }
    },
    process_chart_name (chart, stat){
      if(chart.name && typeOf(chart.name) == 'function') return chart.name(stat)
      else if(chart.name) return chart.name
    },
    /**
    * trasnform "current" to chart.data
    **/
    _current_nested_array(current, watcher, name){

      let index = (name.substring(name.indexOf('_') +1 , name.length - 1)) * 1
      ////////////console.log('generic_data_watcher isNanN', name, val, index)

      let val_current = []
      Array.each(current, function(item){
        // ////////////console.log('CPU item', item)

        let value = {}
        Array.each(item.value, function(val, value_index){//each cpu

          if(watcher.merge !== true && value_index == index){////no merging - compare indexes to add to this watcher
            value[watcher.value] = Object.clone(val[watcher.value])
          }
          else{//merge all into a single stat
            if(value_index == 0){
              value[watcher.value] = Object.clone(val[watcher.value])
            }
            else{
              Object.each(val[watcher.value], function(prop, key){
                value[watcher.value][key] += prop
              })

            }
          }

        }.bind(this))

        val_current.push({timestamp: item.timestamp, value: value})

      }.bind(this))

      // ////////////console.log('CPU new current', val_current)

      return val_current
    },
    _current_number_to_data (current, watcher){
      let data = []
      Array.each(current, function(current){
        let value = null
        if(watcher.value != ''){
          value = current.value[watcher.value]
        }
        else{
          value = current.value
        }

        // data.push([new Date(current.timestamp), value, 0])//0, minute column
        data.push([new Date(current.timestamp), value])//0, minute column
      })

      return data
    },
    _current_array_to_data (current, watcher){
      let data = []
      Array.each(current, function(item){
        let tmp_data = []
        tmp_data.push(new Date(item.timestamp))

        let value = null
        if(watcher.value != ''){
          value = item.value[watcher.value]
        }
        else{
          value = item.value
        }

        // Array.each(value, function(real_value){
        //   tmp_data.push(real_value)
        // })
        if(Array.isArray(value)){
          Array.each(value, function(real_value){
            tmp_data.push(real_value)
          })
        }
        else if(!isNaN(value)){//mounts[mount_point].value.percentage
          tmp_data.push(value * 1)
        }
        else{
          Object.each(value, function(real_value){
            real_value = real_value * 1
            tmp_data.push(real_value)
          })
        }

        // tmp_data.push(0)//add minute column

        data.push(tmp_data)
      })

      return data
    },
  }
}
</script>
