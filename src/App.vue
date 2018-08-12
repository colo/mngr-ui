<template>
  <div id="q-app">
    <!-- <router-view :EventBus="EventBus" :class="($q.loading.active) ? 'invisible' : 'visible'"  /> -->
    <router-view :EventBus="EventBus" />
  </div>
</template>

<script>

/**
* https://alligator.io/vuejs/global-event-bus/
* vue events as message bus
*/
import Vue from 'vue'
export const EventBus = new Vue();

import Pipeline from 'node-mngr-worker/lib/pipeline'


import HostTemplatePipeline from './libs/pipelines/host.template'
import HostHistoricalTemplatePipeline from './libs/pipelines/host.historical.template'
import HostMuninTemplatePipeline from './libs/pipelines/host.munin.template'

// import hostStore from './store/host'
let hostStore = {
  namespaced: true,
  state: {},
  getters: {},
  actions: {},
  mutations: { }
}



import SearchPipeline from './libs/pipelines/search'
let search_pipeline = new Pipeline(SearchPipeline)

let host_pipelines_templates = [
  HostTemplatePipeline,
  // HostMuninTemplatePipeline,
  // HostHistoricalTemplatePipeline
]

import { mapState } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
      EventBus : EventBus,
      hosts_pipelines: [],
      // list: [
      //   {title: 'first chart'},
      //   {title: 'second chart'},
      // ]
    }
  },
  computed: Object.merge(
    mapState({
      currentHost: state => state.hosts.current,
    })
  ),
  watch: {
    '$store.state.app.suspend': function(bool){
      // //console.log('$store.state.app.suspend', bool)
      let search_host = new RegExp(this.currentHost, 'g')
      Array.each(this.hosts_pipelines, function(pipe){
        if(bool == false){
          //resume only current host
          if(search_host.test(pipe.inputs[0].options.id)){
            //console.log('$store.state.app.suspend ON_RESUME',pipe);
            pipe.fireEvent('onResume')
          }
        }
        else{
          pipe.fireEvent('onSuspend')
        }

      }.bind(this))
    },
    '$store.state.hosts.current': function(host){
      console.log('$store.state.hosts.current', host)

      let range = Object.clone(this.$store.state.app.range)

      Array.each(this.hosts_pipelines, function(pipe){

        ////////console.log('pipe.inputs[0].options.id', pipe.inputs[0].options.id, 'input.os-'+host)

        // if(pipe.inputs[0].options.id == 'input.os-'+host){
        let search_host = new RegExp(host, 'g')
        if(search_host.test(pipe.inputs[0].options.id)){
          console.log('current firing onResume...', pipe.inputs[0].options.id)


          if(range[1] == null){
            range[1] = new Date().getTime()
          }

          pipe.fireEvent('onRange', { Range: 'posix '+ range[0] +'-'+ range[1] +'/*' })

          // if(null_range == false){
          //   pipe.fireEvent('onSuspend')
          // }
          // else{
          if(this.$store.state.app.suspend != true){
            console.log('store.state.hosts.current ON_RESUME',this.$store.state.app.suspend);
            pipe.fireEvent('onResume')
          }

          // }

          // pipe.fireEvent('onResume')
        }
        else{
          pipe.fireEvent('onSuspend')
        }

      }.bind(this))



    },

    '$store.state.hosts.all': function(hosts){
      //console.log('$store.state.hosts.all', hosts, this.$store.state.app.paths)

      this.create_hosts_pipelines(hosts, this.$store.state.app.paths)


    },
    // '$store.state.app.paths': function(paths){
    //   // ////console.log('$store.state.app.paths', paths, this.$store.state.hosts.all)
    //   let hosts = this.$store.state.hosts.all
    //
    //   this.$store.commit('hosts/clear')
    //   this.$store.commit('hosts/set', hosts)
    //   // // this.create_hosts_pipelines(this.$store.state.hosts.all, paths)
    //
    //
    // },
    '$store.state.app.range' : function(range){
      if(this.currentHost){

        Array.each(this.hosts_pipelines, function(pipe){

          let search_host = new RegExp(this.currentHost, 'g')

          console.log('store.state.app.range', this.currentHost)

          if(search_host.test(pipe.inputs[0].options.id)){
          // if(pipe.inputs[0].options.id == 'input.os-'+this.currentHost){
            //////console.log('firing range......', pipe.inputs[0].options.id)

            let end = new Date().getTime()

            // ////////console.log('firing range...', pipe.inputs[0].options.conn[0].stat_host)

            // let host = pipe.inputs[0].options.conn[0].stat_host

            // let null_range = (range[1] == null) ? true : false

            if(range[1] != null)
              end = range[1]

            // if(range[1] != null){
            //   end = range[1]
            //
            //   this.$store.commit('app/freeze', true)
            //   // this.$nextTick(() => this.$store.commit('app/pause', true))
            //   // this.EventBus.$emit('suspend')
            // }
            // else{
            //   this.$store.commit('app/freeze', false)
            //   // this.$store.commit('app/pause', false)
            //   // this.EventBus.$emit('resume')
            // }

            console.log('firing range', range)

            pipe.fireEvent('onRange', { Range: 'posix '+ range[0] +'-'+ end +'/*' })

            pipe.fireEvent('onSuspend')


            // if(range[1] != null){
            //   this.$nextTick(function(){pipe.fireEvent('onSuspend')})
            // }
          }




          // if(null_range == false){
          //   this.$nextTick(() => this.$store.commit('app/freeze', true))
          // }
          // else{
          //   // this.EventBus.$emit('resume')
          //   //pipe.fireEvent('onResume')
          // }

          // this.EventBus.$emit('range', { host: host, Range: 'posix '+ val[0] +'-'+ val[1] +'/*' })

          // this.$nextTick(function(){pipe.fireEvent('onSuspend')})


        }.bind(this))

        if(range[1] != null){
          this.$store.commit('app/freeze', true)
        }
        else{
          this.$store.commit('app/freeze', false)
        }

        this.$store.commit('app/reset', true)

        this.$q.loading.show({
          delay: 0, // ms
          spinner: 'QSpinnerGears',
          spinnerColor: 'blue',
          customClass : 'bg-white'
        })

      }//if this.currentHost
    }
  },
  methods: {
    create_hosts_pipelines (hosts, paths) {
      console.log('$store.state create_hosts_pipelines', hosts, paths)


      if(hosts.length > 0 && paths.length > 0){
        if(this.hosts_pipelines.length > 0)
          Array.each(this.hosts_pipelines, function(pipe, index){//destroy old ones
            pipe.fireEvent('onExit')
            pipe.removeEvents()
            // delete pipe
            delete this.hosts_pipelines[index]
            // this.hosts_pipelines.shift()
          }.bind(this))

        this.$set(this.hosts_pipelines, [])


        Array.each(hosts, function(host){
          Array.each(host_pipelines_templates, function(pipeline_template){

            let template = Object.clone(pipeline_template)

            template.input[0].poll.conn[0].stat_host = host
            template.input[0].poll.conn[0].paths = paths

            template.input[0].poll.id += '-'+host
            template.input[0].poll.conn[0].id = template.input[0].poll.id

            let pipe = new Pipeline(template)

            ////////console.log('$store.state.hosts.all', pipe)

            /**
            * start suspended already
            **/
            // pipe.fireEvent('onSuspend')

            //suscribe to 'onRangeDoc

            pipe.inputs[0].addEvent('onRangeDoc', function(doc){
              //console.log('create_hosts_pipelines onRangeDoc',doc);

              if(this.$store.state.app.freeze == true){
                ////////console.log('pipe.inputs[0].addEvent(onRangeDoc)')
                // this.$nextTick(function(){pipe.fireEvent('onSuspend')})
                this.$store.commit('app/suspend', true)
                this.$q.loading.hide()
                // this.$store.commit('app/pause', true)
              }
              else{
                console.log('create_hosts_pipelines ON_RESUME',pipe.inputs[0].options.id);

                this.$store.commit('app/suspend', false)//

                pipe.fireEvent('onResume')
                this.$q.loading.hide()
                // this.$store.commit('app/pause', false)
              }
            }.bind(this))

            this.hosts_pipelines.push(pipe)

          }.bind(this))

        }.bind(this))
      }
    }
  },

  created: function(){


    this.EventBus.$on('search', doc => {
			// ////console.log('recived doc via Event search', doc)

      // // this.$store.commit('hosts/clear')
      // // this.$store.commit('hosts/set', hosts)
      // //
      let currentPaths = this.$store.state.app.paths
      if (currentPaths.equals(doc.paths) !== true){

        this.$store.commit('app/paths', doc.paths)

        this.$store.commit('hosts/clear')
        this.$store.commit('hosts/set', doc.hosts)


        let currentRange = Object.clone(this.$store.state.app.range)
        ////console.log('update range', currentRange)
        //just a small modification to notify of update
        this.$store.commit('app/range', {start: currentRange[0] + 1, end: currentRange[1]})

        this.$store.commit('app/reset', false)
        this.$store.commit('app/reset', true)

      }
      else {
        this.$store.commit('hosts/set', doc.hosts)
      }



      Array.each(doc.hosts, function(host){
        if(!this.$store.state.hosts[host]){
          //console.log('registerModule HOSTS', host)
          this.$store.registerModule(['hosts', host], Object.clone(hostStore))
        }
      }.bind(this))

      /**
      * should unregister modules for unset hosts?
      */
      Array.each(this.$store.state.hosts, function(host){
        if(!doc.hosts.contains(host)){
          //console.log('UNregisterModule HOSTS', host)
          this.$store.unregisterModule(['hosts', host])
        }
      }.bind(this))



		})

    // this.EventBus.$on('hosts', doc => {
		// 	// ////////////console.log('recived doc via Event hosts', doc)
    //   this.$store.commit('hosts/set', doc)
    //
    //   Array.each(doc, function(host){
    //     if(!this.$store.state.hosts[host])
    //       this.$store.registerModule(['hosts', host], hostStore)
    //
    //   }.bind(this))
    //
    //   /**
    //   * should unregister modules for unset hosts?
    //   */
    //   Array.each(this.$store.state.hosts, function(host){
    //     if(!doc.contains(host))
    //       this.$store.unregisterModule(['hosts', host])
    //   }.bind(this))
    //
    //
		// })

    // this.EventBus.$on('paths', doc => {
		// 	// ////console.log('recived doc via Event paths', doc)
    //   // let os = /^os.*/g
    //   // let os_paths = []
    //   // Array.each(doc, function(path){
    //   //   if(os.test(path))
    //   //     os_paths.push(path)
    //   // }.bind(this))
    //
    //   this.$store.commit('app/paths', doc)
    //
    //
		// })
  },
  beforeCreate () {
    // this.$q.loading.show({
    //   delay: 0, // ms
    //   spinner: 'QSpinnerGears',
    //   spinnerColor: 'blue',
    //   customClass : 'bg-white'
    // })
  },
}

/**
* https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
**/
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

</script>

<style>
</style>
