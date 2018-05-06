'use strict'

import InputPollerCouchDBHosts from '../input/poller/couchdb.hosts'
import InputPollerCouchDBPaths from '../input/poller/couchdb.paths'

import DefaultConn from '../../etc/default.conn'

let buffer = {}

export default  {
	input: [
		{
			poll: {
				id: "input.search.hosts",
				conn: [
          Object.merge(
            Object.clone(DefaultConn),
            {
              id: 'input.search.hosts',
              module: InputPollerCouchDBHosts,
            }
          )

				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				requests: {
					periodical: 10000,
				},
			},
		},
    // {
		// 	poll: {
		// 		id: "input.search.paths",
		// 		conn: [
    //       Object.merge(
    //         Object.clone(DefaultConn),
    //         {
    //           id: 'input.search.paths',
    //           module: InputPollerCouchDBPaths,
    //         }
    //       )
    //
		// 		],
		// 		connect_retry_count: 5,
		// 		connect_retry_periodical: 1000,
		// 		requests: {
		// 			periodical: 10000,
		// 		},
		// 	},
		// }
	],
	filters: [
		function(doc, opts, next){

			console.log('search_pipeline ', doc)

			buffer = Object.merge(buffer, doc.data)

			if(buffer.hosts && buffer.paths){
				next(buffer)
				buffer = {}
			}
		}
	],
	output: [
		function(doc){


			doc = JSON.decode(doc)

			if(EventBus)
				EventBus.$emit('search', doc)

      // if(doc.data.hosts){
      //
			// 	EventBus.$emit('hosts', doc.data.hosts)
      //
			// }
      // else{
      //
      //   EventBus.$emit('paths', doc.data.paths)
      // }

		}
	]
}
