'use strict'

import DefaultConn from '../../etc/default.conn'

import InputPollerCouchDBMunin from '../input/poller/couchdb.munin'

export default {
  input: [
  	{
  		poll: {
        suspended: true,//start suspended
  			id: "input.munin",
  			conn: [
          Object.merge(
            Object.clone(DefaultConn),
            {
              path_start_key: 'munin',
              path_end_key: 'munin\ufff0',
              module: InputPollerCouchDBMunin,
            }
          )
  			],
  			connect_retry_count: 5,
  			connect_retry_periodical: 1000,
  			requests: {
  				periodical: 5000,
  			},
  		},
  	}
  ],
  filters: [
  	function(doc, opts, next){


      if(doc != null && opts.type == 'periodical'){
        console.log('host_munin_pipeline_template periodical', doc)

      }
      else if(doc != null && doc[0]){
        console.log('host_munin_pipeline_template range', doc)
      }
      // else if(doc != null){
      //   next(doc)
      // }

  	},
  ],
  output: [
  	function(doc){
      // doc = JSON.decode(doc)
      //
      // let type = doc.type
      // EventBus.$emit(type, doc) //update mem widget

  	}
  ]
}
